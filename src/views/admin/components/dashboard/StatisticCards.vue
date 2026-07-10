<script setup>
/**
 * 数据统计卡片
 */
import { computed } from 'vue'
import {
  Users,
  Wallet,
  TrendingDown,
  UserPlus,
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

const systemHealthy = computed(() => {
  const status = props.data.system_status || {}
  const values = Object.values(status)
  if (!values.length) return true
  return values.every((value) => value === 'ok')
})

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
    label: '剩余可分配额度',
    value: Number(props.data.quota_available || 0),
    icon: Wallet,
    iconBg: 'bg-mint text-emerald-700',
    prefix: '¥',
    note: `已分配 ¥${Number(props.data.quota_allocated || 0).toFixed(2)}`,
  },
  {
    label: '累计消费',
    value: Number(props.data.total_consumed || 0),
    icon: TrendingDown,
    iconBg: 'bg-cream text-warning',
    prefix: '¥',
    note: 'AI 调用扣费',
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
          <CountUp
            v-if="item.text === undefined"
            :value="item.value"
            :prefix="item.prefix || ''"
            :decimals="item.prefix ? 2 : 0"
          />
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
