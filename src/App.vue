<!--
  根组件
  包含页面布局：顶部导航栏 + 主内容区 + 底部 Footer
-->
<template>
  <a-config-provider :locale="zhCN" :theme="{ token: antdToken }">
    <div class="relative flex flex-col min-h-screen font-sans antialiased bg-cream text-ink">
      <!-- 全页背景装饰层 -->
      <div class="fixed inset-0 z-0 pointer-events-none page-bg" />
      <AppHeader v-if="!$route.meta.hideLayout" />
      <main
        class="relative z-10 flex-1 transition-all duration-300"
        :class="$route.meta.hideLayout ? 'pt-0' : 'pt-16'"
      >
        <router-view />
      </main>

      <!-- 用户端可拖拽反馈入口 -->
      <FeedbackFloatingButton v-if="showFeedback" />
    </div>
  </a-config-provider>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { antdToken } from '@/constants/theme'
import { useTheme } from '@/composables/useTheme'
import AppHeader from '@/components/AppHeader.vue'
import FeedbackFloatingButton from '@/components/FeedbackFloatingButton.vue'
import { useVisitTracker } from '@/composables/useVisitTracker'

const route = useRoute()
const { applyCssVariables } = useTheme()
const { init: initVisitTracker } = useVisitTracker()

// 隐藏反馈按钮的路径：管理端与认证页
const HIDDEN_FEEDBACK_PATHS = ['/login', '/register', '/forgot-password']
const showFeedback = computed(() => {
  const path = route.path
  if (path.startsWith('/admin')) return false
  return !HIDDEN_FEEDBACK_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
})

// 挂载时将 theme.js 变量注入 :root，并初始化访客追踪
onMounted(() => {
  applyCssVariables()
  initVisitTracker()
})
</script>
