/**
 * 流式 SSE 文本增量解析为简历对象
 */
import { normalizeResumeFields, normalizeEducationItem, normalizeCustomField } from '@/constants/resumeFieldSchema'

// 流式解析需要提取的字符串字段（包含岗位相关的中文变体）
const STRING_FIELDS = [
  'name', 'school', 'major', 'main_course', 'education', 'phone', 'email',
  'summary', 'target_position', 'targetPosition',
  'work_years', 'marital_status', 'height', 'weight',
  'ethnicity', 'native_place', 'political_status', 'expected_salary',
  // 岗位相关字段（AI 可能返回的中文/英文变体）
  '意向岗位', '求职岗位', '面试岗位', '应聘岗位',
]

/** 岗位字段的别名列表（流式增量解析时统一映射到 target_position）*/
const POSITION_ALIAS_FIELDS = ['targetPosition', '意向岗位', '求职岗位', '面试岗位', '应聘岗位']

/**
 * 从 AI 返回数据中提取目标岗位（兼容多种字段命名）
 * 与后端 ai.service.js 的 extractTargetPosition 保持一致
 * @param {Object} source AI 原始返回数据
 * @returns {string} 目标岗位字符串
 */
function extractTargetPosition(source) {
  return (
    source.target_position ||
    source.targetPosition ||
    source['意向岗位'] ||
    source['求职岗位'] ||
    source['面试岗位'] ||
    source['应聘岗位'] ||
    source.position ||
    ''
  )
}

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
  // 使用统一提取函数兼容多种岗位字段命名
  const base = {
    name: source.name || '',
    target_position: extractTargetPosition(source),
    school: source.school || '',
    major: source.major || '',
    main_course: source.main_course || source.mainCourse || '',
    education: source.education || source.degree || '',
    phone: source.phone || '',
    email: source.email || '',
    summary: source.summary || '',
    work_years: source.work_years || source.workYears || '',
    marital_status: source.marital_status || source.maritalStatus || '',
    height: source.height || '',
    weight: source.weight || '',
    ethnicity: source.ethnicity || '',
    native_place: source.native_place || source.nativePlace || '',
    political_status: source.political_status || source.politicalStatus || '',
    expected_salary: source.expected_salary || source.expectedSalary || '',
    skills: Array.isArray(source.skills) ? source.skills.filter(Boolean) : [],
    projects: Array.isArray(source.projects) ? source.projects : [],
    internships: Array.isArray(source.internships) ? source.internships : [],
    awards: Array.isArray(source.awards) ? source.awards.filter(Boolean) : [],
    certificates: Array.isArray(source.certificates) ? source.certificates.filter(Boolean) : [],
    educations: Array.isArray(source.educations)
      ? source.educations.map(normalizeEducationItem)
      : [],
    custom_fields: Array.isArray(source.custom_fields)
      ? source.custom_fields.map(normalizeCustomField)
      : Array.isArray(source.customFields)
        ? source.customFields.map(normalizeCustomField)
        : [],
  }
  return normalizeResumeFields(base)
}

/**
 * 从累积流式文本解析简历（完整或部分）
 */
export function parsePartialResumeJson(text) {
  if (!text?.trim()) return {}

  const start = text.indexOf('{')
  if (start === -1) return {}

  const slice = text.slice(start)

  const end = slice.lastIndexOf('}')
  if (end > 0) {
    try {
      return normalizeResume(JSON.parse(slice.slice(0, end + 1)))
    } catch (e) {
      /* 流式未闭合，走字段提取 */
    }
  }

  const partial = {}
  for (const field of STRING_FIELDS) {
    const val = extractStringField(slice, field)
    if (val) {
      // 所有岗位变体字段统一归入 target_position
      if (POSITION_ALIAS_FIELDS.includes(field)) {
        partial.target_position = val
      } else {
        partial[field] = val
      }
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
    resume?.educations?.length ||
    resume?.skills?.length ||
    resume?.projects?.length
  )
}
