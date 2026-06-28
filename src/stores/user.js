/**
 * 用户状态管理
 * 管理用户登录状态、Token、用户信息
 * 支持三种登录方式：验证码、用户名/邮箱密码、注册后直接登录
 * 支持 access_token 自动刷新
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

export const useUserStore = defineStore('user', () => {
  // ===== 持久化状态（从 localStorage 恢复） =====
  const token = ref(localStorage.getItem('token') || '')
  const refreshTokenValue = ref(localStorage.getItem('refresh_token') || '')
  const expiresAt = ref(Number(localStorage.getItem('expires_at') || '0'))
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // ===== 计算属性 =====
  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => userInfo.value.role || 'USER')
  const permissions = computed(() => userInfo.value.permissions || [])
  const isAdmin = computed(() => ['SUPER_ADMIN', 'ADMIN'].includes(role.value))
  const isVip = computed(() => ['VIP', 'SUPER_ADMIN', 'ADMIN'].includes(role.value))

  // 刷新锁：防止并发请求同时触发多次刷新
  let isRefreshing = false
  let refreshPromise = null

  /**
   * 持久化认证信息到 localStorage
   * 仅更新 token 相关字段，不覆盖 userInfo 中的其他字段
   */
  function persistAuth(res) {
    token.value = res.token
    refreshTokenValue.value = res.refresh_token || refreshTokenValue.value
    expiresAt.value = res.expires_at || 0
    // 如果返回了角色/权限信息，增量合并到 userInfo
    if (res.role || res.permissions) {
      userInfo.value = {
        ...userInfo.value,
        role: res.role || userInfo.value.role || 'USER',
        status: res.status || userInfo.value.status || 'ACTIVE',
        vipExpireTime: res.vip_expire_time || userInfo.value.vipExpireTime || '',
        permissions: res.permissions || userInfo.value.permissions || [],
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
    localStorage.setItem('token', token.value)
    localStorage.setItem('refresh_token', refreshTokenValue.value)
    localStorage.setItem('expires_at', String(expiresAt.value))
  }

  /**
   * 把后端返回的完整会话信息落地到 store 和 localStorage
   * 用于登录/注册成功后一次性保存所有用户数据
   */
  function saveSession(res) {
    userInfo.value = {
      userId: res.user_id,
      email: res.email,
      nickname: res.nickname,
      role: res.role || 'USER',
      status: res.status || 'ACTIVE',
      vipExpireTime: res.vip_expire_time || '',
      permissions: res.permissions || [],
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    persistAuth(res)
  }

  /** 发送邮箱验证码 */
  async function sendCode(email) {
    const res = await sendCodeApi(email)
    if (res.success) {
      message.success('验证码已发送')
      return res
    }
  }

  /** 验证码登录（首次自动注册） */
  async function login(email, code) {
    const res = await loginApi(email, code)
    saveSession(res)
    message.success('登录成功')
    return res
  }

  /** 用户名/邮箱 + 密码登录 */
  async function loginWithPassword(identifier, password) {
    const res = await loginPasswordApi(identifier, password)
    saveSession(res)
    message.success('登录成功')
    return res
  }

  /**
   * 注册（邮箱验证码 + 用户名 + 密码）
   * 后端会先校验邮箱验证码，再设置密码并完成注册。
   */
  async function register(payload) {
    const res = await registerApi(payload)
    // need_verify=true：兼容旧响应；新注册流程正常会直接返回已验证会话
    if (res.need_verify) {
      message.success('请先完成邮箱验证')
      return res
    }
    // 无需验证，直接保存会话
    saveSession(res)
    message.success('注册成功')
    return res
  }

  /**
   * 刷新 access_token
   * 使用 refresh_lock 防止并发请求同时触发多次刷新
   */
  async function doRefreshToken() {
    if (!refreshTokenValue.value) {
      throw new Error('no refresh token')
    }
    // 如果已有刷新请求在进行中，复用同一个 Promise
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

  /** 检查 token 是否即将过期（5 分钟内） */
  function isTokenExpiringSoon() {
    if (!expiresAt.value) return false
    return expiresAt.value * 1000 - Date.now() < 5 * 60 * 1000
  }

  /** 检查用户是否拥有指定权限 */
  function hasPermission(permission) {
    return permissions.value.includes(permission)
  }

  /**
   * 获取有效的 access_token
   * 如果 token 即将过期，自动触发刷新
   */
  async function getValidToken() {
    if (!token.value) throw new Error('not logged in')
    if (isTokenExpiringSoon()) {
      return await doRefreshToken()
    }
    return token.value
  }

  /** 退出登录：清空所有状态和 localStorage */
  function logout() {
    token.value = ''
    refreshTokenValue.value = ''
    expiresAt.value = 0
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('userInfo')
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
    isVip,
    isLoggedIn,
    sendCode,
    login,
    loginWithPassword,
    register,
    doRefreshToken,
    isTokenExpiringSoon,
    hasPermission,
    getValidToken,
    logout,
  }
})
