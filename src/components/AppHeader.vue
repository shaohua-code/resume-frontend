<!--
  顶部导航栏
  统一品牌入口、桌面胶囊导航、账户菜单与移动端抽屉
-->
<template>
  <a-layout-header class="app-header">
    <div class="justify-between header-inner">
      <button
        type="button"
        class="brand-entry"
        aria-label="返回首页"
        @click="navTo('/')"
      >
        <span class="brand-mark-wrap">
          <img src="/brand-mark.svg" alt="" class="brand-mark" />
        </span>
        <span class="brand-copy">
          <b>AI 简历助手</b>
          <small>AI RESUME STUDIO</small>
        </span>
      </button>

      <nav class="desktop-nav" aria-label="主导航">
        <button
          v-for="item in visibleNavItems"
          :key="item.key"
          type="button"
          class="desktop-nav-item"
          :class="{
            'desktop-nav-item--active': selectedKeys.includes(item.key),
          }"
          @click="navTo(item.path)"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="header-actions">
        <template v-if="userStore.isLoggedIn">
          <a-dropdown trigger="click" placement="bottomRight">
            <button type="button" class="account-trigger">
              <span class="account-avatar">{{ accountInitial }}</span>
              <span class="account-trigger-copy">
                <b>{{ userStore.userInfo.nickname || "用户" }}</b>
                <!-- <small>{{ balanceText }}</small> -->
              </span>
              <DownOutlined class="account-chevron" />
            </button>
            <template #overlay>
              <div class="account-dropdown">
                <div class="dropdown-profile">
                  <a-image
                    src="../../public/demo-avatar.svg"
                    alt=""
                    width="40px"
                    height="40px"
                    class="inline-block"
                    style="border-radius: 40px"
                  />  
                  <div>
                    <b>{{ userStore.userInfo.nickname || "用户" }}</b>
                    <span>{{ getRoleLabel(userStore.role) }}</span>
                  </div>
                </div>
                <div class="dropdown-balance">
                  <span><WalletOutlined /> 账户余额</span>
                  <strong>{{ balanceText }}</strong>
                </div>
                <button
                  type="button"
                  class="dropdown-action"
                  @click="router.push('/user')"
                >
                  <UserOutlined /><span>进入用户中心</span><RightOutlined />
                </button>
                <button
                  type="button"
                  class="dropdown-action dropdown-action--danger"
                  @click="handleLogout"
                >
                  <LogoutOutlined /><span>退出登录</span>
                </button>
              </div>
            </template>
          </a-dropdown>
        </template>

        <template v-else>
          <button
            type="button"
            class="register-link"
            @click="router.push('/register')"
          >
            免费开户
          </button>
          <GradientButton
            ghost
            class="login-button"
            @click="router.push('/login')"
            >登录</GradientButton
          >
        </template>

        <button
          type="button"
          class="mobile-menu-button"
          aria-label="打开导航菜单"
          @click="drawerOpen = true"
        >
          <MenuOutlined />
        </button>
      </div>
    </div>

    <a-drawer
      v-model:open="drawerOpen"
      placement="right"
      :width="300"
      class="mobile-nav-drawer"
    >
      <template #title>
        <div class="drawer-brand">
          <span class="brand-mark-wrap brand-mark-wrap--small">
            <img src="/brand-mark.svg" alt="" class="brand-mark" />
          </span>
          <div><b>AI 简历助手</b><small>导航与账户</small></div>
        </div>
      </template>

      <div v-if="userStore.isLoggedIn" class="drawer-account-card">
        <div class="drawer-account-head">
          <a-image
            src="../../public/demo-avatar.svg"
            alt=""
            width="40px"
            height="40px"
            class="inline-block"
            style="border-radius: 40px"
          />
          <div>
            <b>{{ userStore.userInfo.nickname || "用户" }}</b>
            <span>{{ getRoleLabel(userStore.role) }}</span>
          </div>
        </div>
        <div class="drawer-account-balance">
          <span>账户余额</span><strong>{{ balanceText }}</strong>
        </div>
      </div>

      <p class="drawer-section-label">页面导航</p>
      <nav class="mobile-nav-list" aria-label="移动端主导航">
        <button
          v-for="item in visibleNavItems"
          :key="item.key"
          type="button"
          class="mobile-nav-item"
          :class="{
            'mobile-nav-item--active': selectedKeys.includes(item.key),
          }"
          @click="navToMobile(item.path)"
        >
          <span><component :is="item.icon" /></span>
          <b>{{ item.label }}</b>
          <RightOutlined />
        </button>
      </nav>

      <div v-if="userStore.isLoggedIn" class="drawer-account-actions">
        <button
          type="button"
          class="drawer-center-button"
          @click="navToMobile('/user')"
        >
          <UserOutlined /> 用户中心
        </button>
        <button
          type="button"
          class="drawer-logout-button"
          @click="handleLogout"
        >
          <LogoutOutlined /> 退出登录
        </button>
      </div>

      <div v-else class="drawer-auth-actions">
        <GradientButton @click="navToMobile('/register')"
          >免费开户</GradientButton
        >
        <GradientButton ghost @click="navToMobile('/login')"
          >登录</GradientButton
        >
      </div>
    </a-drawer>
  </a-layout-header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  HomeOutlined,
  AppstoreOutlined,
  FileAddOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  WalletOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";
import { useUserStore } from "@/stores/user";
import { useWalletStore } from "@/stores/wallet";
import { getRoleLabel, formatBalanceText } from "@/constants/roles";
import GradientButton from "@/components/GradientButton.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const walletStore = useWalletStore();
const drawerOpen = ref(false);

const navItems = [
  { key: "home", label: "首页", path: "/", icon: HomeOutlined },
  {
    key: "templates",
    label: "模板预览",
    path: "/templates",
    icon: AppstoreOutlined,
  },
  {
    key: "generate",
    label: "生成简历",
    path: "/generate",
    icon: FileAddOutlined,
    primary: true,
  },
  { key: "user", label: "用户中心", path: "/user", icon: UserOutlined },
  {
    key: "admin",
    label: "管理后台",
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
  () =>
    (userStore.userInfo.nickname || "U").trim().charAt(0).toUpperCase() || "U",
);

async function refreshBalance() {
  if (!userStore.isLoggedIn) return;
  try {
    await walletStore.fetchBalance();
  } catch {
    // 忽略未登录或网络错误
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

const selectedKeys = computed(() => {
  const path = route.path;
  if (path === "/") return ["home"];
  if (path.startsWith("/templates")) return ["templates"];
  if (path.startsWith("/generate") || path.startsWith("/editor"))
    return ["generate"];
  if (path.startsWith("/user")) return ["user"];
  if (path.startsWith("/admin")) return ["admin"];
  return ["home"];
});

function navTo(path) {
  const publicPaths = ["/", "/templates"];
  const pathname = path.split("?")[0];
  if (!userStore.isLoggedIn && !publicPaths.includes(pathname)) {
    router.push({ name: "Login", query: { redirect: path } });
  } else {
    router.push(path);
  }
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
  border-bottom: 1px solid rgba(226, 232, 240, 0.76);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.055);
  line-height: 1;
  backdrop-filter: blur(18px) saturate(1.3);
}

.header-accent {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #06b6d4, #4f46e5 52%, #a855f7);
  opacity: 0.88;
  pointer-events: none;
}

.header-inner {
  display: flex;
  width: 100%;
  max-width: 1280px;
  height: 100%;
  align-items: center;
  gap: 22px;
  margin: 0 auto;
  padding: 0 24px;
}

.brand-entry {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.brand-mark-wrap {
  position: relative;
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(186, 230, 253, 0.9);
  border-radius: 12px;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
  box-shadow: 0 6px 18px rgba(8, 145, 178, 0.12);
}

.brand-mark-wrap::after {
  content: "";
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 6px;
  height: 6px;
  border: 1px solid white;
  border-radius: 50%;
  background: #22c55e;
}

.brand-mark-wrap--small {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.brand-mark {
  width: 25px;
  height: 25px;
}

.brand-copy b,
.brand-copy small {
  display: block;
  white-space: nowrap;
}

.brand-copy b {
  color: #143248;
  font-size: 16px;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.brand-copy small {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.17em;
}

.desktop-nav {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(226, 232, 240, 0.75);
  border-radius: 13px;
  background: rgba(248, 250, 252, 0.72);
}

.desktop-nav-item {
  position: relative;
  display: inline-flex;
  height: 36px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 13px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
  transition: 0.2s ease;
  white-space: nowrap;
}

.desktop-nav-item:hover {
  background: white;
  color: #0e7490;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.desktop-nav-item--active {
  background: white;
  color: #0e7490;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.07);
}

.desktop-nav-item--active::after {
  content: "";
  position: absolute;
  right: 13px;
  bottom: 3px;
  left: 13px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #06b6d4, #6366f1);
}

.desktop-nav-item--primary {
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
  color: #0e7490;
}

.desktop-nav-item--primary i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}

.header-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.account-trigger {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  min-width: 150px;
  height: 44px;
  align-items: center;
  gap: 8px;
  padding: 4px 9px 4px 5px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: 0.2s ease;
}

.account-trigger:hover {
  border-color: #bae6fd;
  background: white;
  box-shadow: 0 7px 20px rgba(14, 116, 144, 0.1);
}

.account-avatar,
.dropdown-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #0891b2, #4f46e5 58%, #a855f7);
  color: white;
  font-weight: 800;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-trigger-copy b {
  max-width: 82px;
  font-size: 12px;
  font-weight: 750;
}

.account-trigger-copy small {
  margin-top: 3px;
  color: #0e7490;
  font-size: 10px;
  font-weight: 700;
}

.account-chevron {
  color: #94a3b8;
  font-size: 10px;
}

.register-link {
  height: 40px;
  padding: 0 10px;
  border: 0;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.register-link:hover {
  color: #0e7490;
}
.login-button {
  min-width: 72px;
}

.mobile-menu-button {
  display: none;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.72);
  color: #334155;
  cursor: pointer;
  font-size: 18px;
}

.account-dropdown {
  width: 260px;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(18px);
}

.dropdown-profile,
.drawer-account-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

.dropdown-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
}

.dropdown-profile b,
.dropdown-profile span,
.drawer-account-head b,
.drawer-account-head span {
  display: block;
}

.dropdown-profile b,
.drawer-account-head b {
  color: #1e293b;
  font-size: 13px;
}

.dropdown-profile span,
.drawer-account-head span {
  margin-top: 4px;
  color: #64748b;
  font-size: 10px;
}

.dropdown-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 8px;
  padding: 10px 11px;
  border: 1px solid #bae6fd;
  border-radius: 11px;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
}

.dropdown-balance span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 11px;
}

.dropdown-balance strong {
  color: #0e7490;
  font-size: 14px;
}

.dropdown-action {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
  text-align: left;
}

.dropdown-action:hover {
  background: #f8fafc;
  color: #0e7490;
}
.dropdown-action--danger {
  grid-template-columns: 20px 1fr;
  color: #dc2626;
}
.dropdown-action--danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.drawer-brand b,
.drawer-brand small {
  display: block;
}

.drawer-brand b {
  color: #143248;
  font-size: 14px;
}
.drawer-brand small {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 9px;
  letter-spacing: 0.1em;
}

.drawer-account-card {
  margin-bottom: 22px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
}

.drawer-account-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding: 9px 10px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.76);
}

.drawer-account-balance span {
  color: #64748b;
  font-size: 11px;
}
.drawer-account-balance strong {
  color: #0e7490;
  font-size: 14px;
}

.drawer-section-label {
  margin: 0 4px 8px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.mobile-nav-list {
  display: grid;
  gap: 7px;
}

.mobile-nav-item {
  display: grid;
  grid-template-columns: 38px 1fr auto;
  min-height: 52px;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 7px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  text-align: left;
}

.mobile-nav-item > span {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
}

.mobile-nav-item b {
  font-size: 13px;
}
.mobile-nav-item > :last-child {
  color: #94a3b8;
  font-size: 10px;
}
.mobile-nav-item--active {
  border-color: #bae6fd;
  background: #ecfeff;
  color: #0e7490;
}
.mobile-nav-item--primary:not(.mobile-nav-item--active) {
  background: #f8fafc;
}

.drawer-account-actions,
.drawer-auth-actions {
  display: grid;
  gap: 9px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.drawer-center-button,
.drawer-logout-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.drawer-center-button {
  border: 1px solid #bae6fd;
  background: #ecfeff;
  color: #0e7490;
}
.drawer-logout-button {
  border: 1px solid #fecaca;
  background: #fff;
  color: #dc2626;
}

/* Minimal header theme */
.app-header {
  height: 60px;
  opacity: 0.8;
  border-bottom-color: #e8edf3;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: none;
  backdrop-filter: blur(12px);
}

.header-inner {
  max-width: 1200px;
  gap: 28px;
  padding: 0 28px;
}

.brand-entry {
  gap: 9px;
}

.brand-mark-wrap {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: #f1f5f9;
  box-shadow: none;
}

.brand-mark-wrap::after {
  display: none;
}

.brand-mark {
  width: 22px;
  height: 22px;
}

.brand-copy b {
  color: #172033;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
}

.brand-copy small {
  display: none;
}

.desktop-nav {
  gap: 8px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.desktop-nav-item {
  height: 34px;
  gap: 5px;
  padding: 0 11px;
  border-radius: 7px;
  color: #667085;
  font-weight: 500;
}

.desktop-nav-item:hover {
  background: #f6f8fa;
  color: #1d2939;
  box-shadow: none;
}

.desktop-nav-item--active,
.desktop-nav-item--primary {
  background: #f1f5f9;
  color: #2563eb;
  box-shadow: none;
}

.desktop-nav-item--active::after,
.desktop-nav-item--primary i {
  display: none;
}

.header-actions {
  gap: 6px;
}

.account-trigger {
  min-width: 138px;
  height: 38px;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 7px;
  padding: 4px 9px 4px 5px;
  border-color: transparent;
  border-radius: 8px;
  background: transparent;
}

.account-trigger:hover {
  border-color: transparent;
  background: #f6f8fa;
  box-shadow: none;
}

.account-avatar,
.dropdown-avatar {
  border-radius: 50%;
  background: #2563eb;
}

.account-avatar {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.account-trigger-copy b {
  font-weight: 600;
}

.account-trigger-copy small {
  color: #667085;
  font-weight: 500;
}

.register-link {
  color: #667085;
  font-weight: 500;
}

.register-link:hover {
  color: #2563eb;
}

.mobile-menu-button {
  width: 38px;
  height: 38px;
  border-color: transparent;
  border-radius: 8px;
  background: transparent;
}

.mobile-menu-button:hover {
  background: #f6f8fa;
}

.account-dropdown {
  border-color: #e8edf3;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
  backdrop-filter: none;
}

.dropdown-balance,
.drawer-account-card {
  border-color: #e8edf3;
  background: #f8fafc;
}

.dropdown-balance strong,
.drawer-account-balance strong {
  color: #2563eb;
}

.mobile-nav-item--active {
  border-color: #e2e8f0;
  background: #f1f5f9;
  color: #2563eb;
}

@media (max-width: 1120px) {
  .desktop-nav-item {
    padding: 0 9px;
  }
  .desktop-nav-item svg {
    display: none;
  }
  .brand-copy small {
    display: none;
  }
}

@media (max-width: 960px) {
  .desktop-nav {
    display: none;
  }
  .mobile-menu-button {
    display: inline-flex;
  }
  .header-inner {
    gap: 14px;
  }
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0 14px;
  }
  .brand-entry {
    gap: 8px;
  }
  .brand-mark-wrap {
    width: 36px;
    height: 36px;
  }
  .brand-copy b {
    font-size: 14px;
  }
  .account-trigger {
    min-width: 42px;
    width: 42px;
    height: 42px;
    grid-template-columns: 32px;
    padding: 4px;
  }
  .account-avatar {
    width: 32px;
    height: 32px;
  }
  .account-trigger-copy,
  .account-chevron {
    display: none;
  }
  .register-link {
    display: none;
  }
  .login-button {
    min-width: 64px;
  }
}

@media (max-width: 390px) {
  .brand-copy {
    display: none;
  }
}
</style>
