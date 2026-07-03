/**
 * 流式 SSE 文本增量解析为简历对象
 * 容错处理不完整 JSON，避免 UI 展示原始字段名
 */

const STRING_FIELDS = [
  'name', 'school', 'major', 'education', 'phone', 'email',
  'summary', 'target_position', 'targetPosition',
]

function unescapeJsonString(str) {
  return str.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
}

function extractStringField(slice, field) {
  const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`)
  const match = slice.match(re)
  return match ? unescapeJsonString(match[1]) : ''
}

function extractStringArray(slice, field) {
  const blockRe = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)`)
  const match = slice.match(blockRe)
  if (!match) return []
  return [...match[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => unescapeJsonString(m[1]))
}

function normalizeResume(data) {
  const source = data?.resume && typeof data.resume === 'object' ? data.resume : (data || {})
  return {
    name: source.name || '',
    target_position: source.target_position || source.targetPosition || '',
    school: source.school || '',
    major: source.major || '',
    education: source.education || source.degree || '',
    phone: source.phone || '',
    email: source.email || '',
    summary: source.summary || '',
    skills: Array.isArray(source.skills) ? source.skills.filter(Boolean) : [],
    projects: Array.isArray(source.projects) ? source.projects : [],
    internships: Array.isArray(source.internships) ? source.internships : [],
    awards: Array.isArray(source.awards) ? source.awards.filter(Boolean) : [],
    certificates: Array.isArray(source.certificates) ? source.certificates.filter(Boolean) : [],
  }
}

/**
 * 从累积流式文本解析简历（完整或部分）
 */
export function parsePartialResumeJson(text) {
  if (!text?.trim()) return {}

  const start = text.indexOf('{')
  if (start === -1) return {}

  const slice = text.slice(start)

  // 优先尝试完整 JSON 解析
  const end = slice.lastIndexOf('}')
  if (end > 0) {
    try {
      return normalizeResume(JSON.parse(slice.slice(0, end + 1)))
    } catch (e) {
      /* 流式未闭合，走字段提取 */
    }
  }

  // 增量提取已输出的字符串字段
  const partial = {}
  for (const field of STRING_FIELDS) {
    const val = extractStringField(slice, field)
    if (val) {
      if (field === 'targetPosition') partial.target_position = val
      else partial[field] = val
    }
  }

  const skills = extractStringArray(slice, 'skills')
  if (skills.length) partial.skills = skills

  const awards = extractStringArray(slice, 'awards')
  if (awards.length) partial.awards = awards

  return normalizeResume(partial)
}

/** 是否已有可展示的简历内容 */
export function hasStreamResumeContent(resume) {
  return Boolean(
    resume?.name ||
    resume?.summary ||
    resume?.school ||
    resume?.skills?.length ||
    resume?.projects?.length
  )
}
