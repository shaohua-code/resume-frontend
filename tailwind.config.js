/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      // 设计 token：统一管理品牌色，避免在组件里写死十六进制
      colors: {
        primary: '#2563EB',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        canvas: '#F8FAFC',
        ink: '#1E293B',
        muted: '#64748B',
        line: '#E2E8F0',
        sidebar: '#0F172A',
      },
      borderRadius: {
        card: '18px',
        banner: '20px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 23, 42, 0.06)',
        lift: '0 12px 32px rgba(37, 99, 235, 0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
