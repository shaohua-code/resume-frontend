<script setup>
/**
 * 余额消费概览
 */
import { computed } from 'vue'
import { Wallet, TrendingDown, TrendingUp, Bot } from 'lucide-vue-next'
import CountUp from './CountUp.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const metrics = computed(() => [
  {
    label: '我的可用额度',
    value: Number(props.data.my_balance || 0),
    icon: Wallet,
    iconClass: 'bg-brand-lighter text-brand-dark',
    prefix: '¥',
    note: '可分配余额',
  },
  {
    label: '累计发放',
    value: Number(props.data.my_granted || 0),
    icon: TrendingUp,
    iconClass: 'bg-mint text-emerald-700',
    prefix: '¥',
    note: '我转出的额度合计',
  },
  {
    label: '累计消费',
    value: Number(props.data.my_consumed || 0),
    icon: TrendingDown,
    iconClass: 'bg-cream text-warning',
    prefix: '¥',
    note: '我的 AI 调用扣费',
  },
  {
    label: 'AI 调用次数',
    value: props.data.ai_call_count || 0,
    icon: Bot,
    iconClass: 'bg-brand-lighter text-brand-dark',
    prefix: '',
  },
])
</script>

<template>
  <div class="card-base">
    <div class="mb-5 flex items-center justify-between">
      <h3 class="text-base font-semibold text-ink">余额消费概览</h3>
      <span class="badge">实时统计</span>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="item in metrics"
        :key="item.label"
        class="flex items-center gap-3 rounded-2xl bg-cream p-4"
      >
        <span class="flex h-11 w-11 items-center justify-center rounded-xl" :class="item.iconClass">
          <component :is="item.icon" class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs text-muted">{{ item.label }}</p>
          <p class="mt-1 truncate text-lg font-bold text-ink">
            <CountUp :value="item.value" :prefix="item.prefix || ''" :decimals="item.prefix ? 2 : 0" />
          </p>
          <p v-if="item.note" class="mt-1 truncate text-xs text-muted">{{ item.note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
