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
