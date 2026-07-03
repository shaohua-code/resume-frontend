/**
 * 主题 composable - 供组件读取渐变、图表色等 token
 */
import { computed } from 'vue'
import THEME, { cssVariables } from '@/constants/theme'

export function useTheme() {
  const colors = computed(() => THEME.colors)
  const gradients = computed(() => THEME.gradients)
  const shadows = computed(() => THEME.shadows)
  const chartColors = computed(() => THEME.chart)

  /** 渐变主按钮内联样式 */
  const gradientBtnStyle = computed(() => ({
    background: THEME.gradients.primary,
    boxShadow: THEME.shadows.glow,
  }))

  /** 注入 CSS 变量到指定元素 */
  function applyCssVariables(el = document.documentElement) {
    Object.entries(cssVariables).forEach(([key, value]) => {
      el.style.setProperty(key, value)
    })
  }

  return {
    colors,
    gradients,
    shadows,
    chartColors,
    gradientBtnStyle,
    applyCssVariables,
    THEME,
  }
}
