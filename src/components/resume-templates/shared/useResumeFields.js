/**
 * 简历字段映射（不改后端接口，对齐AI简历模块）
 */
export function useResumeFields(resume) {
  const r = resume || {}
  return {
    name: r.name || '姓名',
    phone: r.phone || '',
    email: r.email || '',
    targetPosition: r.target_position || '',
    school: r.school || '',
    major: r.major || '',
    education: r.education || '',
    summary: r.summary || '',
    skills: r.skills || [],
    projects: r.projects || [],
    internships: r.internships || [],
    awards: r.awards || [],
    certificates: r.certificates || [],
    eduLine: [r.school, r.major, r.education].filter(Boolean).join(' · '),
    contactLine: [r.phone, r.email].filter(Boolean).join('  |  '),
    honorList: [...(r.awards || []), ...(r.certificates || [])],
  }
}

/** 技能进度条宽度（模拟AI简历进度） */
export function skillProgress(index) {
  const levels = [95, 85, 75, 65, 55, 45]
  return levels[index % levels.length]
}

/** 技能熟练度文字 */
export function skillLevel(index) {
  const labels = ['精通', '熟练', '良好', '一般']
  return labels[index % labels.length]
}
