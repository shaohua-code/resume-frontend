<script setup>
/**
 * 数据中心大盘
 */
import { onMounted, ref } from 'vue'
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
const activeRange = ref('年度')

async function loadDashboard() {
  loading.value = true
  try {
    dashboard.value = (await getAdminDashboard()).data || {}
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
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
