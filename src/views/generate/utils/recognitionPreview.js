/**
 * 把内部结构化识别结果转换为用户可读的中文文本。
 * SSE 原始 JSON 仍用于增量回填表单，但绝不直接暴露技术字段名。
 */
import { normalizeResumeFields } from '@/constants/resumeFieldSchema'

function clean(value) {
  return String(value || '').trim()
}

function joinPresent(values, separator = ' ｜ ') {
  return values.map(clean).filter(Boolean).join(separator)
}

function dateRange(item = {}) {
  return joinPresent([item.start_date, item.end_date], ' - ')
}

function addSection(sections, title, content) {
  const body = clean(content)
  if (body) sections.push(`${title}\n${body}`)
}

function indentDescription(value) {
  return clean(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `   ${line}`)
    .join('\n')
}

function formatRecords(records, titleBuilder, detailBuilder) {
  return records.map((item, index) => {
    const title = joinPresent(titleBuilder(item)) || `第 ${index + 1} 条`
    const details = detailBuilder(item).map(clean).filter(Boolean)
    return [`${index + 1}. ${title}`, ...details].join('\n')
  }).join('\n\n')
}

/** 识别到一个完整字段后即加入预览，实现不展示 JSON 的渐进式输出。 */
export function formatRecognitionPreview(resume = {}) {
  const data = normalizeResumeFields(resume)
  const sections = []
  const basicInfo = [
    ['姓名', data.name],
    ['意向岗位', data.target_position],
    ['联系电话', data.phone],
    ['邮箱', data.email],
    ['工作年限', data.work_years],
    ['婚姻状况', data.marital_status],
    ['身高', data.height],
    ['体重', data.weight],
    ['民族', data.ethnicity],
    ['籍贯', data.native_place],
    ['政治面貌', data.political_status],
    ['期望薪资', data.expected_salary],
    ...(data.custom_fields || []).map((item) => [item.label, item.value]),
  ].filter(([, value]) => clean(value))

  addSection(sections, '基本信息', basicInfo.map(([label, value]) => `${label}：${clean(value)}`).join('\n'))
  addSection(sections, '个人简介', data.summary)

  if (data.educations?.length) {
    addSection(sections, '教育经历', formatRecords(
      data.educations,
      (item) => [item.school, item.major, item.degree, dateRange(item)],
      (item) => item.main_course ? [`   主修课程：${item.main_course}`] : [],
    ))
  }

  if (data.skills?.length) addSection(sections, '专业技能', data.skills.join('、'))

  if (data.work_experiences?.length) {
    addSection(sections, '工作经历', formatRecords(
      data.work_experiences,
      (item) => [item.company, item.position, item.department, dateRange(item)],
      (item) => [indentDescription(item.description)],
    ))
  }

  if (data.internships?.length) {
    addSection(sections, '实习经历', formatRecords(
      data.internships,
      (item) => [item.company, item.position, dateRange(item)],
      (item) => [indentDescription(item.description)],
    ))
  }

  if (data.projects?.length) {
    addSection(sections, '项目经历', formatRecords(
      data.projects,
      (item) => [item.name, item.role, dateRange(item)],
      (item) => [
        item.tech_stack ? `   使用技术：${item.tech_stack}` : '',
        indentDescription(item.description),
      ],
    ))
  }

  if (data.awards?.length) addSection(sections, '荣誉奖项', data.awards.map((item) => `• ${item}`).join('\n'))
  if (data.certificates?.length) addSection(sections, '证书资质', data.certificates.map((item) => `• ${item}`).join('\n'))

  return sections.join('\n\n')
}
