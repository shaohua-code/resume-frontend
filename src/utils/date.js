/**
 * 统一时间格式化工具
 * 全局统一使用 YYYY-MM-DD HH:mm:ss 格式展示时间
 */
import dayjs from 'dayjs'

/**
 * 格式化时间为 YYYY-MM-DD HH:mm:ss
 * @param {string|number|Date} value 时间值（ISO 字符串 / 时间戳 / Date 对象）
 * @returns {string} 格式化后的时间字符串，无效值返回 '-'
 */
export function formatDateTime(value) {
  if (!value) return '-'
  const d = dayjs(value)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : '-'
}
