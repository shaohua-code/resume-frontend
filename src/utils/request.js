/**
 * Axios 请求封装
 * 统一处理请求基础URL、超时时间、请求拦截（添加Token）、响应拦截（错误处理）
 * 支持 access_token 过期自动刷新
 */
import axios from 'axios'
import message from 'ant-design-vue/es/message'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { getErrorMessage } from '@/utils/errorMessage'
import {
  EMAIL_BINDING_REQUIRED_CODE,
  createOperationCancelledError,
  getCurrentSessionOwner,
  withEmailBindingRetry,
} from '@/utils/emailBindingGate'

// 读取 Vite 环境变量：VITE_API_URL 在 Vercel 项目环境变量中配置
// 本地开发：.env.local 中设置 VITE_API_URL=/（或留空，Vite proxy 会处理 /api）
// 生产环境：设置为 https://resume-backend-node.onrender.com
const API_BASE = import.meta.env.VITE_API_URL || ''

const request = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 60000, // 超时60秒（AI生成可能较慢）
})

// 无需登录即可访问的认证接口，注册/登录/重置密码页调用时不应触发跳转登录
const PUBLIC_AUTH_PATHS = ['/auth/sendCode', '/auth/login', '/auth/register', '/auth/loginPassword', '/auth/refresh', '/auth/resetPassword', '/auth/updatePassword']

function isPublicAuthRequest(url = '') {
  return PUBLIC_AUTH_PATHS.some((path) => url === path || url.endsWith(path))
}

// 请求拦截器：自动在请求头中添加JWT令牌
request.interceptors.request.use(
  async (config) => {
    // 公开认证接口不带 token，避免未登录用户在注册/登录页被误跳转到登录页
    if (isPublicAuthRequest(config.url)) {
      return config
    }
    try {
      const userStore = useUserStore()
      const currentOwner = getCurrentSessionOwner()
      // 重放请求必须仍属于原账号；否则不能重新取得新账号 token 后发送旧账号的 payload。
      if (config.__sessionOwner && config.__sessionOwner !== currentOwner) {
        throw createOperationCancelledError('登录状态已变化，本次请求未继续')
      }
      config.__sessionOwner = config.__sessionOwner || currentOwner
      const token = await userStore.getValidToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      if (e?.silent) return Promise.reject(e)
      // 仅已登录态下 token 失效才清理并跳转；必须同步清 Pinia，避免指引等组件误判仍登录。
      const userStore = useUserStore()
      if (userStore.isLoggedIn || localStorage.getItem('token')) {
        userStore.clearSession()
        router.push('/login')
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误（401 时尝试刷新 token，刷新失败再跳转登录）
request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error?.silent) return Promise.reject(error)
    if (error.response) {
      const { status, data } = error.response
      const originalRequest = error.config

      // 服务端邮箱门禁命中后等待全局弹窗，绑定成功仅重放一次原 Axios 请求。
      if (
        status === 403
        && data?.code === EMAIL_BINDING_REQUIRED_CODE
        && originalRequest
        && !originalRequest.__emailBindingRetried
      ) {
        originalRequest.__emailBindingRetried = true
        // 迟到的 403 若已跨账号，必须在修改当前用户状态和打开门禁之前静默终止。
        if (
          !originalRequest.__sessionOwner
          || originalRequest.__sessionOwner !== getCurrentSessionOwner()
        ) {
          return Promise.reject(createOperationCancelledError('登录状态已变化，本次 AI 操作未继续'))
        }
        const userStore = useUserStore()
        userStore.patchUserInfo({ email_verified: false, email_bound: false })
        try {
          return await withEmailBindingRetry(
            () => request(originalRequest),
            {
              signal: originalRequest.signal,
              sessionOwner: originalRequest.__sessionOwner,
            },
          )
        } catch (gateError) {
          // 用户取消绑定时保持静默，由发起操作的页面负责结束 loading 状态。
          return Promise.reject(gateError)
        }
      }

      if (status === 401 && originalRequest && !isPublicAuthRequest(originalRequest.url)) {
        const requestOwner = originalRequest.__sessionOwner
        if (!requestOwner || requestOwner !== getCurrentSessionOwner()) {
          return Promise.reject(createOperationCancelledError('登录状态已变化，本次请求未继续'))
        }
        if (originalRequest.__authRetried) {
          useUserStore().clearSession()
          message.error(getErrorMessage(error, '登录已过期，请重新登录'))
          router.push('/login')
          return Promise.reject(error)
        }
        originalRequest.__authRetried = true
        try {
          const userStore = useUserStore()
          const newToken = await userStore.doRefreshToken()
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return request(originalRequest)
        } catch (refreshError) {
          if (refreshError?.silent || requestOwner !== getCurrentSessionOwner()) {
            return Promise.reject(refreshError?.silent
              ? refreshError
              : createOperationCancelledError('登录状态已变化，本次请求未继续'))
          }
          useUserStore().clearSession()
          message.error(getErrorMessage(refreshError, '登录已过期，请重新登录'))
          router.push('/login')
          return Promise.reject(refreshError)
        }
      } else {
        // 统一友好提示，避免直接展示 detail 中的技术原文
        const tip = getErrorMessage(error)
        if (tip) message.error(tip)
      }
    } else {
      const tip = getErrorMessage(error)
      if (tip) message.error(tip)
    }
    return Promise.reject(error)
  }
)

export default request
