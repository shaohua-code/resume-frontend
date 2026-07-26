<script setup>
/**
 * 信任背书区 - 数据条 + Offer 文案 + 行业标签 + 匿名证言轮播
 */
import GlassCard from '@/components/GlassCard.vue'
import { useRouter } from 'vue-router'
import Carousel from 'ant-design-vue/es/carousel'
import {
  CheckCircleFilled,
  EditOutlined,
  ExportOutlined,
  SafetyCertificateOutlined,
  StarFilled,
} from '@ant-design/icons-vue'
import {
  TRUST_OFFER_HEADLINE,
  TRUST_MINI_STATS,
  TRUST_GUARANTEES,
  TRUST_INDUSTRIES,
  TRUST_TESTIMONIALS,
} from '../utils/trust'

const router = useRouter()

const guaranteeIcons = {
  shield: SafetyCertificateOutlined,
  edit: EditOutlined,
  export: ExportOutlined,
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <GlassCard class="trust-wall" :padding="false">
      <!-- 标题区 -->
      <div class="p-5 sm:p-8 lg:p-10">
      <div class="mx-auto mb-6 max-w-2xl text-center sm:mb-8">
        <span class="mb-2 inline-block text-[10px] font-bold tracking-[0.22em] text-brand-dark sm:text-xs">TRUSTED BY JOB SEEKERS</span>
        <h2 class="section-title">认真对待你的每一次投递</h2>
        <p class="mt-2 section-subtitle">覆盖不同经验阶段与求职方向，让专业简历不再有门槛</p>
      </div>

      <!-- Mini stats 三列数据条 -->
      <div class="grid grid-cols-3 gap-2 sm:gap-4">
        <div
          v-for="stat in TRUST_MINI_STATS"
          :key="stat.label"
          class="flex min-w-0 flex-col items-center gap-0.5 rounded-card border border-line/50 bg-surface/80 px-1.5 py-3 shadow-card sm:gap-1 sm:px-4 sm:py-5"
        >
          <span class="text-xl font-bold text-brand-dark sm:text-2xl">{{ stat.value }}</span>
          <span class="truncate text-[10px] font-medium text-ink-secondary sm:text-xs">{{ stat.label }}</span>
        </div>
      </div>

      <!-- 主 Offer 文案 -->
      <div class="mx-auto mt-5 flex max-w-2xl items-start justify-center gap-2 rounded-xl bg-brand-lighter/50 px-3 py-3 text-center sm:mt-6 sm:items-center sm:px-5">
        <CheckCircleFilled class="mt-0.5 shrink-0 text-brand-dark sm:mt-0" />
        <p class="text-sm font-medium text-ink-secondary sm:text-base">{{ TRUST_OFFER_HEADLINE }}</p>
      </div>

      <!-- 使用保障 -->
      <div class="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <div
          v-for="item in TRUST_GUARANTEES"
          :key="item.title"
          class="flex items-center gap-3 rounded-card border border-line/40 bg-surface/50 p-3 text-left sm:flex-col sm:p-4 sm:text-center"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lighter text-lg text-brand-dark">
            <component :is="guaranteeIcons[item.icon]" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-ink">{{ item.title }}</h3>
            <p class="mt-0.5 text-xs leading-relaxed text-ink-secondary">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 行业标签：移动端横滑，桌面端换行居中 -->
      <div class="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible">
        <span
          v-for="industry in TRUST_INDUSTRIES"
          :key="industry"
          class="inline-flex shrink-0 items-center rounded-pill border border-line/50 bg-surface/60 px-3 py-1 text-xs font-medium text-ink-secondary backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm"
        >
          {{ industry }}
        </span>
      </div>

      <!-- 移动端匿名证言轮播 -->
      <div class="mt-6 sm:hidden">
        <Carousel autoplay dots class="trust-carousel">
          <div
            v-for="(item, idx) in TRUST_TESTIMONIALS"
            :key="idx"
            class="px-2 pb-2"
          >
            <div class="mx-auto max-w-lg rounded-card border border-line/40 bg-surface/60 p-4">
              <div class="flex items-start gap-3 text-left">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-lighter text-sm font-semibold text-brand-dark">
                  {{ item.avatar }}
                </div>
                <div class="min-w-0">
                  <div class="mb-1 flex gap-0.5 text-[10px] text-amber-400" aria-label="5 星评价">
                    <StarFilled v-for="star in 5" :key="star" />
                  </div>
                  <p class="text-sm leading-relaxed text-ink-secondary">“{{ item.quote }}”</p>
                  <p class="mt-2 text-xs text-muted">— {{ item.role }}</p>
                </div>
              </div>
            </div>
          </div>
        </Carousel>
      </div>

      <!-- 平板和桌面端展示更多反馈，减少轮播信息隐藏 -->
      <div class="mt-8 hidden grid-cols-2 gap-4 sm:grid">
        <article
          v-for="(item, idx) in TRUST_TESTIMONIALS"
          :key="idx"
          class="rounded-card border border-line/50 bg-surface/70 p-5 text-left shadow-card"
        >
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-lighter text-sm font-semibold text-brand-dark">
              {{ item.avatar }}
            </div>
            <div class="min-w-0">
              <div class="mb-1.5 flex gap-0.5 text-xs text-amber-400" aria-label="5 星评价">
                <StarFilled v-for="star in 5" :key="star" />
              </div>
              <p class="text-sm leading-relaxed text-ink-secondary">“{{ item.quote }}”</p>
              <p class="mt-2 text-xs text-muted">— {{ item.role }}</p>
            </div>
          </div>
        </article>
      </div>
      </div>

      <div class="trust-cta flex flex-col items-center justify-between gap-4 px-5 py-5 text-center sm:flex-row sm:px-8 sm:py-6 sm:text-left lg:px-10">
        <div>
          <h3 class="text-base font-semibold text-white sm:text-lg">准备好做一份更有竞争力的简历了吗？</h3>
          <p class="mt-1 text-xs text-white/75 sm:text-sm">现在开始，先生成、再修改，满意后再导出</p>
        </div>
        <button class="h-11 w-full rounded-button bg-surface px-6 text-sm font-semibold text-brand-dark shadow-lift transition hover:-translate-y-0.5 hover:shadow-float sm:w-auto" @click="router.push('/generate')">
          免费开始创建 →
        </button>
      </div>
    </GlassCard>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

:deep(.trust-carousel .slick-dots li button) {
  @apply bg-brand/30;
}

:deep(.trust-carousel .slick-dots li.slick-active button) {
  @apply bg-brand-dark;
}

.trust-wall {
  @apply overflow-hidden;
  /* 背书区背景与行动按钮共享系统主题，避免切换后仍显示默认青紫渐变。 */
  background:
    radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--color-brand) 11%, transparent), transparent 20rem),
    color-mix(in srgb, var(--color-surface) 78%, transparent);
}

.trust-cta {
  background: var(--gradient-primary);
}
</style>
