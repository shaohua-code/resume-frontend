/**
 * 50 套模板字体颜色独立默认预设
 * - label / basicValue / name / content 对应编辑器四项颜色
 * - 用户未自定义（null）时由 CSS fallback 与本表 picker 展示值共同决定
 */
import { clampTemplateId } from '@/constants/templateRegistry'

/** 全局 content 兜底（resolveFontColorDisplay 用） */
const FALLBACK_CONTENT_COLOR = '#000000'
/** 单套模板字体色预设 */
/** 单套模板字体色预设（优化版） */
export const TEMPLATE_FONT_COLOR_PRESETS = {
  // 1. 全职业通用：朱砂标签、白色联系信息与深靛正文
  1: { label: '#ffb199', basicValue: '#ffffff', name: '#17224b', content: '#33394a' },

  // 2. 简约商务：雾蓝标签、白色头部信息与蓝灰正文
  2: { label: '#bcd9e8', basicValue: '#ffffff', name: '#ffffff', content: '#344454' },

  // 3. 新锐校招：酸橙标签、白色头部与深紫正文
  3: { label: '#c7f35b', basicValue: '#ffffff', name: '#ffffff', content: '#3b3450' },

  // 4. 左右分栏：若左侧有深色背景，姓名/基本信息用白色或浅灰，右侧正文保持深灰
  4: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#1f2937' },

  // 5. 品牌色带：香槟金标签、白色头部信息与深蓝灰正文
  5: { label: '#f2d58a', basicValue: '#ffffff', name: '#ffffff', content: '#2d4050' },

  // 6. 表格信息：强调严谨性，使用标准的石墨黑与深灰
  6: { label: '#8a621b', basicValue: '#24303c', name: '#1e293b', content: '#3b4652' },

  // 7. 墨印排版：黑墨正文与钴蓝标签
  7: { label: '#2f57d9', basicValue: '#171717', name: '#171717', content: '#242424' },

  // 8. 现代扁平：左侧深色边栏用白字，右侧正文用深灰
  8: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#334155' },

  // 9 - 20. 其他通用/极简模板演变（引入合理的冷暖色调过渡，拒绝纯白纯红文本）
  9: { label: '#6d2735', basicValue: '#292524', name: '#3f1d26', content: '#413b38' },
  10: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#334155' },
  11: { label: '#f0c86e', basicValue: '#f8fafc', name: '#ffffff', content: '#304257' },
  12: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#1f2937' },
  13: { label: '#9a4e43', basicValue: '#332942', name: '#4a2e6d', content: '#3e3a48' },
  14: { label: '#7de8df', basicValue: '#eefafa', name: '#ffffff', content: '#263a48' },
  15: { label: '#d94b50', basicValue: '#253b4e', name: '#17324d', content: '#354653' },
  16: { label: '#1677ff', basicValue: '#1f2937', name: '#14532d', content: '#374151' },
  17: { label: '#3f766e', basicValue: '#213b37', name: '#183d38', content: '#334e49' },
  18: { label: '#5b7fb5', basicValue: '#27364a', name: '#15243a', content: '#384454' },
  19: { label: '#f3d4ca', basicValue: '#ffffff', name: '#3b2445', content: '#453c49' },
  20: { label: '#8a6b35', basicValue: '#27333d', name: '#1f2933', content: '#35424b' },
  21: { label: '#171717', basicValue: '#171717', name: '#171717', content: '#242424' },
  22: { label: '#a55347', basicValue: '#314b40', name: '#245544', content: '#3f4d46' },
  23: { label: '#7ee9e5', basicValue: '#ffffff', name: '#ffffff', content: '#33405a' },
  24: { label: '#f4c45c', basicValue: '#ffffff', name: '#ffffff', content: '#343c55' },
  25: { label: '#e65057', basicValue: '#3d3656', name: '#302947', content: '#403a4d' },
  // 26. 晨光校刊：学院蓝文字搭配暖橙标签，保持打印阅读清晰。
  26: { label: '#b85f2e', basicValue: '#29465a', name: '#173f5f', content: '#344754' },
  // 27. 起跑计划：青绿标签与深海蓝正文，传达清爽的成长感。
  27: { label: '#0f7f78', basicValue: '#24444d', name: '#ffffff', content: '#304751' },
  // 28–47. 新增模板分别使用与其版式匹配的四类字体色，且保留用户覆盖能力。
  28: { label: '#c62828', basicValue: '#263238', name: '#111827', content: '#303846' },
  29: { label: '#9c7a3c', basicValue: '#2b2925', name: '#171717', content: '#2f2f2f' },
  30: { label: '#047c8f', basicValue: '#254b55', name: '#0e5b6b', content: '#304b55' },
  31: { label: '#b6536f', basicValue: '#5d3c48', name: '#784154', content: '#59454b' },
  32: { label: '#7dd3fc', basicValue: '#f0f9ff', name: '#ffffff', content: '#12354a' },
  33: { label: '#a34e37', basicValue: '#5b4237', name: '#6d3527', content: '#4c403a' },
  34: { label: '#7dd3fc', basicValue: '#ffffff', name: '#ffffff', content: '#293d4b' },
  35: { label: '#697c78', basicValue: '#34434c', name: '#22313b', content: '#3c474d' },
  36: { label: '#4dffc3', basicValue: '#dbfff3', name: '#79ffd4', content: '#d1eee6' },
  37: { label: '#a4473d', basicValue: '#4c3c32', name: '#5b2a28', content: '#403832' },
  38: { label: '#e05a7a', basicValue: '#463750', name: '#4b2a60', content: '#41394b' },
  39: { label: '#5e70aa', basicValue: '#39445c', name: '#405083', content: '#374052' },
  40: { label: '#8a5b24', basicValue: '#4b4032', name: '#4e3926', content: '#494139' },
  41: { label: '#5379ac', basicValue: '#364b5c', name: '#494797', content: '#344859' },
  42: { label: '#111111', basicValue: '#111111', name: '#111111', content: '#1c1c1c' },
  43: { label: '#b6904b', basicValue: '#33475a', name: '#173f5f', content: '#344452' },
  44: { label: '#d76f19', basicValue: '#405d55', name: '#a8501e', content: '#3e4b47' },
  45: { label: '#ffffff', basicValue: '#ffffff', name: '#ffffff', content: '#171717' },
  46: { label: '#75e8ff', basicValue: '#e4fbff', name: '#ffffff', content: '#dce9ff' },
  47: { label: '#8b6f47', basicValue: '#51483c', name: '#5c4630', content: '#49443c' },
  // 48–50. 校招成长档案、实践冲刺与新星作品集使用各自独立的文字层级。
  48: { label: '#9a6b16', basicValue: '#3e514a', name: '#275d4d', content: '#384740' },
  49: { label: '#76e0d2', basicValue: '#ffffff', name: '#ffffff', content: '#304154' },
  50: { label: '#5a44b5', basicValue: '#302b46', name: '#392a78', content: '#3d3850' },
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
