<script setup>
/**
 * 全站顶部导航
 * 品牌入口、桌面导航、账户菜单与移动端抽屉（样式全部使用 Tailwind）
 */
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Dropdown from "ant-design-vue/es/dropdown";
import Drawer from "ant-design-vue/es/drawer";
import { LayoutHeader } from "ant-design-vue/es/layout";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BgColorsOutlined,
  CheckOutlined,
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
import { useMediaQuery } from "@/composables/useMediaQuery";
import { useTheme } from "@/composables/useTheme";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const walletStore = useWalletStore();
const drawerOpen = ref(false);
const accountThemePanelOpen = ref(false);
const isMobile = useMediaQuery();
const {
  currentThemeKey,
  currentTheme,
  currentThemeName,
  themeOptions,
  setTheme,
} = useTheme();

const drawerWidth = computed(() =>
  typeof window === "undefined" ? 320 : Math.min(340, window.innerWidth),
);

const navItems = [
  {
    key: "home",
    label: "首页",
    description: "发现简历新灵感",
    path: "/",
    icon: HomeOutlined,
  },
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
    label: "我的求职",
    description: "简历、收藏与求职进度",
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
  () =>
    (userStore.userInfo.nickname || "U").trim().charAt(0).toUpperCase() || "U",
);
// 账户入口与下拉头像直接使用当前主题渐变，防止跨页面时保留默认主题色。
const accountAvatarStyle = computed(() => ({
  backgroundImage: currentTheme.value.gradients.hero,
  boxShadow: currentTheme.value.shadows.soft,
}));

const selectedKeys = computed(() => {
  const path = route.path;
  if (path === "/") return ["home"];
  if (path.startsWith("/templates")) return ["templates"];
  if (path.startsWith("/generate") || path.startsWith("/editor"))
    return ["generate"];
  if (path.startsWith("/user")) return ["user"];
  if (path.startsWith("/admin")) return ["admin"];
  return [];
});

/** 桌面导航项：仅当前路由高亮，primary 不再默认选中 */
function desktopNavClass(item) {
  const active = selectedKeys.value.includes(item.key);
  return [
    "relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border-0 bg-transparent px-3 text-[15px] font-semibold leading-none whitespace-nowrap transition-all duration-200 ease-smooth xl:px-4",
    "text-ink-secondary hover:bg-brand-lighter/55 hover:text-brand-dark",
    active
      ? "bg-brand-lighter/75 text-brand-dark shadow-soft"
      : "",
  ];
}

/** 移动端导航项：仅 active 时高亮 */
function mobileNavClass(item) {
  const active = selectedKeys.value.includes(item.key);
  return [
    "grid w-full min-h-[58px] grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[14px] border border-transparent bg-transparent py-1.5 pr-2.5 pl-1.5 text-left text-ink-secondary",
    active
      ? "border-brand/25 bg-brand-lighter/55"
      : "",
  ];
}

function mobileNavIconClass(item) {
  const active = selectedKeys.value.includes(item.key);
  return [
    "inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line bg-surface text-ink-secondary",
    active
      ? "border-brand/25 text-brand-dark shadow-soft"
      : "",
  ];
}

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

function chooseTheme(themeKey) {
  setTheme(themeKey);
  accountThemePanelOpen.value = false;
}

function handleLogout() {
  drawerOpen.value = false;
  userStore.logout();
  window.location.href = "/";
}
</script>

<template>
  <LayoutHeader
    class="app-header-glass fixed inset-x-0 top-0 z-50 flex h-16 items-center border-0 p-0 leading-none shadow-soft"
  >
    <div
      class="relative mx-auto grid h-full w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 px-3.5 sm:gap-4 sm:px-6 lg:grid-cols-[minmax(230px,1fr)_auto_minmax(230px,1fr)] lg:gap-6"
    >
      <button
        type="button"
        class="inline-flex min-w-0 items-center justify-self-start gap-2 border-0 bg-transparent p-0 text-left sm:gap-2.5"
        aria-label="返回首页"
        @click="navTo('/')"
      >
        <div
          class="mr-0.5 flex h-[35px] w-[35px] items-center justify-center rounded-full [background-image:var(--gradient-primary)] text-[20px] font-bold text-white"
        >
        <span class="text-[20px] font-bold">AI</span>
        
        </div>
        <span class="block whitespace-nowrap max-[390px]:hidden">
          <span
            class="block text-base font-extrabold tracking-tight text-ink sm:text-[19px]"
          >
            AI 简历
          </span>
        </span>
      </button>

      <nav
        class="hidden items-center justify-center gap-0.5 bg-transparent p-0 lg:flex"
        aria-label="主导航"
      >
        <button
          v-for="item in visibleNavItems"
          :key="item.key"
          type="button"
          :class="desktopNavClass(item)"
          :aria-current="selectedKeys.includes(item.key) ? 'page' : undefined"
          @click="navTo(item.path)"
        >
          <span class="inline-flex text-base">
            <component :is="item.icon" />
          </span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="flex min-w-0 items-center justify-self-end gap-2">
        <template v-if="userStore.isLoggedIn">
          <Dropdown v-if="!isMobile" trigger="click" placement="bottomRight">
            <button
              type="button"
              class="grid h-11 min-w-[164px] grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2 rounded-[14px] border-0 bg-surface/70 py-1 pr-2.5 pl-1.5 text-left text-ink transition duration-200 ease-smooth hover:bg-surface hover:shadow-soft"
              aria-label="打开账户菜单"
            >
              <span
                class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-[13px] font-extrabold text-white"
                :style="accountAvatarStyle"
              >
                {{ accountInitial }}
              </span>
              <span class="min-w-0">
                <b class="block max-w-[92px] truncate text-sm font-bold">
                  {{ userStore.userInfo.nickname || "用户" }}
                </b>
                <small
                  class="mt-1 block max-w-[92px] truncate text-[11px] font-bold text-brand-dark"
                >
                  {{ balanceText }}
                </small>
              </span>
              <DownOutlined class="text-[10px] text-muted" />
            </button>

            <template #overlay>
              <div
                class="w-[320px] rounded-[18px] border border-line/90 bg-surface/95 p-3.5 shadow-lift backdrop-blur-[var(--glass-blur)]"
              >
                <div class="flex items-center gap-3 px-1.5 pt-2 pb-3">
                  <span
                    class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[11px] text-base font-extrabold text-white"
                    :style="accountAvatarStyle"
                  >
                    {{ accountInitial }}
                  </span>
                  <div>
                    <b class="block text-[15px] leading-snug text-ink">
                      {{ userStore.userInfo.nickname || "用户" }}
                    </b>
                    <span
                      class="mt-1 block text-xs leading-snug text-ink-secondary"
                    >
                      {{ getRoleLabel(userStore.role) }}
                    </span>
                  </div>
                </div>

                <div
                  class="my-1 mb-2 flex items-center justify-between rounded-xl border border-brand/25 bg-brand-lighter/55 p-3"
                >
                  <span
                    class="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary"
                  >
                    <WalletOutlined /> 账户余额
                  </span>
                  <strong class="text-base text-brand-dark">{{
                    balanceText
                  }}</strong>
                </div>

                <button
                  type="button"
                  class="grid min-h-12 w-full grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 rounded-[10px] border-0 bg-transparent px-2.5 text-left text-ink-secondary transition-colors hover:bg-canvas hover:text-brand-dark"
                  :aria-expanded="accountThemePanelOpen"
                  aria-controls="desktop-account-theme-panel"
                  @click.stop="accountThemePanelOpen = !accountThemePanelOpen"
                >
                  <BgColorsOutlined />
                  <span class="min-w-0">
                    <b class="block text-sm font-medium">界面主题</b>
                    <small class="mt-0.5 block truncate text-[11px] text-muted">
                      {{ currentThemeName }}
                    </small>
                  </span>
                  <RightOutlined
                    class="text-[10px] transition-transform"
                    :class="accountThemePanelOpen ? 'rotate-90 text-brand-dark' : ''"
                  />
                </button>

                <div
                  v-if="accountThemePanelOpen"
                  id="desktop-account-theme-panel"
                  class="mb-2 grid max-h-[326px] gap-1.5 overflow-y-auto rounded-[14px] border border-line bg-canvas/65 p-2"
                  role="group"
                  aria-label="选择界面主题"
                >
                  <button
                    v-for="theme in themeOptions"
                    :key="theme.key"
                    type="button"
                    class="grid min-h-[58px] w-full grid-cols-[46px_minmax(0,1fr)_18px] items-center gap-2.5 rounded-xl border border-transparent bg-surface px-2.5 py-1.5 text-left transition-all hover:border-brand/25 hover:shadow-soft"
                    :class="currentThemeKey === theme.key ? 'border-brand/35 bg-brand-lighter/65' : ''"
                    :aria-pressed="currentThemeKey === theme.key"
                    @click.stop="chooseTheme(theme.key)"
                  >
                    <span
                      class="relative h-8 w-[42px] overflow-hidden border"
                      :style="{
                        background: theme.preview.background,
                        borderColor: theme.preview.border,
                        borderRadius: theme.preview.radius,
                        boxShadow: theme.preview.shadow,
                      }"
                      aria-hidden="true"
                    >
                      <span
                        class="absolute inset-x-1 top-1 h-1.5 rounded-full"
                        :style="{ background: theme.preview.gradient }"
                      />
                      <span
                        class="absolute bottom-1 left-1 h-3.5 w-6 border"
                        :style="{
                          background: theme.preview.surface,
                          borderColor: theme.preview.border,
                          borderRadius: theme.preview.radius,
                        }"
                      />
                    </span>
                    <span class="min-w-0">
                      <b class="block truncate text-[13px] text-ink">{{ theme.name }}</b>
                      <small class="mt-0.5 block truncate text-[10px] text-muted">
                        {{ theme.description }}
                      </small>
                    </span>
                    <CheckOutlined
                      v-if="currentThemeKey === theme.key"
                      class="text-xs text-brand-dark"
                    />
                  </button>
                </div>

                <button
                  type="button"
                  class="grid w-full min-h-12 grid-cols-[20px_1fr_auto] items-center gap-2 rounded-[10px] border-0 bg-transparent px-2.5 text-left text-sm text-ink-secondary hover:bg-canvas hover:text-brand-dark"
                  @click="router.push('/user')"
                >
                  <UserOutlined /><span>进入用户中心</span>
                  <RightOutlined />
                </button>
                <button
                  type="button"
                  class="grid w-full min-h-12 grid-cols-[20px_1fr] items-center gap-2 rounded-[10px] border-0 bg-transparent px-2.5 text-left text-sm text-danger hover:bg-danger/10 hover:text-danger"
                  @click="handleLogout"
                >
                  <LogoutOutlined /><span>退出登录</span>
                </button>
              </div>
            </template>
          </Dropdown>
        </template>

        <template v-else>
          <!-- 窄屏登录按钮改为主色 CTA；宽屏保持文字链 -->
          <button
            type="button"
            class="inline-flex h-11 min-w-[64px] items-center justify-center rounded-[13px] border border-white/55 [background-image:var(--gradient-primary)] px-4 text-[13px] font-bold text-white shadow-float transition duration-200 ease-smooth hover:-translate-y-px hover:shadow-glow sm:min-w-[54px] sm:border-0 sm:bg-none sm:px-3 sm:shadow-none sm:text-ink-secondary sm:hover:translate-y-0 sm:hover:bg-transparent sm:hover:text-accent sm:hover:shadow-none"
            @click="router.push('/login')"
          >
            登录
          </button>
          <button
            type="button"
            class="hidden h-11 items-center justify-center gap-2 rounded-[13px] border border-white/55 [background-image:var(--gradient-primary)] px-[17px] text-[13px] font-bold text-white shadow-float transition duration-200 ease-smooth hover:-translate-y-px hover:shadow-glow sm:inline-flex"
            @click="router.push('/register')"
          >
            免费体验
            <ArrowRightOutlined />
          </button>
        </template>

        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-[13px] border border-line bg-surface/80 text-lg text-ink lg:hidden"
          aria-label="打开导航菜单"
          @click="drawerOpen = true"
        >
          <MenuOutlined />
        </button>
      </div>
    </div>

    <Drawer
      :open="drawerOpen"
      placement="right"
      :width="drawerWidth"
      @update:open="
        (val) => {
          drawerOpen = val;
        }
      "
    >
      <template #title>
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full [background-image:var(--gradient-primary)] text-[20px] font-bold text-white"
          >
            AI
          </div>
          <b class="block text-[15px] text-ink">AI 简历</b>
        </div>
      </template>

      <div
        v-if="userStore.isLoggedIn"
        class="mb-6 rounded-2xl border border-brand/25 bg-brand-lighter/55 p-3"
      >
        <div class="flex items-center gap-3 px-1.5 pt-2 pb-3">
          <span
            class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[11px] text-base font-extrabold text-white"
            :style="accountAvatarStyle"
          >
            {{ accountInitial }}
          </span>
          <div>
            <b class="block text-[15px] leading-snug text-ink">
              {{ userStore.userInfo.nickname || "用户" }}
            </b>
            <span class="mt-1 block text-xs leading-snug text-ink-secondary">
              {{ getRoleLabel(userStore.role) }}
            </span>
          </div>
        </div>
        <div
          class="mt-2 flex items-center justify-between rounded-[11px] bg-surface/75 p-2.5"
        >
          <span class="text-[11px] text-ink-secondary">账户余额</span>
          <strong class="text-sm text-brand-dark">{{ balanceText }}</strong>
        </div>
        <button
          type="button"
          class="mt-2 grid min-h-11 w-full grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 rounded-[11px] border border-line/70 bg-surface/75 px-2.5 text-left text-ink-secondary"
          :aria-expanded="accountThemePanelOpen"
          aria-controls="mobile-account-theme-panel"
          @click="accountThemePanelOpen = !accountThemePanelOpen"
        >
          <BgColorsOutlined class="text-brand-dark" />
          <span class="min-w-0">
            <b class="block text-xs text-ink">界面主题</b>
            <small class="mt-0.5 block truncate text-[10px] text-muted">
              {{ currentThemeName }}
            </small>
          </span>
          <RightOutlined
            class="text-[10px] transition-transform"
            :class="accountThemePanelOpen ? 'rotate-90 text-brand-dark' : ''"
          />
        </button>
        <div
          v-if="accountThemePanelOpen"
          id="mobile-account-theme-panel"
          class="mt-2 grid gap-1.5 rounded-[13px] border border-line bg-canvas/75 p-2"
          role="group"
          aria-label="选择界面主题"
        >
          <button
            v-for="theme in themeOptions"
            :key="theme.key"
            type="button"
            class="grid min-h-[58px] w-full grid-cols-[46px_minmax(0,1fr)_18px] items-center gap-2 rounded-[11px] border border-transparent bg-surface px-2 py-1.5 text-left"
            :class="currentThemeKey === theme.key ? 'border-brand/35 bg-brand-lighter/65 shadow-soft' : ''"
            :aria-pressed="currentThemeKey === theme.key"
            @click="chooseTheme(theme.key)"
          >
            <span
              class="relative h-8 w-[42px] overflow-hidden border"
              :style="{
                background: theme.preview.background,
                borderColor: theme.preview.border,
                borderRadius: theme.preview.radius,
                boxShadow: theme.preview.shadow,
              }"
              aria-hidden="true"
            >
              <span
                class="absolute inset-x-1 top-1 h-1.5 rounded-full"
                :style="{ background: theme.preview.gradient }"
              />
              <span
                class="absolute bottom-1 left-1 h-3.5 w-6 border"
                :style="{
                  background: theme.preview.surface,
                  borderColor: theme.preview.border,
                  borderRadius: theme.preview.radius,
                }"
              />
            </span>
            <span class="min-w-0">
              <b class="block truncate text-xs text-ink">{{ theme.name }}</b>
              <small class="mt-0.5 block truncate text-[9px] text-muted">
                {{ theme.description }}
              </small>
            </span>
            <CheckOutlined
              v-if="currentThemeKey === theme.key"
              class="text-xs text-brand-dark"
            />
          </button>
        </div>
      </div>

      <p
        class="mx-1 mb-2.5 text-[10px] font-extrabold tracking-[0.16em] text-muted"
      >
        探索职简
      </p>
      <nav class="grid gap-2" aria-label="移动端主导航">
        <button
          v-for="item in visibleNavItems"
          :key="item.key"
          type="button"
          :class="mobileNavClass(item)"
          :aria-current="selectedKeys.includes(item.key) ? 'page' : undefined"
          @click="navToMobile(item.path)"
        >
          <span :class="mobileNavIconClass(item)">
            <component :is="item.icon" />
          </span>
          <span class="block min-w-0">
            <b class="block text-[13px] text-ink">{{ item.label }}</b>
            <small class="mt-1 block truncate text-[10px] text-muted">{{
              item.description
            }}</small>
          </span>
          <RightOutlined class="text-[10px] text-line" />
        </button>
      </nav>

      <div
        v-if="userStore.isLoggedIn"
        class="mt-6 grid gap-2 border-t border-line pt-[18px]"
      >
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[11px] border border-brand/20 bg-brand-lighter/55 text-xs font-bold text-brand-dark"
          @click="navToMobile('/user')"
        >
          <UserOutlined /> 用户中心
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[11px] border border-danger/20 bg-surface text-xs font-bold text-danger hover:bg-danger/10"
          @click="handleLogout"
        >
          <LogoutOutlined /> 退出登录
        </button>
      </div>

      <div v-else class="mt-6 grid gap-2 border-t border-line pt-[18px]">
        <button
          type="button"
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] border border-white/55 [background-image:var(--gradient-primary)] px-[17px] text-[13px] font-bold text-white shadow-float"
          @click="navToMobile('/register')"
        >
          免费开始创作
          <ArrowRightOutlined />
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[11px] border border-line bg-surface text-xs font-bold text-ink-secondary"
          @click="navToMobile('/login')"
        >
          已有账号，立即登录
        </button>
      </div>
    </Drawer>
  </LayoutHeader>
</template>
