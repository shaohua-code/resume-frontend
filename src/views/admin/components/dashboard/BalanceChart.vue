<script setup>
/**
 * 余额占比环形图
 */
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import CHART_COLORS from '../../utils/chartTheme.js'

const props = defineProps({
  totalBalance: {
    type: Number,
    default: 0,
  },
  totalConsumed: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const consumedPercent = computed(() => {
  const total = props.totalBalance + props.totalConsumed
  if (!total) return 0
  return Math.round((props.totalConsumed / total) * 100)
})

const option = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', right: 0, top: 'center' },
  series: [
    {
      type: 'pie',
      radius: ['58%', '78%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: `${consumedPercent.value}%`,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
      },
      labelLine: { show: false },
      data: [
        { value: props.totalBalance, name: '账户余额', itemStyle: { color: CHART_COLORS.primary } },
        { value: props.totalConsumed, name: '累计消费', itemStyle: { color: CHART_COLORS.warning } },
      ],
    },
  ],
}))
</script>

<template>
  <div class="card-base">
    <div class="mb-2">
      <h3 class="text-base font-semibold text-ink">余额 / 消费占比</h3>
    </div>
    <BaseChart :option="option" :loading="loading" height="300px" />
  </div>
</template>
