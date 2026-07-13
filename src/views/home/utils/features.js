/**
 * 首页功能卡片数据
 */
export const HOME_FEATURES = [
  {
    icon: '🤖',
    title: 'AI 生成简历',
    path: '/generate',
    desc: '按目标行业与岗位生成专业简历，自动强化匹配优势',
    iconBg: 'bg-brand-lighter/60',
  },
  {
    icon: '⚡',
    title: '智能识别',
    path: '/generate?mode=lazy',
    desc: '自由文本键值对填写，AI 智能解析生成专业简历',
    iconBg: 'bg-accent-lighter/60',
  },
  {
    icon: '📄',
    title: '上传优化',
    path: '/generate?mode=upload',
    desc: '上传现有 PDF 简历，AI 自动提取并整体优化重写',
    iconBg: 'bg-mint/60',
  },
  {
    icon: '🎯',
    title: 'JD 岗位匹配',
    path: '/generate',
    desc: '分析简历与岗位 JD 的匹配度，给出优化建议',
    iconBg: 'bg-brand-lighter/60',
  },
  {
    icon: '⭐',
    title: 'AI 评分',
    path: '/generate',
    desc: '智能评估简历质量，100 分制量化你的竞争力',
    iconBg: 'bg-mint/60',
  },
  {
    icon: '📤',
    title: '导出中心',
    path: '/user',
    desc: '支持 PDF、Word、Markdown 多格式一键导出投递',
    iconBg: 'bg-accent-lighter/60',
  },
]

export const HOME_STATS = [
  { value: 'AI极速生成', label: '30秒完成简历' },
  { value: 'JD定向优化', label: '提升面试邀约率' },
  { value: 'AI测评', label: '自动诊断短板' },
]
