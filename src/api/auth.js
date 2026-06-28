/**
 * 认证相关API
 * - sendCode / login: 邮箱验证码登录
 * - register: 邮箱验证码 + 用户名 + 密码注册
 * - loginPassword: 用户名/邮箱 + 密码登录
 * - refreshToken: 刷新 token
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

/** 邮箱验证码 + 用户名 + 密码注册 */
export function register(payload) {
  return request.post('/auth/register', payload)
}

/** 用户名/邮箱 + 密码登录 */
export function loginPassword(identifier, password) {
  return request.post('/auth/loginPassword', { identifier, password })
}

/** 使用 refresh_token 换取新的 access_token */
export function refreshToken(refresh_token) {
  return request.post('/auth/refresh', { refresh_token })
}
