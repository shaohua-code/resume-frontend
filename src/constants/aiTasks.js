/**
 * AI 任务类型常量
 * 统一维护任务类型的英文标识、中文显示和描述
 * 用于 AI 调用记录、用量明细、模型配置等所有页面
 */

/**
 * AI 任务类型英文标识枚举
 */
export const AI_TASK_TYPES = {
  RESUME_GENERATE: 'resume_generate',
  PROJECT_OPTIMIZE: 'project_optimize',
  SUMMARY_OPTIMIZE: 'summary_optimize',
  SKILLS_OPTIMIZE: 'skills_optimize',
  INTERNSHIP_OPTIMIZE: 'internship_optimize',
  JD_MATCH: 'jd_match',
  SCORE: 'score',
  PDF_OPTIMIZE: 'pdf_optimize',
}

/**
 * AI 任务类型中文名称映射表
 */
export const AI_TASK_TYPE_LABEL_MAP = {
  [AI_TASK_TYPES.RESUME_GENERATE]: '简历生成',
  [AI_TASK_TYPES.PROJECT_OPTIMIZE]: '项目经历优化',
  [AI_TASK_TYPES.SUMMARY_OPTIMIZE]: '个人评价优化',
  [AI_TASK_TYPES.SKILLS_OPTIMIZE]: '技能特长优化',
  [AI_TASK_TYPES.INTERNSHIP_OPTIMIZE]: '实习经验优化',
  [AI_TASK_TYPES.JD_MATCH]: '岗位匹配度分析',
  [AI_TASK_TYPES.SCORE]: '简历评分',
  [AI_TASK_TYPES.PDF_OPTIMIZE]: 'PDF优化',
}

/**
 * 获取任务类型的中文名称
 * @param {string} taskType - 任务类型英文标识
 * @returns {string} 中文名称，未找到则返回原始值或 '-'
 */
export function getAiTaskLabel(taskType) {
  return AI_TASK_TYPE_LABEL_MAP[taskType] || taskType || '-'
}

/**
 * 获取所有任务类型选项（用于下拉筛选、表单选择等）
 * @returns {Array<{label: string, value: string}>}
 */
export function getAiTaskOptions() {
  return Object.entries(AI_TASK_TYPE_LABEL_MAP).map(([value, label]) => ({
    label,
    value,
  }))
}
