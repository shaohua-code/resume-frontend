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

dayjs.locale('zh-cn')

const app = createApp(App)

let antDesignPromise

// 缓存完整组件库的加载结果，避免连续导航时重复下载或重复注册。
function ensureAntDesign() {
  if (!antDesignPromise) {
    antDesignPromise = import('ant-design-vue').then(({ default: Antd }) => {
      app.use(Antd)
    })
  }
  return antDesignPromise
}

// 轻量路由只加载首屏所需组件；其他页面并行准备完整组件库，并在解析完成前确保可用。
router.beforeEach((to) => {
  if (!to.meta.lightweight) void ensureAntDesign()
})

router.beforeResolve(async (to) => {
  if (!to.meta.lightweight) await ensureAntDesign()
})

app.use(createPinia()) // Pinia 状态管理
app.use(router) // Vue Router 路由

app.mount('#app')
