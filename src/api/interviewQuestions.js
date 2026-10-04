/** 用户面试题库 API 使用认证 Axios；管理端只读接口仍由服务端做角色与归属校验。 */
import request from '@/utils/request'

// 创建接口只将持久化任务加入队列；轮询接口负责在任意页面恢复可见进度。
export async function generateInterviewQuestions(payload) {
  const response = await request.post('/ai/interview-question-jobs', payload)
  return response?.data || response
}

export async function getActiveInterviewQuestionJob() {
  const response = await request.get('/user/interview-question-jobs/active')
  // 空闲时后端会返回 data:null；必须保留这个 null，不能把外层成功信封当成任务。
  return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response
}

export async function listInterviewQuestionJobs(params = {}) {
  const response = await request.get('/user/interview-question-jobs', { params })
  return response?.data || response
}

export async function getInterviewQuestionJob(jobId) {
  const response = await request.get(`/user/interview-question-jobs/${encodeURIComponent(jobId)}`)
  return response?.data || response
}

export async function createInterviewAnswerReview(setId, questionId, answerDraft) {
  const response = await request.post(
    `/user/interview-question-sets/${encodeURIComponent(setId)}/questions/${encodeURIComponent(questionId)}/reviews`,
    { answer_draft: answerDraft },
    // 点评组件会按当前问题展示错误，避免 Axios 全局提示与局部提示重复弹出。
    { suppressGlobalErrorMessage: true },
  )
  return response?.data || response
}

export async function listInterviewAnswerReviews(setId, questionId) {
  const response = await request.get(
    `/user/interview-question-sets/${encodeURIComponent(setId)}/questions/${encodeURIComponent(questionId)}/reviews`,
  )
  return response?.data || response
}

export async function listInterviewQuestionSets(params = {}) {
  const response = await request.get('/user/interview-question-sets', { params })
  return response?.data || response
}

export async function getInterviewQuestionSet(setId) {
  const response = await request.get(`/user/interview-question-sets/${encodeURIComponent(setId)}`)
  return response?.data || response
}

export async function updateInterviewPractice(setId, questionId, payload) {
  const response = await request.patch(
    `/user/interview-question-sets/${encodeURIComponent(setId)}/questions/${encodeURIComponent(questionId)}/practice`,
    payload,
  )
  return response?.data || response
}

export async function deleteInterviewQuestionSet(setId) {
  return request.delete(`/user/interview-question-sets/${encodeURIComponent(setId)}`)
}

export async function listAdminInterviewQuestionSets(params = {}) {
  const response = await request.get('/admin/interview-question-sets', { params })
  return response?.data || response
}

export async function getAdminInterviewQuestionSet(setId) {
  const response = await request.get(`/admin/interview-question-sets/${encodeURIComponent(setId)}`)
  return response?.data || response
}
