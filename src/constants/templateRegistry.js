/**
 * 50 套 AI 简历风格模板注册表
 * 元数据与组件加载器分离：列表页只引元数据，渲染时再按 id 动态 import 组件。
 */

export const MAX_TEMPLATE_ID = 50

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
  // 28–47 覆盖网格、社论、自然、技术与创意等明显不同的视觉体系。
  { id: 28, name: '瑞士网格', category: '通用', desc: '严格栏线与编号系统，适合高密度专业信息', color: 'linear-gradient(135deg,#e63946,#f1faee)' },
  { id: 29, name: '黑金社论', category: '职场', desc: '报章头版与黑金细节，突出资深和管理气质', color: 'linear-gradient(135deg,#171717,#c7a55b)' },
  { id: 30, name: '海岸波纹', category: '通用', desc: '层叠海岸色带与圆润信息岛，清爽且亲和', color: 'linear-gradient(135deg,#075985,#67e8f9)' },
  { id: 31, name: '樱色手账', category: '创意', desc: '便签页签与柔和点线，适合温暖细腻的表达', color: 'linear-gradient(135deg,#be6477,#f8d7df)' },
  { id: 32, name: '工程蓝图', category: '行业', desc: '坐标网格与制图框线，突出技术规范和可靠性', color: 'linear-gradient(135deg,#0c4a6e,#38bdf8)' },
  { id: 33, name: '陶土卡片', category: '创意', desc: '暖色厚底卡片和手作质感，沉稳且有人文温度', color: 'linear-gradient(135deg,#9a4f3b,#e9c8a6)' },
  { id: 34, name: '城市路线', category: '职场', desc: '站点与导向线路串联经历，职业轨迹一目了然', color: 'linear-gradient(135deg,#173b57,#f05d5e)' },
  { id: 35, name: '北欧留白', category: '通用', desc: '克制细线与宽松留白，让内容成为视觉中心', color: 'linear-gradient(135deg,#334155,#d9e7e5)' },
  { id: 36, name: '霓虹终端', category: '行业', desc: '命令行窗口与荧光状态码，适合数字技术岗位', color: 'linear-gradient(135deg,#071a1d,#39ffb6)' },
  { id: 37, name: '东方印鉴', category: '通用', desc: '朱印、题签与双框线，端庄而富有文化识别度', color: 'linear-gradient(135deg,#782c2c,#e5c07b)' },
  { id: 38, name: '丝带作品', category: '创意', desc: '分层绶带与双栏展板，强化项目和作品叙事', color: 'linear-gradient(135deg,#4c2a69,#e05a7a)' },
  { id: 39, name: '水晶面板', category: '创意', desc: '通透切面与几何卡片，呈现轻盈现代的信息感', color: 'linear-gradient(135deg,#5066a5,#a8e6cf)' },
  { id: 40, name: '纸本账册', category: '传统行业', desc: '横线纸与连续编号，适合严谨规范的职业档案', color: 'linear-gradient(135deg,#5f4b32,#c8a86b)' },
  { id: 41, name: '极光流线', category: '创意', desc: '柔和渐变和弧形边界，兼顾活力与专业阅读', color: 'linear-gradient(135deg,#5b4fc7,#45d6c5)' },
  { id: 42, name: '包豪斯积木', category: '创意', desc: '基础几何与粗框色块，形成大胆清晰的视觉秩序', color: 'linear-gradient(135deg,#de3c2f,#f2c230)' },
  { id: 43, name: '学院徽章', category: '校招', desc: '院刊规则与徽章结构，适合学术和校园经历展示', color: 'linear-gradient(135deg,#173f5f,#b6904b)' },
  { id: 44, name: '柑橘工作室', category: '创意', desc: '明快果瓣和点状纸张，适合创意与品牌类岗位', color: 'linear-gradient(135deg,#ee8b2d,#64b5a7)' },
  { id: 45, name: '黑白索引', category: '通用', desc: '极端黑白对比与目录编号，高效呈现核心内容', color: 'linear-gradient(135deg,#111111,#d4d4d4)' },
  { id: 46, name: '深空坐标', category: '行业', desc: '星点坐标与任务舱面板，表达探索和技术精神', color: 'linear-gradient(135deg,#10183a,#6a7cff)' },
  { id: 47, name: '亚麻书信', category: '通用', desc: '信纸抬头与温柔留白，传递真诚可靠的职业形象', color: 'linear-gradient(135deg,#8b6f47,#e8dcc8)' },
  // 三套校招模板分别聚焦成长记录、实践成果和能力证明。
  { id: 48, name: '校园成长档案', category: '校招', desc: '学期索引与成长刻度，完整串联教育和校园历程', color: 'linear-gradient(135deg,#275d4d,#e9b949)' },
  { id: 49, name: '实践冲刺', category: '校招', desc: '冲刺看板突出实习与项目贡献，行动成果更醒目', color: 'linear-gradient(135deg,#173b67,#f47a3c)' },
  { id: 50, name: '新星作品集', category: '校招', desc: '展览票签与能力证明墙，集中呈现作品和应届潜力', color: 'linear-gradient(135deg,#4d3ca6,#d8ff4f)' },
]

/** 模板 ID -> 动态 import，避免 50 套组件同步打进首页包 */
export const TEMPLATE_LOADERS = {
  1: () => import('@/components/resume-templates/Tpl01Universal.vue'),
  2: () => import('@/components/resume-templates/Tpl02Business.vue'),
  3: () => import('@/components/resume-templates/Tpl03Campus.vue'),
  4: () => import('@/components/resume-templates/Tpl04TwoColumn.vue'),
  5: () => import('@/components/resume-templates/Tpl05TopBand.vue'),
  6: () => import('@/components/resume-templates/Tpl06TableInfo.vue'),
  7: () => import('@/components/resume-templates/Tpl07ClassicBW.vue'),
  8: () => import('@/components/resume-templates/Tpl08Internet.vue'),
  9: () => import('@/components/resume-templates/Tpl09Admin.vue'),
  10: () => import('@/components/resume-templates/Tpl10Sales.vue'),
  11: () => import('@/components/resume-templates/Tpl11Education.vue'),
  12: () => import('@/components/resume-templates/Tpl12Finance.vue'),
  13: () => import('@/components/resume-templates/Tpl13Creative.vue'),
  14: () => import('@/components/resume-templates/Tpl14Programmer.vue'),
  15: () => import('@/components/resume-templates/Tpl15Bilingual.vue'),
  16: () => import('@/components/resume-templates/Tpl16Timeline.vue'),
  17: () => import('@/components/resume-templates/Tpl17SkillProgress.vue'),
  18: () => import('@/components/resume-templates/Tpl18MinimalLine.vue'),
  19: () => import('@/components/resume-templates/Tpl19Envelope.vue'),
  20: () => import('@/components/resume-templates/Tpl20Executive.vue'),
  21: () => import('@/components/resume-templates/Tpl21Brutalist.vue'),
  22: () => import('@/components/resume-templates/Tpl22Botanical.vue'),
  23: () => import('@/components/resume-templates/Tpl23Dashboard.vue'),
  24: () => import('@/components/resume-templates/Tpl24Constructivist.vue'),
  25: () => import('@/components/resume-templates/Tpl25Gallery.vue'),
  26: () => import('@/components/resume-templates/Tpl26CampusJournal.vue'),
  27: () => import('@/components/resume-templates/Tpl27GraduateLaunch.vue'),
  28: () => import('@/components/resume-templates/Tpl28SwissGrid.vue'),
  29: () => import('@/components/resume-templates/Tpl29EditorialNoir.vue'),
  30: () => import('@/components/resume-templates/Tpl30OceanWave.vue'),
  31: () => import('@/components/resume-templates/Tpl31SakuraNote.vue'),
  32: () => import('@/components/resume-templates/Tpl32Blueprint.vue'),
  33: () => import('@/components/resume-templates/Tpl33TerraCards.vue'),
  34: () => import('@/components/resume-templates/Tpl34MetroRoute.vue'),
  35: () => import('@/components/resume-templates/Tpl35NordicMinimal.vue'),
  36: () => import('@/components/resume-templates/Tpl36NeonTerminal.vue'),
  37: () => import('@/components/resume-templates/Tpl37HeritageSeal.vue'),
  38: () => import('@/components/resume-templates/Tpl38RibbonPortfolio.vue'),
  39: () => import('@/components/resume-templates/Tpl39QuartzPanel.vue'),
  40: () => import('@/components/resume-templates/Tpl40PaperLedger.vue'),
  41: () => import('@/components/resume-templates/Tpl41AuroraFlow.vue'),
  42: () => import('@/components/resume-templates/Tpl42BauhausBlocks.vue'),
  43: () => import('@/components/resume-templates/Tpl43AcademicCrest.vue'),
  44: () => import('@/components/resume-templates/Tpl44CitrusStudio.vue'),
  45: () => import('@/components/resume-templates/Tpl45MonochromeIndex.vue'),
  46: () => import('@/components/resume-templates/Tpl46DeepSpace.vue'),
  47: () => import('@/components/resume-templates/Tpl47LinenLetter.vue'),
  48: () => import('@/components/resume-templates/Tpl48CampusArchive.vue'),
  49: () => import('@/components/resume-templates/Tpl49PracticeSprint.vue'),
  50: () => import('@/components/resume-templates/Tpl50GraduatePortfolio.vue'),
}

/** @deprecated 兼容旧引用：请改用 TEMPLATE_LOADERS / getTemplateLoader */
export const TEMPLATE_MAP = TEMPLATE_LOADERS

export function clampTemplateId(id) {
  const n = Number(id) || 1
  if (n < 1) return 1
  if (n > MAX_TEMPLATE_ID) return 1
  return n
}

export function getTemplateLoader(id) {
  const safeId = clampTemplateId(id)
  return TEMPLATE_LOADERS[safeId] || TEMPLATE_LOADERS[1]
}

export function getTemplateName(id) {
  return TEMPLATE_LIST.find((t) => t.id === clampTemplateId(id))?.name || '全职业通用'
}
