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
} from '@/api/auth'
import { message } from 'ant-design-vue'
import { useWalletStore } from '@/stores/wallet'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const refreshTokenValue = ref(localStorage.getItem('refresh_token') || '')
  const expiresAt = ref(Number(localStorage.getItem('expires_at') || '0'))
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => userInfo.value.role || 'USER')
  const permissions = computed(() => userInfo.value.permissions || [])
  const isAdmin = computed(() => ['SUPER_ADMIN', 'ADMIN'].includes(role.value))

  // 额度变更时间戳：用于通知 admin/stats 页面刷新额度池数据
  const dashboardRefreshTick = ref(0)

  /** 触发 dashboard 数据刷新（额度分配/调整后调用） */
  function triggerDashboardRefresh() {
    dashboardRefreshTick.value = Date.now()
  }

  let isRefreshing = false
  let refreshPromise = null

  function persistAuth(res) {
    token.value = res.token
    refreshTokenValue.value = res.refresh_token || refreshTokenValue.value
    expiresAt.value = res.expires_at || 0
    if (res.role || res.permissions) {
      userInfo.value = {
        ...userInfo.value,
        role: res.role || userInfo.value.role || 'USER',
        status: res.status || userInfo.value.status || 'ACTIVE',
        permissions: res.permissions || userInfo.value.permissions || [],
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
    localStorage.setItem('token', token.value)
    localStorage.setItem('refresh_token', refreshTokenValue.value)
    localStorage.setItem('expires_at', String(expiresAt.value))
  }

  function saveSession(res) {
    userInfo.value = {
      userId: res.user_id,
      email: res.email,
      nickname: res.nickname,
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

  async function register(payload) {
    const res = await registerApi(payload)
    if (res.need_verify) {
      message.success('请先完成邮箱验证')
      return res
    }
    saveSession(res)
    message.success('注册成功')
    return res
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
    return permissions.value.includes(permission)
  }

  async function getValidToken() {
    if (!token.value) throw new Error('not logged in')
    if (isTokenExpiringSoon()) {
      return await doRefreshToken()
    }
    return token.value
  }

  function logout() {
    token.value = ''
    refreshTokenValue.value = ''
    expiresAt.value = 0
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('userInfo')
    useWalletStore().reset()
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
    isLoggedIn,
    dashboardRefreshTick,
    sendCode,
    login,
    loginWithPassword,
    register,
    doRefreshToken,
    isTokenExpiringSoon,
    hasPermission,
    getValidToken,
    logout,
    triggerDashboardRefresh,
  }
})
