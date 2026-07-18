/**
 * 简历相关API
 * AI生成简历、优化项目、JD匹配、评分、保存、列表、详情、删除、导出、PDF优化
 */
import request from '@/utils/request'
import {
  EMAIL_BINDING_REQUIRED_CODE,
  getCurrentSessionOwner,
  withEmailBindingRetry,
} from '@/utils/emailBindingGate'

// 流式请求的 API 基础地址，与 request.js 保持一致
const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * 原生 fetch 不经过 Axios 拦截器，因此在这里统一识别“需要绑定邮箱”。
 * 首次请求被服务端拦截后等待全局弹窗完成，再原样重试一次，文件/FormData 也不会丢失。
 */
async function fetchSSEWithEmailGate(operation, options = {}) {
  const sessionOwner = getCurrentSessionOwner()
  let response = await operation()
  if (response.ok) return response

  let errorBody = null
  try {
    errorBody = await response.clone().json()
  } catch {
    // 非 JSON 错误继续交给各接口原有的错误提示处理。
  }

  const code = errorBody?.code || errorBody?.data?.code
  if (code === EMAIL_BINDING_REQUIRED_CODE) {
    response = await withEmailBindingRetry(operation, {
      signal: options.signal,
      sessionOwner,
    })
  }
  return response
}

/** 每次执行（包括邮箱绑定后的重试）都重新取得有效令牌，避免续接时使用过期 token。 */
async function authorizedSSEFetch(url, options = {}) {
  const { useUserStore } = await import('@/stores/user')
  const token = await useUserStore().getValidToken()
  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(url, { ...options, headers })
}

/**
 * 分模块 AI 流式优化
 * @param {'summary'|'skills'|'project'|'internship'} type 优化类型
 * @param {object} payload 请求体 { resume, index? }
 * @param {object} handlers 流式回调 { onChunk, onDone, onError, onStatus }
 * @param {string} model 可选模型
 */
export async function optimizeResumePartStream(type, payload, handlers = {}, model = '') {
  const body = { ...payload }
  if (model) body.model = model

  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/ai/optimize/${type}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '优化失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    const err = new Error(detail)
    throw err
  }

  return readSSEStream(response, handlers)
}

/** AI生成简历 */
export function generateResume(data, model = '') {
  // 支持按业务传入模型，不传时由后端默认配置兜底
  const payload = model ? { ...data, model } : data
  return request.post('/ai/generate', payload)
}

/**
 * AI生成简历（SSE 流式）
 * @param {object} data 表单数据
 * @param {object} handlers 流式回调 { onChunk, onDone, onError }
 * @param {string} model 可选模型
 */
export async function generateResumeStream(data, handlers = {}, model = '') {
  const { onChunk, onDone, onError } = handlers
  const payload = model ? { ...data, model } : data

  // 流式请求需绕过 axios 拦截器，直接使用 fetch 读取 ReadableStream
  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/ai/generate/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '生成失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    const err = new Error(detail)
    throw err
  }

  return readSSEStream(response, handlers)
}

/**
 * 从自由文字中流式提取简历字段。
 * 该接口只识别原文事实，不生成、润色或补写内容；最终生成仍由用户在表单末尾主动触发。
 */
export async function extractResumeTextStream(rawText, handlers = {}, model = '') {
  const body = { raw_text: rawText }
  if (model) body.model = model

  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/ai/extract-resume/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '文字识别失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    throw new Error(detail)
  }

  return readSSEStream(response, handlers)
}

/**
 * 解析 SSE 行事件（与 generateResumeStream 共用格式）
 */
async function readSSEStream(response, handlers = {}) {
  const { onChunk, onDone, onError, onStatus } = handlers
  const reader = response.body?.getReader()
  if (!reader) {
    const err = new Error('浏览器不支持流式响应')
    onError?.(err)
    throw err
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let finalData = null
  let completed = false

  /** 单行解析失败只忽略该行；服务端明确 error 事件必须向上抛出。 */
  function handleLine(line) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    let event
    try {
      event = JSON.parse(trimmed.slice(5).trim())
    } catch {
      return
    }
    if (event.status) onStatus?.(event.status)
    if (event.chunk) onChunk?.(event.chunk)
    if (event.error) {
      const streamError = new Error(event.error)
      streamError.code = event.code || ''
      throw streamError
    }
    if (event.done && Object.prototype.hasOwnProperty.call(event, 'data')) {
      completed = true
      finalData = event.data
      onDone?.(event.data)
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) handleLine(line)
    }
    buffer += decoder.decode()
    if (buffer.trim()) handleLine(buffer)
    if (!completed) {
      const incompleteError = new Error('AI 流式响应未返回完成结果，请重试')
      incompleteError.code = 'SSE_INCOMPLETE'
      throw incompleteError
    }
    return finalData
  } catch (error) {
    if (error?.name === 'AbortError') error.silent = true
    onError?.(error)
    throw error
  } finally {
    reader.releaseLock?.()
    // AI 可能已在完成或错误事件前计费，流结束后统一刷新钱包展示。
    try {
      const { useWalletStore } = await import('@/stores/wallet')
      await useWalletStore().fetchBalance()
    } catch {
      // 退出登录或余额刷新失败不覆盖本次 AI 的真实结果。
    }
  }
}

/**
 * 上传 PDF 并流式提取其中已有的简历字段。
 * 与 PDF 优化接口保持独立，避免用户点击“识别”时提前改写原简历内容。
 * 上传成功后会覆盖用户名下唯一保留的那份 PDF，供下次直接识别。
 */
export async function uploadRecognizeResumeStream(file, handlers = {}, model = '') {
  const formData = new FormData()
  formData.append('file', file)
  if (model) formData.append('model', model)

  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/pdf/uploadRecognize/stream`, {
    method: 'POST',
    body: formData,
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = 'PDF 识别失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    throw new Error(detail)
  }

  return readSSEStream(response, handlers)
}

/**
 * 使用已上传 PDF 流式纯识别（无需重新选择文件）。
 */
export async function uploadRecognizeExistingStream(handlers = {}, model = '') {
  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/pdf/uploadRecognize/existing/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(model ? { model } : {}),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = 'PDF 识别失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    throw new Error(detail)
  }

  return readSSEStream(response, handlers)
}

/**
 * 上传 PDF 并由 AI 流式优化
 */
export async function uploadOptimizeResumeStream(file, targetPosition = '', handlers = {}, model = '') {
  const formData = new FormData()
  formData.append('file', file)
  if (targetPosition) formData.append('target_position', targetPosition)
  if (model) formData.append('model', model)

  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/pdf/uploadOptimize/stream`, {
    method: 'POST',
    body: formData,
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '优化失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    const err = new Error(detail)
    throw err
  }

  return readSSEStream(response, handlers)
}

/** JD岗位匹配分析 */
export function matchJd(resumeId, jdText, model = '') {
  return request.post('/ai/match', { resume_id: resumeId, jd_text: jdText, model })
}

/**
 * 基于岗位 JD 流式优化整份简历（SSE）
 * @param {object} resume 当前简历对象
 * @param {string} jdText 岗位 JD 文本
 * @param {object} handlers 流式回调 { onChunk, onDone, onError, onStatus }
 * @param {string} model 可选模型
 */
export async function optimizeResumeByJdStream(resume, jdText, handlers = {}, model = '') {
  const body = { resume, jd_text: jdText }
  if (model) body.model = model

  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/ai/optimize-by-jd/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '岗位优化失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    const err = new Error(detail)
    throw err
  }

  return readSSEStream(response, handlers)
}

/**
 * 从 JD 图片提取岗位描述文本
 * @param {File} file 图片文件
 */
export function extractJdFromImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/ai/extract-jd-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  })
}

/**
 * 从 JD 图片流式提取岗位描述文本
 * @param {File} file 图片文件
 * @param {object} handlers 流式回调 { onChunk, onDone, onError, onStatus }
 */
export async function extractJdFromImageStream(file, handlers = {}, model = '') {
  const formData = new FormData()
  formData.append('file', file)
  if (model) formData.append('model', model)

  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/ai/extract-jd-image/stream`, {
    method: 'POST',
    body: formData,
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '图片识别失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    throw new Error(detail)
  }

  return readSSEStream(response, handlers)
}

/**
 * 上传 PDF 并根据岗位 JD 流式优化（SSE）
 * @param {File} file PDF 文件
 * @param {string} jdText 岗位 JD 文本
 */
export async function uploadOptimizeByJdStream(file, jdText, handlers = {}, model = '') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('jd_text', jdText)
  if (model) formData.append('model', model)

  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/pdf/uploadOptimizeByJd/stream`, {
    method: 'POST',
    body: formData,
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '岗位优化失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    const err = new Error(detail)
    throw err
  }

  return readSSEStream(response, handlers)
}

/**
 * 使用已上传 PDF 根据岗位 JD 流式优化（SSE）
 * @param {string} jdText 岗位 JD 文本
 */
export async function uploadOptimizeByJdExistingStream(jdText, handlers = {}, model = '') {
  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/pdf/uploadOptimizeByJd/existing/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jd_text: jdText,
      ...(model ? { model } : {}),
    }),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '岗位优化失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    const err = new Error(detail)
    throw err
  }

  return readSSEStream(response, handlers)
}

/** AI简历评分 */
export function scoreResume(resumeId, model = '') {
  return request.post('/ai/score', { model }, { params: { resume_id: resumeId } })
}

/** AI简历评分（SSE 流式输出中文评分报告） */
export async function scoreResumeStream(resumeId, handlers = {}, model = '') {
  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/ai/score/stream?resume_id=${encodeURIComponent(resumeId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(model ? { model } : {}),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '评分失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    throw new Error(detail)
  }

  return readSSEStream(response, handlers)
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

/** 批量删除简历 */
export function batchDeleteResume(ids) {
  return request.post('/resume/batch-delete', { ids })
}

/** 获取当前用户简历数量与上限 */
export function getResumeCount() {
  return request.get('/resume/count')
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
  return request.post('/pdf/uploadOptimize', formData, {
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
  return request.get('/pdf/uploadedFile')
}

/** 删除当前用户已上传的 PDF */
export function deleteUploadedResume() {
  return request.delete('/pdf/uploadedFile')
}

/**
 * 使用已上传的 PDF 进行 AI 流式优化（无需重新上传文件）
 */
export async function uploadOptimizeExistingStream(targetPosition = '', handlers = {}, model = '') {
  const response = await fetchSSEWithEmailGate(() => authorizedSSEFetch(`${API_BASE}/api/pdf/uploadOptimize/existing/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target_position: targetPosition,
      ...(model ? { model } : {}),
    }),
    signal: handlers.signal,
  }), { signal: handlers.signal })

  if (!response.ok) {
    let detail = '优化失败，请重试'
    try {
      const errJson = await response.json()
      detail = errJson.detail || detail
    } catch (e) {
      /* ignore */
    }
    const err = new Error(detail)
    throw err
  }

  return readSSEStream(response, handlers)
}

/** 使用已上传的 PDF 进行 AI 同步优化 */
export function uploadOptimizeExisting(targetPosition = '', model = '') {
  return request.post('/pdf/uploadOptimize/existing', {
    target_position: targetPosition,
    ...(model ? { model } : {}),
  })
}
