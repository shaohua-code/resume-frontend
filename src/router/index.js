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
    redirect: (to) => ({ path: '/generate', query: { ...to.query, mode: 'upload' } }),
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
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requireAuth: true, roles: ['SUPER_ADMIN', 'ADMIN'], hideLayout: true },
    redirect: '/admin/stats',
    children: [
      {
        path: 'stats',
        name: 'AdminStats',
        component: () => import('@/views/admin/components/AdminStatsPanel.vue'),
        meta: { title: '数据中心', permission: 'admin:stats' },
      },
      {
        path: 'admins',
        name: 'AdminAdmins',
        component: () => import('@/views/admin/components/AdminUsersPanel.vue'),
        props: { mode: 'admins' },
        meta: { title: '管理员账号', permission: 'admin:manage_admins' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/components/AdminUsersPanel.vue'),
        props: { mode: 'users' },
        meta: { title: '用户账号', permission: 'admin:manage_users' },
      },
      {
        path: 'wallets',
        name: 'AdminWallets',
        component: () => import('@/views/admin/components/AdminWalletPanel.vue'),
        meta: { title: '用户额度', permission: 'admin:wallet' },
      },
      {
        path: 'ledgers',
        name: 'AdminLedgers',
        component: () => import('@/views/admin/components/AdminLedgerPanel.vue'),
        meta: { title: '消费记录', permission: 'admin:view_ledgers' },
      },
      {
        path: 'ai-calls',
        name: 'AdminAiCalls',
        component: () => import('@/views/admin/components/AdminAiCallsPanel.vue'),
        meta: { title: 'AI调用记录', permission: 'admin:view_ai_calls' },
      },
      {
        path: 'resumes',
        name: 'AdminResumes',
        component: () => import('@/views/admin/components/AdminResumesPanel.vue'),
        meta: { title: '简历资源', permission: 'admin:view_resumes' },
      },
      {
        path: 'feedbacks',
        name: 'AdminFeedbacks',
        component: () => import('@/views/admin/components/AdminFeedbackPanel.vue'),
        meta: { title: '用户反馈', permission: 'admin:view_feedback' },
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: () => import('@/views/admin/components/AdminCrudPanel.vue'),
        props: { type: 'announcements' },
        meta: { title: '公告管理', permission: 'admin:announcement' },
      },
      {
        path: 'models',
        name: 'AdminModels',
        component: () => import('@/views/admin/components/AdminCrudPanel.vue'),
        props: { type: 'models' },
        meta: { title: 'AI模型管理', permission: 'admin:ai_model' },
      },
      {
        path: 'configs',
        name: 'AdminConfigs',
        component: () => import('@/views/admin/components/AdminConfigsPanel.vue'),
        meta: { title: '系统配置', permission: 'admin:system_config' },
      },
      {
        path: 'visits',
        name: 'AdminVisits',
        component: () => import('@/views/admin/components/AdminVisitLogsPanel.vue'),
        meta: { title: '访客记录', permission: 'admin:view_visits' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：未登录时跳转到登录页
router.beforeEach((to, from, next) => {
  const titleRoute = [...to.matched].reverse().find((r) => r.meta.title)
  document.title = titleRoute?.meta.title ? `${titleRoute.meta.title} - AI简历助手` : 'AI简历助手'
  const token = localStorage.getItem('token')
  const requireAuth = to.matched.some((r) => r.meta.requireAuth)
  const rolesMeta = to.matched.find((r) => r.meta.roles)?.meta.roles
  if (requireAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (rolesMeta) {
    const userStore = useUserStore()
    if (!rolesMeta.includes(userStore.role)) {
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
