<!--
  根组件
  包含页面布局：顶部导航栏 + 主内容区 + 底部 Footer
-->
<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ConfigProvider from 'ant-design-vue/es/config-provider'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useTheme } from '@/composables/useTheme'
import { useVisitTracker } from '@/composables/useVisitTracker'
import { useUserStore } from '@/stores/user'
import { emailBindingGateOpen } from '@/utils/emailBindingGate'
import { antDesignReady } from '@/utils/uiReady'

// 顶栏、反馈和邮箱绑定弹窗均按需加载，避免非 AI 首屏承担无关组件体积。
const AppHeader = defineAsyncComponent(() => import('@/components/AppHeader.vue'))
const FeedbackFloatingButton = defineAsyncComponent(() => import('@/components/FeedbackFloatingButton.vue'))
const EmailBindingModal = defineAsyncComponent(() => import('@/components/EmailBindingModal.vue'))
const NewUserGuide = defineAsyncComponent(() => import('@/components/NewUserGuide.vue'))
const AnnouncementModal = defineAsyncComponent(() => import('@/components/AnnouncementModal.vue'))

const route = useRoute()
const userStore = useUserStore()
const { antdTheme, applyCssVariables } = useTheme()
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
  console.log('LG onMounted')
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

<template>
  <ConfigProvider :locale="zhCN" :theme="antdTheme">
    <div class="relative flex flex-col min-h-screen font-sans antialiased system-ui-shell bg-cream text-ink">
      <!-- 全页背景装饰层 -->
      <div class="fixed inset-0 z-0 pointer-events-none page-bg" />
      <AppHeader v-if="!$route.meta.hideLayout" />
      <main
        class="relative z-10 flex-1 transition-all duration-300"
        :class="$route.meta.hideLayout ? 'pt-0' : 'pt-16'"
      >
        <!-- 完整 Antd 未就绪前不挂载业务页，避免未注册组件闪错；用友好文案替代路由阻塞 -->
        <router-view v-if="route.meta.lightweight || antDesignReady" />
        <div
          v-else
          class="flex min-h-[40vh] items-center justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div class="w-full max-w-sm rounded-banner border border-line/60 bg-surface/95 px-5 py-4 text-sm font-medium text-ink shadow-soft">
            <div class="mb-3 flex items-center justify-between gap-4">
              <span>页面加载中，请稍候…</span>
              <span class="text-xs text-muted">加载组件</span>
            </div>
            <!-- 非轻量业务页等待 Ant Design 按需组件注册完成，这里用非确定进度条表达加载中。 -->
            <div
              class="h-2 overflow-hidden rounded-full bg-brand-lighter/50"
              role="progressbar"
              aria-label="页面加载进度"
            >
              <div class="h-full w-1/2 animate-loading-progress rounded-full bg-gradient-to-r from-brand-light via-brand to-brand-dark" />
            </div>
          </div>
        </div>
      </main>

      <!-- 用户端可拖拽反馈入口 -->
      <FeedbackFloatingButton v-if="showFeedback && deferredReady" />

      <!-- 服务端命中 AI 邮箱门禁时才按需加载弹窗，绑定成功后自动续接原操作。 -->
      <EmailBindingModal v-if="emailBindingGateOpen" />

      <!-- 仅登录后挂载；注册写 pending，首次进 /generate 展示三步指引（文案/存储键见 NewUserGuide + newUserGuide.js）。 -->
      <NewUserGuide v-if="deferredReady && userStore.isLoggedIn" />

      <!-- 版本公告：仅登录后展示；注册/登录/找回密码页不挂载，避免盖住凭据弹窗 -->
      <AnnouncementModal
        v-if="deferredReady && userStore.isLoggedIn && !['/login', '/register', '/forgot-password'].includes($route.path)"
      />

    </div>
  </ConfigProvider>
</template>

<style scoped>
@keyframes loading-progress {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(220%);
  }
}

/* 根加载态没有真实百分比，使用循环位移动画保持轻量并避免阻塞首屏。 */
.animate-loading-progress {
  animation: loading-progress 1.15s ease-in-out infinite;
}
</style>
