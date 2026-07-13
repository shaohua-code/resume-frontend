<!--
  顶部导航栏 - 磨砂玻璃 + 桌面菜单 + 移动端 Drawer
-->
<template>
  <a-layout-header class="fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-0 leading-none glass">
    <div class="flex items-center w-full h-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center gap-2 mr-4 transition-opacity cursor-pointer hover:opacity-80 lg:mr-8"
        @click="navTo('/')">
        <img src="/brand-mark.svg" alt="AI简历助手" class="w-8 h-8" />
        <span class="text-base font-bold text-brand-dark sm:text-lg">AI 简历助手</span>
      </div>

      <!-- 桌面导航 -->
      <a-menu mode="horizontal" :selected-keys="selectedKeys"
        class="flex-1 hidden bg-transparent border-b-0 nav-menu lg:flex">
        <a-menu-item key="home" @click="navTo('/')">首页</a-menu-item>
        <a-menu-item key="templates" @click="navTo('/templates')">模板预览</a-menu-item>
        <a-menu-item key="generate" @click="navTo('/generate')">生成简历</a-menu-item>
        <a-menu-item key="user" @click="navTo('/user')">用户中心</a-menu-item>
        <a-menu-item v-if="userStore.isAdmin" key="admin" @click="navTo('/admin')">管理后台</a-menu-item>
      </a-menu>

      <div class="flex items-center gap-2 ml-auto">


        <div class="flex items-center gap-3 ml-6">
          <template v-if="userStore.isLoggedIn">
            <!-- <span class="hidden text-sm font-semibold text-brand-dark sm:inline">{{ balanceText }}</span> -->
            <a-dropdown>
              <div class="flex items-center gap-1.5 rounded-button px-2 py-1.5 cursor-pointer sm:px-3">
                <UserOutlined class="text-brand-dark" />
                <span class="hidden max-w-[100px] truncate text-sm font-medium text-ink sm:inline">{{
                  userStore.userInfo.nickname }}</span>
                <a-tag :color="getRoleColor(userStore.role)" class="hidden ml-1 sm:inline-flex">{{
                  getRoleLabel(userStore.role) }}</a-tag>
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item disabled>账户余额：<span class="text-danger">{{ balanceText }}</span></a-menu-item>
                  <!-- <a-menu-item disabled>我的角色：{{ getRoleLabel(userStore.role) }}</a-menu-item> -->
                  <a-menu-divider />
                  <a-menu-item @click="$router.push('/user')">
                    <UserOutlined class="mr-1" /> 个人中心
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="handleLogout">
                    <LogoutOutlined class="mr-1" /> 退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <GradientButton  class="hidden sm:inline-flex" @click="$router.push('/register')">免费开户
            </GradientButton>
            <GradientButton  ghost @click="$router.push('/login')">登录</GradientButton>
          </template>
        </div>

        <!-- 移动端汉堡菜单 -->
        <a-button type="text" class="text-ink lg:hidden flex justify-center items-center" aria-label="打开菜单" @click="drawerOpen = true">   
          <MenuOutlined class="text-lg" />
        </a-button>
      </div>
    </div>

    <a-drawer v-model:open="drawerOpen" placement="right" title="导航菜单" :width="280">
      <a-menu mode="inline" :selected-keys="selectedKeys" class="border-0">
        <a-menu-item key="home" @click="navToMobile('/')">首页</a-menu-item>
        <a-menu-item key="templates" @click="navToMobile('/templates')">模板预览</a-menu-item>
        <a-menu-item key="generate" @click="navToMobile('/generate')">生成简历</a-menu-item>
        <a-menu-item key="user" @click="navToMobile('/user')">用户中心</a-menu-item>
        <a-menu-item v-if="userStore.isAdmin" key="admin" @click="navToMobile('/admin')">管理后台</a-menu-item>
      </a-menu>
      <div v-if="!userStore.isLoggedIn" class="flex flex-col gap-3 mt-6">
        <GradientButton @click="navToMobile('/register')">免费开户</GradientButton>
        <GradientButton ghost @click="navToMobile('/login')">登录</GradientButton>
      </div>
    </a-drawer>
  </a-layout-header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { getRoleColor, getRoleLabel, formatBalanceText } from '@/constants/roles'
import GradientButton from '@/components/GradientButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const drawerOpen = ref(false)

const balanceText = computed(() => formatBalanceText(walletStore.balance))

// 登录后拉取余额，路由变化时刷新
async function refreshBalance() {
  if (!userStore.isLoggedIn) return
  try {
    await walletStore.fetchBalance()
  } catch {
    // 忽略未登录或网络错误
  }
}

watch(() => userStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) refreshBalance()
  else walletStore.reset()
}, { immediate: true })

onMounted(refreshBalance)

const selectedKeys = computed(() => {
  const map = {
    '/': ['home'],
    '/templates': ['templates'],
    '/generate': ['generate'],
    '/user': ['user'],
    '/admin': ['admin'],
  }
  return map[route.path] || ['home']
})

function navTo(path) {
  const publicPaths = ['/', '/templates']
  const pathname = path.split('?')[0]
  if (!userStore.isLoggedIn && !publicPaths.includes(pathname)) {
    router.push({ name: 'Login', query: { redirect: path } })
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
