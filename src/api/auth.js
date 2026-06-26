/**
 * 认证相关API
 * 发送验证码、验证码登录、刷新 token
 */
import request from '@/utils/request'

/** 发送验证码到邮箱 */
export function sendCode(email) {
  return request.post('/auth/sendCode', { email })
}

/** 验证码登录 */
export function login(email, code) {
  return request.post('/auth/login', { email, code })
}

/** 使用 refresh_token 换取新的 access_token */
export function refreshToken(refresh_token) {
  return request.post('/auth/refresh', { refresh_token })
}
