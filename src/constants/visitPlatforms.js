/**
 * 访客来源平台白名单
 * 与后端 visit.source.js 保持同一组 key，管理端展示中文名
 */
export const VISIT_PLATFORMS = [
  { key: 'wechat', label: '微信' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'douyin', label: '抖音' },
  { key: 'weibo', label: '微博' },
  { key: 'qq', label: 'QQ' },
  { key: 'bilibili', label: 'B站' },
  { key: 'zhihu', label: '知乎' },
  { key: 'other', label: '其他' },
]

export const VISIT_PLATFORM_KEYS = VISIT_PLATFORMS.map((item) => item.key)

const PLATFORM_LABEL_MAP = Object.fromEntries(
  VISIT_PLATFORMS.map((item) => [item.key, item.label]),
)

/**
 * 把存储值（platform:wechat / utm:wechat / referrer:host / direct）转成中文来源
 * @param {string} raw 后端 visit_source
 * @returns {string} 中文平台名
 */
export function formatVisitSource(raw) {
  const source = String(raw || '').trim()
  if (!source || source === 'direct') return '直接访问'
  const platformMatch = source.match(/^(?:platform|utm):([a-z0-9_-]+)$/i)
  if (platformMatch) {
    const key = platformMatch[1].toLowerCase()
    return PLATFORM_LABEL_MAP[key] || source
  }
  return source
}

/**
 * 生成可复制的平台追踪链接
 * @param {string} origin 前端站点 origin
 * @param {string} key 平台 key
 * @returns {string}
 */
export function buildShareLink(origin, key) {
  const base = String(origin || '').replace(/\/$/, '')
  return `${base}/?from=${encodeURIComponent(key)}`
}
