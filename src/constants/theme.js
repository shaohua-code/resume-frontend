/**
 * 全局主题配置 - 唯一配色源
 * 修改此文件即可同步 Tailwind / CSS 变量 / Ant Design Vue token
 */

export const THEME = {
  colors: {
    brand: {
      DEFAULT: '#00D4FF',
      light: '#4FACFE',
      lighter: '#E0F7FA',
      dark: '#0891B2',
    },
    accent: {
      DEFAULT: '#A855F7',
      light: '#C084FC',
      lighter: '#F3E8FF',
    },
    primary: '#00D4FF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    cream: '#F8FAFC',
    mint: '#D1FAE5',
    surface: '#FFFFFF',
    'surface-soft': 'rgba(255, 255, 255, 0.72)',
    canvas: '#F1F5F9',
    ink: {
      DEFAULT: '#1E293B',
      secondary: '#64748B',
    },
    muted: '#94A3B8',
    line: '#E2E8F0',
    sidebar: '#FFFFFF',
  },
  gradients: {
    primary: 'linear-gradient(90deg, #00D4FF, #4FACFE, #A855F7)',
    hero: 'linear-gradient(135deg, #00D4FF 0%, #4FACFE 50%, #A855F7 100%)',
    glowBorder: 'linear-gradient(135deg, #00D4FF, #4FACFE, #A855F7)',
    pageBg: 'radial-gradient(ellipse at 20% 0%, rgba(0, 212, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
  },
  shadows: {
    card: '0 2px 12px rgba(30, 41, 59, 0.06), 0 8px 24px rgba(30, 41, 59, 0.04)',
    cardHover: '0 8px 24px rgba(30, 41, 59, 0.08), 0 16px 40px rgba(30, 41, 59, 0.06)',
    lift: '0 16px 48px rgba(30, 41, 59, 0.1), 0 24px 64px rgba(30, 41, 59, 0.08)',
    glass: '0 8px 32px rgba(30, 41, 59, 0.08)',
    soft: '0 4px 20px rgba(0, 212, 255, 0.08)',
    float: '0 12px 32px rgba(0, 212, 255, 0.15)',
    glow: '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(168, 85, 247, 0.15)',
  },
  radius: {
    card: '16px',
    banner: '20px',
    button: '10px',
    pill: '9999px',
  },
  chart: {
    primary: '#00D4FF',
    secondary: '#4FACFE',
    accent: '#A855F7',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
}

/** Ant Design Vue ConfigProvider token 映射 */
export const antdToken = {
  colorPrimary: THEME.colors.brand.DEFAULT,
  colorSuccess: THEME.colors.success,
  colorWarning: THEME.colors.warning,
  colorError: THEME.colors.danger,
  colorInfo: THEME.colors.brand.light,
  colorBgContainer: THEME.colors.surface,
  colorBgLayout: THEME.colors.cream,
  colorText: THEME.colors.ink.DEFAULT,
  colorTextSecondary: THEME.colors.ink.secondary,
  colorBorder: THEME.colors.line,
  borderRadius: 10,
  borderRadiusLG: 16,
  fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
}

/** CSS 变量对象，供 global.css 或运行时注入 */
export const cssVariables = {
  '--color-brand': THEME.colors.brand.DEFAULT,
  '--color-brand-light': THEME.colors.brand.light,
  '--color-brand-lighter': THEME.colors.brand.lighter,
  '--color-brand-dark': THEME.colors.brand.dark,
  '--color-accent': THEME.colors.accent.DEFAULT,
  '--color-accent-light': THEME.colors.accent.light,
  '--color-cream': THEME.colors.cream,
  '--color-surface': THEME.colors.surface,
  '--color-surface-soft': THEME.colors['surface-soft'],
  '--color-ink': THEME.colors.ink.DEFAULT,
  '--color-ink-secondary': THEME.colors.ink.secondary,
  '--color-muted': THEME.colors.muted,
  '--color-line': THEME.colors.line,
  '--gradient-primary': THEME.gradients.primary,
  '--gradient-hero': THEME.gradients.hero,
  '--gradient-glow-border': THEME.gradients.glowBorder,
  '--shadow-card': THEME.shadows.card,
  '--shadow-glow': THEME.shadows.glow,
  '--radius-card': THEME.radius.card,
  '--radius-button': THEME.radius.button,
}

export default THEME
