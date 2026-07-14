/**
 * 20 套模板皮肤默认预设（唯一配置源）
 * - 11 项字段对应 EditorSkinPanel 自定义颜色
 * - 用户未覆盖（null）时由 mergeSkinThemeWithTemplate + skinThemeToCssVars 注入
 */
import { clampTemplateId } from '@/constants/templateRegistry'

/** 皮肤 11 项字段 key（与 skin.js SKIN_COLOR_FIELDS 一致） */
export const SKIN_THEME_KEYS = [
  'titleColor',
  'dividerColor',
  'headerBg',
  'headerBorder',
  'itemBg',
  'itemBorder',
  'basicRowBg',
  'basicRowBorder',
  'skillBg',
  'skillBorder',
  'topBandBg',
]

/** G1 标准蓝系基准（全职业 / 校招 / 时间轴 / 技能进度） */
const BLUE_SKIN = {
  titleColor: '#1677ff',
  dividerColor: '#e5e7eb',
  headerBg: 'transparent',
  headerBorder: '#1f2937',
  itemBg: '#ffffff',
  itemBorder: '#edf0f5',
  basicRowBg: '#f8fafc',
  basicRowBorder: '#e5e7eb',
  skillBg: '#eef4ff',
  skillBorder: '#cfe0ff',
  topBandBg: '#1677ff',
}

/** G3 商务灰黑基准（表格 / 黑白 / 行政 / 金融 / Executive） */
const GRAY_SKIN = {
  titleColor: '#111827',
  dividerColor: '#d1d5db',
  headerBg: 'transparent',
  headerBorder: '#111827',
  itemBg: '#ffffff',
  itemBorder: '#e5e7eb',
  basicRowBg: '#f3f4f6',
  basicRowBorder: '#d1d5db',
  skillBg: '#f3f4f6',
  skillBorder: '#9ca3af',
  topBandBg: '#374151',
}

/** 20 套模板皮肤独立默认色（含中文注释说明视觉意图） */
export const TEMPLATE_SKIN_PRESETS = {
  // 1. 全职业通用：标准蓝强调 + 浅灰条目
  1: { ...BLUE_SKIN },

  // 2. 简约商务：深蓝顶栏色带 + 左色条技能边框
  2: {
    titleColor: '#1e40af',
    dividerColor: '#dbeafe',
    headerBg: 'transparent',
    headerBorder: '#1e40af',
    itemBg: '#ffffff',
    itemBorder: '#edf0f5',
    basicRowBg: '#f8fafc',
    basicRowBorder: '#e5e7eb',
    skillBg: '#eff6ff',
    skillBorder: '#dbeafe',
    topBandBg: '#1e40af',
  },

  // 3. 应届校招：清爽蓝白 + 浅蓝顶栏边框
  3: {
    ...BLUE_SKIN,
    titleColor: '#437482',
    dividerColor: '#e5e7eb',
    headerBg: 'transparent',
    headerBorder: '#1f2937',
    itemBg: '#ffffff',
    itemBorder: '#edf0f5',
    basicRowBg: '#ffffff',
    basicRowBorder: '#e5e7eb',
    skillBg: '#ffffff',
    skillBorder: '#ffffff',
    topBandBg: '#437482',
    headerBorder: '#bfdbfe',
    itemBorder: '#dbeafe',
    basicRowBorder: '#bfdbfe',
  },

  // 4. 左右分栏：深色顶栏分栏区
  4: {
    titleColor: '#1677ff',
    dividerColor: '#e5e7eb',
    headerBg: '#1f2937',
    headerBorder: '#374151',
    itemBg: '#ffffff',
    itemBorder: '#edf0f5',
    basicRowBg: '#f8fafc',
    basicRowBorder: '#e5e7eb',
    skillBg: '#eef4ff',
    skillBorder: '#cfe0ff',
    topBandBg: '#1f2937',
  },

  // 5. 顶部色带：全宽蓝色 header
  5: {
    titleColor: '#ffffff',
    dividerColor: 'rgba(255,255,255,0.3)',
    headerBg: '#1677ff',
    headerBorder: '#0958d9',
    itemBg: '#ffffff',
    itemBorder: '#edf0f5',
    basicRowBg: 'rgba(255,255,255,0.16)',
    basicRowBorder: 'rgba(255,255,255,0.24)',
    skillBg: '#eef4ff',
    skillBorder: '#cfe0ff',
    topBandBg: '#1677ff',
  },

  // 6. 表格信息：严谨灰黑表格风
  6: {
    ...GRAY_SKIN,
    titleColor: '#374151',
    basicRowBorder: '#d1d5db',
  },

  // 7. 经典黑白：打印友好高对比
  7: {
    titleColor: '#000000',
    dividerColor: '#000000',
    headerBg: 'transparent',
    headerBorder: '#000000',
    itemBg: '#ffffff',
    itemBorder: '#d1d5db',
    basicRowBg: '#ffffff',
    basicRowBorder: '#d1d5db',
    skillBg: '#f9fafb',
    skillBorder: '#6b7280',
    topBandBg: '#111827',
  },

  // 8. 现代扁平：左侧 slate 蓝灰边栏 + 右侧蓝色标题条
  8: {
    titleColor: '#5b6b7c',
    dividerColor: '#e2e8f0',
    headerBg: '#5b6b7c',
    headerBorder: '#5b6b7c',
    itemBg: '#ffffff',
    itemBorder: '#e2e8f0',
    basicRowBg: '#f1f5f9',
    basicRowBorder: '#cbd5e1',
    skillBg: '#eff6ff',
    skillBorder: '#bfdbfe',
    topBandBg: '#5b6b7c',
  },

  // 9. 行政文职：正式列表灰系
  9: {
    ...GRAY_SKIN,
    titleColor: '#374151',
    itemBorder: '#e5e7eb',
  },

  // 10. 销售市场：红色强调 + 浅红技能
  10: {
    titleColor: '#7c3aed',
    dividerColor: '#7c3aed',
    headerBg: '#7c3aed',
    headerBorder: '#7c3aed',
    itemBg: '#ffffff',
    itemBorder: '#7c3aed',
    basicRowBg: '#7c3aed',
    basicRowBorder: '#7c3aed',
    skillBg: '#7c3aed',
    skillBorder: '#7c3aed',
    topBandBg: '#7c3aed',
  },

  // 11. 教育培训：衬线暖棕
  11: {
    titleColor: '#81a1c1',
    dividerColor: '#81a1c1',
    headerBg: 'transparent',
    headerBorder: '#81a1c1',
    itemBg: '#ffffff',
    itemBorder: '#81a1c1',
    basicRowBg: '#81a1c5',
    basicRowBorder: '#81a1c1',
    skillBg: '#81a1c1',
    skillBorder: '#81a1c1',
    topBandBg: '#81a1c1',
  },

  // 12. 金融会计：顶部蓝色头部 + 时间轴内容区
  12: {
    ...GRAY_SKIN,
    titleColor: '#5b9bd5',
    headerBg: '#5b9bd5',
    headerBorder: '#5b9bd5',
    itemBorder: '#d1d5db',
  },

  // 13. 设计创意：暖色浅块顶栏
  13: {
    titleColor: '#ea580c',
    dividerColor: '#fed7aa',
    headerBg: '#fff7ed',
    headerBorder: '#fed7aa',
    itemBg: '#ffffff',
    itemBorder: '#ffedd5',
    basicRowBg: '#fff7ed',
    basicRowBorder: '#fdba74',
    skillBg: '#ffedd5',
    skillBorder: '#fdba74',
    topBandBg: '#fff7ed',
  },

  // 14. 程序员：深色 slate 顶栏 + 蓝绿点缀
  14: {
    titleColor: '#1677ff',
    dividerColor: '#334155',
    headerBg: '#0f172a',
    headerBorder: '#1e293b',
    itemBg: '#ffffff',
    itemBorder: '#e2e8f0',
    basicRowBg: '#f1f5f9',
    basicRowBorder: '#cbd5e1',
    skillBg: '#1e293b',
    skillBorder: '#4ade80',
    topBandBg: '#0f172a',
  },

  // 15. 中英文双语：石板灰专业
  15: {
    titleColor: '#1e293b',
    dividerColor: '#cbd5e1',
    headerBg: 'transparent',
    headerBorder: '#475569',
    itemBg: '#ffffff',
    itemBorder: '#e2e8f0',
    basicRowBg: '#f8fafc',
    basicRowBorder: '#cbd5e1',
    skillBg: '#f1f5f9',
    skillBorder: '#94a3b8',
    topBandBg: '#334155',
  },

  // 16. 时间轴：蓝色竖线时间轴
  16: { ...BLUE_SKIN },

  // 17. 技能进度：蓝绿渐变进度条
  17: {
    ...BLUE_SKIN,
    skillBg: '#e6f4ff',
    skillBorder: '#36cfc9',
  },

  // 18. 极简线条：透明底 + 线条分隔
  18: {
    titleColor: '#111827',
    dividerColor: '#e5e7eb',
    headerBg: 'transparent',
    headerBorder: '#111827',
    itemBg: 'transparent',
    itemBorder: '#e5e7eb',
    basicRowBg: 'transparent',
    basicRowBorder: '#e5e7eb',
    skillBg: 'transparent',
    skillBorder: '#9ca3af',
    topBandBg: 'transparent',
  },

  // 19. 信封封面：大边框封面感
  19: {
    titleColor: '#374151',
    dividerColor: '#d1d5db',
    headerBg: 'transparent',
    headerBorder: '#1f2937',
    itemBg: '#ffffff',
    itemBorder: '#e5e7eb',
    basicRowBg: '#f9fafb',
    basicRowBorder: '#d1d5db',
    skillBg: '#f3f4f6',
    skillBorder: '#9ca3af',
    topBandBg: 'transparent',
  },

  // 20. Executive：高端留白灰
  20: {
    titleColor: '#7c3aed',
    dividerColor: '#d1d5db',
    headerBg: 'transparent',
    headerBorder: '#9ca3af',
    itemBg: '#ffffff',
    itemBorder: '#f1f5f9',
    basicRowBg: '#f9fafb',
    basicRowBorder: '#e5e7eb',
    skillBg: '#f3f4f6',
    skillBorder: '#d1d5db',
    topBandBg: '#ffffff',
  },
}

/** 未自定义皮肤时的空覆盖（preset: template 表示走模板默认） */
export const EMPTY_SKIN_OVERRIDES = {
  preset: 'template',
  titleColor: null,
  dividerColor: null,
  headerBg: null,
  headerBorder: null,
  itemBg: null,
  itemBorder: null,
  basicRowBg: null,
  basicRowBorder: null,
  skillBg: null,
  skillBorder: null,
  topBandBg: null,
}

/** 获取指定模板的皮肤默认色 */
export function getTemplateSkinDefaults(templateId) {
  const id = clampTemplateId(templateId)
  const preset = TEMPLATE_SKIN_PRESETS[id] || TEMPLATE_SKIN_PRESETS[1]
  return { ...preset }
}

/** 切换模板 / 重置皮肤：恢复为 template 预设空覆盖 */
export function applyTemplateSkinDefaults(skinThemeRef, templateId) {
  skinThemeRef.value = { ...EMPTY_SKIN_OVERRIDES }
}

/** 皮肤面板「重置」：恢复当前模板默认 */
export function resetTemplateSkinColors(skinThemeRef, templateId) {
  applyTemplateSkinDefaults(skinThemeRef, templateId)
}

/** 颜色选择器展示：字段为 null 时用模板默认 */
export function resolveSkinFieldDisplay(key, value, templateId) {
  if (value != null) return value
  const defaults = getTemplateSkinDefaults(templateId)
  return defaults[key] || '#1677ff'
}
