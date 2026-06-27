<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getRoleLabel, getVipStatusText } from '@/constants/roles'
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ShoppingCart,
  Bot,
  FileText,
  Megaphone,
  Cpu,
  Crown,
  Settings,
  Search,
  Bell,
  Moon,
  User,
  LogOut,
} from 'lucide-vue-next'
import AdminAiCallsPanel from './components/AdminAiCallsPanel.vue'
import AdminConfigsPanel from './components/AdminConfigsPanel.vue'
import AdminCrudPanel from './components/AdminCrudPanel.vue'
import AdminOrdersPanel from './components/AdminOrdersPanel.vue'
import AdminResumesPanel from './components/AdminResumesPanel.vue'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminStatsPanel from './components/AdminStatsPanel.vue'
import AdminUsersPanel from './components/AdminUsersPanel.vue'

const router = useRouter()
const userStore = useUserStore()
const activeKey = ref('stats')
// 顶部搜索关键词，仅用于本地菜单过滤提示
const searchKeyword = ref('')

const menuItems = computed(() => [
  { key: 'stats', label: '数据中心', desc: '核心业务大盘', group: '数据中心', permission: 'admin:stats', icon: LayoutDashboard },
  { key: 'admins', label: '管理员账号', desc: '后台账号权限', group: '用户管理', permission: 'admin:manage_admins', icon: ShieldCheck },
  { key: 'users', label: '用户账号', desc: '普通/VIP用户', group: '用户管理', permission: 'admin:manage_users', icon: Users },
  { key: 'orders', label: '业务订单', desc: '会员订单状态', group: '业务管理', permission: 'admin:view_orders', icon: ShoppingCart },
  { key: 'aiCalls', label: 'AI调用记录', desc: '模型调用审计', group: '业务管理', permission: 'admin:view_ai_calls', icon: Bot },
  { key: 'resumes', label: '简历资源', desc: '只读查看简历', group: '业务管理', permission: 'admin:view_resumes', icon: FileText },
  { key: 'announcements', label: '公告管理', desc: '运营通知内容', group: '业务管理', permission: 'admin:announcement', icon: Megaphone },
  { key: 'models', label: 'AI模型管理', desc: '模型与VIP限制', group: 'AI模型管理', permission: 'admin:ai_model', icon: Cpu },
  { key: 'plans', label: '会员套餐', desc: 'VIP套餐配置', group: '系统管理', permission: 'admin:membership_plan', icon: Crown },
  { key: 'configs', label: '系统配置', desc: '平台运行参数', group: '系统管理', permission: 'admin:system_config', icon: Settings },
].filter((item) => userStore.hasPermission(item.permission)))

const currentMenu = computed(() => menuItems.value.find((item) => item.key === activeKey.value) || menuItems.value[0])
const roleLabel = computed(() => getRoleLabel(userStore.role))
const vipStatusText = computed(() => getVipStatusText(userStore.userInfo))
const userInitial = computed(() => userStore.userInfo.nickname?.slice(0, 1) || '管')

// 退出登录后跳转登录页
function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen min-w-[1180px] bg-canvas font-sans text-ink">
    <AdminSidebar v-model="activeKey" :menus="menuItems" :keyword="searchKeyword" />

    <main class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-line bg-white/90 px-6 backdrop-blur-xl">
        <div class="min-w-0">
          <p class="text-xs font-medium text-muted">管理中心</p>
          <h1 class="truncate text-lg font-semibold text-ink">{{ currentMenu?.label || '数据中心' }}</h1>
        </div>
        <div class="flex items-center gap-4">
          <a-input
            :value="searchKeyword"
            placeholder="搜索菜单 / 功能"
            allow-clear
            class="w-64"
            @update:value="searchKeyword = $event"
          >
            <template #prefix>
              <Search class="h-4 w-4 text-muted" />
            </template>
          </a-input>
          <a-badge :count="3" size="small">
            <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-slate-100 hover:text-primary">
              <Bell class="h-5 w-5" />
            </button>
          </a-badge>
          <a-tooltip title="暗黑模式即将上线">
            <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-slate-100 hover:text-primary">
              <Moon class="h-5 w-5" />
            </button>
          </a-tooltip>
          <a-dropdown placement="bottomRight">
            <div class="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-slate-100">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-primary">
                {{ userInitial }}
              </div>
              <div class="text-left text-sm">
                <p class="font-medium leading-tight text-ink">{{ roleLabel }}</p>
                <p class="text-xs leading-tight text-muted">{{ vipStatusText }}</p>
              </div>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="router.push('/user')">
                  <span class="flex items-center gap-2">
                    <User class="h-4 w-4" />
                    个人中心
                  </span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <span class="flex items-center gap-2">
                    <LogOut class="h-4 w-4" />
                    退出登录
                  </span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </header>

      <section class="min-w-0 flex-1 overflow-auto p-6">
        <div v-if="activeKey !== 'stats'" class="mb-5 rounded-card bg-white p-5 shadow-soft">
          <p class="text-sm font-medium text-primary">AI简历助手后台</p>
          <h2 class="mt-1 text-xl font-semibold text-ink">{{ currentMenu?.label }} · {{ currentMenu?.desc }}</h2>
        </div>

        <AdminStatsPanel v-if="activeKey === 'stats'" />
        <AdminUsersPanel v-if="activeKey === 'admins'" mode="admins" />
        <AdminUsersPanel v-if="activeKey === 'users'" mode="users" />
        <AdminOrdersPanel v-if="activeKey === 'orders'" />
        <AdminAiCallsPanel v-if="activeKey === 'aiCalls'" />
        <AdminResumesPanel v-if="activeKey === 'resumes'" />
        <AdminConfigsPanel v-if="activeKey === 'configs'" />
        <AdminCrudPanel v-if="activeKey === 'plans'" type="plans" />
        <AdminCrudPanel v-if="activeKey === 'announcements'" type="announcements" />
        <AdminCrudPanel v-if="activeKey === 'models'" type="models" />
      </section>
    </main>
  </div>
</template>
