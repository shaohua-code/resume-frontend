/**
 * 20 套模板字体颜色独立默认预设
 * - label / basicValue / name / content 对应编辑器四项颜色
 * - 用户未自定义（null）时由 CSS fallback 与本表 picker 展示值共同决定
 */
import { clampTemplateId } from '@/constants/templateRegistry'

/** 全局 content 兜底（resolveFontColorDisplay 用） */
const FALLBACK_CONTENT_COLOR = '#000000'
/** 单套模板字体色预设 */
/** 单套模板字体色预设（优化版） */
export const TEMPLATE_FONT_COLOR_PRESETS = {
  // 1. 全职业通用：蓝顶栏 + 经典深灰文字，层次分明
  1: { label: '#0c418c', basicValue: '#1f2937', name: '#111827', content: '#374151' },

  // 2. 简约商务（左红条）：降低红色的刺眼感，正文采用高级深灰
  2: { label: '#FFFFFF', basicValue: '#ffffff', name: '#FFFFFF', content: '#374151' },

  // 3. 应届校招（蓝色标题线+居中）：使用正式稳妥的深蓝/墨黑搭配
  3: { label: '#1d4ed8', basicValue: '#1f2937', name: '#1e3a8a', content: '#374151' },

  // 4. 左右分栏：若左侧有深色背景，姓名/基本信息用白色或浅灰，右侧正文保持深灰
  4: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#000000' },

  // 5. 顶部色带（全宽蓝Header）：Header内文字（姓名）用纯白，下方正文用深灰
  5: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#374151' },

  // 6. 表格信息：强调严谨性，使用标准的石墨黑与深灰
  6: { label: '#4b5563', basicValue: '#1f2937', name: '#111827', content: '#374151' },

  // 7. 经典黑白（打印优先）：极简高对比度，适合HR直接打印
  7: { label: '#000000', basicValue: '#000000', name: '#000000', content: '#111827' },

  // 8. 现代扁平：左侧深色边栏用白字，右侧正文用深灰
  8: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#334155' },

  // 9 - 20. 其他通用/极简模板演变（引入合理的冷暖色调过渡，拒绝纯白纯红文本）
  9: { label: '#4f46e5', basicValue: '#1f2937', name: '#312e81', content: '#374151' },
  10: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#334155' },
  11: { label: '#78716c', basicValue: '#292524', name: '#1c1917', content: '#44403c' },
  12: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#1f2937' },
  13: { label: '#b45309', basicValue: '#1f2937', name: '#78350f', content: '#374151' },
  14: { label: '#1677ff', basicValue: '#1f2937', name: '#ffffff', content: '#374151' },
  15: { label: '#2563eb', basicValue: '#1f2937', name: '#111827', content: '#374151' },
  16: { label: '#1677ff', basicValue: '#1f2937', name: '#14532d', content: '#374151' },
  17: { label: '#57534e', basicValue: '#1f2937', name: '#1c1917', content: '#374151' },
  18: { label: '#374151', basicValue: '#1f2937', name: '#111827', content: '#1f2937' },
  19: { label: '#000000', basicValue: '#1f2937', name: '#000000', content: '#374151' },
  20: { label: '#7c3aed', basicValue: '#1f2937', name: '#4c1d95', content: '#374151' },
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
