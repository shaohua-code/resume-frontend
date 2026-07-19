/**
 * 将接口/网络异常转成用户可读的中文提示，避免暴露堆栈、SQL 或驱动原文。
 */
import { EMAIL_BINDING_REQUIRED_CODE } from '@/utils/emailBindingGate'

const FRIENDLY_FALLBACK = '操作失败，请稍后重试'
const BUSY_FALLBACK = '服务暂时繁忙，请稍后重试'

/** 明显的技术噪声：不应直接展示给终端用户 */
const TECHNICAL_PATTERN = /(at\s+\S+|stack|ECONN|ENOENT|postgres|sql|syntax error|TypeError|ReferenceError|Cannot read|undefined is not|ETIMEDOUT|ECONNREFUSED)/i

/**
 * @param {unknown} error - Axios / fetch / Error / 字符串
 * @param {string} [fallback]
 * @returns {string}
 */
export function getErrorMessage(error, fallback = FRIENDLY_FALLBACK) {
  if (error?.silent) return ''

  const status = error?.response?.status
  const data = error?.response?.data
  const code = data?.code
  const rawDetail = pickRawMessage(data, error)

  if (code === EMAIL_BINDING_REQUIRED_CODE) {
    return '使用 AI 功能前需要先绑定并验证邮箱'
  }
  if (status === 401) return '登录已过期，请重新登录'
  if (status === 402) return '账户余额不足，请先充值后再试'
  if (status === 403) return sanitizeMessage(rawDetail) || '暂无权限执行此操作'
  if (status === 404) return sanitizeMessage(rawDetail) || '未找到相关内容'
  if (status === 409) return sanitizeMessage(rawDetail) || '操作冲突，请刷新后重试'
  if (status === 429) return '操作过于频繁，请稍后再试'
  if (status >= 500) return sanitizeMessage(rawDetail) || BUSY_FALLBACK

  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || /timeout/i.test(String(error?.message || ''))) {
      return '请求超时，请检查网络后重试'
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return '网络已断开，请检查网络连接'
    }
    return '网络异常，请检查网络连接后重试'
  }

  return sanitizeMessage(rawDetail) || fallback
}

function pickRawMessage(data, error) {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (data?.detail && typeof data.detail === 'string') return data.detail.trim()
  if (data?.message && typeof data.message === 'string') return data.message.trim()
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return String(data.detail[0].msg)
  if (error?.message && typeof error.message === 'string') return error.message.trim()
  return ''
}

function sanitizeMessage(text) {
  if (!text) return ''
  const trimmed = String(text).trim()
  if (!trimmed) return ''
  // 技术细节或过长英文堆栈改为通用提示
  if (TECHNICAL_PATTERN.test(trimmed)) return BUSY_FALLBACK
  if (trimmed.length > 160) return `${trimmed.slice(0, 160)}…`
  return trimmed
}
