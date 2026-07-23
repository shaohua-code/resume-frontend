/**
 * 系统界面主题配置 - 唯一设计令牌源
 * 这里只控制站点外壳、业务页面、组件库和图表；简历 A4 与模板皮肤继续使用独立 skin 变量。
 */

export const DEFAULT_SYSTEM_THEME_KEY = 'fresh-gradient'
export const SYSTEM_THEME_STORAGE_KEY = 'ai-resume-ui-theme-v2'

function hexToRgb(hex) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(
    normalized.length === 3
      ? normalized
          .split('')
          .map((item) => `${item}${item}`)
          .join('')
      : normalized,
    16,
  )
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function rgbChannels(hex) {
  return hexToRgb(hex).join(' ')
}

function rgba(hex, alpha) {
  const [red, green, blue] = hexToRgb(hex)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function createSystemTheme({
  key,
  name,
  description,
  palette,
  gradients,
  radius,
  shadows,
  glass,
  pageGridOpacity,
}) {
  return {
    key,
    name,
    description,
    swatch: palette.brand,
    colors: {
      brand: {
        DEFAULT: palette.brand,
        light: palette.brandLight,
        lighter: palette.brandLighter,
        dark: palette.brandDark,
      },
      accent: {
        DEFAULT: palette.accent,
        light: palette.accentLight,
        lighter: palette.accentLighter,
      },
      primary: palette.brand,
      success: palette.success,
      warning: palette.warning,
      danger: palette.danger,
      cream: palette.page,
      mint: palette.successSoft,
      surface: palette.card,
      'surface-soft': glass.background,
      canvas: palette.canvas,
      ink: {
        DEFAULT: palette.text,
        secondary: palette.textSecondary,
      },
      muted: palette.textMuted,
      line: palette.border,
      sidebar: palette.sidebar,
    },
    gradients,
    radius,
    shadows,
    glass,
    pageGridOpacity,
    interaction: {
      hover: palette.brandLighter,
      active: palette.brandDark,
      selected: palette.brandLighter,
      focusRing: rgba(palette.brand, 0.2),
      disabledBg: palette.canvas,
      disabledText: palette.textMuted,
      dangerHover: '#DC2626',
      dangerActive: '#B91C1C',
    },
    chart: {
      primary: palette.brand,
      secondary: palette.brandLight,
      accent: palette.accent,
      success: palette.success,
      warning: palette.warning,
      danger: palette.danger,
      primarySoft: rgba(palette.brand, 0.28),
      primaryFaint: rgba(palette.brand, 0.02),
    },
  }
}

export const SYSTEM_THEMES = Object.freeze({
  'fresh-gradient': createSystemTheme({
    key: 'fresh-gradient',
    name: '清新渐变',
    description: '青蓝紫渐变与通透玻璃质感',
    palette: {
      brand: '#00D4FF',
      brandLight: '#4FACFE',
      brandLighter: '#E0F7FA',
      brandDark: '#0891B2',
      accent: '#A855F7',
      accentLight: '#C084FC',
      accentLighter: '#F3E8FF',
      success: '#10B981',
      successSoft: '#D1FAE5',
      warning: '#F59E0B',
      danger: '#EF4444',
      page: '#F8FAFC',
      card: '#FFFFFF',
      canvas: '#F1F5F9',
      sidebar: '#FFFFFF',
      text: '#1E293B',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
    },
    gradients: {
      primary: 'linear-gradient(90deg, #00D4FF, #4FACFE, #A855F7)',
      hero: 'linear-gradient(135deg, #00D4FF 0%, #4FACFE 50%, #A855F7 100%)',
      glowBorder: 'linear-gradient(135deg, #00D4FF, #4FACFE, #A855F7)',
      pageBg:
        'radial-gradient(ellipse at 20% 0%, rgba(0, 212, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
    },
    radius: { card: '16px', banner: '20px', button: '10px', pill: '9999px' },
    shadows: {
      card: '0 2px 12px rgba(30, 41, 59, 0.06), 0 8px 24px rgba(30, 41, 59, 0.04)',
      cardHover:
        '0 8px 24px rgba(30, 41, 59, 0.08), 0 16px 40px rgba(30, 41, 59, 0.06)',
      lift: '0 16px 48px rgba(30, 41, 59, 0.1), 0 24px 64px rgba(30, 41, 59, 0.08)',
      glass: '0 8px 32px rgba(30, 41, 59, 0.08)',
      soft: '0 4px 20px rgba(0, 212, 255, 0.08)',
      float: '0 12px 32px rgba(0, 212, 255, 0.15)',
      glow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(168, 85, 247, 0.15)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.72)',
      border: 'rgba(255, 255, 255, 0.6)',
      blur: '22px',
      saturation: '1.35',
    },
    pageGridOpacity: '0.03',
  }),
  minimal: createSystemTheme({
    key: 'minimal',
    name: '简约风',
    description: '克制留白、轻圆角与极浅阴影',
    palette: {
      brand: '#334155',
      brandLight: '#64748B',
      brandLighter: '#F1F5F9',
      brandDark: '#0F172A',
      accent: '#0F766E',
      accentLight: '#14B8A6',
      accentLighter: '#E2E8F0',
      success: '#059669',
      successSoft: '#D1FAE5',
      warning: '#D97706',
      danger: '#DC2626',
      page: '#FAFAFA',
      card: '#FFFFFF',
      canvas: '#F5F5F5',
      sidebar: '#FFFFFF',
      text: '#262626',
      textSecondary: '#666666',
      textMuted: '#9A9A9A',
      border: '#E5E7EB',
    },
    gradients: {
      primary: 'linear-gradient(90deg, #334155, #475569)',
      hero: 'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
      glowBorder: 'linear-gradient(135deg, #CBD5E1, #64748B)',
      pageBg: 'linear-gradient(180deg, rgba(51, 65, 85, 0.025) 0%, transparent 42%)',
    },
    radius: { card: '12px', banner: '16px', button: '8px', pill: '9999px' },
    shadows: {
      card: '0 1px 3px rgba(15, 23, 42, 0.05)',
      cardHover: '0 8px 22px rgba(15, 23, 42, 0.08)',
      lift: '0 16px 36px rgba(15, 23, 42, 0.11)',
      glass: '0 6px 20px rgba(15, 23, 42, 0.06)',
      soft: '0 3px 12px rgba(15, 23, 42, 0.06)',
      float: '0 10px 24px rgba(15, 23, 42, 0.12)',
      glow: '0 0 0 3px rgba(51, 65, 85, 0.1)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.92)',
      border: 'rgba(226, 232, 240, 0.9)',
      blur: '10px',
      saturation: '1',
    },
    pageGridOpacity: '0',
  }),
  business: createSystemTheme({
    key: 'business',
    name: '商务风',
    description: '沉稳蓝调、清晰层级与利落边界',
    palette: {
      brand: '#1D4ED8',
      brandLight: '#3B82F6',
      brandLighter: '#DBEAFE',
      brandDark: '#1E3A8A',
      accent: '#0F766E',
      accentLight: '#2DD4BF',
      accentLighter: '#CCFBF1',
      success: '#047857',
      successSoft: '#D1FAE5',
      warning: '#B45309',
      danger: '#DC2626',
      page: '#F4F7FB',
      card: '#FFFFFF',
      canvas: '#EAF0F7',
      sidebar: '#F8FAFC',
      text: '#162235',
      textSecondary: '#52627A',
      textMuted: '#8492A6',
      border: '#CBD5E1',
    },
    gradients: {
      primary: 'linear-gradient(90deg, #1E3A8A, #1D4ED8, #3B82F6)',
      hero: 'linear-gradient(135deg, #172554 0%, #1D4ED8 58%, #0F766E 100%)',
      glowBorder: 'linear-gradient(135deg, #1D4ED8, #0F766E)',
      pageBg:
        'radial-gradient(circle at 88% 2%, rgba(29, 78, 216, 0.09), transparent 38%), linear-gradient(180deg, rgba(30, 58, 138, 0.035), transparent 52%)',
    },
    radius: { card: '10px', banner: '14px', button: '8px', pill: '9999px' },
    shadows: {
      card: '0 2px 8px rgba(22, 34, 53, 0.07), 0 8px 20px rgba(22, 34, 53, 0.04)',
      cardHover: '0 10px 28px rgba(22, 34, 53, 0.12)',
      lift: '0 18px 46px rgba(22, 34, 53, 0.16)',
      glass: '0 8px 26px rgba(22, 34, 53, 0.1)',
      soft: '0 4px 15px rgba(29, 78, 216, 0.11)',
      float: '0 12px 28px rgba(29, 78, 216, 0.2)',
      glow: '0 0 0 3px rgba(29, 78, 216, 0.15)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.88)',
      border: 'rgba(203, 213, 225, 0.82)',
      blur: '16px',
      saturation: '1.12',
    },
    pageGridOpacity: '0.025',
  }),
  'classic-monochrome': createSystemTheme({
    key: 'classic-monochrome',
    name: '经典黑白',
    description: '黑白高对比、直角秩序与纸面质感',
    palette: {
      brand: '#18181B',
      brandLight: '#52525B',
      brandLighter: '#E4E4E7',
      brandDark: '#09090B',
      accent: '#71717A',
      accentLight: '#A1A1AA',
      accentLighter: '#F4F4F5',
      success: '#166534',
      successSoft: '#DCFCE7',
      warning: '#A16207',
      danger: '#B91C1C',
      page: '#F7F7F7',
      card: '#FFFFFF',
      canvas: '#EEEEEE',
      sidebar: '#FAFAFA',
      text: '#111111',
      textSecondary: '#525252',
      textMuted: '#8A8A8A',
      border: '#D4D4D4',
    },
    gradients: {
      primary: 'linear-gradient(90deg, #09090B, #3F3F46)',
      hero: 'linear-gradient(135deg, #09090B 0%, #27272A 68%, #52525B 100%)',
      glowBorder: 'linear-gradient(135deg, #09090B, #A1A1AA)',
      pageBg:
        'linear-gradient(135deg, rgba(24, 24, 27, 0.025) 25%, transparent 25%, transparent 75%, rgba(24, 24, 27, 0.025) 75%)',
    },
    radius: { card: '6px', banner: '8px', button: '4px', pill: '9999px' },
    shadows: {
      card: '0 1px 0 rgba(0, 0, 0, 0.08)',
      cardHover: '0 8px 20px rgba(0, 0, 0, 0.1)',
      lift: '0 18px 42px rgba(0, 0, 0, 0.17)',
      glass: '0 6px 18px rgba(0, 0, 0, 0.08)',
      soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
      float: '0 10px 24px rgba(0, 0, 0, 0.16)',
      glow: '0 0 0 2px rgba(0, 0, 0, 0.14)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.96)',
      border: 'rgba(212, 212, 212, 0.94)',
      blur: '2px',
      saturation: '0',
    },
    pageGridOpacity: '0.018',
  }),
  'elegant-warm': createSystemTheme({
    key: 'elegant-warm',
    name: '雅致暖色',
    description: '陶土金棕、柔和层次与温润圆角',
    palette: {
      brand: '#A65F46',
      brandLight: '#C98267',
      brandLighter: '#F3E0D7',
      brandDark: '#7C3F2D',
      accent: '#B88746',
      accentLight: '#D4A866',
      accentLighter: '#F3E8D5',
      success: '#4D7C5B',
      successSoft: '#E2F0E5',
      warning: '#B7791F',
      danger: '#C2413B',
      page: '#FBF7F2',
      card: '#FFFDFC',
      canvas: '#F3EBE2',
      sidebar: '#FFF9F5',
      text: '#352A25',
      textSecondary: '#75635A',
      textMuted: '#A18D82',
      border: '#E7D8CC',
    },
    gradients: {
      primary: 'linear-gradient(90deg, #A65F46, #C98267, #B88746)',
      hero: 'linear-gradient(135deg, #7C3F2D 0%, #C98267 58%, #B88746 100%)',
      glowBorder: 'linear-gradient(135deg, #C98267, #D4A866)',
      pageBg:
        'radial-gradient(circle at 12% 4%, rgba(201, 130, 103, 0.12), transparent 42%), radial-gradient(circle at 90% 94%, rgba(184, 135, 70, 0.09), transparent 40%)',
    },
    radius: { card: '18px', banner: '22px', button: '12px', pill: '9999px' },
    shadows: {
      card: '0 3px 14px rgba(53, 42, 37, 0.07), 0 10px 26px rgba(166, 95, 70, 0.04)',
      cardHover: '0 12px 32px rgba(83, 54, 43, 0.12)',
      lift: '0 20px 52px rgba(83, 54, 43, 0.16)',
      glass: '0 10px 32px rgba(83, 54, 43, 0.09)',
      soft: '0 5px 18px rgba(166, 95, 70, 0.12)',
      float: '0 14px 34px rgba(166, 95, 70, 0.2)',
      glow: '0 0 22px rgba(201, 130, 103, 0.24), 0 0 36px rgba(184, 135, 70, 0.12)',
    },
    glass: {
      background: 'rgba(255, 253, 252, 0.82)',
      border: 'rgba(255, 255, 255, 0.7)',
      blur: '18px',
      saturation: '1.18',
    },
    pageGridOpacity: '0.022',
  }),
})

export const SYSTEM_THEME_OPTIONS = Object.freeze(
  Object.values(SYSTEM_THEMES).map((theme) => ({
    key: theme.key,
    name: theme.name,
    description: theme.description,
    swatch: theme.swatch,
    preview: {
      background: theme.colors.cream,
      surface: theme.colors.surface,
      border: theme.colors.line,
      gradient: theme.gradients.primary,
      radius: theme.radius.button,
      shadow: theme.shadows.soft,
    },
  })),
)

export function normalizeSystemThemeKey(themeKey) {
  return typeof themeKey === 'string' &&
    Object.prototype.hasOwnProperty.call(SYSTEM_THEMES, themeKey)
    ? themeKey
    : DEFAULT_SYSTEM_THEME_KEY
}

export function getSystemTheme(themeKey) {
  return SYSTEM_THEMES[normalizeSystemThemeKey(themeKey)]
}

/** Ant Design Vue 全局与组件级设计令牌映射。 */
export function createAntdToken(theme) {
  return {
    colorPrimary: theme.colors.brand.DEFAULT,
    colorPrimaryBg: theme.colors.brand.lighter,
    colorPrimaryBgHover: theme.interaction.hover,
    colorPrimaryBorder: theme.colors.brand.light,
    colorPrimaryBorderHover: theme.colors.brand.DEFAULT,
    colorPrimaryHover: theme.colors.brand.light,
    colorPrimaryActive: theme.colors.brand.dark,
    colorPrimaryText: theme.colors.brand.dark,
    colorLink: theme.colors.brand.dark,
    colorLinkHover: theme.colors.brand.light,
    colorLinkActive: theme.colors.brand.dark,
    colorSuccess: theme.colors.success,
    colorWarning: theme.colors.warning,
    colorError: theme.colors.danger,
    colorInfo: theme.colors.brand.light,
    colorBgBase: theme.colors.cream,
    colorBgContainer: theme.colors.surface,
    colorBgElevated: theme.colors.surface,
    colorBgLayout: theme.colors.cream,
    colorBgContainerDisabled: theme.interaction.disabledBg,
    colorBgTextHover: theme.interaction.hover,
    colorBgTextActive: theme.interaction.selected,
    colorText: theme.colors.ink.DEFAULT,
    colorTextSecondary: theme.colors.ink.secondary,
    colorTextTertiary: theme.colors.muted,
    colorTextDisabled: theme.interaction.disabledText,
    colorTextHeading: theme.colors.ink.DEFAULT,
    colorTextLabel: theme.colors.ink.secondary,
    colorTextDescription: theme.colors.ink.secondary,
    colorTextPlaceholder: theme.colors.muted,
    colorTextLightSolid: '#FFFFFF',
    colorBorder: theme.colors.line,
    colorBorderSecondary: theme.colors.line,
    colorSplit: theme.colors.line,
    colorIcon: theme.colors.muted,
    colorIconHover: theme.colors.brand.dark,
    colorHighlight: theme.colors.danger,
    colorFill: rgba(theme.colors.brand.DEFAULT, 0.12),
    colorFillSecondary: rgba(theme.colors.brand.DEFAULT, 0.08),
    colorFillTertiary: rgba(theme.colors.brand.DEFAULT, 0.05),
    colorFillQuaternary: rgba(theme.colors.brand.DEFAULT, 0.03),
    colorFillAlter: theme.colors.canvas,
    colorFillContent: theme.interaction.hover,
    colorFillContentHover: theme.interaction.selected,
    colorBgMask: rgba(theme.colors.ink.DEFAULT, 0.46),
    controlItemBgHover: theme.interaction.hover,
    controlItemBgActive: theme.interaction.selected,
    controlItemBgActiveHover: theme.interaction.selected,
    controlOutline: theme.interaction.focusRing,
    borderRadius: Number.parseInt(theme.radius.button, 10),
    borderRadiusSM: Math.max(2, Number.parseInt(theme.radius.button, 10) - 2),
    borderRadiusLG: Number.parseInt(theme.radius.card, 10),
    borderRadiusXS: Math.max(2, Number.parseInt(theme.radius.button, 10) - 4),
    boxShadow: theme.shadows.card,
    boxShadowSecondary: theme.shadows.lift,
    controlHeight: 40,
    opacityLoading: 0.68,
    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  }
}

export function createAntdTheme(theme) {
  const token = createAntdToken(theme)
  return {
    token,
    // 4.2.6 仅 Menu 暴露这些组件级令牌；其余组件状态统一由上方 AliasToken 驱动。
    components: {
      Menu: {
        radiusItem: Number.parseInt(theme.radius.button, 10),
        colorGroupTitle: theme.colors.muted,
        colorItemText: theme.colors.ink.secondary,
        colorItemTextHover: theme.colors.brand.dark,
        colorItemTextHoverHorizontal: theme.colors.brand.dark,
        colorItemTextSelected: theme.colors.brand.dark,
        colorItemTextSelectedHorizontal: theme.colors.brand.dark,
        colorItemTextDisabled: theme.interaction.disabledText,
        colorItemBg: theme.colors.surface,
        colorSubItemBg: theme.colors.canvas,
        colorItemBgHover: theme.interaction.hover,
        colorItemBgActive: theme.interaction.selected,
        colorItemBgSelected: theme.interaction.selected,
        colorItemBgSelectedHorizontal: theme.interaction.selected,
        colorDangerItemText: theme.colors.danger,
        colorDangerItemTextHover: theme.interaction.dangerHover,
        colorDangerItemTextSelected: theme.interaction.dangerActive,
        colorDangerItemBgActive: rgba(theme.colors.danger, 0.1),
        colorDangerItemBgSelected: rgba(theme.colors.danger, 0.12),
      },
    },
  }
}

/**
 * CSS 变量由主题对象实时派生；同时输出 RGB 通道，供 Tailwind 的透明度修饰符使用。
 */
export function createCssVariables(theme) {
  const flatColors = {
    brand: theme.colors.brand.DEFAULT,
    'brand-light': theme.colors.brand.light,
    'brand-lighter': theme.colors.brand.lighter,
    'brand-dark': theme.colors.brand.dark,
    accent: theme.colors.accent.DEFAULT,
    'accent-light': theme.colors.accent.light,
    'accent-lighter': theme.colors.accent.lighter,
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    'danger-hover': theme.interaction.dangerHover,
    'danger-active': theme.interaction.dangerActive,
    cream: theme.colors.cream,
    mint: theme.colors.mint,
    surface: theme.colors.surface,
    canvas: theme.colors.canvas,
    ink: theme.colors.ink.DEFAULT,
    'ink-secondary': theme.colors.ink.secondary,
    muted: theme.colors.muted,
    line: theme.colors.line,
    sidebar: theme.colors.sidebar,
  }
  const variables = {
    '--color-surface-soft': theme.colors['surface-soft'],
    '--color-focus-ring': theme.interaction.focusRing,
    '--color-disabled-bg': theme.interaction.disabledBg,
    '--color-disabled-text': theme.interaction.disabledText,
    '--gradient-primary': theme.gradients.primary,
    '--gradient-hero': theme.gradients.hero,
    '--gradient-glow-border': theme.gradients.glowBorder,
    '--gradient-page-bg': theme.gradients.pageBg,
    '--shadow-card': theme.shadows.card,
    '--shadow-card-hover': theme.shadows.cardHover,
    '--shadow-lift': theme.shadows.lift,
    '--shadow-glass': theme.shadows.glass,
    '--shadow-soft': theme.shadows.soft,
    '--shadow-float': theme.shadows.float,
    '--shadow-glow': theme.shadows.glow,
    '--radius-card': theme.radius.card,
    '--radius-banner': theme.radius.banner,
    '--radius-button': theme.radius.button,
    '--radius-pill': theme.radius.pill,
    '--glass-background': theme.glass.background,
    '--glass-border': theme.glass.border,
    '--glass-blur': theme.glass.blur,
    '--glass-saturation': theme.glass.saturation,
    '--page-grid-opacity': theme.pageGridOpacity,
  }

  Object.entries(flatColors).forEach(([name, value]) => {
    variables[`--color-${name}`] = value
    variables[`--color-${name}-rgb`] = rgbChannels(value)
  })

  return variables
}

/** 旧代码的默认主题导出保持兼容；新代码请通过 useTheme 获取响应式主题。 */
export const THEME = SYSTEM_THEMES[DEFAULT_SYSTEM_THEME_KEY]
export const antdToken = createAntdToken(THEME)
export const cssVariables = createCssVariables(THEME)

export default THEME
