/**
 * 流式 SSE 文本增量解析为简历对象
 */
import {
  normalizeResumeFields,
  normalizeEducationItem,
  normalizeCustomField,
  normalizeProjectItem,
  normalizeInternshipItem,
  normalizeWorkExperienceItem,
} from '@/constants/resumeFieldSchema'

// 流式解析需要提取的字符串字段（包含岗位相关的中文变体）
const STRING_FIELDS = [
  'name', 'school', 'major', 'main_course', 'education', 'phone', 'email',
  'summary', 'target_position', 'targetPosition',
  'work_years', 'marital_status', 'height', 'weight',
  'ethnicity', 'native_place', 'political_status', 'expected_salary',
  // 岗位相关字段（AI 可能返回的中文/英文变体，含示例常用的「求职意向」）
  '求职意向', '意向岗位', '目标岗位', '期望岗位', '求职岗位', '面试岗位', '应聘岗位', '意向职位',
]

/** 岗位字段的别名列表（流式增量解析时统一映射到 target_position）*/
const POSITION_ALIAS_FIELDS = [
  'targetPosition',
  '求职意向',
  '意向岗位',
  '目标岗位',
  '期望岗位',
  '求职岗位',
  '面试岗位',
  '应聘岗位',
  '意向职位',
]

/**
 * 从 AI 返回数据中提取目标岗位（兼容多种字段命名）
 * 与后端 resume-content.js 的 extractTargetPosition 保持一致
 * @param {Object} source AI 原始返回数据
 * @returns {string} 目标岗位字符串
 */
function extractTargetPosition(source) {
  return (
    source.target_position
    || source.targetPosition
    || source['求职意向']
    || source['意向岗位']
    || source['目标岗位']
    || source['期望岗位']
    || source['求职岗位']
    || source['面试岗位']
    || source['应聘岗位']
    || source['意向职位']
    || source.job_intention
    || source.jobIntention
    || source.position
    || ''
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

/**
 * 从尚未闭合的数组中提取已经闭合的对象。
 * 流式输出不完整时只返回可安全 JSON.parse 的项目，后续项目会在下一批 chunk 自动补齐。
 */
function extractCompletedObjectArray(slice, field) {
  const fieldMatch = new RegExp(`"${field}"\\s*:\\s*\\[`).exec(slice)
  if (!fieldMatch) return []

  const arrayStart = fieldMatch.index + fieldMatch[0].length
  const objects = []
  let objectStart = -1
  let depth = 0
  let inString = false
  let escaped = false

  for (let index = arrayStart; index < slice.length; index += 1) {
    const char = slice[index]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') {
      inString = true
      continue
    }
    if (char === '{') {
      if (depth === 0) objectStart = index
      depth += 1
      continue
    }
    if (char === '}' && depth > 0) {
      depth -= 1
      if (depth === 0 && objectStart >= 0) {
        try {
          objects.push(JSON.parse(slice.slice(objectStart, index + 1)))
        } catch {
          // 单个对象还不可解析时保留既有结果，等待后续 chunk。
        }
        objectStart = -1
      }
      continue
    }
    if (char === ']' && depth === 0) break
  }
  return objects
}

function normalizeResume(data) {
  const source = data?.resume && typeof data.resume === 'object' ? data.resume : (data || {})
  // 教育：优先 educations，兼容模型把多段写进 education[]
  const educations = Array.isArray(source.educations) && source.educations.length
    ? source.educations
    : Array.isArray(source.education_list) && source.education_list.length
      ? source.education_list
      : Array.isArray(source.education) && source.education.length
        ? source.education
        : []
  // 项目：兼容 project_experiences 等别名，避免流式阶段丢项目
  const projects = Array.isArray(source.projects) && source.projects.length
    ? source.projects
    : Array.isArray(source.project_experiences) && source.project_experiences.length
      ? source.project_experiences
      : Array.isArray(source.projectExperiences) && source.projectExperiences.length
        ? source.projectExperiences
        : Array.isArray(source.project_list) && source.project_list.length
          ? source.project_list
          : []
  // 扁平 education 仅保留字符串学历，避免数组污染 degree
  const flatEducation = typeof source.education === 'string'
    ? source.education
    : (source.degree || '')

  // 使用统一提取函数兼容多种岗位字段命名
  const base = {
    name: source.name || '',
    target_position: extractTargetPosition(source),
    school: source.school || '',
    major: source.major || '',
    main_course: source.main_course || source.mainCourse || '',
    education: flatEducation,
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
    projects,
    internships: Array.isArray(source.internships)
      ? source.internships.map(normalizeInternshipItem)
      : Array.isArray(source.internship_experiences)
        ? source.internship_experiences.map(normalizeInternshipItem)
        : Array.isArray(source['实习经历'])
          ? source['实习经历'].map(normalizeInternshipItem)
          : [],
    work_experiences: Array.isArray(source.work_experiences)
      ? source.work_experiences.map(normalizeWorkExperienceItem)
      : Array.isArray(source.workExperiences)
        ? source.workExperiences.map(normalizeWorkExperienceItem)
        : Array.isArray(source.work_experience)
          ? source.work_experience.map(normalizeWorkExperienceItem)
          : Array.isArray(source['工作经历'])
            ? source['工作经历'].map(normalizeWorkExperienceItem)
            : [],
    awards: Array.isArray(source.awards) ? source.awards.filter(Boolean) : [],
    certificates: Array.isArray(source.certificates) ? source.certificates.filter(Boolean) : [],
    educations: educations.map(normalizeEducationItem),
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

  // 技能/证书可能是字符串数组，也可能是 {name/title} 对象数组
  const skills = extractStringArray(slice, 'skills')
  const skillObjects = extractCompletedObjectArray(slice, 'skills')
  if (skills.length) partial.skills = skills
  else if (skillObjects.length) partial.skills = skillObjects

  const awards = extractStringArray(slice, 'awards')
  const awardObjects = extractCompletedObjectArray(slice, 'awards')
  if (awards.length) partial.awards = awards
  else if (awardObjects.length) partial.awards = awardObjects

  const certificates = extractStringArray(slice, 'certificates')
  const certificateObjects = extractCompletedObjectArray(slice, 'certificates')
  if (certificates.length) partial.certificates = certificates
  else if (certificateObjects.length) partial.certificates = certificateObjects

  // 同时抽取 educations / education，避免多段教育落在别名键上
  const educations = extractCompletedObjectArray(slice, 'educations')
  const educationAlias = extractCompletedObjectArray(slice, 'education')
  const educationList = educations.length ? educations : educationAlias
  if (educationList.length) partial.educations = educationList.map(normalizeEducationItem)

  // 项目兼容多种字段名
  const projects = extractCompletedObjectArray(slice, 'projects')
  const projectAlias = extractCompletedObjectArray(slice, 'project_experiences')
  const projectList = projects.length ? projects : projectAlias
  if (projectList.length) partial.projects = projectList.map(normalizeProjectItem)

  const internships = extractCompletedObjectArray(slice, 'internships')
  const internshipAlias = extractCompletedObjectArray(slice, 'internship_experiences')
  const internshipList = internships.length ? internships : internshipAlias
  if (internshipList.length) partial.internships = internshipList.map(normalizeInternshipItem)

  const workExperiences = extractCompletedObjectArray(slice, 'work_experiences')
  const workAlias = extractCompletedObjectArray(slice, 'workExperiences')
  const workExperienceAlias = extractCompletedObjectArray(slice, 'work_experience')
  const workList = workExperiences.length
    ? workExperiences
    : (workAlias.length ? workAlias : workExperienceAlias)
  if (workList.length) {
    partial.work_experiences = workList.map(normalizeWorkExperienceItem)
  }

  const customFields = extractCompletedObjectArray(slice, 'custom_fields')
  if (customFields.length) partial.custom_fields = customFields.map(normalizeCustomField)

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
    || resume?.internships?.length
    || resume?.work_experiences?.length
  )
}
