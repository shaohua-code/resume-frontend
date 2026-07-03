/**
 * 管理后台 ECharts 色板 - 引用全局 theme.js
 */
import THEME from '@/constants/theme'

export const CHART_COLORS = {
  primary: THEME.chart.primary,
  secondary: THEME.chart.secondary,
  accent: THEME.chart.accent,
  success: THEME.chart.success,
  warning: THEME.chart.warning,
  danger: THEME.chart.danger,
}

export const CHART_GRADIENT = {
  start: THEME.chart.primary,
  end: THEME.chart.secondary,
}

export default CHART_COLORS
