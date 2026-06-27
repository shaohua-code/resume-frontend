/**
 * 管理后台 API
 * 统一封装 /api/admin 下的接口，页面只负责传参和展示。
 */
import request from '@/utils/request'

export function getAdminStats() {
  return request.get('/admin/stats')
}

// 数据中心大盘聚合数据（统计卡、趋势、订单概览、公告、系统状态）
export function getAdminDashboard() {
  return request.get('/admin/dashboard')
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

export function getAdminOrders(params = {}) {
  return request.get('/admin/orders', { params })
}

export function createAdminOrder(data) {
  return request.post('/admin/orders', data)
}

export function updateAdminOrder(id, data) {
  return request.patch(`/admin/orders/${id}`, data)
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

export const membershipPlanApi = createCrudApi('plans')
export const announcementApi = createCrudApi('announcements')
export const aiModelApi = createCrudApi('models')
