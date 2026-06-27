<script setup>
/**
 * 业务订单概览
 * 使用 dashboard 已有聚合数据展示订单数、订单金额、已支付金额与待支付订单。
 */
import { computed } from 'vue'
import { ShoppingBag, ClipboardCheck, Wallet, Clock3 } from 'lucide-vue-next'
import CountUp from './CountUp.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const metrics = computed(() => [
  {
    label: '订单总数',
    value: props.data.order_count || 0,
    icon: ShoppingBag,
    iconClass: 'bg-blue-50 text-primary',
    suffix: '',
  },
  {
    label: '订单金额',
    value: Number(props.data.total_amount || 0),
    icon: Wallet,
    iconClass: 'bg-emerald-50 text-success',
    prefix: '¥',
  },
  {
    label: '已支付金额',
    value: Number(props.data.paid_amount || 0),
    icon: ClipboardCheck,
    iconClass: 'bg-violet-50 text-violet-600',
    prefix: '¥',
  },
  {
    label: '待支付订单',
    value: props.data.pending_count || 0,
    icon: Clock3,
    iconClass: 'bg-amber-50 text-warning',
    suffix: '',
  },
])
</script>

<template>
  <div class="rounded-card bg-white p-5 shadow-soft">
    <div class="mb-5 flex items-center justify-between">
      <h3 class="text-base font-semibold text-ink">业务订单概览</h3>
      <a-tag color="blue">实时统计</a-tag>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="item in metrics"
        :key="item.label"
        class="flex items-center gap-3 rounded-2xl bg-canvas p-4"
      >
        <span class="flex h-11 w-11 items-center justify-center rounded-xl" :class="item.iconClass">
          <component :is="item.icon" class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs text-muted">{{ item.label }}</p>
          <p class="mt-1 truncate text-lg font-bold text-ink">
            <CountUp :value="item.value" :prefix="item.prefix || ''" :suffix="item.suffix || ''" :decimals="item.prefix ? 2 : 0" />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
