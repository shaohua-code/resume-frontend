<script setup>
/**
 * 核心业务指标卡：累计规模与所选周期增量分开呈现，比较值始终与同长度上一周期对齐。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, ArrowDown, ArrowUp, Bot, FileText, UserPlus, Users } from 'lucide-vue-next'
import CountUp from './CountUp.vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  range: { type: String, default: '年度' },
})

const router = useRouter()
const userStore = useUserStore()

// 将后端同环比字段转成可读文案；基期为零时不展示误导性的百分比。
function comparisonText(comparison) {
  if (!comparison) return '暂无对比数据'
  const sign = comparison.change > 0 ? '+' : ''
  if (comparison.previous === 0) return '上期 0 · 暂无可比基数'
  const rate = comparison.change_rate === null ? '' : `（${sign}${comparison.change_rate}%）`
  return `较上期 ${sign}${comparison.change}${rate}`
}

// 指标卡中的总量只使用累计值，区间增量才参与周期对比。
const cards = computed(() => {
  const summary = props.data.period_summary || {}
  const activeUsers = Number(summary.active_users || 0)
  return [
    {
      key: 'users', label: '累计用户', value: Number(props.data.user_count || 0), icon: Users,
      tone: 'brand', note: '当前权限范围内的用户总量', path: '/admin/users', permission: 'admin:manage_users',
    },
    {
      key: 'new-users', label: `新增用户 · ${props.range}`, value: Number(summary.users?.value || 0),
      comparison: summary.users, icon: UserPlus, tone: 'mint', note: comparisonText(summary.users),
      path: '/admin/users', permission: 'admin:manage_users',
    },
    {
      key: 'resumes', label: `新建简历 · ${props.range}`, value: Number(summary.resumes?.value || 0),
      comparison: summary.resumes, icon: FileText, tone: 'cream', note: comparisonText(summary.resumes),
      path: '/admin/resumes', permission: 'admin:view_resumes',
    },
    {
      key: 'ai-calls', label: `AI 调用 · ${props.range}`, value: Number(summary.ai_calls?.value || 0),
      comparison: summary.ai_calls, icon: Bot, tone: 'brand',
      note: `${activeUsers} 位用户使用 · ${comparisonText(summary.ai_calls)}`,
      path: '/admin/ai-calls', permission: 'admin:view_ai_calls',
    },
  ]
})

// 卡片只在用户本身拥有目标菜单权限时导航，避免用前端展示扩大后台权限。
function openMetric(item) {
  if (item.path && userStore.hasPermission(item.permission)) router.push(item.path)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
    <button
      v-for="item in cards"
      :key="item.key"
      type="button"
      class="card-hover group flex min-h-[142px] items-start justify-between gap-3 p-4 text-left transition sm:p-5"
      :class="userStore.hasPermission(item.permission) ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'"
      :aria-label="`${item.label}：${item.value}。${item.note}`"
      @click="openMetric(item)"
    >
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium text-muted">{{ item.label }}</p>
          <ArrowUp
            v-if="item.comparison?.change > 0"
            class="h-3.5 w-3.5 shrink-0 text-success"
            aria-label="增加"
          />
          <ArrowDown
            v-else-if="item.comparison?.change < 0"
            class="h-3.5 w-3.5 shrink-0 text-danger"
            aria-label="减少"
          />
        </div>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-ink">
          <CountUp :value="item.value" />
        </p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ item.note }}</p>
      </div>
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
        :class="{
          'bg-brand-lighter text-brand-dark': item.tone === 'brand',
          'bg-mint text-emerald-700': item.tone === 'mint',
          'bg-cream text-warning': item.tone === 'cream',
        }"
      >
        <component :is="item.icon" class="h-5 w-5" />
      </span>
    </button>
  </div>
  <p class="flex items-center gap-1.5 text-xs text-muted">
    <Activity class="h-3.5 w-3.5" />
    用户、简历和 AI 指标遵循当前管理员的数据范围；卡片可跳转到对应明细。
  </p>
</template>
