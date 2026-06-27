<script setup>
/**
 * VIP 占比环形图
 * 中心展示 VIP 占比百分比，右侧图例区分 VIP / 普通用户。
 */
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'

const props = defineProps({
  vipCount: {
    type: Number,
    default: 0,
  },
  userCount: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// 普通用户 = 总用户 - VIP，避免负数
const normalCount = computed(() => Math.max((props.userCount || 0) - (props.vipCount || 0), 0))
const vipPercent = computed(() => {
  if (!props.userCount) return 0
  return Math.round((props.vipCount / props.userCount) * 100)
})

const option = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 0, top: 'center', icon: 'circle' },
  series: [
    {
      type: 'pie',
      radius: ['58%', '80%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: `${vipPercent.value}%`,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
      },
      labelLine: { show: false },
      data: [
        { value: props.vipCount, name: 'VIP用户', itemStyle: { color: '#2563eb' } },
        { value: normalCount.value, name: '普通用户', itemStyle: { color: '#e2e8f0' } },
      ],
    },
  ],
}))
</script>

<template>
  <div class="rounded-card bg-white p-5 shadow-soft">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-base font-semibold text-ink">VIP 用户占比</h3>
    </div>
    <BaseChart :option="option" :loading="loading" height="300px" />
  </div>
</template>
