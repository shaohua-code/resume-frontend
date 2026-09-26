<script setup>
/**
 * 用户增长趋势图
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
  userTrend: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { chartColors, chartUi } = useChartTheme()
// 当前区间没有新用户时以空态说明，避免空坐标轴造成加载异常的错觉。
const hasData = computed(() => props.userTrend.some((value) => Number(value) > 0))

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['新增用户'], right: 0, top: 0, icon: 'roundRect' },
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
      name: '新增用户（人）',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.userTrend,
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
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-ink">新增用户趋势</h3>
        <p class="mt-1 text-xs text-muted">按 {{ props.range === '近12个月' ? '月份' : props.range === '今日' || props.range === '昨日' ? '小时' : '日期' }}统计 · 单位：人</p>
      </div>
    </div>
    <SkeletonCard v-if="loading && !hasData" height="300px" />
    <BaseChart v-else-if="hasData" :option="option" :loading="loading" height="300px" />
    <EmptyState v-else text="所选时间范围内暂无新增用户" />
  </div>
</template>
