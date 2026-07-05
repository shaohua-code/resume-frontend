/**
 * 首页功能卡片数据
 */
export const HOME_FEATURES = [
  {
    icon: '🤖',
    title: 'AI 生成简历',
    path: '/generate',
    desc: '填写信息后 AI 自动生成专业校招简历，STAR 法则优化',
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
  { value: 'AI', label: '智能一键生成' },
  { value: '20', label: '套专业模板' },
  { value: '100', label: '分 AI 评分' },
]
