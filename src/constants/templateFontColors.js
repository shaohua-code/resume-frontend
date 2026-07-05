/**
 * 20 套模板字体颜色独立默认预设
 * - label / basicValue / name / content 对应编辑器四项颜色
 * - 用户未自定义（null）时由 CSS fallback 与本表 picker 展示值共同决定
 */
import { clampTemplateId } from '@/constants/templateRegistry'

/** 全局 content 兜底（resolveFontColorDisplay 用） */
const FALLBACK_CONTENT_COLOR = '#000000'
/** 单套模板字体色预设 */
export const TEMPLATE_FONT_COLOR_PRESETS = {
  1: { label: '#0c418c', basicValue: '#000000', name: '#000000', content: '#000000' },
  2: { label: '#fe0000', basicValue: '#fe0000', name: '#fe0000', content: '#fe0000' },
  3: { label: '#6b7280', basicValue: '#000000', name: '#111827', content: '#374151' },
  4: { label: '#ffffff', basicValue: '#000000', name: '#ffffff', content: '#ffffff' },
  5: { label: '#ffffff', basicValue: '#000000', name: '#ffffff', content: '#ffffff' },
  6: { label: '#6b7280', basicValue: '#000000', name: '#000000', content: '#000000' },
  7: { label: '#374151', basicValue: '#000000', name: '#000000', content: '#1f2937' },
  8: { label: '#6b7280', basicValue: '#000000', name: '#111827', content: '#374151' },
  9: { label: '#6b7280', basicValue: '#000000', name: '#000000', content: '#374151' },
  10: { label: '#64748b', basicValue: '#1e293b', name: '#0f172a', content: '#334155' },
  11: { label: '#78716c', basicValue: '#000000', name: '#1c1917', content: '#44403c' },
  12: { label: '#6b7280', basicValue: '#000000', name: '#111827', content: '#1f2937' },
  13: { label: '#92400e', basicValue: '#000000', name: '#78350f', content: '#374151' },
  14: { label: '#ffffff', basicValue: '#000000', name: '#e2e8f0', content: '#e2e8f0' },
  15: { label: '#6b7280', basicValue: '#000000', name: '#111827', content: '#374151' },
  16: { label: '#6b7280', basicValue: '#000000', name: '#000000', content: '#374151' },
  17: { label: '#6b7280', basicValue: '#000000', name: '#000000', content: '#374151' },
  18: { label: '#374151', basicValue: '#000000', name: '#000000', content: '#1f2937' },
  19: { label: '#6b7280', basicValue: '#000000', name: '#000000', content: '#374151' },
  20: { label: '#6b7280', basicValue: '#000000', name: '#000000', content: '#374151' },
}

/** 获取指定模板的字体色默认值（供颜色选择器展示） */
export function getTemplateFontColorDefaults(templateId) {
  const id = clampTemplateId(templateId)
  const preset = TEMPLATE_FONT_COLOR_PRESETS[id] || TEMPLATE_FONT_COLOR_PRESETS[1]
  return {
    labelColor: preset.label,
    basicContentColor: preset.basicValue,
    nameColor: preset.name,
    contentColor: preset.content,
  }
}

/**
 * 切换模板 / 重置字体色：四项全部置 null，运行时由 templateFontColors 预设注入 CSS 变量
 */
export function applyTemplateFontColorDefaults(fontColorRefs, templateId) {
  fontColorRefs.labelColor.value = null
  fontColorRefs.basicContentColor.value = null
  fontColorRefs.nameColor.value = null
  fontColorRefs.contentColor.value = null
}

/** 字体面板「重置」：恢复当前模板默认四项颜色 */
export function resetTemplateFontColors(fontColorRefs, templateId) {
  applyTemplateFontColorDefaults(fontColorRefs, templateId)
}
/** 颜色选择器展示：用户值为 null 时用模板默认，否则用全局兜底 */
export function resolveFontColorDisplay(key, value, templateId) {
  if (value) return value
  const defaults = getTemplateFontColorDefaults(templateId)
  const map = {
    labelColor: defaults.labelColor,
    basicContentColor: defaults.basicContentColor,
    nameColor: defaults.nameColor,
    contentColor: defaults.contentColor,
  }
  return map[key] || FALLBACK_CONTENT_COLOR
}
