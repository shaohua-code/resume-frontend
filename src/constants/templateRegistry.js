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
  { id: 1, name: '全职业通用', desc: '对照AI简历1004，顶栏+基本信息', color: 'linear-gradient(135deg,#333,#666)' },
  { id: 2, name: '简约商务', desc: '左色条+单列正式', color: 'linear-gradient(135deg,#1e40af,#3b82f6)' },
  { id: 3, name: '应届校招', desc: '蓝色标题线+居中', color: 'linear-gradient(135deg,#1677ff,#69b1ff)' },
  { id: 4, name: '左右分栏', desc: '头部分栏，PDF友好', color: 'linear-gradient(135deg,#334155,#64748b)' },
  { id: 5, name: '顶部色带', desc: '全宽蓝色 header', color: 'linear-gradient(135deg,#0958d9,#1677ff)' },
  { id: 6, name: '表格信息', desc: '基本信息表格化', color: 'linear-gradient(135deg,#475569,#94a3b8)' },
  { id: 7, name: '经典黑白', desc: '线框分隔，打印优先', color: 'linear-gradient(135deg,#111,#555)' },
  { id: 8, name: '互联网扁平', desc: '圆角标签技能', color: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
  { id: 9, name: '行政文职', desc: '正式列表风格', color: 'linear-gradient(135deg,#444,#777)' },
  { id: 10, name: '销售市场', desc: '红色强调经历', color: 'linear-gradient(135deg,#cf1322,#ff7875)' },
  { id: 11, name: '教育培训', desc: '衬线标题', color: 'linear-gradient(135deg,#78350f,#a16207)' },
  { id: 12, name: '金融会计', desc: '严谨黑灰', color: 'linear-gradient(135deg,#1a1a1a,#444)' },
  { id: 13, name: '设计创意', desc: '暖色轻量色块', color: 'linear-gradient(135deg,#ea580c,#fb923c)' },
  { id: 14, name: '程序员', desc: '等宽点缀+深色标签', color: 'linear-gradient(135deg,#0f172a,#334155)' },
  { id: 15, name: '中英文双语', desc: '标题中英对照', color: 'linear-gradient(135deg,#1e293b,#475569)' },
  { id: 16, name: '时间轴', desc: '左侧竖线时间轴', color: 'linear-gradient(135deg,#1677ff,#4096ff)' },
  { id: 17, name: '技能进度', desc: '1004式进度条', color: 'linear-gradient(135deg,#1677ff,#36cfc9)' },
  { id: 18, name: '极简线条', desc: '仅横线分隔', color: 'linear-gradient(135deg,#222,#888)' },
  { id: 19, name: '信封封面', desc: '封面 slogan 区', color: 'linear-gradient(135deg,#333,#999)' },
  { id: 20, name: '高端Executive', desc: '大字号+紧凑经历', color: 'linear-gradient(135deg,#1a1a1a,#666)' },
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
