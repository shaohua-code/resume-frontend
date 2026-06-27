<!--
  顶部导航栏组件
  包含Logo、导航菜单、用户登录状态显示
-->
<template>
  <a-layout-header class="app-header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        <img src="/vite.svg" alt="AI简历助手" class="logo-icon" />
        <span class="logo-text">AI简历助手</span>
      </div>
      <a-menu mode="horizontal" :selectedKeys="selectedKeys" class="nav-menu">
        <a-menu-item key="home" @click="navTo('/')">首页</a-menu-item>
        <a-menu-item key="generate" @click="navTo('/generate')">生成简历</a-menu-item>
        <a-menu-item key="upload" @click="navTo('/upload-optimize')">上传优化</a-menu-item>
        <a-menu-item key="user" @click="navTo('/user')">用户中心</a-menu-item>
        <a-menu-item v-if="userStore.isAdmin" key="admin" @click="navTo('/admin')">管理后台</a-menu-item>
      </a-menu>
      <div class="header-right">
        <template v-if="userStore.isLoggedIn">
          <a-dropdown>
            <a-button type="text" class="user-btn">
              <UserOutlined />
              <span class="user-name">{{ userStore.userInfo.nickname }}</span>
              <a-tag :color="getRoleColor(userStore.role)" style="margin-left: 8px">{{ getRoleLabel(userStore.role) }}</a-tag>
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item disabled>
                  我的角色：{{ getRoleLabel(userStore.role) }}
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="$router.push('/user')">
                  <UserOutlined /> 个人中心
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <template v-else>
          <a-button type="primary" @click="$router.push('/login')">登录</a-button>
        </template>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { getRoleColor, getRoleLabel } from '@/constants/roles'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedKeys = computed(() => {
  const map = { '/': ['home'], '/generate': ['generate'], '/upload-optimize': ['upload'], '/user': ['user'], '/admin': ['admin'] }
  return map[route.path] || ['home']
})

function navTo(path) {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  } else {
    router.push(path)
  }
}

function handleLogout() {
  userStore.logout()
  window.location.href = '/'
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 64px;
  line-height: 64px;
}
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 40px;
}
.logo-icon {
  width: 32px;
  height: 32px;
}
.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  margin-left: 8px;
}
.nav-menu {
  flex: 1;
  border-bottom: none;
  line-height: 62px;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-btn {
  display: flex;
  align-items: center;
}
.user-name {
  margin-left: 4px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
