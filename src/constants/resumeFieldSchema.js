/**
 * 简历字段 Schema 与归一化工具
 * 统一管理基本信息扩展字段、教育背景数组、自定义键值对
 */

/** 婚姻状况选项 */
export const MARITAL_STATUS_OPTIONS = [
  { value: '未婚', label: '未婚' },
  { value: '已婚', label: '已婚' },
  { value: '离异', label: '离异' },
  { value: '丧偶', label: '丧偶' },
]

/** 政治面貌选项 */
export const POLITICAL_STATUS_OPTIONS = [
  { value: '群众', label: '群众' },
  { value: '共青团员', label: '共青团员' },
  { value: '中共党员', label: '中共党员' },
  { value: '中共预备党员', label: '中共预备党员' },
  { value: '民主党派', label: '民主党派' },
]

/** 学历选项 */
export const DEGREE_OPTIONS = [
  { value: '大专', label: '大专' },
  { value: '本科', label: '本科' },
  { value: '硕士', label: '硕士' },
  { value: '博士', label: '博士' },
  { value: '其他', label: '其他' },
]

/** 基本信息扩展字段配置（不含姓名/意向岗位/联系方式/个人评价） */
export const EXTENDED_BASIC_FIELDS = [
  { key: 'work_years', label: '工作年限', type: 'text', placeholder: '如：3年' },
  { key: 'marital_status', label: '婚姻状况', type: 'select', options: MARITAL_STATUS_OPTIONS },
  { key: 'height', label: '身高', type: 'text', placeholder: '如：175cm' },
  { key: 'weight', label: '体重', type: 'text', placeholder: '如：65kg' },
  { key: 'ethnicity', label: '民族', type: 'text', placeholder: '如：汉族' },
  { key: 'native_place', label: '籍贯', type: 'text', placeholder: '如：江苏南京' },
  { key: 'political_status', label: '政治面貌', type: 'select', options: POLITICAL_STATUS_OPTIONS },
  { key: 'expected_salary', label: '期望薪资', type: 'text', placeholder: '如：15K-20K' },
]

/** 创建空教育记录 */
export function createEmptyEducation() {
  return {
    school: '',
    major: '',
    main_course: '',
    degree: '',
    start_date: '',
    end_date: '',
  }
}

/** 创建空自定义字段 */
export function createEmptyCustomField() {
  return { label: '', value: '' }
}

/** 归一化单条教育记录 */
export function normalizeEducationItem(item = {}) {
  // degree 可能误收到数组（education[] 被塞进扁平字段），只接受字符串
  const rawDegree = item.degree || item.education || ''
  let degree = typeof rawDegree === 'string' ? rawDegree : ''
  let major = item.major || ''
  // 仅单段专业（无换行/分号/斜杠拼接）时，从「通信技术（大专）」拆出学历
  if (major && !degree && !/[\n；;]|\s+\/\s+/.test(major)) {
    const parsed = splitMajorAndDegree(major)
    if (parsed.degree) {
      major = parsed.major
      degree = parsed.degree
    }
  }
  return {
    school: item.school || item.school_name || item.schoolName || '',
    major,
    main_course: item.main_course || item.mainCourse || '',
    degree,
    start_date: item.start_date || item.startDate || '',
    end_date: item.end_date || item.endDate || '',
  }
}

/** 归一化自定义字段 */
export function normalizeCustomField(item = {}) {
  return {
    label: (item.label || '').trim(),
    value: (item.value || '').trim(),
  }
}

/** 归一化项目经历，避免识别结果中的空对象污染表单。 */
export function normalizeProjectItem(item = {}) {
  // 兼容 AI 偶发使用 title / project_name / content 等别名
  const techStack = item.tech_stack || item.skills || item.techStack || ''
  return {
    name: item.name || item.project_name || item.projectName || item.title || '',
    role: item.role || item.position || '',
    description: item.description || item.content || item.desc || '',
    tech_stack: Array.isArray(techStack) ? techStack.filter(Boolean).join('、') : techStack,
    start_date: item.start_date || item.startDate || '',
    end_date: item.end_date || item.endDate || '',
  }
}

/** 从多种字段名中取出项目数组，兼容模型别名。 */
function pickProjectList(resume = {}) {
  const r = resume || {}
  const candidates = [
    r.projects,
    r.project_experiences,
    r.projectExperiences,
    r.project_list,
    r.projectList,
  ]
  for (const list of candidates) {
    if (Array.isArray(list) && list.length) return list
  }
  // 模型偶发把整段项目写成字符串时，降级为单条描述，避免静默丢弃
  if (typeof r.projects === 'string' && r.projects.trim()) {
    return [{ description: r.projects.trim() }]
  }
  return []
}

/** 归一化实习经历。 */
export function normalizeInternshipItem(item = {}) {
  return {
    company: item.company || '',
    position: item.position || item.role || '',
    description: item.description || item.content || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
  }
}

/** 归一化正式工作经历，兼容旧版 workExperiences 命名。 */
export function normalizeWorkExperienceItem(item = {}) {
  return {
    company: item.company || '',
    position: item.position || item.role || '',
    department: item.department || '',
    description: item.description || item.content || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
  }
}

/**
 * 把技能/证书等列表项安全转成可读字符串。
 * AI 偶发返回 { name/title/... } 对象时，禁止直接 String(obj) 变成 [object Object]。
 */
function stringifyListItem(item) {
  if (item === undefined || item === null) return ''
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
    return String(item).trim()
  }
  if (typeof item === 'object') {
    const text = (
      item.name
      || item.title
      || item.label
      || item.skill
      || item.certificate
      || item.award
      || item.value
      || item.text
      || item.content
      || ''
    )
    if (text) return String(text).trim()
    // 对象仅含一个原始值时取其值，例如 { Java: true } 不处理，避免脏数据
    const values = Object.values(item).filter((v) => typeof v === 'string' || typeof v === 'number')
    if (values.length === 1) return String(values[0]).trim()
  }
  return ''
}

/** 将字符串或数组统一为去空字符串数组。 */
function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map(stringifyListItem).filter(Boolean)
  }
  if (!value) return []
  if (typeof value === 'object') {
    const text = stringifyListItem(value)
    return text ? [text] : []
  }
  return String(value).split(/[\n,，、]/).map((item) => item.trim()).filter(Boolean)
}

/**
 * 拆分被模型错误合并进同一字段的多段教育信息。
 * 常见形态：school/major 用换行、分号或 " / " 拼接两所学校。
 */
function splitEducationField(value) {
  const text = String(value || '').trim()
  if (!text) return []
  const parts = text
    .split(/\n+|；|;|\s+\/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
  return parts.length ? parts : [text]
}

/** 从「通信技术（大专）」这类文案中拆出专业与学历。 */
function splitMajorAndDegree(text = '') {
  const raw = String(text || '').trim()
  if (!raw) return { major: '', degree: '' }
  const match = raw.match(/^(.+?)[（(]\s*(大专|本科|硕士|博士|研究生|专科|高中|中专)\s*[）)]$/)
  if (match) {
    return { major: match[1].trim(), degree: match[2].trim() }
  }
  return { major: raw, degree: '' }
}

/**
 * 从「学校A 专业（大专） 学校B 专业（本科）」这类粘连文本中尽量拆成多段。
 * 仅在出现多所学校关键词时启用，避免误拆普通专业名。
 */
function splitStickyEducationText(text = '') {
  const raw = String(text || '').trim()
  if (!raw) return []
  const schoolHits = raw.match(/[\u4e00-\u9fa5A-Za-z0-9（）()]{2,}(?:大学|学院|学校|职业技术学院|职业技术大学)/g) || []
  if (schoolHits.length < 2) return []

  const parts = []
  let cursor = 0
  schoolHits.forEach((school, index) => {
    const start = raw.indexOf(school, cursor)
    if (start < 0) return
    const nextSchool = schoolHits[index + 1]
    const end = nextSchool ? raw.indexOf(nextSchool, start + school.length) : raw.length
    const chunk = raw.slice(start, end >= 0 ? end : raw.length).trim()
    const rest = chunk.slice(school.length).trim().replace(/^[,，、|｜\-\s]+/, '')
    const parsed = splitMajorAndDegree(rest)
    parts.push({
      school,
      major: parsed.major,
      degree: parsed.degree,
    })
    cursor = start + school.length
  })
  return parts
}

/** 把合并的一条教育记录尽量拆成多条。 */
function expandMergedEducationItems(list = []) {
  const result = []
  list.forEach((item) => {
    const schools = splitEducationField(item.school)
    const majors = splitEducationField(item.major)
    const degrees = splitEducationField(item.degree)
    const startDates = splitEducationField(item.start_date)
    const endDates = splitEducationField(item.end_date)
    const courses = splitEducationField(item.main_course)

    // 学校字段已有多分隔段：按段对齐拆分
    if (schools.length > 1) {
      schools.forEach((school, index) => {
        const majorSource = majors[index] || ''
        const parsed = splitMajorAndDegree(majorSource)
        result.push({
          school,
          major: parsed.major || majorSource,
          degree: degrees[index] || parsed.degree || '',
          // 时间只挂在对应分段；没有分段时间时仅第一条继承原时间
          start_date: startDates[index] || (index === 0 ? item.start_date : '') || '',
          end_date: endDates[index] || (index === 0 ? item.end_date : '') || '',
          main_course: courses[index] || '',
        })
      })
      return
    }

    // 学校名粘连在同一字符串，或第二学历被塞进 major 时尝试拆分
    // 注意：[] 在 JS 中为真值，不能用 || 串联
    const stickyFromSchool = splitStickyEducationText(item.school)
    const sticky = stickyFromSchool.length > 1
      ? stickyFromSchool
      : splitStickyEducationText([item.school, item.major].filter(Boolean).join(' '))
    if (sticky.length > 1) {
      sticky.forEach((part, index) => {
        result.push({
          school: part.school,
          major: part.major || majors[index] || '',
          degree: part.degree || degrees[index] || '',
          start_date: startDates[index] || (index === 0 ? item.start_date : '') || '',
          end_date: endDates[index] || (index === 0 ? item.end_date : '') || '',
          main_course: courses[index] || '',
        })
      })
      return
    }

    result.push(item)
  })
  return result
}

/**
 * 归一化教育背景数组
 * 兼容 educations[] / education[] / education_list 与扁平 school/major/education
 */
export function normalizeEducations(resume = {}) {
  const r = resume || {}
  // 优先标准数组，其次兼容模型把多段教育写进 education[]
  let list = []
  if (Array.isArray(r.educations) && r.educations.length) {
    list = r.educations
  } else if (Array.isArray(r.education_list) && r.education_list.length) {
    list = r.education_list
  } else if (Array.isArray(r.education) && r.education.length) {
    list = r.education
  }

  if (list.length) {
    const normalized = list
      .map(normalizeEducationItem)
      .filter((item) =>
        item.school || item.major || item.main_course || item.degree || item.start_date || item.end_date,
      )
    return expandMergedEducationItems(normalized)
  }

  // 旧数据：扁平字段合成一条（education 为字符串学历时）
  if (r.school || r.major || (typeof r.education === 'string' && r.education) || r.degree) {
    return expandMergedEducationItems([normalizeEducationItem({
      school: r.school,
      major: r.major,
      main_course: r.main_course || r.mainCourse,
      degree: (typeof r.education === 'string' ? r.education : '') || r.degree,
      start_date: r.start_date,
      end_date: r.end_date,
    })])
  }

  return []
}

/**
 * 归一化自定义字段数组
 */
export function normalizeCustomFields(resume = {}) {
  const list = resume?.custom_fields || resume?.customFields || []
  if (!Array.isArray(list)) return []
  return list.map(normalizeCustomField).filter((item) => item.label && item.value)
}

/**
 * 将 educations 首条同步回扁平字段（向后兼容）
 */
export function syncFlatEducationFields(resume = {}) {
  const educations = normalizeEducations(resume)
  if (educations.length) {
    const first = educations[0]
    resume.school = first.school || ''
    resume.major = first.major || ''
    resume.main_course = first.main_course || ''
    resume.education = first.degree || ''
  }
  resume.educations = educations
  return resume
}

/**
 * 从简历原文标签行回退提取求职意向。
 * 用于识别场景：模型漏填 target_position 时仍能回填「求职意向：xxx」。
 */
export function extractTargetPositionFromText(text = '') {
  const source = String(text || '')
  if (!source.trim()) return ''
  const match = source.match(
    /(?:求职意向|意向岗位|目标岗位|期望岗位|求职岗位|应聘岗位|意向职位)\s*[:：]\s*([^\n，,；;]+)/,
  )
  return match ? String(match[1] || '').trim() : ''
}

/**
 * 完整归一化 resume 对象的新增字段
 */
export function normalizeResumeFields(resume = {}) {
  const r = { ...resume }
  const educations = normalizeEducations(r)
  const customFields = normalizeCustomFields(r)

  // 兼容 projects / project_experiences 等别名，避免项目段被静默清空
  const projects = pickProjectList(r)
    .map(normalizeProjectItem)
    .filter((item) => (
      item.name || item.role || item.description || item.tech_stack || item.start_date || item.end_date
    ))
  const internships = Array.isArray(r.internships)
    ? r.internships.map(normalizeInternshipItem).filter((item) => (
      item.company || item.position || item.description || item.start_date || item.end_date
    ))
    : []
  const rawWorkExperiences = r.work_experiences || r.workExperiences || []
  const workExperiences = Array.isArray(rawWorkExperiences)
    ? rawWorkExperiences.map(normalizeWorkExperienceItem).filter((item) => (
      item.company || item.position || item.department || item.description || item.start_date || item.end_date
    ))
    : []

  r.work_years = r.work_years || r.workYears || ''
  r.marital_status = r.marital_status || r.maritalStatus || ''
  r.height = r.height || ''
  r.weight = r.weight || ''
  r.ethnicity = r.ethnicity || ''
  r.native_place = r.native_place || r.nativePlace || r.origin || ''
  r.political_status = r.political_status || r.politicalStatus || ''
  r.expected_salary = r.expected_salary || r.expectedSalary || r.salary || ''
  r.educations = educations
  r.custom_fields = customFields
  r.projects = projects
  r.internships = internships
  r.work_experiences = workExperiences
  r.skills = normalizeStringList(r.skills)
  r.awards = normalizeStringList(r.awards)
  r.certificates = normalizeStringList(r.certificates)

  // target_position 多源归一化：兼容 AI 返回的多种岗位字段命名（含「求职意向」）
  r.target_position = (
    r.target_position
    || r.targetPosition
    || r['求职意向']
    || r['意向岗位']
    || r['目标岗位']
    || r['期望岗位']
    || r['求职岗位']
    || r['面试岗位']
    || r['应聘岗位']
    || r['意向职位']
    || r.job_intention
    || r.jobIntention
    || r.position
    || ''
  )

  if (educations.length) {
    r.school = educations[0].school || r.school || ''
    r.major = educations[0].major || r.major || ''
    r.main_course = educations[0].main_course || r.main_course || r.mainCourse || ''
    r.education = educations[0].degree || r.education || ''
  }

  return r
}

/**
 * 将流式识别结果安全合并到已有表单。
 * 空字符串与空数组永远不会覆盖用户已填写内容，避免部分 JSON 解析造成字段闪空。
 */
export function mergeRecognizedResume(current = {}, recognized = {}) {
  const target = normalizeResumeFields(current)
  const source = normalizeResumeFields(recognized)
  const scalarFields = [
    'name', 'target_position', 'phone', 'email', 'summary',
    'work_years', 'marital_status', 'height', 'weight', 'ethnicity',
    'native_place', 'political_status', 'expected_salary',
  ]

  scalarFields.forEach((key) => {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim()) {
      target[key] = value
    }
  })

  ;['educations', 'projects', 'internships', 'work_experiences', 'skills', 'awards', 'certificates', 'custom_fields']
    .forEach((key) => {
      if (Array.isArray(source[key]) && source[key].length) target[key] = source[key]
    })

  return syncFlatEducationFields(normalizeResumeFields(target))
}

/**
 * 构建基本信息展示项（供模板渲染）
 * @param {Object} fields useResumeFields 返回值
 */
export function buildBasicInfoDisplayItems(fields = {}) {
  const items = [
    { key: 'phone', label: '电话', value: fields.phone },
    { key: 'email', label: '邮箱', value: fields.email },
    { key: 'workYears', label: '工作年限', value: fields.workYears },
    { key: 'maritalStatus', label: '婚姻状况', value: fields.maritalStatus },
    { key: 'height', label: '身高', value: fields.height },
    { key: 'weight', label: '体重', value: fields.weight },
    { key: 'ethnicity', label: '民族', value: fields.ethnicity },
    { key: 'nativePlace', label: '籍贯', value: fields.nativePlace },
    { key: 'politicalStatus', label: '政治面貌', value: fields.politicalStatus },
    { key: 'expectedSalary', label: '期望薪资', value: fields.expectedSalary },
  ].filter((item) => item.value)

  // 自定义字段展开到基本信息区
  ;(fields.customFields || []).forEach((cf, index) => {
    if (cf.label && cf.value) {
      items.push({ key: `custom_${index}`, label: cf.label, value: cf.value })
    }
  })

  return items
}

/** 格式化教育时间范围 */
export function formatEducationDateRange(edu = {}) {
  const start = edu.start_date || ''
  const end = edu.end_date || ''
  if (start && end) return `${start} ~ ${end}`
  return start || end || ''
}

/** 格式化教育详情：学历 · 专业 · 主修 */
export function formatEducationDetail(edu = {}) {
  return [edu.degree, edu.major, edu.main_course].filter(Boolean).join(' · ')
}

/** 创建空基本信息表单（生成页用） */
export function createEmptyBasicForm() {
  return {
    name: '',
    target_position: '',
    phone: '',
    email: '',
    work_years: '',
    marital_status: undefined,
    height: '',
    weight: '',
    ethnicity: '',
    native_place: '',
    political_status: undefined,
    expected_salary: '',
    custom_fields: [],
  }
}

/** 姓名、意向岗位表单校验规则（Ant Design Vue Form） */
export const REQUIRED_BASIC_FORM_RULES = {
  name: [
    { required: true, whitespace: true, message: '请填写姓名', trigger: ['blur', 'change'] },
  ],
  target_position: [
    { required: true, whitespace: true, message: '请填写意向岗位', trigger: ['blur', 'change'] },
  ],
}

/**
 * 校验姓名与意向岗位必填（trim 后）
 * @returns {{ ok: boolean, message?: string, name?: string, target_position?: string }}
 */
export function validateRequiredBasicFields(data = {}) {
  const name = String(data.name || '').trim()
  const targetPosition = String(data.target_position || '').trim()
  if (!name) {
    return { ok: false, message: '请填写姓名' }
  }
  if (!targetPosition) {
    return { ok: false, message: '请填写意向岗位' }
  }
  return { ok: true, name, target_position: targetPosition }
}

/**
 * 将 岗位优化后的简历合并到目标对象（用户点击「应用替换」时调用）
 * 保留目标对象中编辑器样式等未在 AI 结果中出现的字段
 * @param {object} target 待写入的简历对象
 * @param {object} optimized AI 优化后的简历
 * @returns {object} 合并后的简历
 */
export function mergeOptimizedResume(target = {}, optimized = {}) {
  const merged = normalizeResumeFields({
    ...target,
    ...optimized,
    // 数组类字段以 AI 结果为准（若存在）
    educations: optimized.educations?.length ? optimized.educations : (target.educations || []),
    projects: optimized.projects?.length ? optimized.projects : (target.projects || []),
    internships: optimized.internships?.length ? optimized.internships : (target.internships || []),
    // 工作经历合并：AI 优化结果优先，无则保留原始数据
    work_experiences: optimized.work_experiences?.length
      ? optimized.work_experiences
      : (target.work_experiences || []),
    skills: optimized.skills?.length ? optimized.skills : (target.skills || []),
    awards: optimized.awards?.length ? optimized.awards : (target.awards || []),
    certificates: optimized.certificates?.length ? optimized.certificates : (target.certificates || []),
    custom_fields: optimized.custom_fields?.length ? optimized.custom_fields : (target.custom_fields || []),
  })
  return syncFlatEducationFields(merged)
}
