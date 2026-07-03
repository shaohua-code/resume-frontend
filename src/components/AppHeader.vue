<!--
  顶部导航栏 - 磨砂玻璃 + 桌面菜单 + 移动端 Drawer
-->
<template>
  <a-layout-header class="glass fixed left-0 right-0 top-0 z-50 flex h-16 items-center px-0 leading-none">
    <div class="mx-auto flex h-full w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
      <div class="mr-4 flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 lg:mr-8" @click="navTo('/')">
        <img src="/vite.svg" alt="AI简历助手" class="h-8 w-8" />
        <span class="text-base font-bold text-brand-dark sm:text-lg">AI 简历助手</span>
      </div>

      <!-- 桌面导航 -->
      <a-menu
        mode="horizontal"
        :selected-keys="selectedKeys"
        class="nav-menu hidden flex-1 border-b-0 bg-transparent lg:flex"
      >
        <a-menu-item key="home" @click="navTo('/')">首页</a-menu-item>
        <a-menu-item key="templates" @click="navTo('/templates')">模板预览</a-menu-item>
        <a-menu-item key="generate" @click="navTo('/generate')">生成简历</a-menu-item>
        <a-menu-item key="upload" @click="navTo('/upload-optimize')">上传优化</a-menu-item>
        <a-menu-item key="user" @click="navTo('/user')">用户中心</a-menu-item>
        <a-menu-item v-if="userStore.isAdmin" key="admin" @click="navTo('/admin')">管理后台</a-menu-item>
      </a-menu>

      <div class="ml-auto flex items-center gap-2">
        <a-button type="text" class="ml-6 hidden text-muted hover:text-brand-dark sm:inline-flex" aria-label="搜索">
          <SearchOutlined class="text-lg" />
        </a-button>

        <div class="ml-6 flex items-center gap-3">
          <template v-if="userStore.isLoggedIn">
            <a-dropdown>
              <a-button type="text" class="flex items-center gap-1.5 rounded-button px-2 py-1.5 hover:bg-brand-lighter sm:px-3">
                <UserOutlined class="text-brand-dark" />
                <span class="hidden max-w-[100px] truncate text-sm font-medium text-ink sm:inline">{{ userStore.userInfo.nickname }}</span>
                <a-tag :color="getRoleColor(userStore.role)" class="ml-1 hidden sm:inline-flex">{{ getRoleLabel(userStore.role) }}</a-tag>
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item disabled>我的角色：{{ getRoleLabel(userStore.role) }}</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="$router.push('/user')"><UserOutlined class="mr-1" /> 个人中心</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="handleLogout"><LogoutOutlined class="mr-1" /> 退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <GradientButton size="small" class="hidden sm:inline-flex" @click="$router.push('/register')">免费开户</GradientButton>
            <GradientButton size="small" ghost @click="$router.push('/login')">登录</GradientButton>
          </template>
        </div>

        <!-- 移动端汉堡菜单 -->
        <a-button type="text" class="text-ink lg:hidden" aria-label="打开菜单" @click="drawerOpen = true">
          <MenuOutlined class="text-lg" />
        </a-button>
      </div>
    </div>

    <a-drawer v-model:open="drawerOpen" placement="right" title="导航菜单" :width="280">
      <a-menu mode="inline" :selected-keys="selectedKeys" class="border-0">
        <a-menu-item key="home" @click="navToMobile('/')">首页</a-menu-item>
        <a-menu-item key="templates" @click="navToMobile('/templates')">模板预览</a-menu-item>
        <a-menu-item key="generate" @click="navToMobile('/generate')">生成简历</a-menu-item>
        <a-menu-item key="upload" @click="navToMobile('/upload-optimize')">上传优化</a-menu-item>
        <a-menu-item key="user" @click="navToMobile('/user')">用户中心</a-menu-item>
        <a-menu-item v-if="userStore.isAdmin" key="admin" @click="navToMobile('/admin')">管理后台</a-menu-item>
      </a-menu>
      <div v-if="!userStore.isLoggedIn" class="mt-6 flex flex-col gap-3">
        <GradientButton block @click="navToMobile('/register')">免费开户</GradientButton>
        <GradientButton block ghost @click="navToMobile('/login')">登录</GradientButton>
      </div>
    </a-drawer>
  </a-layout-header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserOutlined, LogoutOutlined, MenuOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { getRoleColor, getRoleLabel } from '@/constants/roles'
import GradientButton from '@/components/GradientButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const drawerOpen = ref(false)

const selectedKeys = computed(() => {
  const map = {
    '/': ['home'],
    '/templates': ['templates'],
    '/generate': ['generate'],
    '/upload-optimize': ['upload'],
    '/user': ['user'],
    '/admin': ['admin'],
  }
  return map[route.path] || ['home']
})

function navTo(path) {
  const publicPaths = ['/', '/templates']
  if (!userStore.isLoggedIn && !publicPaths.includes(path)) {
    router.push('/login')
  } else {
    router.push(path)
  }
}

function navToMobile(path) {
  drawerOpen.value = false
  navTo(path)
}

function handleLogout() {
  userStore.logout()
  window.location.href = '/'
}
</script>

<style scoped>
:deep(.nav-menu .ant-menu-item) {
  @apply text-sm font-medium text-ink-secondary transition-colors;
}

:deep(.nav-menu .ant-menu-item:hover),
:deep(.nav-menu .ant-menu-item-selected) {
  @apply text-brand-dark;
}

:deep(.nav-menu .ant-menu-item-selected::after) {
  @apply border-b-2 border-brand-dark;
}
</style>
