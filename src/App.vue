<!--
  根组件
  包含页面布局：顶部导航栏 + 主内容区 + 底部 Footer
-->
<template>
  <ConfigProvider :locale="zhCN" :theme="{ token: antdToken }">
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
      <FeedbackFloatingButton v-if="showFeedback && deferredReady" />
    </div>
  </ConfigProvider>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ConfigProvider from 'ant-design-vue/es/config-provider'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { antdToken } from '@/constants/theme'
import { useTheme } from '@/composables/useTheme'
import { useVisitTracker } from '@/composables/useVisitTracker'

// 顶栏与反馈均拆出首屏入口；反馈含富文本编辑器，只在浏览器空闲后加载。
const AppHeader = defineAsyncComponent(() => import('@/components/AppHeader.vue'))
const FeedbackFloatingButton = defineAsyncComponent(() => import('@/components/FeedbackFloatingButton.vue'))

const route = useRoute()
const { applyCssVariables } = useTheme()
const { init: initVisitTracker } = useVisitTracker()
const deferredReady = ref(false)
let deferredHandle
let deferredHandleType

// 隐藏反馈按钮的路径：管理端与认证页
const HIDDEN_FEEDBACK_PATHS = ['/login', '/register', '/forgot-password']
const showFeedback = computed(() => {
  const path = route.path
  if (route.meta.hideFeedback) return false
  if (path.startsWith('/admin')) return false
  return !HIDDEN_FEEDBACK_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
})

function runDeferredTasks() {
  deferredReady.value = true
  initVisitTracker()
}

// 主题立即生效；访客追踪和富文本反馈让出关键渲染阶段。
onMounted(() => {
  applyCssVariables()
  if ('requestIdleCallback' in window) {
    deferredHandleType = 'idle'
    deferredHandle = window.requestIdleCallback(runDeferredTasks, { timeout: 2000 })
    return
  }
  deferredHandleType = 'timeout'
  deferredHandle = window.setTimeout(runDeferredTasks, 800)
})

onBeforeUnmount(() => {
  if (deferredHandleType === 'idle') window.cancelIdleCallback?.(deferredHandle)
  if (deferredHandleType === 'timeout') window.clearTimeout(deferredHandle)
})
</script>
