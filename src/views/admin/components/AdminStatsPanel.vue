<script setup>
/**
 * 数据中心大盘
 * 负责拉取 dashboard 聚合数据，并按现代 SaaS 风格分发给各可视化子组件。
 */
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getAdminDashboard } from '@/api/admin'
import WelcomeBanner from './dashboard/WelcomeBanner.vue'
import StatisticCards from './dashboard/StatisticCards.vue'
import UserChart from './dashboard/UserChart.vue'
import AIChart from './dashboard/AIChart.vue'
import OrderChart from './dashboard/OrderChart.vue'
import VipChart from './dashboard/VipChart.vue'
import OrderOverview from './dashboard/OrderOverview.vue'
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

    <!-- 统计卡：加载时显示骨架屏 -->
    <div v-if="loading" class="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>
    <StatisticCards v-else :data="dashboard" />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <UserChart
          :months="dashboard.months || []"
          :user-trend="dashboard.user_trend || []"
          :vip-trend="dashboard.vip_trend || []"
          :loading="loading"
        />
      </div>
      <VipChart
        :vip-count="dashboard.vip_count || 0"
        :user-count="dashboard.user_count || 0"
        :loading="loading"
      />
    </div>

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <OrderOverview :data="dashboard" />
      <div class="xl:col-span-2">
        <AIChart
          :months="dashboard.months || []"
          :ai-trend="dashboard.ai_trend || []"
          :loading="loading"
        />
      </div>
    </div>

    <OrderChart
      :months="dashboard.months || []"
      :order-trend="dashboard.order_trend || []"
      :loading="loading"
    />

    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <NoticeCard :announcements="dashboard.recent_announcements || []" />
      <ServiceStatus :status="dashboard.system_status || {}" />
    </div>
  </div>
</template>
