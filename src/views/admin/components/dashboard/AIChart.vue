<script setup>
/**
 * AI 调用趋势图：跟随所选范围切换小时、日期或月份粒度。
 */
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import { useChartTheme } from '../../utils/chartTheme.js'
import EmptyState from './EmptyState.vue'
import SkeletonCard from './SkeletonCard.vue'

const props = defineProps({
  labels: {
    type: Array,
    default: () => [],
  },
  range: { type: String, default: '年度' },
  aiTrend: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { chartColors, chartUi } = useChartTheme()
// 当前区间没有调用量时呈现直白的空数据说明，不以空坐标轴代替信息。
const hasData = computed(() => props.aiTrend.some((value) => Number(value) > 0))

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['AI 调用'], right: 0, top: 0, icon: 'roundRect' },
  grid: { left: 8, right: 12, bottom: 8, top: 36, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.labels,
    axisLine: { lineStyle: { color: chartUi.value.axis } },
    axisLabel: { color: chartUi.value.label, hideOverlap: true, rotate: props.range === '30日' ? 35 : 0 },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: chartUi.value.splitLine } },
    axisLabel: { color: chartUi.value.label },
  },
  series: [
    {
      name: 'AI 调用（次）',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.aiTrend,
      itemStyle: { color: chartColors.value.primary },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: chartColors.value.primarySoft },
            { offset: 1, color: chartColors.value.primaryFaint },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <div class="card-base">
    <div class="flex items-center justify-between mb-2">
      <div>
        <h3 class="text-base font-semibold text-ink">AI 使用趋势</h3>
        <p class="mt-1 text-xs text-muted">按 {{ props.range === '近12个月' ? '月份' : props.range === '今日' || props.range === '昨日' ? '小时' : '日期' }}统计 · 单位：次</p>
      </div>
    </div>
    <SkeletonCard v-if="loading && !hasData" height="300px" />
    <BaseChart v-else-if="hasData" :option="option" :loading="loading" height="300px" />
    <EmptyState v-else text="所选时间范围内暂无 AI 调用记录" />
  </div>
</template>
