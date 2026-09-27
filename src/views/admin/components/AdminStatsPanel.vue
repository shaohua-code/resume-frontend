<script setup>
/**
 * 数据中心大盘
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getAdminDashboard } from '@/api/admin'
import WelcomeBanner from './dashboard/WelcomeBanner.vue'
import StatisticCards from './dashboard/StatisticCards.vue'
import UserChart from './dashboard/UserChart.vue'
import AIChart from './dashboard/AIChart.vue'
import ConsumeChart from './dashboard/ConsumeChart.vue'
import WalletOverview from './dashboard/WalletOverview.vue'
import NoticeCard from './dashboard/NoticeCard.vue'
import SkeletonCard from './dashboard/SkeletonCard.vue'
import DataGlossary from './dashboard/DataGlossary.vue'
import AdminRetentionSummary from './AdminRetentionSummary.vue'
import { AlertCircle } from 'lucide-vue-next'

const userStore = useUserStore()
const loading = ref(true)
const dashboard = ref({})
const loadError = ref('')
const lastUpdated = ref('')
let requestVersion = 0
// 时间范围筛选条件驱动所有区间指标与趋势图，避免页面各区块各用一套时间口径。
const activeRange = ref('年度')
const hasLoaded = computed(() => Boolean(lastUpdated.value))
// 筛选请求未完成时沿用上一次已加载范围，防止旧数据被新范围标题误标。
const displayedRangeLabel = computed(() => {
  const loadedRange = dashboard.value.range || activeRange.value
  return loadedRange === '年度' ? '近12个月' : loadedRange
})

/**
 * 加载大盘数据（支持时间范围筛选）
 * @param {string} range - 时间范围（今日/昨日/7日/30日/年度）
 */
async function loadDashboard(range) {
  const currentRequest = ++requestVersion
  loading.value = true
  loadError.value = ''
  try {
    const response = await getAdminDashboard(range)
    if (currentRequest !== requestVersion) return
    dashboard.value = response.data || {}
    lastUpdated.value = new Date().toLocaleString('zh-CN', { hour12: false })
  } catch {
    if (currentRequest === requestVersion) loadError.value = '数据加载失败，请检查连接后重试。'
  } finally {
    if (currentRequest === requestVersion) loading.value = false
  }
}

// 监听时间范围变化，自动重新加载数据
watch(activeRange, (newRange) => {
  loadDashboard(newRange)
})

// 监听额度变更（AdminWalletPanel 分配额度后触发），自动刷新数据
watch(() => userStore.dashboardRefreshTick, () => {
  loadDashboard(activeRange.value)
})

onMounted(() => loadDashboard(activeRange.value))
</script>

<template>
  <div class="flex flex-col gap-5">
    <WelcomeBanner
      v-model="activeRange"
      :nickname="userStore.userInfo.nickname || '管理员'"
      :scope-label="dashboard.scope === 'all' ? '全站数据' : '我管理的用户'"
      :last-updated="lastUpdated"
      :loading="loading"
      @refresh="loadDashboard(activeRange)"
    />

    <div v-if="loadError" class="flex items-start justify-between gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger" role="alert">
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
        <span class="min-w-0">{{ loadError }}</span>
      </div>
      <a-button class="shrink-0" size="small" :loading="loading" @click="loadDashboard(activeRange)">重试</a-button>
    </div>

    <div v-if="loading && !hasLoaded" class="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    <StatisticCards v-else :data="dashboard" :range="displayedRangeLabel" />

    <section aria-labelledby="activity-heading">
      <div class="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="activity-heading" class="text-lg font-semibold text-ink">业务趋势</h2>
          <p class="mt-1 text-xs text-muted">{{ displayedRangeLabel }} · 新增用户与 AI 使用量</p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <UserChart
          :labels="dashboard.labels || []"
          :user-trend="dashboard.user_trend || []"
          :loading="loading"
          :range="displayedRangeLabel"
        />
        <AIChart
          :labels="dashboard.labels || []"
          :ai-trend="dashboard.ai_trend || []"
          :loading="loading"
          :range="displayedRangeLabel"
        />
      </div>
    </section>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <WalletOverview :data="dashboard" />
      <div class="xl:col-span-2">
        <ConsumeChart
          :labels="dashboard.labels || []"
          :consume-trend="dashboard.consume_trend || []"
          :grant-trend="dashboard.grant_trend || []"
          :loading="loading"
          :range="displayedRangeLabel"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <NoticeCard :announcements="dashboard.recent_announcements || []" />
      <DataGlossary />
    </div>

    <AdminRetentionSummary />
  </div>
</template>
