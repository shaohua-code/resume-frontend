/**
 * 认证相关API
 * - sendCode / login: 已绑定邮箱的验证码登录
 * - register: 系统随机生成账号与密码
 * - loginPassword: 账号/邮箱 + 密码登录
 * - sendEmailBindingCode / bindEmail: 登录后绑定唯一邮箱
 * - refreshToken: 刷新 token
 * - resetPassword: 发送密码重置验证码
 * - updatePassword: 使用邮箱验证码重置密码
 */
import request from '@/utils/request'

/** 向已绑定邮箱发送登录验证码 */
export function sendCode(email) {
  return request.post('/auth/sendCode', { email })
}

/** 使用已绑定邮箱和验证码登录 */
export function login(email, code) {
  return request.post('/auth/login', { email, code })
}

/** 随机账号注册；邀请码为空时不发送无意义字段 */
export function register(inviteCode = '') {
  return request.post('/auth/register', inviteCode ? { invite_code: inviteCode } : {})
}

/** 账号/邮箱 + 密码登录 */
export function loginPassword(identifier, password) {
  return request.post('/auth/loginPassword', { identifier, password })
}

/** 为当前登录账号发送邮箱绑定验证码 */
export function sendEmailBindingCode(email) {
  return request.post('/auth/email/send-code', { email })
}

/** 校验验证码并为当前登录账号绑定邮箱 */
export function bindEmail(email, code) {
  return request.post('/auth/email/bind', { email, code })
}

/** 使用 refresh_token 换取新的 access_token */
export function refreshToken(refresh_token) {
  return request.post('/auth/refresh', { refresh_token })
}

/** 发送密码重置验证码到邮箱 */
export function resetPassword(email) {
  return request.post('/auth/resetPassword', { email })
}

/** 使用邮箱验证码重置密码 */
export function updatePassword(email, code, password) {
  return request.post('/auth/updatePassword', { email, code, password })
}

/** 读取 IAM 登录开关，不回显任何机密配置。 */
export function getIamLoginConfig() {
  return request.get('/auth/iam/config')
}

/** 启动 IAM 授权码登录并允许浏览器接收一次性 HttpOnly state cookie。 */
export function startIamLogin() {
  return request.post('/auth/iam/login/start', {}, { withCredentials: true })
}

/** 将 URL fragment 中的一次性桥接码兑换为既有本地会话。 */
export function exchangeIamLoginCode(code) {
  return request.post('/auth/iam/exchange', { code })
}

/** 读取当前本地用户的显式 IAM 身份绑定状态。 */
export function getIamLinkStatus() {
  return request.get('/auth/iam/link/status')
}

/** 已登录用户主动启动 IAM 身份绑定。 */
export function startIamLink() {
  return request.post('/auth/iam/link/start', {}, { withCredentials: true })
}