<!--
  全站顶部导航
  品牌入口、桌面导航、账户菜单与移动端抽屉
-->
<template>
  <LayoutHeader class="app-header">
    <div class="header-glow" aria-hidden="true" />

    <div class="header-inner">
      <button type="button" class="brand-entry" aria-label="返回首页" @click="navTo('/')">
        <!-- <span class="brand-logo-shell">
          <img src="/brand-mark.svg" alt="" class="brand-logo" />
        </span> -->
        <!-- background: var(--gradient-primary);
  background-clip: text;
  color: transparent;
  font-style: normal; -->
        <div
          class="rounded-full  h-[40px]  w-[40px] flex items-center justify-center text-xs text-brand-dark logoText text-[20px] font-bold">
          AI
        </div>
        <span class="brand-copy">
          <span class="brand-name"> AI 简历</span>
          <!-- <span class="brand-slogan">AI RESUME STUDIO</span> -->
        </span>
      </button>

      <nav class="desktop-nav" aria-label="主导航">
        <button v-for="item in visibleNavItems" :key="item.key" type="button" class="desktop-nav-item" :class="{
          'desktop-nav-item--active': selectedKeys.includes(item.key),
          'desktop-nav-item--primary': item.primary,
        }" :aria-current="selectedKeys.includes(item.key) ? 'page' : undefined" @click="navTo(item.path)">
          <span class="nav-icon">
            <component :is="item.icon" />
          </span>
          <span>{{ item.label }}</span>
          <span v-if="item.primary" class="nav-spark" aria-hidden="true" />
        </button>
      </nav>

      <div class="header-actions">
        <template v-if="userStore.isLoggedIn">
          <Dropdown trigger="click" placement="bottomRight" v-if="!isMobile">
            <button type="button" class="account-trigger" aria-label="打开账户菜单">
              <span class="account-avatar">{{ accountInitial }}</span>
              <!-- 移动端不显示账户姓名 -->

              <span class="account-trigger-copy" v-if="!isMobile">
                <b>{{ userStore.userInfo.nickname || "用户" }}</b>
                <small>{{ balanceText }}</small>
              </span>
              <DownOutlined class="account-chevron" />
            </button>

            <template #overlay>
              <div class="account-dropdown">
                <div class="dropdown-profile">
                  <span class="dropdown-avatar">{{ accountInitial }}</span>
                  <div>
                    <b>{{ userStore.userInfo.nickname || "用户" }}</b>
                    <span>{{ getRoleLabel(userStore.role) }}</span>
                  </div>
                </div>

                <div class="dropdown-balance">
                  <span>
                    <WalletOutlined /> 账户余额
                  </span>
                  <strong>{{ balanceText }}</strong>
                </div>

                <button type="button" class="dropdown-action" @click="router.push('/user')">
                  <UserOutlined /><span>进入用户中心</span>
                  <RightOutlined />
                </button>
                <button type="button" class="dropdown-action dropdown-action--danger" @click="handleLogout">
                  <LogoutOutlined /><span>退出登录</span>
                </button>
              </div>
            </template>
          </Dropdown>
        </template>

        <template v-else>
          <button type="button" class="login-link" @click="router.push('/login')">
            登录
          </button>
          <button type="button" class="register-button" @click="router.push('/register')">
            免费体验
            <ArrowRightOutlined />
          </button>
        </template>

        <button type="button" class="mobile-menu-button" aria-label="打开导航菜单" @click="drawerOpen = true">
          <MenuOutlined />
        </button>
      </div>
    </div>

    <Drawer v-model:open="drawerOpen" placement="right" :width="drawerWidth" class="mobile-nav-drawer">
      <template #title>
        <div class="drawer-brand">
          <!-- <span class="brand-logo-shell brand-logo-shell--small">
            <img src="/brand-mark.svg" alt="" class="brand-logo" />
          </span> -->
          <div
            class="rounded-full  h-[40px]  w-[40px] flex items-center justify-center text-xs text-brand-dark logoText text-[20px] font-bold">
            AI
          </div>
          <div><b>AI 简历</b></div>
        </div>
      </template>

      <div v-if="userStore.isLoggedIn" class="drawer-account-card">
        <div class="drawer-account-head">
          <span class="drawer-avatar">{{ accountInitial }}</span>
          <div>
            <b>{{ userStore.userInfo.nickname || "用户" }}</b>
            <span>{{ getRoleLabel(userStore.role) }}</span>
          </div>
        </div>
        <div class="drawer-account-balance">
          <span>账户余额</span><strong>{{ balanceText }}</strong>
        </div>
      </div>

      <p class="drawer-section-label">探索职简</p>
      <nav class="mobile-nav-list" aria-label="移动端主导航">
        <button v-for="item in visibleNavItems" :key="item.key" type="button" class="mobile-nav-item" :class="{
          'mobile-nav-item--active': selectedKeys.includes(item.key),
          'mobile-nav-item--primary': item.primary,
        }" :aria-current="selectedKeys.includes(item.key) ? 'page' : undefined" @click="navToMobile(item.path)">
          <span class="mobile-nav-icon">
            <component :is="item.icon" />
          </span>
          <span class="mobile-nav-copy">
            <b>{{ item.label }}</b>
            <small>{{ item.description }}</small>
          </span>
          <RightOutlined class="mobile-nav-arrow" />
        </button>
      </nav>

      <div v-if="userStore.isLoggedIn" class="drawer-account-actions">
        <button type="button" class="drawer-center-button" @click="navToMobile('/user')">
          <UserOutlined /> 用户中心
        </button>
        <button type="button" class="drawer-logout-button" @click="handleLogout">
          <LogoutOutlined /> 退出登录
        </button>
      </div>

      <div v-else class="drawer-auth-actions">
        <button type="button" class="drawer-register-button" @click="navToMobile('/register')">
          免费开始创作
          <ArrowRightOutlined />
        </button>
        <button type="button" class="drawer-login-button" @click="navToMobile('/login')">
          已有账号，立即登录
        </button>
      </div>
    </Drawer>
  </LayoutHeader>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Dropdown from 'ant-design-vue/es/dropdown'
import Drawer from 'ant-design-vue/es/drawer'
import { LayoutHeader } from 'ant-design-vue/es/layout'
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  DownOutlined,
  FileAddOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  RightOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons-vue";
import { useUserStore } from "@/stores/user";
import { useWalletStore } from "@/stores/wallet";
import { formatBalanceText, getRoleLabel } from "@/constants/roles";
import { useMediaQuery } from '@/composables/useMediaQuery'
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const walletStore = useWalletStore();
const drawerOpen = ref(false);

const drawerWidth = computed(() =>
  typeof window === "undefined" ? 320 : Math.min(340, window.innerWidth),
);
const isMobile = useMediaQuery()



const navItems = [
  { key: "home", label: "首页", description: "发现简历新灵感", path: "/", icon: HomeOutlined },
  {
    key: "templates",
    label: "模板中心",
    description: "精选多行业模板",
    path: "/templates",
    icon: AppstoreOutlined,
  },
  {
    key: "generate",
    label: "AI 创作",
    description: "智能生成专业简历",
    path: "/generate",
    icon: FileAddOutlined,
    primary: true,
  },
  {
    key: "user",
    label: "我的简历",
    description: "管理简历与用量",
    path: "/user",
    icon: UserOutlined,
  },
  {
    key: "admin",
    label: "管理后台",
    description: "系统管理与配置",
    path: "/admin",
    icon: SettingOutlined,
    adminOnly: true,
  },
];

const visibleNavItems = computed(() =>
  navItems.filter((item) => !item.adminOnly || userStore.isAdmin),
);
const balanceText = computed(() => formatBalanceText(walletStore.balance));
const accountInitial = computed(
  () => (userStore.userInfo.nickname || "U").trim().charAt(0).toUpperCase() || "U",
);

const selectedKeys = computed(() => {
  const path = route.path;
  if (path === "/") return ["home"];
  if (path.startsWith("/templates")) return ["templates"];
  if (path.startsWith("/generate") || path.startsWith("/editor")) return ["generate"];
  if (path.startsWith("/user")) return ["user"];
  if (path.startsWith("/admin")) return ["admin"];
  return [];
});

async function refreshBalance() {
  if (!userStore.isLoggedIn) return;
  try {
    await walletStore.fetchBalance();
  } catch {
    // 顶栏余额失败不阻断页面加载，后续进入用户中心仍可重新获取。
  }
}

watch(
  () => userStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) refreshBalance();
    else walletStore.reset();
  },
  { immediate: true },
);

onMounted(refreshBalance);

function navTo(path) {
  const publicPaths = ["/", "/templates"];
  const pathname = path.split("?")[0];
  if (!userStore.isLoggedIn && !publicPaths.includes(pathname)) {
    router.push({ name: "Login", query: { redirect: path } });
    return;
  }
  router.push(path);
}

function navToMobile(path) {
  drawerOpen.value = false;
  navTo(path);
}

function handleLogout() {
  drawerOpen.value = false;
  userStore.logout();
  window.location.href = "/";
}
</script>

<style scoped>
.app-header {
  position: fixed;
  z-index: 50;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  height: 64px;
  align-items: center;
  padding: 0;
  border-bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 20px rgba(79, 172, 254, 0.08);
  line-height: 1;
  backdrop-filter: blur(22px) saturate(1.35);
}

.header-glow {
  display: none;
}

.header-inner {
  position: relative;
  display: grid;
  width: 100%;
  /* max-width: 1400px; */
  height: 100%;
  grid-template-columns: minmax(230px, 1fr) auto minmax(230px, 1fr);
  align-items: center;
  gap: 24px;
  margin: 0 auto;
  padding: 0 24px;
}

.brand-entry {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  justify-self: start;
  gap: 11px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.brand-logo-shell {
  position: relative;
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  box-shadow: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.brand-entry:hover .brand-logo-shell {
  transform: translateY(-1px);
  box-shadow: none;
}

.brand-logo-shell--small {
  width: 38px;
  height: 38px;
  border-radius: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
}

.brand-copy,
.brand-name,
.brand-slogan {
  display: block;
  white-space: nowrap;
}

.brand-name {
  color: #172033;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.logoText {
  margin-right: 3px;
  background: var(--gradient-primary);

  color: #ffffff;
  font-style: normal;
}

.brand-name em {
  margin-right: 3px;
  background: var(--gradient-primary);
  background-clip: text;
  color: transparent;
  font-style: normal;
}

.brand-slogan {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0;
  border: 0;
  background: transparent;
}

.desktop-nav-item {
  position: relative;
  display: inline-flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #667085;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.nav-icon {
  display: inline-flex;
  font-size: 16px;
}

.desktop-nav-item:hover {
  background: linear-gradient(110deg, rgba(0, 212, 255, 0.09), rgba(168, 85, 247, 0.08));
  color: var(--color-brand-dark);
}

.desktop-nav-item--active {
  background: linear-gradient(110deg, rgba(0, 212, 255, 0.15), rgba(79, 172, 254, 0.13) 52%, rgba(168, 85, 247, 0.13));
  color: #2563eb;
  box-shadow: inset 0 0 0 1px rgba(79, 172, 254, 0.09);
}

.desktop-nav-item--active::after {
  display: none;
}

.desktop-nav-item--primary {
  margin-left: 0;
  background: transparent;
  color: #667085;
}

.desktop-nav-item--primary:hover,
.desktop-nav-item--primary.desktop-nav-item--active {
  background: linear-gradient(110deg, rgba(0, 212, 255, 0.15), rgba(79, 172, 254, 0.13) 52%, rgba(168, 85, 247, 0.13));
  color: #2563eb;
}

.nav-spark {
  display: none;
}

.header-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-self: end;
  gap: 8px;
}

.account-trigger {
  display: grid;
  min-width: 164px;
  height: 46px;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 5px 10px 5px 6px;
  /* border: 1px solid rgba(226, 232, 240, 0.9); */
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: 0.2s ease;
}

.account-trigger:hover {
  border-color: rgba(79, 172, 254, 0.42);
  background: #fff;
  box-shadow: 0 8px 22px rgba(79, 172, 254, 0.14);
}

.account-avatar,
.dropdown-avatar,
.drawer-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: var(--gradient-hero);
  color: #fff;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.account-avatar {
  width: 34px;
  height: 34px;
  font-size: 13px;
}

.account-trigger-copy {
  min-width: 0;
}

.account-trigger-copy b,
.account-trigger-copy small {
  display: block;
  max-width: 92px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-trigger-copy b {
  font-size: 14px;
  font-weight: 700;
}

.account-trigger-copy small {
  margin-top: 4px;
  color: #3b82f6;
  font-size: 11px;
  font-weight: 700;
}

.account-chevron {
  color: #94a3b8;
  font-size: 10px;
}

.login-link {
  min-width: 54px;
  height: 44px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.login-link:hover {
  color: #4f46e5;
}

.register-button,
.drawer-register-button {
  display: inline-flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 17px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 13px;
  background: var(--gradient-primary);
  box-shadow: 0 9px 22px rgba(79, 172, 254, 0.24);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 750;
  transition: 0.2s ease;
}

.register-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(79, 172, 254, 0.32);
}

.mobile-menu-button {
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.78);
  color: #334155;
  cursor: pointer;
  font-size: 18px;
}

.account-dropdown {
  width: 300px;
  padding: 14px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 22px 54px rgba(15, 23, 42, 0.17);
  backdrop-filter: blur(20px);
}

.dropdown-profile,
.drawer-account-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 6px 12px;
}

.dropdown-avatar,
.drawer-avatar {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  margin: 0;
  color: #fff;
  font-size: 16px;
  line-height: 1;
  text-align: center;
}

.dropdown-profile b,
.dropdown-profile>div>span,
.drawer-account-head b,
.drawer-account-head>div>span {
  display: block;
}

.dropdown-profile b,
.drawer-account-head b {
  color: #1e293b;
  font-size: 15px;
  line-height: 1.4;
}

.dropdown-profile>div>span,
.drawer-account-head>div>span {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.dropdown-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px 0 9px;
  padding: 12px;
  border: 1px solid rgba(79, 172, 254, 0.25);
  border-radius: 12px;
  background: linear-gradient(110deg, rgba(0, 212, 255, 0.1), rgba(79, 172, 254, 0.08) 52%, rgba(168, 85, 247, 0.08));
}

.dropdown-balance span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 13px;
}

.dropdown-balance strong {
  color: #2563eb;
  font-size: 16px;
}

.dropdown-action {
  display: grid;
  width: 100%;
  min-height: 48px;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}

.dropdown-action:hover {
  background: #f8fafc;
  color: #2563eb;
}

.dropdown-action--danger {
  grid-template-columns: 20px 1fr;
  color: #dc2626;
}

.dropdown-action--danger:hover {
  background: #fff1f2;
  color: #dc2626;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.drawer-brand b,
.drawer-brand small {
  display: block;
}

.drawer-brand b {
  color: #172033;
  font-size: 15px;
}

.drawer-brand small {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 9px;
  letter-spacing: 0.06em;
}

.drawer-account-card {
  margin-bottom: 24px;
  padding: 12px;
  border: 1px solid rgba(79, 172, 254, 0.25);
  border-radius: 16px;
  background: linear-gradient(120deg, rgba(0, 212, 255, 0.11), rgba(79, 172, 254, 0.09) 52%, rgba(168, 85, 247, 0.09));
}

.drawer-account-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 11px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.76);
}

.drawer-account-balance span {
  color: #64748b;
  font-size: 11px;
}

.drawer-account-balance strong {
  color: #2563eb;
  font-size: 14px;
}

.drawer-section-label {
  margin: 0 4px 10px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.mobile-nav-list {
  display: grid;
  gap: 8px;
}

.mobile-nav-item {
  display: grid;
  width: 100%;
  min-height: 58px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 7px 11px 7px 7px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  text-align: left;
}

.mobile-nav-icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #64748b;
}

.mobile-nav-copy,
.mobile-nav-copy b,
.mobile-nav-copy small {
  display: block;
  min-width: 0;
}

.mobile-nav-copy b {
  color: #334155;
  font-size: 13px;
}

.mobile-nav-copy small {
  margin-top: 5px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-nav-arrow {
  color: #cbd5e1;
  font-size: 10px;
}

.mobile-nav-item--active,
.mobile-nav-item--primary {
  border-color: rgba(79, 172, 254, 0.24);
  background: linear-gradient(110deg, rgba(0, 212, 255, 0.1), rgba(79, 172, 254, 0.08) 55%, rgba(168, 85, 247, 0.08));
}

.mobile-nav-item--active .mobile-nav-icon,
.mobile-nav-item--primary .mobile-nav-icon {
  border-color: rgba(79, 172, 254, 0.24);
  background: #fff;
  color: #2563eb;
  box-shadow: 0 5px 14px rgba(79, 172, 254, 0.12);
}

.drawer-account-actions,
.drawer-auth-actions {
  display: grid;
  gap: 9px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.drawer-center-button,
.drawer-logout-button,
.drawer-login-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 11px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.drawer-center-button {
  border: 1px solid #dbeafe;
  background: #eef2ff;
  color: #4f46e5;
}

.drawer-logout-button {
  border: 1px solid #fecdd3;
  background: #fff;
  color: #dc2626;
}

.drawer-register-button {
  width: 100%;
}

.drawer-login-button {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
}

@media (max-width: 1180px) {
  .header-inner {
    grid-template-columns: auto 1fr auto;
    gap: 16px;
  }

  .desktop-nav-item {
    padding: 0 11px;
  }

  .brand-slogan {
    display: none;
  }
}

@media (max-width: 980px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-button {
    display: inline-flex;
  }

  .header-inner {
    display: flex;
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .header-inner {
    gap: 10px;
    padding: 0 14px;
  }

  .brand-entry {
    gap: 8px;
  }

  .brand-logo-shell {
    width: 40px;
    height: 40px;
    border-radius: 13px;
  }

  .brand-logo {
    width: 32px;
    height: 32px;
  }

  .brand-name {
    font-size: 16px;
  }

  .account-trigger {
    width: 44px;
    min-width: 44px;
    height: 44px;
    grid-template-columns: 34px;
    padding: 4px;
  }

  .account-trigger-copy,
  .account-chevron {
    display: none;
  }

  .login-link {
    display: inline-flex;
    min-width: 64px;
    height: 44px;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 13px;
    background: var(--gradient-primary);
    box-shadow: 0 9px 22px rgba(79, 172, 254, 0.24);
    color: #fff;
    font-size: 13px;
  }

  .login-link:hover {
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 12px 26px rgba(79, 172, 254, 0.32);
  }

  .register-button {
    display: none;
  }
}

@media (max-width: 390px) {
  .brand-copy {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {

  .brand-logo-shell,
  .desktop-nav-item,
  .login-link,
  .register-button {
    transition: none;
  }
}
</style>
