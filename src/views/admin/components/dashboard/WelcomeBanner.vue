<script setup>
/**
 * 数据中心标题与筛选栏：展示数据归属、更新时间，并承载统一周期筛选与手动刷新。
 */
import { computed } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

const activeRange = defineModel({ type: String, default: '年度' })

const props = defineProps({
  nickname: {
    type: String,
    default: '管理员',
  },
  scopeLabel: {
    type: String,
    default: '当前数据范围',
  },
  lastUpdated: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh'])

// 前端标签保持易读，接口仍使用兼容原有调用方的“年度”范围值。
const timeRanges = [
  { label: '今日', value: '今日' },
  { label: '昨日', value: '昨日' },
  { label: '7日', value: '7日' },
  { label: '30日', value: '30日' },
  { label: '近12个月', value: '年度' },
]

const rangeLabel = computed(() => activeRange.value === '年度' ? '近12个月' : activeRange.value)

// 根据当前小时给出问候语，时间筛选描述统一放在页面标题区。
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
</script>

<template>
  <div class="card-base flex flex-col gap-5 !p-5 sm:flex-row sm:items-center sm:justify-between sm:!p-6">
    <div class="min-w-0">
      <p class="text-xs font-medium text-brand-dark">{{ scopeLabel }} · {{ rangeLabel }}</p>
      <h2 class="mt-1 text-2xl font-semibold text-ink">{{ greeting }}，{{ nickname }}</h2>
      <p class="mt-2 text-sm text-muted">查看用户增长、产品使用和个人额度变化。数据范围会随时间筛选同步调整。</p>
      <p v-if="lastUpdated" class="mt-2 text-xs text-muted">最近更新：{{ lastUpdated }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <a-segmented
        :value="activeRange"
        :options="timeRanges"
        class="stats-range-selector"
        aria-label="选择统计时间范围"
        @change="activeRange = $event"
      />
      <!-- 使用原生横向按钮，避免 Ant 按钮在窄弹性布局中把图标和文案拆成两行。 -->
      <button
        type="button"
        class="btn-ghost !h-10 !min-h-10 !shrink-0 !whitespace-nowrap !px-4"
        :disabled="loading"
        aria-label="刷新数据中心统计"
        @click="emit('refresh')"
      >
        <RefreshCw class="h-4 w-4 shrink-0" :class="loading ? 'animate-spin' : ''" />
        <span class="whitespace-nowrap">刷新</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 时间范围控件使用常规表面色，确保和页面中其余筛选表单一致且主题可读。 */
.stats-range-selector :deep(.ant-segmented) {
  @apply rounded-xl bg-canvas p-1;
}
.stats-range-selector :deep(.ant-segmented-item-selected) {
  @apply rounded-lg bg-surface font-medium text-brand-dark shadow-sm;
}
</style>
