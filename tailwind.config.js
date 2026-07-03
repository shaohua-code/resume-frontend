import { THEME } from './src/constants/theme.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        brand: THEME.colors.brand,
        accent: THEME.colors.accent,
        primary: THEME.colors.primary,
        success: THEME.colors.success,
        warning: THEME.colors.warning,
        danger: THEME.colors.danger,
        cream: THEME.colors.cream,
        mint: THEME.colors.mint,
        surface: THEME.colors.surface,
        'surface-soft': THEME.colors['surface-soft'],
        canvas: THEME.colors.canvas,
        ink: THEME.colors.ink,
        muted: THEME.colors.muted,
        line: THEME.colors.line,
        sidebar: THEME.colors.sidebar,
      },
      borderRadius: {
        card: THEME.radius.card,
        banner: THEME.radius.banner,
        button: THEME.radius.button,
        pill: THEME.radius.pill,
      },
      boxShadow: {
        card: THEME.shadows.card,
        'card-hover': THEME.shadows.cardHover,
        lift: THEME.shadows.lift,
        glass: THEME.shadows.glass,
        soft: THEME.shadows.soft,
        float: THEME.shadows.float,
        glow: THEME.shadows.glow,
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
  plugins: [],
}
