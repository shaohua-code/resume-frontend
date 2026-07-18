/**
 * 27 套AI简历风格模板注册表
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
import Tpl21Brutalist from '@/components/resume-templates/Tpl21Brutalist.vue'
import Tpl22Botanical from '@/components/resume-templates/Tpl22Botanical.vue'
import Tpl23Dashboard from '@/components/resume-templates/Tpl23Dashboard.vue'
import Tpl24Constructivist from '@/components/resume-templates/Tpl24Constructivist.vue'
import Tpl25Gallery from '@/components/resume-templates/Tpl25Gallery.vue'
// 应届生模板保持独立组件，便于在不改公共逻辑的前提下形成明显不同版式。
import Tpl26CampusJournal from '@/components/resume-templates/Tpl26CampusJournal.vue'
import Tpl27GraduateLaunch from '@/components/resume-templates/Tpl27GraduateLaunch.vue'

export const MAX_TEMPLATE_ID = 27

export const TEMPLATE_LIST = [
  { id: 1, name: '全职业通用', category: '通用', desc: '清晰稳妥的单栏结构，适合大多数岗位', color: 'linear-gradient(135deg,#334155,#64748b)' },
  { id: 2, name: '简约商务', category: '职场', desc: '商务蓝顶栏与清楚层级，适合社招求职', color: 'linear-gradient(135deg,#1e40af,#3b82f6)' },
  { id: 3, name: '新锐校招', category: '校招', desc: '海报式编号与高能配色，突出成长潜力和项目表达', color: 'linear-gradient(135deg,#282050,#c7f35b)' },
  { id: 4, name: '专业分栏', category: '职场', desc: '信息分区明确，适合经历丰富的候选人', color: 'linear-gradient(135deg,#334155,#64748b)' },
  { id: 5, name: '品牌色带', category: '通用', desc: '醒目头部与规整正文，兼顾辨识度与阅读性', color: 'linear-gradient(135deg,#0958d9,#1677ff)' },
  { id: 6, name: '信息表格', category: '传统行业', desc: '信息密度高、打印稳定，适合规范型岗位', color: 'linear-gradient(135deg,#475569,#94a3b8)' },
  { id: 7, name: '墨印排版', category: '通用', desc: '报刊式排版搭配钴蓝印记，正式又有编辑感', color: 'linear-gradient(135deg,#171717,#2f57d9)' },
  { id: 8, name: '现代扁平', category: '职场', desc: '现代配色与标签体系，适合产品、运营与技术岗', color: 'linear-gradient(135deg,#4f46e5,#8b5cf6)' },
  { id: 9, name: '行政文职', category: '行业', desc: '端正规整，突出工作职责与办公能力', color: 'linear-gradient(135deg,#3f3f46,#71717a)' },
  { id: 10, name: '销售市场', category: '行业', desc: '强调业绩成果、客户经营与增长贡献', color: 'linear-gradient(135deg,#be123c,#fb7185)' },
  { id: 11, name: '教育培训', category: '行业', desc: '温和沉稳，适合教师、教研与培训岗位', color: 'linear-gradient(135deg,#92400e,#d97706)' },
  { id: 12, name: '金融会计', category: '行业', desc: '严谨专业，突出财务资质与数据成果', color: 'linear-gradient(135deg,#0f3d56,#39758f)' },
  { id: 13, name: '设计创意', category: '创意', desc: '温暖配色与轻量卡片，强化作品与审美表达', color: 'linear-gradient(135deg,#c2410c,#fb923c)' },
  { id: 14, name: '极夜技术', category: '行业', desc: '控制台与蓝图网格结合，突出技术项目和专业工具', color: 'linear-gradient(135deg,#0b1324,#00c9b7)' },
  { id: 15, name: '跨境名片', category: '通用', desc: '航空信封色带与双语章节，适合外企和跨境岗位', color: 'linear-gradient(135deg,#17324d,#d94b50)' },
  { id: 16, name: '成长时间轴', category: '校招', desc: '按时间呈现成长路径，适合经历连续的候选人', color: 'linear-gradient(135deg,#0369a1,#38bdf8)' },
  { id: 17, name: '能力矩阵', category: '职场', desc: '强化核心能力标签，不虚构熟练度百分比', color: 'linear-gradient(135deg,#0f766e,#2dd4bf)' },
  { id: 18, name: '极简线条', category: '通用', desc: '克制留白与细线分隔，内容阅读优先', color: 'linear-gradient(135deg,#27272a,#a1a1aa)' },
  { id: 19, name: '个人品牌', category: '创意', desc: '封面式姓名区，适合咨询、创意与管理岗位', color: 'linear-gradient(135deg,#312e81,#818cf8)' },
  { id: 20, name: '高管精英', category: '职场', desc: '高级留白与紧凑经历，突出管理影响力', color: 'linear-gradient(135deg,#18181b,#52525b)' },
  { id: 21, name: '野兽派档案', category: '创意', desc: '粗边框、高反差和块面构成，适合作品型岗位', color: 'linear-gradient(135deg,#ff5c52,#f4d738)' },
  { id: 22, name: '植物编辑', category: '创意', desc: '森林绿与柔和叶片轮廓，专业中保留温度', color: 'linear-gradient(135deg,#245544,#e48673)' },
  { id: 23, name: '信息面板', category: '创意', desc: '仪表盘卡片结构，高密度信息仍保持清晰', color: 'linear-gradient(135deg,#1d2747,#3ad5d0)' },
  { id: 24, name: '构成主义', category: '创意', desc: '建筑网格、竖排标题和大胆几何色块', color: 'linear-gradient(135deg,#2846a2,#e7aa32)' },
  { id: 25, name: '策展画廊', category: '创意', desc: '展签式卡片与多彩拼贴，突出个人作品叙事', color: 'linear-gradient(135deg,#24213e,#e65057)' },
  // 两套校招模板分别突出校园成长档案与实践成果路径。
  { id: 26, name: '晨光校刊', category: '校招', desc: '校刊式单栏档案，清晰呈现教育、项目与校园成长', color: 'linear-gradient(135deg,#173f5f,#e68a4f)' },
  { id: 27, name: '起跑计划', category: '校招', desc: '清爽成长轨道与成果卡片，突出技能和实践潜力', color: 'linear-gradient(135deg,#126e82,#35b7a6)' },
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
  21: Tpl21Brutalist,
  22: Tpl22Botanical,
  23: Tpl23Dashboard,
  24: Tpl24Constructivist,
  25: Tpl25Gallery,
  // 连续 ID 映射保证模板库、生成页和编辑器自动接入。
  26: Tpl26CampusJournal,
  27: Tpl27GraduateLaunch,
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
