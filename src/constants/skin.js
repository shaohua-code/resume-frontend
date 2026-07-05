/**
 * 皮肤主题配置（单点维护）
 * - 模块标题色 titleColor：仅作用于六大模块大标题 .rt-title
 * - 其余字段：背景色 / 边框色等
 */

export const SKIN_COLORS = [
  { value: 'blue', color: '#1677ff' },
  { value: 'green', color: '#13d8a7' },
  { value: 'purple', color: '#722ed1' },
  { value: 'orange', color: '#fa8c16' },
  { value: 'red', color: '#f5222d' },
  { value: 'dark', color: '#333333' },
  { value: 'pink', color: '#eb2f96' },
  { value: 'cyan', color: '#13c2c2' },
]

export const SKIN_COLOR_MAP = SKIN_COLORS.reduce((acc, s) => {
  acc[s.value] = s.color
  return acc
}, {})

/** 默认主题基准值 */
export const BASE_SKIN_THEME = {
  preset: 'blue',
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

/** 皮肤面板可自定义颜色项 */
export const SKIN_COLOR_FIELDS = [
  { key: 'titleColor', label: '模块标题色', hint: '仅作用于教育背景、工作经历、项目经历、技能特长、荣誉证书、自我评价六大模块大标题' },
  { key: 'dividerColor', label: '标题分割线色' },
  { key: 'headerBg', label: '顶栏背景色' },
  { key: 'headerBorder', label: '顶栏边框色' },
  { key: 'itemBg', label: '条目背景色' },
  { key: 'itemBorder', label: '条目边框色' },
  { key: 'basicRowBg', label: '基本信息行背景' },
  { key: 'basicRowBorder', label: '基本信息行边框' },
  { key: 'skillBg', label: '技能标签背景' },
  { key: 'skillBorder', label: '技能标签边框' },
  { key: 'topBandBg', label: '顶部色带背景' },
]

/** 8 套推荐预设完整主题 */
export const SKIN_PRESET_THEMES = {
  blue: {
    preset: 'blue',
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
  },
  green: {
    preset: 'green',
    titleColor: '#13d8a7',
    dividerColor: '#d1fae5',
    headerBg: 'transparent',
    headerBorder: '#065f46',
    itemBg: '#ffffff',
    itemBorder: '#d1fae5',
    basicRowBg: '#ecfdf5',
    basicRowBorder: '#a7f3d0',
    skillBg: '#d1fae5',
    skillBorder: '#6ee7b7',
    topBandBg: '#13d8a7',
  },
  purple: {
    preset: 'purple',
    titleColor: '#722ed1',
    dividerColor: '#ede9fe',
    headerBg: 'transparent',
    headerBorder: '#4c1d95',
    itemBg: '#ffffff',
    itemBorder: '#ede9fe',
    basicRowBg: '#f5f3ff',
    basicRowBorder: '#ddd6fe',
    skillBg: '#ede9fe',
    skillBorder: '#c4b5fd',
    topBandBg: '#722ed1',
  },
  orange: {
    preset: 'orange',
    titleColor: '#fa8c16',
    dividerColor: '#ffedd5',
    headerBg: 'transparent',
    headerBorder: '#9a3412',
    itemBg: '#ffffff',
    itemBorder: '#fed7aa',
    basicRowBg: '#fff7ed',
    basicRowBorder: '#fdba74',
    skillBg: '#ffedd5',
    skillBorder: '#fdba74',
    topBandBg: '#fa8c16',
  },
  red: {
    preset: 'red',
    titleColor: '#f5222d',
    dividerColor: '#fecaca',
    headerBg: 'transparent',
    headerBorder: '#991b1b',
    itemBg: '#ffffff',
    itemBorder: '#fecaca',
    basicRowBg: '#fef2f2',
    basicRowBorder: '#fca5a5',
    skillBg: '#fee2e2',
    skillBorder: '#fca5a5',
    topBandBg: '#f5222d',
  },
  dark: {
    preset: 'dark',
    titleColor: '#333333',
    dividerColor: '#d1d5db',
    headerBg: 'transparent',
    headerBorder: '#111827',
    itemBg: '#ffffff',
    itemBorder: '#e5e7eb',
    basicRowBg: '#f3f4f6',
    basicRowBorder: '#d1d5db',
    skillBg: '#f3f4f6',
    skillBorder: '#9ca3af',
    topBandBg: '#333333',
  },
  pink: {
    preset: 'pink',
    titleColor: '#eb2f96',
    dividerColor: '#fce7f3',
    headerBg: 'transparent',
    headerBorder: '#9d174d',
    itemBg: '#ffffff',
    itemBorder: '#fbcfe8',
    basicRowBg: '#fdf2f8',
    basicRowBorder: '#f9a8d4',
    skillBg: '#fce7f3',
    skillBorder: '#f9a8d4',
    topBandBg: '#eb2f96',
  },
  cyan: {
    preset: 'cyan',
    titleColor: '#13c2c2',
    dividerColor: '#cffafe',
    headerBg: 'transparent',
    headerBorder: '#155e75',
    itemBg: '#ffffff',
    itemBorder: '#a5f3fc',
    basicRowBg: '#ecfeff',
    basicRowBorder: '#67e8f9',
    skillBg: '#cffafe',
    skillBorder: '#67e8f9',
    topBandBg: '#13c2c2',
  },
}

export const DEFAULT_SKIN = 'blue'
export const DEFAULT_SKIN_THEME = { ...SKIN_PRESET_THEMES.blue }

/**
 * 兼容旧数据 skin: 'blue' 字符串 → 完整 theme 对象
 */
export function normalizeSkinTheme(skin) {
  if (!skin) return { ...DEFAULT_SKIN_THEME }
  if (typeof skin === 'string') {
    return { ...(SKIN_PRESET_THEMES[skin] || DEFAULT_SKIN_THEME) }
  }
  if (typeof skin === 'object') {
    const presetKey = skin.preset && skin.preset !== 'custom' ? skin.preset : null
    const base = presetKey && SKIN_PRESET_THEMES[presetKey]
      ? { ...SKIN_PRESET_THEMES[presetKey] }
      : { ...DEFAULT_SKIN_THEME }
    return { ...base, ...skin, preset: skin.preset || presetKey || 'custom' }
  }
  return { ...DEFAULT_SKIN_THEME }
}

/** 将 skinTheme 转为 ResumePreview CSS 变量 */
export function skinThemeToCssVars(theme) {
  const t = normalizeSkinTheme(theme)
  return {
    '--skin-title-color': t.titleColor,
    '--skin-divider-color': t.dividerColor,
    '--skin-header-bg': t.headerBg,
    '--skin-header-border': t.headerBorder,
    '--skin-item-bg': t.itemBg,
    '--skin-item-border': t.itemBorder,
    '--skin-basic-row-bg': t.basicRowBg,
    '--skin-basic-row-border': t.basicRowBorder,
    '--skin-skill-bg': t.skillBg,
    '--skin-skill-border': t.skillBorder,
    '--skin-top-band-bg': t.topBandBg,
  }
}
