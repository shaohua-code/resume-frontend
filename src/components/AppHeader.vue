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

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const walletStore = useWalletStore();
const drawerOpen = ref(false);
const isMobile = useMediaQuery();

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
  () =>
    (userStore.userInfo.nickname || "U").trim().charAt(0).toUpperCase() || "U",
);

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
    "relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border-0 bg-transparent px-3 text-[15px] font-semibold leading-none text-[#667085] whitespace-nowrap transition-all duration-200 ease-smooth xl:px-4",
    "hover:bg-[linear-gradient(110deg,rgba(0,212,255,0.09),rgba(168,85,247,0.08))] hover:text-brand-dark",
    active
      ? "bg-[linear-gradient(110deg,rgba(0,212,255,0.15),rgba(79,172,254,0.13)_52%,rgba(168,85,247,0.13))] text-[#2563eb] shadow-[inset_0_0_0_1px_rgba(79,172,254,0.09)]"
      : "",
  ];
}

/** 移动端导航项：仅 active 时高亮 */
function mobileNavClass(item) {
  const active = selectedKeys.value.includes(item.key);
  return [
    "grid w-full min-h-[58px] grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[14px] border border-transparent bg-transparent py-1.5 pr-2.5 pl-1.5 text-left text-ink-secondary",
    active
      ? "border-[rgba(79,172,254,0.24)] bg-[linear-gradient(110deg,rgba(0,212,255,0.1),rgba(79,172,254,0.08)_55%,rgba(168,85,247,0.08))]"
      : "",
  ];
}

function mobileNavIconClass(item) {
  const active = selectedKeys.value.includes(item.key);
  return [
    "inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line bg-white text-ink-secondary",
    active
      ? "border-[rgba(79,172,254,0.24)] text-[#2563eb] shadow-[0_5px_14px_rgba(79,172,254,0.12)]"
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

function handleLogout() {
  drawerOpen.value = false;
  userStore.logout();
  window.location.href = "/";
}
</script>

<template>
  <LayoutHeader
    class="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-0 bg-white/80 p-0 leading-none shadow-soft backdrop-blur-[22px] backdrop-saturate-[1.35]"
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
            class="block text-base font-extrabold tracking-tight text-[#172033] sm:text-[19px]"
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
              class="grid h-11 min-w-[164px] grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2 rounded-[14px] border-0 bg-white/70 py-1 pr-2.5 pl-1.5 text-left text-ink transition duration-200 ease-smooth hover:bg-white hover:shadow-[0_8px_22px_rgba(79,172,254,0.14)]"
              aria-label="打开账户菜单"
            >
              <span
                class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[11px] [background-image:var(--gradient-hero)] text-[13px] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
              >
                {{ accountInitial }}
              </span>
              <span class="min-w-0">
                <b class="block max-w-[92px] truncate text-sm font-bold">
                  {{ userStore.userInfo.nickname || "用户" }}
                </b>
                <small
                  class="mt-1 block max-w-[92px] truncate text-[11px] font-bold text-[#3b82f6]"
                >
                  {{ balanceText }}
                </small>
              </span>
              <DownOutlined class="text-[10px] text-muted" />
            </button>

            <template #overlay>
              <div
                class="w-[300px] rounded-[18px] border border-line/90 bg-white/95 p-3.5 shadow-[0_22px_54px_rgba(15,23,42,0.17)] backdrop-blur-[20px]"
              >
                <div class="flex items-center gap-3 px-1.5 pt-2 pb-3">
                  <span
                    class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[11px] [background-image:var(--gradient-hero)] text-base font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
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
                  class="my-1 mb-2 flex items-center justify-between rounded-xl border border-[rgba(79,172,254,0.25)] bg-[linear-gradient(110deg,rgba(0,212,255,0.1),rgba(79,172,254,0.08)_52%,rgba(168,85,247,0.08))] p-3"
                >
                  <span
                    class="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary"
                  >
                    <WalletOutlined /> 账户余额
                  </span>
                  <strong class="text-base text-[#2563eb]">{{
                    balanceText
                  }}</strong>
                </div>

                <button
                  type="button"
                  class="grid w-full min-h-12 grid-cols-[20px_1fr_auto] items-center gap-2 rounded-[10px] border-0 bg-transparent px-2.5 text-left text-sm text-ink-secondary hover:bg-canvas hover:text-[#2563eb]"
                  @click="router.push('/user')"
                >
                  <UserOutlined /><span>进入用户中心</span>
                  <RightOutlined />
                </button>
                <button
                  type="button"
                  class="grid w-full min-h-12 grid-cols-[20px_1fr] items-center gap-2 rounded-[10px] border-0 bg-transparent px-2.5 text-left text-sm text-danger hover:bg-rose-50 hover:text-danger"
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
            class="inline-flex h-11 min-w-[64px] items-center justify-center rounded-[13px] border border-white/55 [background-image:var(--gradient-primary)] px-4 text-[13px] font-bold text-white shadow-[0_9px_22px_rgba(79,172,254,0.24)] transition duration-200 ease-smooth hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(79,172,254,0.32)] sm:min-w-[54px] sm:border-0 sm:bg-none sm:px-3 sm:shadow-none sm:text-ink-secondary sm:hover:translate-y-0 sm:hover:bg-transparent sm:hover:text-accent sm:hover:shadow-none"
            @click="router.push('/login')"
          >
            登录
          </button>
          <button
            type="button"
            class="hidden h-11 items-center justify-center gap-2 rounded-[13px] border border-white/55 [background-image:var(--gradient-primary)] px-[17px] text-[13px] font-bold text-white shadow-[0_9px_22px_rgba(79,172,254,0.24)] transition duration-200 ease-smooth hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(79,172,254,0.32)] sm:inline-flex"
            @click="router.push('/register')"
          >
            免费体验
            <ArrowRightOutlined />
          </button>
        </template>

        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-[13px] border border-line bg-white/80 text-lg text-ink lg:hidden"
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
          <b class="block text-[15px] text-[#172033]">AI 简历</b>
        </div>
      </template>

      <div
        v-if="userStore.isLoggedIn"
        class="mb-6 rounded-2xl border border-[rgba(79,172,254,0.25)] bg-[linear-gradient(120deg,rgba(0,212,255,0.11),rgba(79,172,254,0.09)_52%,rgba(168,85,247,0.09))] p-3"
      >
        <div class="flex items-center gap-3 px-1.5 pt-2 pb-3">
          <span
            class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[11px] [background-image:var(--gradient-hero)] text-base font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
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
          class="mt-2 flex items-center justify-between rounded-[11px] bg-white/75 p-2.5"
        >
          <span class="text-[11px] text-ink-secondary">账户余额</span>
          <strong class="text-sm text-[#2563eb]">{{ balanceText }}</strong>
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
          class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[11px] border border-blue-100 bg-indigo-50 text-xs font-bold text-indigo-600"
          @click="navToMobile('/user')"
        >
          <UserOutlined /> 用户中心
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[11px] border border-rose-200 bg-white text-xs font-bold text-danger"
          @click="handleLogout"
        >
          <LogoutOutlined /> 退出登录
        </button>
      </div>

      <div v-else class="mt-6 grid gap-2 border-t border-line pt-[18px]">
        <button
          type="button"
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] border border-white/55 [background-image:var(--gradient-primary)] px-[17px] text-[13px] font-bold text-white shadow-[0_9px_22px_rgba(79,172,254,0.24)]"
          @click="navToMobile('/register')"
        >
          免费开始创作
          <ArrowRightOutlined />
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[11px] border border-line bg-white text-xs font-bold text-ink-secondary"
          @click="navToMobile('/login')"
        >
          已有账号，立即登录
        </button>
      </div>
    </Drawer>
  </LayoutHeader>
</template>
