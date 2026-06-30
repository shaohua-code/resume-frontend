/**
 * Axios 请求封装
 * 统一处理请求基础URL、超时时间、请求拦截（添加Token）、响应拦截（错误处理）
 * 支持 access_token 过期自动刷新
 */
import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 读取 Vite 环境变量：VITE_API_URL 在 Vercel 项目环境变量中配置
// 本地开发：.env.local 中设置 VITE_API_URL=/（或留空，Vite proxy 会处理 /api）
// 生产环境：设置为 https://resume-backend-node.onrender.com
const API_BASE = import.meta.env.VITE_API_URL || ''

const request = axios.create({
  baseURL: `/api`,
  timeout: 60000, // 超时60秒（AI生成可能较慢）
})

// 无需登录即可访问的认证接口，注册/登录页调用时不应触发跳转登录
const PUBLIC_AUTH_PATHS = ['/auth/sendCode', '/auth/login', '/auth/register', '/auth/loginPassword', '/auth/refresh']

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
      const token = await userStore.getValidToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      // 仅已登录态下 token 失效才清理并跳转；未登录用户继续放行（由业务页自行处理）
      const hasAuthState = !!localStorage.getItem('token')
      if (hasAuthState) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('expires_at')
        localStorage.removeItem('userInfo')
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
    if (error.response) {
      const { status, data } = error.response
      const originalRequest = error.config

      if (status === 401 && !isPublicAuthRequest(originalRequest.url)) {
        try {
          const userStore = useUserStore()
          const newToken = await userStore.doRefreshToken()
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return request(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('expires_at')
          localStorage.removeItem('userInfo')
          message.error('登录已过期，请重新登录')
          router.push('/login')
          return Promise.reject(refreshError)
        }
      } else {
        message.error(data.detail || '请求失败，请重试')
      }
    } else {
      message.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request
