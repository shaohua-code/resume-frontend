/**
 * 20 套AI简历风格模板注册表
 */
import Tpl01Universal from '@/components/resume-templates/Tpl01Universal.vue'
import Tpl02Business from '@/components/resume-templates/Tpl02Business.vue'
import Tpl03Campus from '@/components/resume-templates/Tpl03Campus.vue'
import Tpl04TwoColumn from '@/components/resume-templates/Tpl04TwoColumn.vue'
import Tpl05TopBand from '@/components/resume-templates/Tpl05TopBand.vue'
import Tpl06TableInfo from '@/components/resume-templates/Tpl06TableInfo.vue'
import Tpl07ClassicBW from '@/components/resume-templates/Tpl07ClassicBW.vue'
import Tpl08Internet from '@/components/resume-templates/Tpl08Internet.vue'
import Tpl09Admin from '@/components/resume-templates/Tpl09Admin.vue'
import Tpl10Sales from '@/components/resume-templates/Tpl10Sales.vue'
import Tpl11Education from '@/components/resume-templates/Tpl11Education.vue'
import Tpl12Finance from '@/components/resume-templates/Tpl12Finance.vue'
import Tpl13Creative from '@/components/resume-templates/Tpl13Creative.vue'
import Tpl14Programmer from '@/components/resume-templates/Tpl14Programmer.vue'
import Tpl15Bilingual from '@/components/resume-templates/Tpl15Bilingual.vue'
import Tpl16Timeline from '@/components/resume-templates/Tpl16Timeline.vue'
import Tpl17SkillProgress from '@/components/resume-templates/Tpl17SkillProgress.vue'
import Tpl18MinimalLine from '@/components/resume-templates/Tpl18MinimalLine.vue'
import Tpl19Envelope from '@/components/resume-templates/Tpl19Envelope.vue'
import Tpl20Executive from '@/components/resume-templates/Tpl20Executive.vue'

export const MAX_TEMPLATE_ID = 20

export const TEMPLATE_LIST = [
  { id: 1, name: '全职业通用', category: '通用', desc: '清晰稳妥的单栏结构，适合大多数岗位', color: 'linear-gradient(135deg,#334155,#64748b)' },
  { id: 2, name: '简约商务', category: '职场', desc: '商务蓝顶栏与清楚层级，适合社招求职', color: 'linear-gradient(135deg,#1e40af,#3b82f6)' },
  { id: 3, name: '清新校招', category: '校招', desc: '轻量蓝白版式，突出教育与项目经历', color: 'linear-gradient(135deg,#1677ff,#69b1ff)' },
  { id: 4, name: '专业分栏', category: '职场', desc: '信息分区明确，适合经历丰富的候选人', color: 'linear-gradient(135deg,#334155,#64748b)' },
  { id: 5, name: '品牌色带', category: '通用', desc: '醒目头部与规整正文，兼顾辨识度与阅读性', color: 'linear-gradient(135deg,#0958d9,#1677ff)' },
  { id: 6, name: '信息表格', category: '传统行业', desc: '信息密度高、打印稳定，适合规范型岗位', color: 'linear-gradient(135deg,#475569,#94a3b8)' },
  { id: 7, name: '经典黑白', category: '通用', desc: '低墨耗、强兼容，适合正式投递与打印', color: 'linear-gradient(135deg,#111827,#52525b)' },
  { id: 8, name: '现代扁平', category: '职场', desc: '现代配色与标签体系，适合产品、运营与技术岗', color: 'linear-gradient(135deg,#4f46e5,#8b5cf6)' },
  { id: 9, name: '行政文职', category: '行业', desc: '端正规整，突出工作职责与办公能力', color: 'linear-gradient(135deg,#3f3f46,#71717a)' },
  { id: 10, name: '销售市场', category: '行业', desc: '强调业绩成果、客户经营与增长贡献', color: 'linear-gradient(135deg,#be123c,#fb7185)' },
  { id: 11, name: '教育培训', category: '行业', desc: '温和沉稳，适合教师、教研与培训岗位', color: 'linear-gradient(135deg,#92400e,#d97706)' },
  { id: 12, name: '金融会计', category: '行业', desc: '严谨专业，突出财务资质与数据成果', color: 'linear-gradient(135deg,#0f3d56,#39758f)' },
  { id: 13, name: '设计创意', category: '创意', desc: '温暖配色与轻量卡片，强化作品与审美表达', color: 'linear-gradient(135deg,#c2410c,#fb923c)' },
  { id: 14, name: '技术工程', category: '行业', desc: '深色代码风点缀，突出项目与专业工具', color: 'linear-gradient(135deg,#0f172a,#334155)' },
  { id: 15, name: '双语专业', category: '通用', desc: '中英标题对照，适合外企与跨境岗位', color: 'linear-gradient(135deg,#1e293b,#475569)' },
  { id: 16, name: '成长时间轴', category: '校招', desc: '按时间呈现成长路径，适合经历连续的候选人', color: 'linear-gradient(135deg,#0369a1,#38bdf8)' },
  { id: 17, name: '能力矩阵', category: '职场', desc: '强化核心能力标签，不虚构熟练度百分比', color: 'linear-gradient(135deg,#0f766e,#2dd4bf)' },
  { id: 18, name: '极简线条', category: '通用', desc: '克制留白与细线分隔，内容阅读优先', color: 'linear-gradient(135deg,#27272a,#a1a1aa)' },
  { id: 19, name: '个人品牌', category: '创意', desc: '封面式姓名区，适合咨询、创意与管理岗位', color: 'linear-gradient(135deg,#312e81,#818cf8)' },
  { id: 20, name: '高管精英', category: '职场', desc: '高级留白与紧凑经历，突出管理影响力', color: 'linear-gradient(135deg,#18181b,#52525b)' },
]

/** 模板 ID 映射到组件 */
export const TEMPLATE_MAP = {
  1: Tpl01Universal,
  2: Tpl02Business,
  3: Tpl03Campus,
  4: Tpl04TwoColumn,
  5: Tpl05TopBand,
  6: Tpl06TableInfo,
  7: Tpl07ClassicBW,
  8: Tpl08Internet,
  9: Tpl09Admin,
  10: Tpl10Sales,
  11: Tpl11Education,
  12: Tpl12Finance,
  13: Tpl13Creative,
  14: Tpl14Programmer,
  15: Tpl15Bilingual,
  16: Tpl16Timeline,
  17: Tpl17SkillProgress,
  18: Tpl18MinimalLine,
  19: Tpl19Envelope,
  20: Tpl20Executive,
}

export function clampTemplateId(id) {
  const n = Number(id) || 1
  if (n < 1) return 1
  if (n > MAX_TEMPLATE_ID) return 1
  return n
}

export function getTemplateName(id) {
  return TEMPLATE_LIST.find((t) => t.id === clampTemplateId(id))?.name || '全职业通用'
}
