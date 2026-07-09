<script setup>
/**
 * 数据中心大盘
 */
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getAdminDashboard } from '@/api/admin'
import WelcomeBanner from './dashboard/WelcomeBanner.vue'
import StatisticCards from './dashboard/StatisticCards.vue'
import UserChart from './dashboard/UserChart.vue'
import AIChart from './dashboard/AIChart.vue'
import ConsumeChart from './dashboard/ConsumeChart.vue'
import BalanceChart from './dashboard/BalanceChart.vue'
import WalletOverview from './dashboard/WalletOverview.vue'
import ServiceStatus from './dashboard/ServiceStatus.vue'
import NoticeCard from './dashboard/NoticeCard.vue'
import SkeletonCard from './dashboard/SkeletonCard.vue'

const userStore = useUserStore()
const loading = ref(false)
const dashboard = ref({})
// 时间范围筛选条件（与 WelcomeBanner 双向绑定）
const activeRange = ref('年度')

/**
 * 加载大盘数据（支持时间范围筛选）
 * @param {string} range - 时间范围（今日/昨日/7日/30日/年度）
 */
async function loadDashboard(range) {
  loading.value = true
  try {
    // 将时间范围参数传递给后端 API
    dashboard.value = (await getAdminDashboard(range)).data || {}
  } finally {
    loading.value = false
  }
}

// 监听时间范围变化，自动重新加载数据
watch(activeRange, (newRange) => {
  loadDashboard(newRange)
})

onMounted(() => loadDashboard(activeRange.value))
</script>

<template>
  <div class="flex flex-col gap-5">
    <WelcomeBanner
      v-model="activeRange"
      :nickname="userStore.userInfo.nickname || '管理员'"
      :today-new-users="dashboard.today_new_users || 0"
    />

    <div v-if="loading" class="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>
    <StatisticCards v-else :data="dashboard" />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <UserChart
          :months="dashboard.months || []"
          :user-trend="dashboard.user_trend || []"
          :loading="loading"
        />
      </div>
      <BalanceChart
        :total-balance="dashboard.total_balance || 0"
        :total-consumed="dashboard.total_consumed || 0"
        :loading="loading"
      />
    </div>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <WalletOverview :data="dashboard" />
      <div class="xl:col-span-2">
        <AIChart
          :months="dashboard.months || []"
          :ai-trend="dashboard.ai_trend || []"
          :loading="loading"
        />
      </div>
    </div>

    <ConsumeChart
      :months="dashboard.months || []"
      :consume-trend="dashboard.consume_trend || []"
      :grant-trend="dashboard.grant_trend || []"
      :loading="loading"
    />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <NoticeCard :announcements="dashboard.recent_announcements || []" />
      <ServiceStatus :status="dashboard.system_status || {}" />
    </div>
  </div>
</template>
