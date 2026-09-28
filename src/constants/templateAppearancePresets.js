import { getTemplateFontColorDefaults } from '@/constants/templateFontColors'

// 每个推荐色板只替换分隔、技能和强调色，保留模板本身的深浅底色以维持对比度。
export const APPEARANCE_PALETTES = [
  { key: 'blue', label: '海蓝', color: '#2563eb', pale: '#eff6ff', border: '#93c5fd', divider: '#dbeafe' },
  { key: 'green', label: '松绿', color: '#15803d', pale: '#f0fdf4', border: '#86efac', divider: '#dcfce7' },
  { key: 'purple', label: '紫罗兰', color: '#7c3aed', pale: '#f5f3ff', border: '#c4b5fd', divider: '#ede9fe' },
  { key: 'orange', label: '暖橙', color: '#c2410c', pale: '#fff7ed', border: '#fdba74', divider: '#ffedd5' },
  { key: 'red', label: '石榴红', color: '#b91c1c', pale: '#fef2f2', border: '#fca5a5', divider: '#fee2e2' },
  { key: 'dark', label: '石墨灰', color: '#374151', pale: '#f3f4f6', border: '#9ca3af', divider: '#e5e7eb' },
  { key: 'pink', label: '莓果粉', color: '#be185d', pale: '#fdf2f8', border: '#f9a8d4', divider: '#fce7f3' },
  { key: 'cyan', label: '清透青', color: '#0e7490', pale: '#ecfeff', border: '#67e8f9', divider: '#cffafe' },
]

// 推荐配色保留每套模板的底色与文字色，只覆盖分隔、技能和强调色，避免破坏标题对比度。
export function buildTemplateAppearancePalette(templateId, paletteKey) {
  const palette = APPEARANCE_PALETTES.find((item) => item.key === paletteKey)
  if (!palette) return null

  const font = getTemplateFontColorDefaults(templateId)
  return {
    labelColor: font.labelColor,
    basicContentColor: font.basicContentColor,
    nameColor: font.nameColor,
    contentColor: font.contentColor,
    skinTheme: {
      preset: 'custom',
      palette: palette.key,
      dividerColor: palette.divider,
      itemBorder: palette.border,
      basicRowBorder: palette.border,
      skillBg: palette.pale,
      skillBorder: palette.border,
      topBandBg: palette.color,
    },
  }
}
