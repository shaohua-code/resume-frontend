/**
 * 编辑器默认设置（间距 / 字体 / 皮肤）
 * 与全民简历参考站 slider 范围对齐
 */
import { DEFAULT_SKIN } from '@/constants/skin'

export const DEFAULT_SPACING = {
  sectionGap: 5,
  lineHeight: 1.6,
  padding: 10,
}

export const SPACING_RANGES = {
  sectionGap: { min: 5, max: 50, step: 1 },
  lineHeight: { min: 1.3, max: 2.2, step: 0.05 },
  padding: { min: 10, max: 50, step: 1 },
}

export const DEFAULT_FONT_SIZE = 13
export const DEFAULT_FONT_FAMILY = "'Microsoft YaHei', sans-serif"

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
  skin: DEFAULT_SKIN,
  modules: DEFAULT_MODULES.map((m) => ({ ...m })),
}

/** 从 resume_json 中提取并剥离 _editorSettings */
export function extractEditorSettings(resume) {
  const settings = resume._editorSettings
    ? { ...DEFAULT_EDITOR_SETTINGS, ...resume._editorSettings, spacing: { ...DEFAULT_SPACING, ...resume._editorSettings?.spacing } }
    : { ...DEFAULT_EDITOR_SETTINGS, spacing: { ...DEFAULT_SPACING } }
  const savedModules = settings.modules || []
  settings.modules = DEFAULT_MODULES.map((mod) => ({
    ...mod,
    ...(savedModules.find((item) => item.key === mod.key) || {}),
  }))
  return settings
}

/** 保存前写入 _editorSettings 到 resume 对象 */
export function applyEditorSettingsToResume(resume, editorSettings) {
  resume._editorSettings = {
    spacing: { ...editorSettings.spacing },
    fontSize: editorSettings.fontSize,
    fontFamily: editorSettings.fontFamily,
    skin: editorSettings.skin,
    modules: (editorSettings.modules || DEFAULT_MODULES).map((m) => ({ ...m })),
  }
}
