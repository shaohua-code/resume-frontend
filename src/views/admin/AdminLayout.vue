<script setup>
/**
 * 管理后台布局 - 固定侧栏 + 子路由 outlet
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/composables/useTheme'
import { getRoleLabel } from '@/constants/roles'
import { Search, Bell, Moon, User, LogOut } from 'lucide-vue-next'
import AdminSidebar from './components/AdminSidebar.vue'
import { ADMIN_MENU_ITEMS, getMenuByPath } from './utils/menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { currentTheme } = useTheme()
const searchKeyword = ref('')
const drawerOpen = ref(false)

const menuItems = computed(() =>
  ADMIN_MENU_ITEMS.filter((item) => userStore.hasPermission(item.permission)),
)

const currentMenu = computed(() => getMenuByPath(route.path, menuItems.value))

const roleLabel = computed(() => getRoleLabel(userStore.role))
const userInitial = computed(() => userStore.userInfo.nickname?.slice(0, 1) || '管')
// 后台头像直接绑定当前系统主题，确保切换后不会残留默认青色。
const adminAvatarStyle = computed(() => ({
  backgroundImage: currentTheme.value.gradients.primary,
  boxShadow: currentTheme.value.shadows.soft,
}))

// 子路由权限守卫：无权限时跳转到第一个可访问菜单
watch(
  () => [route.path, menuItems.value],
  () => {
    const permission = route.meta.permission
    if (!permission || menuItems.value.length === 0) return
    if (userStore.hasPermission(permission)) return
    const fallback = menuItems.value[0]
    if (fallback && route.path !== fallback.path) {
      router.replace(fallback.path)
    }
  },
  { immediate: true },
)

function closeDrawer() {
  drawerOpen.value = false
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <a-layout class="h-screen overflow-hidden font-sans bg-cream text-ink">
    <!-- 桌面端固定侧边栏：流式宽度为 0，避免与 ml 叠加产生空隙 -->
    <a-layout-sider :width="248" :collapsed-width="0"
      class="admin-sider fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-line/60 !bg-sidebar lg:block">
      <AdminSidebar :menus="menuItems" :keyword="searchKeyword" @navigate="closeDrawer" />
    </a-layout-sider>

    <a-layout class="flex flex-col h-screen min-w-0 overflow-hidden ">
      <a-layout-header
        class="z-20 flex !h-[72px] !bg-surface shrink-0 items-center justify-between gap-3 border-b border-line/60 px-4 shadow-card sm:px-6">
        <div class="flex items-center min-w-0 gap-3">
          <a-button type="text" class="lg:hidden" @click="drawerOpen = true">
            <MenuOutlined class="text-lg" />
          </a-button>
          <div class="min-w-0">
            <p class="text-xs font-medium text-muted">管理中心</p>
            <h1 class="text-base font-semibold truncate text-ink sm:text-lg">{{ currentMenu?.label || '数据中心' }}</h1>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 sm:gap-3">
          <a-input
            v-model:value="searchKeyword"
            placeholder="搜索菜单"
            allow-clear
            size="small"
            class="hidden admin-search sm:block"
          >
          
          </a-input>
          <a-badge :count="3" size="small" class="hidden sm:inline-flex">
            <button type="button"
              class="flex items-center justify-center transition-colors rounded-full h-9 w-9 text-muted hover:bg-brand-lighter hover:text-brand-dark">
              <Bell class="w-4 h-4" />
            </button>
          </a-badge>
          <a-tooltip title="暗黑模式即将上线">
            <button type="button"
              class="items-center justify-center hidden transition-colors rounded-full h-9 w-9 text-muted hover:bg-brand-lighter hover:text-brand-dark sm:flex">
              <Moon class="w-4 h-4" />
            </button>
          </a-tooltip>
          <a-dropdown placement="bottomRight" overlay-class-name="admin-user-dropdown">
            <div
              class="flex items-center gap-2 py-1 pl-1 pr-2 transition-opacity rounded-full cursor-pointer hover:opacity-90 sm:pr-3">
              <div
                class="flex items-center justify-center text-sm font-semibold text-white rounded-full h-9 w-9"
                :style="adminAvatarStyle">
                {{ userInitial }}
              </div>
              <div class="hidden text-sm text-left sm:block">
                <p class="font-semibold leading-tight text-ink">{{ roleLabel }}</p>
              </div>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="router.push('/user')">
                  <span class="flex items-center gap-2 font-medium text-ink">
                    <User class="w-4 h-4 text-brand-dark" /> 个人中心
                  </span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="handleLogout">
                  <span class="flex items-center gap-2 font-medium text-ink">
                    <LogOut class="w-4 h-4 text-brand-dark" /> 退出登录
                  </span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="flex-1 p-3 overflow-y-auto sm:p-4">
        <router-view />
      </a-layout-content>
    </a-layout>

    <!-- 小屏侧边栏 Drawer -->
    <a-drawer v-model:open="drawerOpen" placement="left" :width="280" :body-style="{ padding: 0 }">
      <AdminSidebar :menus="menuItems" :keyword="searchKeyword" @navigate="closeDrawer" />
    </a-drawer>
  </a-layout>
</template>

<style scoped>
:deep(.admin-sider .ant-layout-sider-children) {
  @apply flex h-full flex-col;
}

:deep(.admin-search) {
  @apply w-[200px];
}

:deep(.admin-search .ant-input-affix-wrapper) {
  @apply flex h-[35px] flex-nowrap items-center rounded-full border border-line/60 bg-canvas/50 px-3 py-0;
}

:deep(.admin-search .ant-input-affix-wrapper:hover),
:deep(.admin-search .ant-input-affix-wrapper-focused) {
  @apply border-brand/40 bg-surface;
}

:deep(.admin-search .ant-input) {
  @apply h-[33px] leading-[33px];
}

:deep(.admin-search .ant-input-prefix),
:deep(.admin-search .ant-input-suffix) {
 display: none;
}
:deep(.ant-input-affix-wrapper::before) {
  display: none;
}
:deep(.admin-search .ant-input-prefix) {
  @apply mr-1.5;
}
</style>

<style>
/* 用户下拉：文字鲜明，hover 无背景 */
.admin-user-dropdown .ant-dropdown-menu {
  border-radius: var(--radius-button);
  border: 1px solid var(--color-line);
  padding: 4px 0;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.admin-user-dropdown .ant-dropdown-menu-item {
  font-weight: 500;
  color: var(--color-ink);
}

.admin-user-dropdown .ant-dropdown-menu-item:hover,
.admin-user-dropdown .ant-dropdown-menu-item-active {
  background-color: var(--color-brand-lighter) !important;
  color: var(--color-brand-dark);
}

:deep(.ant-layout-header) {
  background-color: var(--color-surface);
  height: 72px;
}

</style>
