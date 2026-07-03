<script setup>
/**
 * 数据统计卡片（6 张）
 * 左侧彩色图标，右侧 CountUp 数字，底部增长趋势（绿涨红跌），hover 整体上浮。
 */
import { computed } from 'vue'
import {
  Users,
  Crown,
  UserPlus,
  ShoppingCart,
  Bot,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-vue-next'
import CountUp from './CountUp.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

// 系统整体状态：任一服务异常即视为异常
const systemHealthy = computed(() => {
  const status = props.data.system_status || {}
  const values = Object.values(status)
  if (!values.length) return true
  return values.every((value) => value === 'ok')
})

// 计算占比百分比
function calcPercent(value = 0, total = 0) {
  if (!total) return 0
  return Math.min(Math.round((Number(value || 0) / Number(total)) * 100), 100)
}

const cards = computed(() => [
  {
    label: '用户总数',
    value: props.data.user_count || 0,
    icon: Users,
    iconBg: 'bg-brand-lighter text-brand-dark',
    trend: props.data.user_growth ?? null,
    trendLabel: '较昨日',
  },
  {
    label: 'VIP付费用户',
    value: props.data.vip_count || 0,
    icon: Crown,
    iconBg: 'bg-mint text-emerald-700',
    note: `占比 ${calcPercent(props.data.vip_count, props.data.user_count)}%`,
  },
  {
    label: '今日新增用户',
    value: props.data.today_new_users || 0,
    icon: UserPlus,
    iconBg: 'bg-mint text-emerald-700',
    trend: props.data.user_growth ?? null,
    trendLabel: '较昨日',
  },
  {
    label: '订单总数',
    value: props.data.order_count || 0,
    icon: ShoppingCart,
    iconBg: 'bg-cream text-warning',
    note: `待支付 ${props.data.pending_count || 0}`,
  },
  {
    label: 'AI调用次数',
    value: props.data.ai_call_count || 0,
    icon: Bot,
    iconBg: 'bg-brand-lighter text-brand-dark',
    note: '近一年累计',
  },
  {
    label: '系统运行状态',
    text: systemHealthy.value ? '正常' : '异常',
    icon: Activity,
    iconBg: systemHealthy.value ? 'bg-mint text-emerald-700' : 'bg-red-50 text-danger',
    note: systemHealthy.value ? '所有服务正常' : '存在异常服务',
  },
])
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
    <div
      v-for="item in cards"
      :key="item.label"
      class="card-hover flex min-h-[116px] items-center justify-between gap-3 p-4"
    >
      <div class="min-w-0">
        <p class="text-sm text-muted">{{ item.label }}</p>
        <p class="mt-2 text-2xl font-bold text-ink">
          <CountUp v-if="item.text === undefined" :value="item.value" />
          <span v-else>{{ item.text }}</span>
        </p>
        <p class="mt-2 flex items-center gap-1 text-xs">
          <template v-if="item.trend !== null && item.trend !== undefined">
            <ArrowUp v-if="item.trend >= 0" class="h-3.5 w-3.5 text-success" />
            <ArrowDown v-else class="h-3.5 w-3.5 text-danger" />
            <span :class="item.trend >= 0 ? 'text-success' : 'text-danger'">{{ Math.abs(item.trend) }}</span>
            <span class="text-muted">{{ item.trendLabel }}</span>
          </template>
          <span v-else class="text-muted">{{ item.note }}</span>
        </p>
      </div>
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="item.iconBg">
        <component :is="item.icon" class="h-5 w-5" />
      </span>
    </div>
  </div>
</template>
