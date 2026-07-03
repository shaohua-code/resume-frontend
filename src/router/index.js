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
    component: () => import('@/views/home/index.vue'),
    meta: { title: 'AI简历助手', hideFooter: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hideLayout: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册', hideLayout: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/index.vue'),
    meta: { title: '忘记密码', hideLayout: true },
  },

  {
    path: '/templates',
    name: 'Templates',
    component: () => import('@/views/templates/index.vue'),
    meta: { title: '全部模板预览' },
  },
  {
    path: '/generate',
    name: 'Generate',
    component: () => import('@/views/generate/index.vue'),
    meta: { title: 'AI生成简历', requireAuth: true },
  },
  {
    path: '/upload-optimize',
    name: 'UploadOptimize',
    component: () => import('@/views/upload-optimize/index.vue'),
    meta: { title: '上传简历优化', requireAuth: true },
  },
  {
    path: '/editor/:id?',
    name: 'Editor',
    component: () => import('@/views/editor/index.vue'),
    meta: { title: '简历编辑', requireAuth: true, hideLayout: true },
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/user/index.vue'),
    meta: { title: '用户中心', requireAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/index.vue'),
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
