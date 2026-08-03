/**
 * 浏览器 Agent 收藏岗位接口。
 * 网页端与扩展共用同一份用户隔离数据，避免出现两套岗位清单。
 */
import request from '@/utils/request'

/** 获取当前用户收藏的岗位。 */
export async function getExtensionJobs() {
  const response = await request.get('/extension/jobs')
  // request 返回统一响应包；网页端在这里解包为与扩展一致的岗位列表结构。
  return response?.data || response
}

export async function getExtensionJob(jobId) {
  const response = await request.get(`/extension/jobs/${encodeURIComponent(jobId)}`)
  return response?.data || response
}

/** 复用既有 jd_match 任务重新分析岗位，并把结果写回收藏。 */
export async function analyzeExtensionJob(jobId) {
  const response = await request.post(`/extension/jobs/${encodeURIComponent(jobId)}/analyze`)
  return response?.data || response
}

/** 取消当前账号中的岗位收藏。 */
export async function deleteExtensionJob(jobId) {
  const response = await request.delete(`/extension/jobs/${encodeURIComponent(jobId)}`)
  return response?.data || response
}
