/**
 * 应用入口文件
 * 初始化 Vue3 实例，并按路由需要注册状态、路由与 UI 组件库
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import './styles/global.css'
import { antDesignReady } from '@/utils/uiReady'
import { initializeSystemTheme } from '@/composables/useTheme'
// import { activateServiceSwitchRedirect } from '@/utils/serviceRedirect'

dayjs.locale('zh-cn')

// const serviceSwitchRedirectActive = activateServiceSwitchRedirect()

// 在 Vue 挂载前恢复界面主题，避免首屏先显示浏览器默认白底。
initializeSystemTheme()

const app = createApp(App)

let antDesignPromise

// 缓存按需组件清单的加载结果，避免连续导航时重复下载或重复注册。
function ensureAntDesign() {
  if (antDesignReady.value) return Promise.resolve()
  if (!antDesignPromise) {
    antDesignPromise = import('@/utils/installAntDesign').then(({ installAntDesign }) => {
      installAntDesign(app)
      antDesignReady.value = true
    })
  }
  return antDesignPromise
}

// 非轻量路由仅预取，不再 beforeResolve 阻塞导航，避免浏览器顶栏/标签页长时间转圈。
router.beforeEach((to) => {
  if (!to.meta.lightweight) void ensureAntDesign()
})

app.use(createPinia()) // Pinia 状态管理
app.use(router) // Vue Router 路由

// if (!serviceSwitchRedirectActive) {
  app.mount('#app')
// }
