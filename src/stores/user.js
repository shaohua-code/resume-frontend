/**
 * 用户状态管理
 * 管理用户登录状态、Token、用户信息
 * 支持 access_token 自动刷新
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, sendCode as sendCodeApi, refreshToken as refreshTokenApi } from '@/api/auth'
import { message } from 'ant-design-vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const token = ref(localStorage.getItem('token') || '')
  const refreshTokenValue = ref(localStorage.getItem('refresh_token') || '')
  const expiresAt = ref(Number(localStorage.getItem('expires_at') || '0'))
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 是否已登录
  const isLoggedIn = computed(() => !!token.value)

  // 是否正在刷新 token，防止并发刷新
  let isRefreshing = false
  let refreshPromise = null

  // 持久化到 localStorage
  function persistAuth(res) {
    token.value = res.token
    refreshTokenValue.value = res.refresh_token || refreshTokenValue.value
    expiresAt.value = res.expires_at || 0
    localStorage.setItem('token', token.value)
    localStorage.setItem('refresh_token', refreshTokenValue.value)
    localStorage.setItem('expires_at', String(expiresAt.value))
  }

  // 发送验证码
  async function sendCode(email) {
    const res = await sendCodeApi(email)
    if (res.success) {
      message.success('验证码已发送')
      return res
    }
  }

  // 登录
  async function login(email, code) {
    const res = await loginApi(email, code)
    userInfo.value = { email: res.email, nickname: res.nickname }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    persistAuth(res)
    message.success('登录成功')
    return res
  }

  // 刷新 token
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

  // 判断 token 是否在 5 分钟内过期
  function isTokenExpiringSoon() {
    if (!expiresAt.value) return false
    // expires_at 是秒级时间戳
    return expiresAt.value * 1000 - Date.now() < 5 * 60 * 1000
  }

  // 获取有效 token，必要时自动刷新
  async function getValidToken() {
    if (!token.value) throw new Error('not logged in')
    if (isTokenExpiringSoon()) {
      return await doRefreshToken()
    }
    return token.value
  }

  // 退出登录
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
    isLoggedIn,
    sendCode,
    login,
    doRefreshToken,
    isTokenExpiringSoon,
    getValidToken,
    logout,
  }
})
