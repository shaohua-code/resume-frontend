/**
 * 皮肤色板配置（单点维护）
 * - value: 业务标识，传给 ResumePreview 的 skin prop
 * - color: 颜色色值，UI 用于皮肤色板展示
 * 同步使用方：
 *   - src/views/Editor.vue （皮肤切换面板）
 *   - src/views/editor/components/ResumePreview.vue （应用 --skin-color 变量）
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

// key -> color 映射，方便按名称快速查找
export const SKIN_COLOR_MAP = SKIN_COLORS.reduce((acc, s) => {
  acc[s.value] = s.color
  return acc
}, {})

export const DEFAULT_SKIN = 'blue'
