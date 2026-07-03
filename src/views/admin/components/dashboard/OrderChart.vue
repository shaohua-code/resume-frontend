<script setup>
/**
 * 订单趋势图
 * 柱状图，展示近 12 个月订单数量，主色蓝紫渐变。
 */
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import CHART_COLORS, { CHART_GRADIENT } from '../../utils/chartTheme.js'

const props = defineProps({
  months: {
    type: Array,
    default: () => [],
  },
  orderTrend: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const axisLabels = computed(() => props.months.map((item) => `${Number(item.split('-')[1])}月`))

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['订单数'], right: 0, top: 0, icon: 'roundRect' },
  grid: { left: 8, right: 12, bottom: 8, top: 36, containLabel: true },
  xAxis: {
    type: 'category',
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
      name: '订单数',
      type: 'bar',
      barWidth: '45%',
      data: props.orderTrend,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: CHART_GRADIENT.start },
            { offset: 1, color: CHART_GRADIENT.end },
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
      <h3 class="text-base font-semibold text-ink">订单趋势</h3>
    </div>
    <BaseChart :option="option" :loading="loading" height="300px" />
  </div>
</template>
