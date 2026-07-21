/**
 * 优化前后对比工具：快照、分区 diff、按模块选择性应用
 * 不做字符级着色，只产出可读 section 列表供 UI 应用
 */

import { normalizeResumeFields, syncFlatEducationFields } from '@/constants/resumeFieldSchema'

/** 深拷贝简历快照，避免流式过程污染优化前原文 */
export function snapshotResume(resume = {}) {
  return normalizeResumeFields(JSON.parse(JSON.stringify(resume || {})))
}

/**
 * 读取分模块优化前的字段值
 * @param {object} resume
 * @param {'summary'|'skills'|'project'|'internship'|'work_experience'} type
 * @param {number} [index]
 */
export function snapshotField(resume, type, index) {
  const r = resume || {}
  if (type === 'summary') return String(r.summary || '')
  if (type === 'skills') return Array.isArray(r.skills) ? [...r.skills] : []
  if (type === 'project') {
    const item = (r.projects || [])[index]
    return String(item?.description || '')
  }
  if (type === 'internship') {
    const item = (r.internships || [])[index]
    return String(item?.description || '')
  }
  if (type === 'work_experience') {
    const item = (r.work_experiences || [])[index]
    return String(item?.description || '')
  }
  return ''
}

function textEqual(a, b) {
  return String(a || '').trim() === String(b || '').trim()
}

function listEqual(a = [], b = []) {
  const left = (Array.isArray(a) ? a : []).map((x) => String(x || '').trim())
  const right = (Array.isArray(b) ? b : []).map((x) => String(x || '').trim())
  if (left.length !== right.length) return false
  return left.every((item, i) => item === right[i])
}

function itemLabel(kind, item, index) {
  if (kind === 'project') return item?.name || `项目 ${index + 1}`
  if (kind === 'internship') return item?.company || item?.position || `实习 ${index + 1}`
  return item?.company || item?.position || `工作 ${index + 1}`
}

function formatExperience(item = {}) {
  const head = [item.company || item.name, item.position || item.role, item.department]
    .filter(Boolean)
    .join(' · ')
  const dates = [item.start_date, item.end_date].filter(Boolean).join(' - ')
  const desc = String(item.description || '').trim()
  return [head, dates, desc].filter(Boolean).join('\n')
}

/**
 * 对比两份简历，产出可逐项应用的分区列表
 * @returns {Array<{ key: string, label: string, beforeText: string, afterText: string, changed: boolean }>}
 */
export function diffResumeSections(beforeInput = {}, afterInput = {}) {
  const before = normalizeResumeFields(beforeInput)
  const after = normalizeResumeFields(afterInput)
  const sections = []

  const basicFields = [
    ['name', '姓名'],
    ['target_position', '意向岗位'],
    ['phone', '电话'],
    ['email', '邮箱'],
    ['work_years', '工作年限'],
    ['expected_salary', '期望薪资'],
  ]
  const basicBefore = basicFields
    .map(([k, label]) => (before[k] ? `${label}：${before[k]}` : ''))
    .filter(Boolean)
    .join('\n')
  const basicAfter = basicFields
    .map(([k, label]) => (after[k] ? `${label}：${after[k]}` : ''))
    .filter(Boolean)
    .join('\n')
  if (!textEqual(basicBefore, basicAfter)) {
    sections.push({
      key: 'basic',
      label: '基本信息',
      beforeText: basicBefore || '（空）',
      afterText: basicAfter || '（空）',
      changed: true,
    })
  }

  if (!textEqual(before.summary, after.summary)) {
    sections.push({
      key: 'summary',
      label: '个人评价',
      beforeText: String(before.summary || '（空）'),
      afterText: String(after.summary || '（空）'),
      changed: true,
    })
  }

  if (!listEqual(before.skills, after.skills)) {
    sections.push({
      key: 'skills',
      label: '技能特长',
      beforeText: (before.skills || []).join('、') || '（空）',
      afterText: (after.skills || []).join('、') || '（空）',
      changed: true,
    })
  }

  const maxEdu = Math.max((before.educations || []).length, (after.educations || []).length)
  for (let i = 0; i < maxEdu; i += 1) {
    const b = before.educations?.[i] || {}
    const a = after.educations?.[i] || {}
    const beforeText = [b.school, b.major, b.degree, `${b.start_date || ''}-${b.end_date || ''}`]
      .filter(Boolean)
      .join(' · ')
    const afterText = [a.school, a.major, a.degree, `${a.start_date || ''}-${a.end_date || ''}`]
      .filter(Boolean)
      .join(' · ')
    if (!textEqual(beforeText, afterText)) {
      sections.push({
        key: `educations[${i}]`,
        label: `教育 ${i + 1}`,
        beforeText: beforeText || '（空）',
        afterText: afterText || '（空）',
        changed: true,
      })
    }
  }

  const listKinds = [
    { key: 'projects', label: '项目', format: formatExperience },
    { key: 'internships', label: '实习', format: formatExperience },
    { key: 'work_experiences', label: '工作', format: formatExperience },
  ]
  for (const kind of listKinds) {
    const max = Math.max((before[kind.key] || []).length, (after[kind.key] || []).length)
    for (let i = 0; i < max; i += 1) {
      const b = before[kind.key]?.[i]
      const a = after[kind.key]?.[i]
      const beforeText = b ? kind.format(b) : '（无）'
      const afterText = a ? kind.format(a) : '（无）'
      if (!textEqual(beforeText, afterText)) {
        sections.push({
          key: `${kind.key}[${i}]`,
          label: `${kind.label}：${itemLabel(kind.key.replace(/s$/, ''), a || b, i)}`,
          beforeText,
          afterText,
          changed: true,
        })
      }
    }
  }

  if (!listEqual(before.awards, after.awards)) {
    sections.push({
      key: 'awards',
      label: '荣誉奖项',
      beforeText: (before.awards || []).join('\n') || '（空）',
      afterText: (after.awards || []).join('\n') || '（空）',
      changed: true,
    })
  }
  if (!listEqual(before.certificates, after.certificates)) {
    sections.push({
      key: 'certificates',
      label: '证书资质',
      beforeText: (before.certificates || []).join('\n') || '（空）',
      afterText: (after.certificates || []).join('\n') || '（空）',
      changed: true,
    })
  }

  return sections
}

/** 将简历摘要为可读多段文本（对比面板左右栏） */
export function formatResumeSummary(resumeInput = {}) {
  const resume = normalizeResumeFields(resumeInput)
  const parts = []
  parts.push(`姓名：${resume.name || '—'}`)
  parts.push(`意向岗位：${resume.target_position || '—'}`)
  if (resume.summary) parts.push(`\n【个人评价】\n${resume.summary}`)
  if (resume.skills?.length) parts.push(`\n【技能】\n${resume.skills.join('、')}`)
  ;(resume.projects || []).forEach((item, i) => {
    parts.push(`\n【项目 ${i + 1}】\n${formatExperience(item)}`)
  })
  ;(resume.internships || []).forEach((item, i) => {
    parts.push(`\n【实习 ${i + 1}】\n${formatExperience(item)}`)
  })
  ;(resume.work_experiences || []).forEach((item, i) => {
    parts.push(`\n【工作 ${i + 1}】\n${formatExperience(item)}`)
  })
  return parts.join('\n')
}

/**
 * 按 section key 把 after 写入 target（原地修改并返回）
 * @param {object} target
 * @param {object} after
 * @param {string} sectionKey
 */
export function applyResumeSection(target, after, sectionKey) {
  const src = normalizeResumeFields(after)
  const dst = target

  if (sectionKey === 'basic') {
    ;['name', 'target_position', 'phone', 'email', 'work_years', 'expected_salary'].forEach((key) => {
      if (src[key] !== undefined) dst[key] = src[key]
    })
    return syncFlatEducationFields(dst)
  }
  if (sectionKey === 'summary') {
    dst.summary = src.summary || ''
    return dst
  }
  if (sectionKey === 'skills') {
    dst.skills = [...(src.skills || [])]
    return dst
  }
  if (sectionKey === 'awards') {
    dst.awards = [...(src.awards || [])]
    return dst
  }
  if (sectionKey === 'certificates') {
    dst.certificates = [...(src.certificates || [])]
    return dst
  }

  const listMatch = sectionKey.match(/^(educations|projects|internships|work_experiences)\[(\d+)\]$/)
  if (listMatch) {
    const [, listKey, indexStr] = listMatch
    const index = Number(indexStr)
    if (!Array.isArray(dst[listKey])) dst[listKey] = []
    const sourceItem = src[listKey]?.[index]
    if (sourceItem) {
      dst[listKey][index] = JSON.parse(JSON.stringify(sourceItem))
    }
    if (listKey === 'educations') return syncFlatEducationFields(dst)
    return dst
  }
  return dst
}

/** 一键应用全部变更分区 */
export function applyAllChangedSections(target, after, sections = []) {
  let result = target
  for (const section of sections) {
    if (!section?.changed || !section.key) continue
    result = applyResumeSection(result, after, section.key)
  }
  return normalizeResumeFields(result)
}

/**
 * 分模块优化结果写回简历
 * @param {object} resume
 * @param {'summary'|'skills'|'project'|'internship'|'work_experience'} type
 * @param {number|undefined} index
 * @param {string|string[]} value
 */
export function applyModuleOptimizeResult(resume, type, index, value) {
  if (type === 'summary') {
    resume.summary = String(value || '')
    return
  }
  if (type === 'skills') {
    resume.skills = Array.isArray(value) ? value.filter(Boolean) : []
    return
  }
  if (type === 'project' && resume.projects?.[index]) {
    resume.projects[index].description = String(value || '')
    return
  }
  if (type === 'internship' && resume.internships?.[index]) {
    resume.internships[index].description = String(value || '')
    return
  }
  if (type === 'work_experience' && resume.work_experiences?.[index]) {
    resume.work_experiences[index].description = String(value || '')
  }
}
