/**
 * 统一处理 AI 返回的 optimization_notes：
 * 兼容多种字段名；缺失时按简历内容生成可读亮点，保证「本次优化亮点」可展示。
 */

/** 过滤空串与「无需修改」类套话 */
export function normalizeOptimizationNotes(notes = []) {
  return (Array.isArray(notes) ? notes : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((note) => !/无需修改|已较完善|微调即可|暂无调整/.test(note))
}

/**
 * 从接口/流式最终包中尽量取出亮点数组
 * @param {object|null} payload SSE done.data 或接口 data
 */
export function pickOptimizationNotes(payload) {
  if (!payload || typeof payload !== 'object') return []
  const candidates = [
    payload.optimization_notes,
    payload.optimizationNotes,
    payload.notes,
    payload.highlights,
    payload['优化亮点'],
    payload['本次优化亮点'],
    payload.resume?.optimization_notes,
    payload.resume?.optimizationNotes,
    payload.resume?.notes,
  ]
  for (const candidate of candidates) {
    const notes = normalizeOptimizationNotes(candidate)
    if (notes.length) return notes.slice(0, 5)
  }
  return []
}

/**
 * 模型未返回亮点时，按简历内容生成前端兜底文案
 * @param {object} resume
 * @param {'generate'|'optimize'} mode
 */
export function buildFallbackOptimizationNotes(resume = {}, mode = 'generate') {
  const notes = []
  const verb = mode === 'optimize' ? '优化' : '生成'
  if (String(resume.summary || '').trim()) {
    notes.push(`已${verb}个人评价，突出与目标岗位的匹配表达`)
  }
  if (Array.isArray(resume.skills) && resume.skills.length) {
    notes.push(`已整理 ${resume.skills.length} 项核心技能关键词`)
  }
  const experienceCount =
    (Array.isArray(resume.projects) ? resume.projects.length : 0)
    + (Array.isArray(resume.internships) ? resume.internships.length : 0)
    + (Array.isArray(resume.work_experiences) ? resume.work_experiences.length : 0)
  if (experienceCount > 0) {
    notes.push('已补强项目/实习/工作经历的职责与交付描述')
  }
  if (Array.isArray(resume.educations) && resume.educations.length) {
    notes.push('已规范教育背景字段结构，便于招聘方快速扫描')
  }
  if (String(resume.target_position || '').trim()) {
    notes.push(`已围绕「${resume.target_position}」对齐简历表达侧重点`)
  }
  while (notes.length < 3) {
    notes.push(
      mode === 'optimize'
        ? '已按招聘筛选口径提升简历可读性与岗位相关性'
        : '已按目标岗位补全可投递的完整简历结构',
    )
  }
  return notes.slice(0, 5)
}

/**
 * 解析亮点：优先 AI 原文，其次 payload，再次按简历兜底
 */
export function resolveOptimizationNotes(payload, resume, mode = 'generate') {
  const fromPayload = pickOptimizationNotes(payload)
  if (fromPayload.length) return fromPayload
  const fromResume = pickOptimizationNotes(resume)
  if (fromResume.length) return fromResume
  if (resume && typeof resume === 'object' && Object.keys(resume).length) {
    return buildFallbackOptimizationNotes(resume, mode)
  }
  return []
}
