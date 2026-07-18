<script setup>
/**
 * 首页 - Hero + 使用流程 + 功能卡 + 模板预览 + 信任背书
 */
import { defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import {
  CloudUploadOutlined,
  EditOutlined,
  FileDoneOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons-vue";
import { useUserStore } from "@/stores/user";
import PageHero from "@/components/PageHero.vue";
import GlassCard from "@/components/GlassCard.vue";
import LazyRender from "@/components/LazyRender.vue";
import HeroActions from "./components/HeroActions.vue";
import FeatureGrid from "./components/FeatureGrid.vue";
import { HOME_FEATURES, HOME_STATS } from "./utils/features";
import { createHomeNavigator } from "./utils/navigate";

// 首屏以下的模板注册表与轮播组件在接近视口时再请求。
const TemplatePreview = defineAsyncComponent(() => import("./components/TemplatePreview.vue"));
const TrustOfferWall = defineAsyncComponent(() => import("./components/TrustOfferWall.vue"));

const router = useRouter();
const userStore = useUserStore();
const navTo = createHomeNavigator(router, userStore);

const HOME_FLOW = [
  {
    icon: CloudUploadOutlined,
    title: "识别或直接填写",
    description: "PDF、文字识别与统一表单在同一页完成",
  },
  {
    icon: ThunderboltOutlined,
    title: "AI 生成优化",
    description: "提炼亮点，自动优化专业表达",
  },
  {
    icon: EditOutlined,
    title: "在线编辑排版",
    description: "27 套模板，内容与样式随心调整",
  },
  {
    icon: FileDoneOutlined,
    title: "导出开始投递",
    description: "支持 PDF / Word，一键保存使用",
  },
];

function handleFeatureClick(item) {
  navTo(item.path);
}
</script>

<template>
  <div class="home-page animate-fade-in">
    <PageHero
      compact
      title="让每一段经历，都成为你的求职优势"
      subtitle="AI 帮你梳理经历、匹配岗位、优化表达，零基础也能快速完成专业简历"
      :stats="HOME_STATS"
    >
      <template #actions>
        <HeroActions
          :is-logged-in="userStore.isLoggedIn"
          @start="navTo('/generate')"
        />
      </template>
    </PageHero>

    <section class="feature-section">
      <div class="page-container !py-8 sm:!py-12">
        <div class="mb-5 text-center sm:mb-8">
          <span class="section-kicker">AI TOOLKIT</span>
          <h2 class="section-title">核心功能</h2>
          <p class="mt-2 section-subtitle">
            从生成、优化到导出，把复杂的简历工作变简单
          </p>
        </div>
        <FeatureGrid :features="HOME_FEATURES" @click="handleFeatureClick" />
      </div>
    </section>

    <LazyRender min-height="38rem">
      <TemplatePreview />
    </LazyRender>

    <LazyRender min-height="36rem" root-margin="400px 0px">
      <TrustOfferWall />
    </LazyRender>
    <section
      class="relative w-full px-4 py-8 pt-0 mx-auto max-w-7xl sm:px-6 sm:py-12 sm:pt-0 lg:px-8"
    >
      <div class="mb-5 text-center sm:mb-8">
        <span class="section-kicker">HOW IT WORKS</span>
        <h2 class="section-title">使用流程</h2>
        <p class="mt-2 section-subtitle">清晰四步，从经历素材到可投递简历</p>
      </div>
      <GlassCard class="flow-panel">
        <div class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <article
            v-for="(step, index) in HOME_FLOW"
            :key="step.title"
            class="flow-card"
          >
            <div class="flow-icon-wrap">
              <component :is="step.icon" />
            </div>
            <div class="flex-1 min-w-0 lg:text-center">
              <div class="flex items-center gap-2 lg:justify-center">
                <span class="flow-number">0{{ index + 1 }}</span>
                <h3 class="text-sm font-semibold text-ink sm:text-base">
                  {{ step.title }}
                </h3>
              </div>
              <p
                class="mt-1 text-xs leading-relaxed text-ink-secondary sm:text-sm"
              >
                {{ step.description }}
              </p>
            </div>
          </article>
        </div>
      </GlassCard>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  background:
    radial-gradient(
      circle at 8% 28%,
      rgba(0, 212, 255, 0.08),
      transparent 22rem
    ),
    radial-gradient(
      circle at 92% 62%,
      rgba(168, 85, 247, 0.07),
      transparent 24rem
    );
}

.section-kicker {
  @apply mb-2 inline-block text-[10px] font-bold tracking-[0.22em] text-brand-dark sm:text-xs;
}

.flow-panel {
  @apply relative overflow-hidden;
}

.flow-panel::before {
  content: "";
  @apply pointer-events-none absolute inset-x-0 top-0 h-1;
  background: var(--gradient-primary);
}

.flow-card {
  @apply relative flex items-center gap-3 rounded-card border border-line/50 bg-white/60 p-3.5 sm:p-4 lg:flex-col lg:items-center lg:px-3 lg:py-5;
}

.flow-icon-wrap {
  @apply flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lighter text-lg text-brand-dark shadow-sm sm:h-12 sm:w-12 sm:text-xl;
}

.flow-number {
  @apply text-[10px] font-bold tracking-wider text-brand-dark/70;
}

.feature-section {
  @apply border-y border-line/40 bg-white/35;
}

@media (min-width: 1024px) {
  .flow-card:not(:last-child)::after {
    content: "";
    @apply absolute -right-3 top-1/2 z-10 h-px w-5 bg-brand/40;
  }
}
</style>
