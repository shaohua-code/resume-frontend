/**
 * 管理后台 API
 */
import request from '@/utils/request'

export function getAdminStats() {
  return request.get('/admin/stats')
}

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

export function getAdminWallets(params = {}) {
  return request.get('/admin/wallets', { params })
}

export function adjustUserBalance(userId, data) {
  return request.post(`/admin/users/${userId}/balance`, data)
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
