/**
 * 管理后台 ECharts 响应式色板
 * 图表从系统主题状态派生，切换主题时 option 会自动重新计算。
 */
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

export function useChartTheme() {
  const { chartColors, colors } = useTheme()
  const chartGradient = computed(() => ({
    start: chartColors.value.primary,
    end: chartColors.value.secondary,
  }))
  const chartUi = computed(() => ({
    axis: colors.value.line,
    splitLine: colors.value.canvas,
    label: colors.value.muted,
    text: colors.value.ink.DEFAULT,
  }))

  return {
    chartColors,
    chartGradient,
    chartUi,
  }
}

export default useChartTheme
