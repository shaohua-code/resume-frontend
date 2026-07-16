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
  return {
    school: item.school || '',
    major: item.major || '',
    main_course: item.main_course || item.mainCourse || '',
    degree: item.degree || item.education || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
  }
}

/** 归一化自定义字段 */
export function normalizeCustomField(item = {}) {
  return {
    label: (item.label || '').trim(),
    value: (item.value || '').trim(),
  }
}

/**
 * 归一化教育背景数组
 * 兼容 educations[] 与扁平 school/major/education
 */
export function normalizeEducations(resume = {}) {
  const r = resume || {}
  const list = r.educations || r.education_list || []

  if (Array.isArray(list) && list.length) {
    return list.map(normalizeEducationItem).filter((item) =>
      item.school || item.major || item.main_course || item.degree || item.start_date || item.end_date,
    )
  }

  // 旧数据：扁平字段合成一条
  if (r.school || r.major || r.education) {
    return [normalizeEducationItem({
      school: r.school,
      major: r.major,
      main_course: r.main_course || r.mainCourse,
      degree: r.education,
    })]
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
 * 完整归一化 resume 对象的新增字段
 */
export function normalizeResumeFields(resume = {}) {
  const r = { ...resume }
  const educations = normalizeEducations(r)
  const customFields = normalizeCustomFields(r)

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

  // target_position 多源归一化：兼容 AI 返回的多种岗位字段命名
  r.target_position = (
    r.target_position ||
    r.targetPosition ||
    r['意向岗位'] ||
    r['求职岗位'] ||
    r['面试岗位'] ||
    r['应聘岗位'] ||
    r.position ||
    ''
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
