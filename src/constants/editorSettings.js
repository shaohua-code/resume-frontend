/**
 * 编辑器默认设置（间距 / 字体 / 皮肤）
 * 与全民简历参考站 slider 范围对齐
 */
import { DEFAULT_SKIN_THEME, normalizeSkinTheme } from '@/constants/skin'

export const DEFAULT_SPACING = {
  sectionGap: 5,
  lineHeight: 1.6,
  padding: 10,
  pageTopGap: 16,
  pageBottomGap: 24,
}

export const SPACING_RANGES = {
  sectionGap: { min: 5, max: 50, step: 1 },
  lineHeight: { min: 1.3, max: 2.2, step: 0.05 },
  padding: { min: 10, max: 50, step: 1 },
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
  { key: 'skills', title: '技能特长', visible: true },
  { key: 'projects', title: '项目经验', visible: true },
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
  contentColor: DEFAULT_CONTENT_COLOR,
  skinTheme: { ...DEFAULT_SKIN_THEME },
  modules: DEFAULT_MODULES.map((m) => ({ ...m })),
}

/** 将字体颜色设置转为预览 CSS 变量；labelColor/nameColor/basicContentColor 为 null 时不注入，由 templateVariants 智能 fallback */
export function fontColorsToCssVars({ labelColor, basicContentColor, nameColor, contentColor } = {}) {
  const vars = {
    '--font-content-color': contentColor || DEFAULT_CONTENT_COLOR,
  }
  if (labelColor) {
    vars['--font-label-color'] = labelColor
  }
  if (basicContentColor) {
    vars['--font-basic-content-color'] = basicContentColor
  }
  if (nameColor) {
    vars['--font-name-color'] = nameColor
  }
  return vars
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
    contentColor: raw.contentColor || DEFAULT_CONTENT_COLOR,
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
    contentColor: editorSettings.contentColor || DEFAULT_CONTENT_COLOR,
    skinTheme: normalizeSkinTheme(editorSettings.skinTheme),
    modules: (editorSettings.modules || DEFAULT_MODULES).map((m) => ({ ...m })),
  }
  // 仅保存用户自定义的标签色/基本信息内容色/姓名色，null 表示使用模板智能默认
  if (editorSettings.labelColor) {
    resume._editorSettings.labelColor = editorSettings.labelColor
  }
  if (editorSettings.basicContentColor) {
    resume._editorSettings.basicContentColor = editorSettings.basicContentColor
  }
  if (editorSettings.nameColor) {
    resume._editorSettings.nameColor = editorSettings.nameColor
  }
}
