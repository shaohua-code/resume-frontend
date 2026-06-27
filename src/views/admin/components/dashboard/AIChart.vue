<script setup>
/**
 * AI 调用趋势图
 * 面积折线，展示近 12 个月 AI 调用次数，主色蓝紫渐变。
 */
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'

const props = defineProps({
  months: {
    type: Array,
    default: () => [],
  },
  aiTrend: {
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
  legend: { data: ['AI调用'], right: 0, top: 0, icon: 'roundRect' },
  grid: { left: 8, right: 12, bottom: 8, top: 36, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: axisLabels.value,
    axisLine: { lineStyle: { color: '#e2e8f0' } },
    axisLabel: { color: '#94a3b8' },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f1f5f9' } },
    axisLabel: { color: '#94a3b8' },
  },
  series: [
    {
      name: 'AI调用',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.aiTrend,
      itemStyle: { color: '#06b6d4' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(6,182,212,0.28)' },
            { offset: 1, color: 'rgba(37,99,235,0.02)' },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <div class="rounded-card bg-white p-5 shadow-soft">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-base font-semibold text-ink">AI 调用趋势</h3>
    </div>
    <BaseChart :option="option" :loading="loading" height="300px" />
  </div>
</template>
