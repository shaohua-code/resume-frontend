/**
 * 编辑器默认设置（间距 / 字体 / 皮肤）
 * 与全民简历参考站 slider 范围对齐
 */
import { EMPTY_SKIN_OVERRIDES, SKIN_THEME_KEYS, normalizeSkinTheme } from '@/constants/skin'
import { getTemplateFontColorDefaults } from '@/constants/templateFontColors'

export const DEFAULT_SPACING = {
  sectionGap: 5,
  lineHeight: 1.6,
  padding: 0,
  pageTopGap: 0,
  pageBottomGap: 24,
}

export const SPACING_RANGES = {
  sectionGap: { min: 5, max: 50, step: 1 },
  lineHeight: { min: 1.3, max: 2.2, step: 0.05 },
  padding: { min: 0, max: 50, step: 1 },
  pageTopGap: { min: 0, max: 80, step: 2 },
  pageBottomGap: { min: 0, max: 80, step: 2 },
}

export const DEFAULT_FONT_SIZE = 13
export const DEFAULT_FONT_FAMILY = "'Microsoft YaHei', sans-serif"
// 基本信息标签默认色（浅色顶栏场景）；深色顶栏由 templateVariants.css fallback 为白色
export const DEFAULT_LABEL_COLOR = '#6b7280'
// 文本内容默认色（不含顶栏大姓名与基本信息行内容值）
export const DEFAULT_CONTENT_COLOR = '#000000'
// 基本信息行内容值默认色
export const DEFAULT_BASIC_CONTENT_COLOR = '#000000'
// 顶栏大姓名默认色（颜色选择器展示用；未自定义时由 templateVariants 智能 fallback）
export const DEFAULT_NAME_COLOR = '#ffffff'

export const FONT_OPTIONS = [
  { value: "'Microsoft YaHei', sans-serif", label: '微软雅黑' },
  { value: "'SimSun', serif", label: '宋体' },
  { value: "'SimHei', sans-serif", label: '黑体' },
  { value: "'KaiTi', serif", label: '楷体' },
  { value: "'FangSong', serif", label: '仿宋' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
]

export const FONT_SIZE_OPTIONS = [10, 11, 12, 13, 14, 15, 16, 18, 20]

export const DEFAULT_MODULES = [
  { key: 'basic', title: '基本信息', visible: true },
  { key: 'educations', title: '教育背景', visible: true },
  { key: 'skills', title: '技能特长', visible: true },
  { key: 'projects', title: '项目经验', visible: true },
  { key: 'work_experience', title: '工作经历', visible: true },
  { key: 'internships', title: '实习经历', visible: true },
  { key: 'awards', title: '荣誉证书', visible: true },
]

export const DEFAULT_EDITOR_SETTINGS = {
  spacing: { ...DEFAULT_SPACING },
  fontSize: DEFAULT_FONT_SIZE,
  fontFamily: DEFAULT_FONT_FAMILY,
  labelColor: null,
  basicContentColor: null,
  nameColor: null,
  contentColor: null,
  skinTheme: { ...EMPTY_SKIN_OVERRIDES },
  modules: DEFAULT_MODULES.map((m) => ({ ...m })),
}

/** 将字体颜色转为预览 CSS 变量；null 时合并 templateFontColors.js 当前模板预设 */
export function fontColorsToCssVars({
  labelColor,
  basicContentColor,
  nameColor,
  contentColor,
  templateId = 1,
} = {}) {
  const defaults = getTemplateFontColorDefaults(templateId)
  return {
    '--font-label-color': labelColor || defaults.labelColor,
    '--font-basic-content-color': basicContentColor || defaults.basicContentColor,
    '--font-name-color': nameColor || defaults.nameColor,
    '--font-content-color': contentColor || defaults.contentColor,
  }
}

/** 从 resume_json 中提取并剥离 _editorSettings */
export function extractEditorSettings(resume) {
  const raw = resume._editorSettings
    ? { ...DEFAULT_EDITOR_SETTINGS, ...resume._editorSettings, spacing: { ...DEFAULT_SPACING, ...resume._editorSettings?.spacing } }
    : { ...DEFAULT_EDITOR_SETTINGS, spacing: { ...DEFAULT_SPACING } }
  const savedModules = raw.modules || []
  const settings = {
    ...raw,
    spacing: { ...DEFAULT_SPACING, ...raw.spacing },
    labelColor: raw.labelColor ?? null,
    basicContentColor: raw.basicContentColor ?? null,
    nameColor: raw.nameColor ?? null,
    contentColor: raw.contentColor ?? null,
    skinTheme: normalizeSkinTheme(raw.skinTheme ?? raw.skin),
    modules: DEFAULT_MODULES.map((mod) => ({
      ...mod,
      ...(savedModules.find((item) => item.key === mod.key) || {}),
    })),
  }
  return settings
}

/** 保存前写入 _editorSettings 到 resume 对象 */
export function applyEditorSettingsToResume(resume, editorSettings) {
  resume._editorSettings = {
    spacing: { ...editorSettings.spacing },
    fontSize: editorSettings.fontSize,
    fontFamily: editorSettings.fontFamily,
    modules: (editorSettings.modules || DEFAULT_MODULES).map((m) => ({ ...m })),
  }
  // 皮肤：仅保存 preset + 用户非 null 覆盖项
  const skin = normalizeSkinTheme(editorSettings.skinTheme)
  resume._editorSettings.skinTheme = { preset: skin.preset || 'template' }
  SKIN_THEME_KEYS.forEach((key) => {
    if (skin[key] != null) {
      resume._editorSettings.skinTheme[key] = skin[key]
    }
  })
  // 仅保存用户自定义字体色，null 表示使用 templateFontColors.js 模板默认
  if (editorSettings.labelColor) {
    resume._editorSettings.labelColor = editorSettings.labelColor
  }
  if (editorSettings.basicContentColor) {
    resume._editorSettings.basicContentColor = editorSettings.basicContentColor
  }
  if (editorSettings.nameColor) {
    resume._editorSettings.nameColor = editorSettings.nameColor
  }
  if (editorSettings.contentColor) {
    resume._editorSettings.contentColor = editorSettings.contentColor
  }
}
