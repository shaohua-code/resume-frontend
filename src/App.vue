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
          class="app-loading flex min-h-[40vh] items-center justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div class="app-loading__card">
            <div class="app-loading__header">
              <div class="app-loading__mark" aria-hidden="true"><span>AI</span></div>
              <div class="app-loading__copy">
                <strong>正在为你准备工作台</strong>
                <span>界面组件加载中，请稍候片刻</span>
              </div>
              <span class="app-loading__status"><i aria-hidden="true" />正在加载</span>
            </div>
            <!-- 这里只等待组件就绪，没有真实百分比；用带流光的循环进度表达状态。 -->
            <div class="app-loading__track" role="progressbar" aria-label="页面正在加载">
              <span class="app-loading__bar" />
            </div>
            <div class="app-loading__footer">
              <span>界面初始化</span>
              <span class="app-loading__steps" aria-hidden="true"><i /><i /><i /></span>
              <span>即将就绪</span>
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
    transform: translateX(-112%);
    opacity: .55;
  }
  45% {
    opacity: 1;
  }
  100% {
    transform: translateX(245%);
    opacity: .72;
  }
}

@keyframes loading-glow {
  0%, 100% { opacity: .4; transform: scale(.86); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes loading-dot {
  0%, 60%, 100% { opacity: .35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

@keyframes loading-orbit {
  to { transform: rotate(360deg); }
}

/* 组件预热期间展示品牌色流光，不伪造百分比，也不延长页面就绪时间。 */
.app-loading__card {
  position: relative;
  width: min(100%, 520px);
  overflow: hidden;
  padding: 22px 24px 17px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 17%, var(--color-line));
  border-radius: 22px;
  background:
    radial-gradient(ellipse at 100% 0%, color-mix(in srgb, var(--color-brand) 10%, transparent), transparent 48%),
    color-mix(in srgb, var(--color-surface) 96%, white);
  box-shadow: 0 18px 52px rgb(25 35 58 / 10%), 0 3px 10px rgb(25 35 58 / 4%);
}

.app-loading__header { display: flex; align-items: center; gap: 14px; }
.app-loading__mark {
  position: relative;
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 15px;
  background: linear-gradient(145deg, var(--color-brand-dark), var(--color-brand) 58%, var(--color-brand-light));
  color: white;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-brand) 30%, transparent);
}
.app-loading__mark::after {
  position: absolute;
  inset: -5px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 42%, transparent);
  border-top-color: var(--color-brand-light);
  border-radius: 19px;
  content: '';
  animation: loading-orbit 2.8s linear infinite;
}
.app-loading__copy { display: grid; min-width: 0; gap: 4px; }
.app-loading__copy strong { color: var(--color-ink); font-size: 15px; font-weight: 750; line-height: 1.35; }
.app-loading__copy span { color: var(--color-ink-secondary); font-size: 12px; line-height: 1.5; }
.app-loading__status { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 6px; margin-left: auto; padding: 6px 9px; border: 1px solid color-mix(in srgb, var(--color-brand) 15%, var(--color-line)); border-radius: 999px; background: color-mix(in srgb, var(--color-brand-lighter) 65%, white); color: var(--color-brand-dark); font-size: 10px; font-weight: 700; }
.app-loading__status i { width: 6px; height: 6px; border-radius: 50%; background: var(--color-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 14%, transparent); animation: loading-glow 1.4s ease-in-out infinite; }
.app-loading__track { position: relative; height: 10px; overflow: hidden; margin-top: 24px; padding: 2px; border: 1px solid color-mix(in srgb, var(--color-brand) 12%, var(--color-line)); border-radius: 999px; background: color-mix(in srgb, var(--color-brand-lighter) 42%, var(--color-surface)); }
.app-loading__track::after { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgb(255 255 255 / 44%), transparent); content: ''; transform: translateX(-100%); animation: loading-progress 2.4s ease-in-out infinite; }
.app-loading__bar { position: absolute; inset-block: 1px; left: 0; width: 42%; border-radius: inherit; background: linear-gradient(90deg, var(--color-brand-dark), var(--color-brand), var(--color-brand-light)); box-shadow: 0 0 12px color-mix(in srgb, var(--color-brand) 48%, transparent); animation: loading-progress 1.45s cubic-bezier(.46,.03,.52,.96) infinite; }
.app-loading__footer { display: flex; align-items: center; gap: 8px; margin-top: 12px; color: var(--color-muted); font-size: 10px; }
.app-loading__steps { display: flex; align-items: center; gap: 4px; margin-inline: auto; }
.app-loading__steps i { width: 4px; height: 4px; border-radius: 50%; background: var(--color-brand); opacity: .45; animation: loading-dot 1.05s ease-in-out infinite; }
.app-loading__steps i:nth-child(2) { animation-delay: .15s; }
.app-loading__steps i:nth-child(3) { animation-delay: .3s; }

@media (max-width: 520px) {
  .app-loading__card { padding: 18px 17px 14px; border-radius: 19px; }
  .app-loading__header { gap: 11px; }
  .app-loading__mark { width: 42px; height: 42px; border-radius: 14px; }
  .app-loading__mark::after { border-radius: 18px; }
  .app-loading__copy strong { font-size: 14px; }
  .app-loading__copy span { font-size: 11px; }
  .app-loading__status { padding: 5px 7px; font-size: 9px; }
}

@media (prefers-reduced-motion: reduce) {
  .app-loading__mark::after,
  .app-loading__status i,
  .app-loading__track::after,
  .app-loading__bar,
  .app-loading__steps i { animation: none; }
  .app-loading__bar { left: 29%; opacity: .9; }
}
</style>
