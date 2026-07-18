/**
 * 用户状态管理
 * 管理用户登录状态、Token、用户信息
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login as loginApi,
  sendCode as sendCodeApi,
  refreshToken as refreshTokenApi,
  register as registerApi,
  loginPassword as loginPasswordApi,
  sendEmailBindingCode as sendEmailBindingCodeApi,
  bindEmail as bindEmailApi,
} from '@/api/auth'
import { message } from 'ant-design-vue'
import { useWalletStore } from '@/stores/wallet'
import { roleHasPermission } from '@/constants/permissions'
import { cancelEmailBinding } from '@/utils/emailBindingGate'
import { markNewUserGuidePending } from '@/utils/newUserGuide'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const refreshTokenValue = ref(localStorage.getItem('refresh_token') || '')
  const expiresAt = ref(Number(localStorage.getItem('expires_at') || '0'))
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => userInfo.value.role || 'USER')
  const permissions = computed(() => userInfo.value.permissions || [])
  const isAdmin = computed(() => ['SUPER_ADMIN', 'ADMIN'].includes(role.value))
  // 绑定接口完成验证码校验后会同时返回两个标记；任一为 true 即可放行前端提示。
  const isEmailBound = computed(() => (
    userInfo.value.email_bound === true || userInfo.value.email_verified === true
  ))

  // 额度变更时间戳：用于通知 admin/stats 页面刷新额度池数据
  const dashboardRefreshTick = ref(0)

  /** 触发 dashboard 数据刷新（额度分配/调整后调用） */
  function triggerDashboardRefresh() {
    dashboardRefreshTick.value = Date.now()
  }

  let isRefreshing = false
  let refreshPromise = null

  /** 合并并持久化非敏感账户信息；随机密码绝不进入该方法。 */
  function patchUserInfo(patch = {}) {
    userInfo.value = { ...userInfo.value, ...patch }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  function persistAuth(res) {
    token.value = res.token
    refreshTokenValue.value = res.refresh_token || refreshTokenValue.value
    expiresAt.value = res.expires_at || 0
    // 刷新响应若携带身份字段则同步缓存，未携带的字段保持原值。
    const identityPatch = {}
    const identityFields = [
      'account',
      'email',
      'email_verified',
      'email_bound',
      'nickname',
      'role',
      'status',
      'permissions',
    ]
    identityFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(res, field)) identityPatch[field] = res[field]
    })
    if (Object.keys(identityPatch).length) {
      patchUserInfo(identityPatch)
    }
    localStorage.setItem('token', token.value)
    localStorage.setItem('refresh_token', refreshTokenValue.value)
    localStorage.setItem('expires_at', String(expiresAt.value))
  }

  function saveSession(res) {
    const emailBound = res.email_bound ?? res.email_verified ?? false
    const account = res.account || res.username || res.nickname || ''
    userInfo.value = {
      userId: res.user_id,
      account,
      email: res.email || '',
      email_verified: res.email_verified ?? emailBound,
      email_bound: emailBound,
      nickname: res.nickname || account || '用户',
      role: res.role || 'USER',
      status: res.status || 'ACTIVE',
      permissions: res.permissions || [],
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    persistAuth(res)
  }

  async function sendCode(email) {
    const res = await sendCodeApi(email)
    if (res.success) {
      message.success('验证码已发送')
      return res
    }
  }

  async function login(email, code) {
    const res = await loginApi(email, code)
    saveSession(res)
    message.success('登录成功')
    return res
  }

  async function loginWithPassword(identifier, password) {
    const res = await loginPasswordApi(identifier, password)
    saveSession(res)
    message.success('登录成功')
    return res
  }

  async function register(inviteCode = '') {
    const res = await registerApi(inviteCode)
    saveSession(res)
    markNewUserGuidePending(userInfo.value)
    message.success('注册成功')
    return res
  }

  /** 为当前账号发送绑定验证码，发送频率和有效期以后端限制为准。 */
  async function sendEmailBindingCode(email) {
    const res = await sendEmailBindingCodeApi(email)
    message.success('验证码已发送，请查收邮箱')
    return res
  }

  /** 完成邮箱绑定并立即刷新本地身份标记，让等待中的 AI 请求可以续接。 */
  async function bindAccountEmail(email, code) {
    const res = await bindEmailApi(email, code)
    const data = res?.data || res || {}
    patchUserInfo({
      email: data.email || email,
      email_verified: data.email_verified ?? true,
      email_bound: data.email_bound ?? true,
    })
    return data
  }

  async function doRefreshToken() {
    if (!refreshTokenValue.value) {
      throw new Error('no refresh token')
    }
    if (isRefreshing) {
      return refreshPromise
    }
    isRefreshing = true
    refreshPromise = refreshTokenApi(refreshTokenValue.value)
      .then((res) => {
        persistAuth(res)
        return res.token
      })
      .finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    return refreshPromise
  }

  function isTokenExpiringSoon() {
    if (!expiresAt.value) return false
    return expiresAt.value * 1000 - Date.now() < 5 * 60 * 1000
  }

  function hasPermission(permission) {
    // 优先读登录缓存；新增权限后旧会话可能未更新，回退到角色权限表
    if (permissions.value.includes(permission)) return true
    return roleHasPermission(role.value, permission)
  }

  async function getValidToken() {
    if (!token.value) throw new Error('not logged in')
    if (isTokenExpiringSoon()) {
      return await doRefreshToken()
    }
    return token.value
  }

  /** 同步清空内存与本地会话；鉴权失效时静默调用，避免组件误判仍登录。 */
  function clearSession() {
    token.value = ''
    refreshTokenValue.value = ''
    expiresAt.value = 0
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('userInfo')
    // 退出时终止仍在等待绑定的请求，避免下一位登录用户继承旧操作。
    cancelEmailBinding('登录状态已结束')
    useWalletStore().reset()
  }

  function logout() {
    clearSession()
    message.success('已退出登录')
  }

  return {
    token,
    refreshTokenValue,
    expiresAt,
    userInfo,
    role,
    permissions,
    isAdmin,
    isEmailBound,
    isLoggedIn,
    dashboardRefreshTick,
    sendCode,
    login,
    loginWithPassword,
    register,
    sendEmailBindingCode,
    bindAccountEmail,
    doRefreshToken,
    isTokenExpiringSoon,
    hasPermission,
    getValidToken,
    patchUserInfo,
    clearSession,
    logout,
    triggerDashboardRefresh,
  }
})
