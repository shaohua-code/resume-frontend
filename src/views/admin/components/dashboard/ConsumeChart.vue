<script setup>
/**
 * 余额变动趋势图：AI 消费 vs 额度发放
 */
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import CHART_COLORS from '../../utils/chartTheme.js'

const props = defineProps({
  months: {
    type: Array,
    default: () => [],
  },
  consumeTrend: {
    type: Array,
    default: () => [],
  },
  grantTrend: {
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
  legend: { data: ['AI 消费', '额度发放'], right: 0, top: 0, icon: 'roundRect' },
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
      name: 'AI 消费',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.consumeTrend,
      itemStyle: { color: CHART_COLORS.danger },
    },
    {
      name: '额度发放',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.grantTrend,
      itemStyle: { color: CHART_COLORS.success },
    },
  ],
}))
</script>

<template>
  <div class="card-base">
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-ink">余额变动趋势</h3>
        <!-- 与卡片「累计消费 / 额度发放」同口径：仅当前登录账号自己的流水 -->
        <p class="mt-1 text-xs text-muted">仅统计我自己的 AI 消费与额度发放</p>
      </div>
    </div>
    <BaseChart :option="option" :loading="loading" height="280px" />
  </div>
</template>
