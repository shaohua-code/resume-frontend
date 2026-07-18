/**
 * 信任背书区配置 - 社会证明数据 + 行业标签 + 匿名证言
 */
export const TRUST_OFFER_COUNT = '12,000+'

/** 主 Offer 文案 */
export const TRUST_OFFER_HEADLINE = '已帮助 12,000+ 位求职者优化简历并斩获 Offer'

/** 背书区 mini stats - 与 Hero 能力数据互补 */
export const TRUST_MINI_STATS = [
  { value: '12,000+', label: '求职者使用' },
  { value: '27 套', label: '专业模板' },
  { value: '98%', label: '用户满意' },
]

export const TRUST_GUARANTEES = [
  { icon: 'shield', title: '隐私安全', desc: '简历内容仅用于你的生成与编辑' },
  { icon: 'edit', title: '全程可控', desc: 'AI 生成内容支持逐项修改' },
  { icon: 'export', title: '放心导出', desc: '导出前可完整预览最终效果' },
]

export const TRUST_INDUSTRIES = [
  '互联网',
  '金融',
  '教育',
  '制造',
  '咨询',
  '医疗',
  '新能源',
  '快消',
]

export const TRUST_TESTIMONIALS = [
  {
    avatar: '张',
    quote: '从零基础到拿到三面，AI 帮我改出了能看的项目描述',
    role: '计算机专业应届生',
  },
  {
    avatar: '李',
    quote: '上传旧简历 10 分钟就优化好了，省了好多时间',
    role: '转行求职者',
  },
  {
    avatar: '王',
    quote: '模板好看又专业，导出 PDF 直接投递，效率翻倍',
    role: '金融专业硕士',
  },
  {
    avatar: '陈',
    quote: '粘贴 JD 后整份简历被针对性改写，面试邀约明显多了',
    role: '互联网产品经理',
  },
]
