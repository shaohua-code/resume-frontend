/**
 * 管理后台 API
 */
import request from '@/utils/request'

export function getAdminStats() {
  return request.get('/admin/stats')
}

/**
 * 获取管理后台数据中心大盘数据
 * @param {string} timeRange - 时间范围（今日/昨日/7日/30日/年度）
 * @returns {Promise} 大盘统计数据
 */
export function getAdminDashboard(timeRange) {
  const params = timeRange ? { range: timeRange } : {}
  return request.get('/admin/dashboard', { params })
}

export function getAdminUsers(params = {}) {
  return request.get('/admin/users', { params })
}

export function updateAdminUser(userId, data) {
  return request.patch(`/admin/users/${userId}`, data)
}

export function resetAdminUserPassword(userId) {
  return request.post(`/admin/users/${userId}/reset-password`)
}

export function getAdminWallets(params = {}) {
  return request.get('/admin/wallets', { params })
}

export function adjustUserBalance(userId, data) {
  return request.post(`/admin/users/${userId}/balance`, data)
}

/**
 * 通过邮箱认领用户（建立归属关系）
 */
export function claimUserByEmail(email) {
  return request.post('/admin/users/claim', { email })
}

/**
 * 获取当前管理员额度摘要（我的可用额度 + 实付合计）
 */
export function getWalletSummary() {
  return request.get('/admin/wallet/summary')
}

/** 获取当前管理员的充值二维码配置 */
export function getAdminRechargeConfig() {
  return request.get('/admin/recharge-config')
}

/** 保存当前管理员的充值二维码配置 */
export function saveAdminRechargeConfig(data) {
  return request.put('/admin/recharge-config', data)
}

/** 充值记录列表 */
export function getAdminRechargeRequests(params = {}) {
  return request.get('/admin/recharge-requests', { params })
}

/** 充值记录详情 */
export function getAdminRechargeRequestDetail(id) {
  return request.get(`/admin/recharge-requests/${id}`)
}

/**
 * 充值邮件预览
 * @param {number|string} id 充值记录 ID
 * @param {string} type 邮件类型 admin_notify | user_confirm
 * @param {{ grant_amount?: number }} params 可选覆盖实际充值金额
 */
export function previewRechargeEmail(id, type = 'admin_notify', params = {}) {
  return request.get(`/admin/recharge-requests/${id}/email-preview`, {
    params: { type, ...params },
  })
}

/** 删除待充值记录（仅超管） */
export function deleteRechargeRequest(id) {
  return request.delete(`/admin/recharge-requests/${id}`)
}

/** 审核充值入账 */
export function approveRechargeRequest(id, data) {
  return request.post(`/admin/recharge-requests/${id}/approve`, data)
}

/** 读取充值邮件模板（超管） */
export function getRechargeEmailTemplates() {
  return request.get('/admin/recharge-email-templates')
}

/** 保存充值邮件模板（超管） */
export function saveRechargeEmailTemplates(data) {
  return request.put('/admin/recharge-email-templates', data)
}

/**
 * 获取消费记录列表
 */
export function getAdminLedgers(params = {}) {
  return request.get('/admin/ledgers', { params })
}

/**
 * 邀请链接管理
 */
export function getInviteLinks() {
  return request.get('/admin/invite-links')
}

export function createInviteLink(data = {}) {
  return request.post('/admin/invite-links', data)
}

export function updateInviteLink(id, data) {
  return request.patch(`/admin/invite-links/${id}`, data)
}

export function deleteInviteLink(id) {
  return request.delete(`/admin/invite-links/${id}`)
}

export function getAdminAiCalls(params = {}) {
  return request.get('/admin/ai-calls', { params })
}

export function getAdminResumes(params = {}) {
  return request.get('/admin/resumes', { params })
}

export function getAdminResumeDetail(id) {
  return request.get(`/admin/resumes/${id}`)
}

export function getAdminFeedbacks(params = {}) {
  return request.get('/admin/feedbacks', { params })
}

export function getAdminVisits(params = {}) {
  return request.get('/admin/visits', { params })
}

export function getAdminFeedbackDetail(id) {
  return request.get(`/admin/feedbacks/${id}`)
}

export function getAdminConfigs() {
  return request.get('/admin/configs')
}

export function saveAdminConfig(key, data) {
  return request.put(`/admin/configs/${key}`, data)
}

export function createCrudApi(path) {
  return {
    list: () => request.get(`/admin/${path}`),
    create: (data) => request.post(`/admin/${path}`, data),
    update: (id, data) => request.patch(`/admin/${path}/${id}`, data),
    remove: (id) => request.delete(`/admin/${path}/${id}`),
  }
}

export const announcementApi = createCrudApi('announcements')
export const aiModelApi = createCrudApi('models')
