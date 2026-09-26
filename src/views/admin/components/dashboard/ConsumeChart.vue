<script setup>
/**
 * 余额变动趋势图：AI 消费 vs 额度发放
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

const { chartColors, chartUi } = useChartTheme()
// 两条个人钱包流水都为零时显示明确空态，避免把空白图误认为加载失败。
const hasData = computed(() => [...props.consumeTrend, ...props.grantTrend].some((value) => Number(value) > 0))

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['AI 消费', '额度发放'], right: 0, top: 0, icon: 'roundRect' },
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
      name: 'AI 消费',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.consumeTrend,
      itemStyle: { color: chartColors.value.danger },
    },
    {
      name: '额度发放',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: props.grantTrend,
      itemStyle: { color: chartColors.value.success },
    },
  ],
}))
</script>

<template>
  <div class="card-base">
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-ink">个人额度变化</h3>
        <!-- 所选周期和趋势一致，避免将当前管理员的个人钱包流水误读为全站收入。 -->
        <p class="mt-1 text-xs text-muted">{{ props.range }} · 仅统计本人 AI 消费和发放 · 单位：额度</p>
      </div>
    </div>
    <SkeletonCard v-if="loading && !hasData" height="280px" />
    <BaseChart v-else-if="hasData" :option="option" :loading="loading" height="280px" />
    <EmptyState v-else text="所选时间范围内暂无个人额度变动" />
  </div>
</template>
