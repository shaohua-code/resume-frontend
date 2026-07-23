import plugin from 'tailwindcss/plugin.js'
import { THEME, createCssVariables } from './src/constants/theme.js'

/** 通过 RGB 通道变量保留 Tailwind 的 /10、/60 等透明度修饰能力。 */
const themeColor = (name) => `rgb(var(--color-${name}-rgb) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: themeColor('brand'),
          light: themeColor('brand-light'),
          lighter: themeColor('brand-lighter'),
          dark: themeColor('brand-dark'),
        },
        accent: {
          DEFAULT: themeColor('accent'),
          light: themeColor('accent-light'),
          lighter: themeColor('accent-lighter'),
        },
        primary: themeColor('primary'),
        success: themeColor('success'),
        warning: themeColor('warning'),
        danger: themeColor('danger'),
        cream: themeColor('cream'),
        mint: themeColor('mint'),
        surface: themeColor('surface'),
        'surface-soft': 'var(--color-surface-soft)',
        canvas: themeColor('canvas'),
        ink: {
          DEFAULT: themeColor('ink'),
          secondary: themeColor('ink-secondary'),
        },
        muted: themeColor('muted'),
        line: themeColor('line'),
        sidebar: themeColor('sidebar'),
      },
      borderRadius: {
        card: 'var(--radius-card)',
        banner: 'var(--radius-banner)',
        button: 'var(--radius-button)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        lift: 'var(--shadow-lift)',
        glass: 'var(--shadow-glass)',
        soft: 'var(--shadow-soft)',
        float: 'var(--shadow-float)',
        glow: 'var(--shadow-glow)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'soft-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'fade-scale-in': 'fade-scale-in 0.25s ease-out',
        float: 'float 3s ease-in-out infinite',
        'soft-float': 'soft-float 2.5s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      // 默认变量同样来自 theme.js，确保首屏无需等待 Vue 挂载且不存在第二份主题色表。
      addBase({
        ':root': createCssVariables(THEME),
      })
    }),
  ],
}
