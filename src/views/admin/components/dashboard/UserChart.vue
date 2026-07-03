<script setup>
/**
 * 用户增长趋势图
 * 面积折线，展示近 12 个月新增用户与付费用户两条曲线，主色蓝紫渐变。
 */
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import CHART_COLORS from '../../utils/chartTheme.js'

const props = defineProps({
  months: {
    type: Array,
    default: () => [],
  },
  userTrend: {
    type: Array,
    default: () => [],
  },
  vipTrend: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// 把 YYYY-MM 转成更友好的 M月
const axisLabels = computed(() => props.months.map((item) => `${Number(item.split('-')[1])}月`))

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['新增用户', '付费用户'], right: 0, top: 0, icon: 'roundRect' },
  grid: { left: 8, right: 12, bottom: 8, top: 36, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: axisLabels.value,
    axisLine: { lineStyle: { color: '#E8ECEF' } },
    axisLabel: { color: '#9CA3AF' },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#F7F9FA' } },
    axisLabel: { color: '#9CA3AF' },
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.userTrend,
      itemStyle: { color: CHART_COLORS.primary },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(125,211,232,0.28)' },
            { offset: 1, color: 'rgba(125,211,232,0.02)' },
          ],
        },
      },
    },
    {
      name: '付费用户',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.vipTrend,
      itemStyle: { color: CHART_COLORS.success },
    },
  ],
}))
</script>

<template>
  <div class="card-base">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-base font-semibold text-ink">用户增长趋势</h3>
    </div>
    <BaseChart :option="option" :loading="loading" height="300px" />
  </div>
</template>
