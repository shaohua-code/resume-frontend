/**
 * 路由配置
 * 定义所有页面路由，包括首页、简历生成、模板预览、用户中心等
 * 需要登录的页面通过 meta.requireAuth 标记，路由守卫自动跳转登录
 */
import { createRouter, createWebHistory } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'AI简历助手' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', hideLayout: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', hideLayout: true },
  },
  {
    path: '/generate',
    name: 'Generate',
    component: () => import('@/views/Generate.vue'),
    meta: { title: 'AI生成简历', requireAuth: true },
  },
  {
    path: '/upload-optimize',
    name: 'UploadOptimize',
    component: () => import('@/views/UploadOptimize.vue'),
    meta: { title: '上传简历优化', requireAuth: true },
  },
  {
    path: '/editor/:id?',
    name: 'Editor',
    component: () => import('@/views/Editor.vue'),
    meta: { title: '简历编辑', requireAuth: true, hideLayout: true },
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/UserCenter.vue'),
    meta: { title: '用户中心', requireAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { title: '管理后台', requireAuth: true, roles: ['SUPER_ADMIN', 'ADMIN'], hideLayout: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：未登录时跳转到登录页
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - AI简历助手` : 'AI简历助手'
  const token = localStorage.getItem('token')
  if (to.meta.requireAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.roles) {
    const userStore = useUserStore()
    // 前端路由只做访问提示，后端接口仍会再次校验角色和权限
    if (!to.meta.roles.includes(userStore.role)) {
      message.error('无权访问该页面')
      next('/')
      return
    }
    next()
  } else {
    next()
  }
})

export default router
