/**
 * 应用入口文件
 * 初始化 Vue3 实例，注册全局插件（路由、状态管理、UI组件库）
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import './styles/global.css'

dayjs.locale('zh-cn')

const app = createApp(App)
console.log('Vite API URL:', import.meta.env.VITE_API_URL);

app.use(createPinia()) // Pinia 状态管理
app.use(router) // Vue Router 路由
app.use(Antd) // Ant Design Vue 组件库

app.mount('#app')
