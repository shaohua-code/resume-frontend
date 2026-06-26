/**
 * 简历相关API
 * AI生成简历、优化项目、JD匹配、评分、保存、列表、详情、删除、导出
 */
import request from '@/utils/request'

/** AI生成简历 */
export function generateResume(data, model = '') {
  // 支持按业务传入模型，不传时由后端默认配置兜底
  const payload = model ? { ...data, model } : data
  return request.post('/resume/generate', payload)
}

/** AI优化项目描述 */
export function optimizeProject(projectDescription, targetPosition = '', model = '') {
  return request.post('/resume/optimize', { project_description: projectDescription, target_position: targetPosition, model })
}

/** JD岗位匹配分析 */
export function matchJd(resumeId, jdText, model = '') {
  return request.post('/resume/match', { resume_id: resumeId, jd_text: jdText, model })
}

/** AI简历评分 */
export function scoreResume(resumeId, model = '') {
  return request.post('/resume/score', { model }, { params: { resume_id: resumeId } })
}

/** 创建简历（仅做 insert，由 AI 生成 / 上传优化 / 首次保存触发） */
export function createResume(data) {
  return request.post('/resume/create', data)
}

/** 更新简历（id 必传，仅做 update） */
export function updateResume(resumeId, data) {
  return request.put(`/resume/update/${resumeId}`, data)
}

/** 保存简历：始终走 update 路径（要求传入 ID），无 ID 时抛出错误 */
export function saveResume(data) {
  if (!data || !data.id) {
    return Promise.reject(new Error('保存简历必须先有 ID，请先创建简历'))
  }
  const { id, ...rest } = data
  return updateResume(id, rest)
}

/** 获取简历列表 */
export function getResumeList(page = 1, size = 10) {
  return request.get('/resume/list', { params: { page, size } })
}

/** 获取简历详情 */
export function getResumeDetail(resumeId) {
  return request.get('/resume/detail', { params: { resume_id: resumeId } })
}

/** 删除简历 */
export function deleteResume(resumeId) {
  return request.delete('/resume/delete', { params: { resume_id: resumeId } })
}

/** 记录导出操作 */
export function exportResume(resumeId) {
  return request.post('/resume/export', null, { params: { resume_id: resumeId } })
}

/**
 * 上传 PDF 简历并由 AI 整体优化
 * @param {File} file PDF 文件
 * @param {string} targetPosition 优化方向
 * @param {(percent:number) => void} onProgress 上传进度回调（0-100）
 */
export function uploadOptimizeResume(file, targetPosition = '', onProgress, model = '') {
  const formData = new FormData()
  formData.append('file', file)
  if (targetPosition) formData.append('target_position', targetPosition)
  if (model) formData.append('model', model)
  return request.post('/resume/uploadOptimize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // PDF解析+AI优化可能较慢，放宽到120秒
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
}

/** 获取当前用户已上传的 PDF 元信息（仅保留一份） */
export function getUploadedResume() {
  return request.get('/resume/uploadedFile')
}

/** 删除当前用户已上传的 PDF */
export function deleteUploadedResume() {
  return request.delete('/resume/uploadedFile')
} 
