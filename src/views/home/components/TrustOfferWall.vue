<script setup>
/**
 * 信任背书区 - 数据条 + Offer 文案 + 行业标签 + 匿名证言轮播
 */
import GlassCard from '@/components/GlassCard.vue'
import {
  TRUST_OFFER_HEADLINE,
  TRUST_MINI_STATS,
  TRUST_INDUSTRIES,
  TRUST_TESTIMONIALS,
} from '../utils/trust'
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
    <GlassCard class="text-center">
      <!-- 标题区 -->
      <div class="mb-5 sm:mb-6">
        <h2 class="section-title">用户信赖</h2>
        <p class="mt-1 section-subtitle">真实用户 · 多行业验证</p>
      </div>

      <!-- Mini stats 三列数据条 -->
      <div class="grid grid-cols-3 gap-2 sm:gap-4">
        <div
          v-for="stat in TRUST_MINI_STATS"
          :key="stat.label"
          class="flex flex-col items-center gap-0.5 rounded-card border border-line/30 bg-white/50 px-2 py-3 sm:gap-1 sm:px-4 sm:py-4"
        >
          <span class="text-xl font-bold text-brand-dark sm:text-2xl">{{ stat.value }}</span>
          <span class="text-[10px] font-medium text-ink-secondary sm:text-xs">{{ stat.label }}</span>
        </div>
      </div>

      <!-- 主 Offer 文案 -->
      <p class="mt-5 text-base text-ink-secondary sm:mt-6 sm:text-lg">
        {{ TRUST_OFFER_HEADLINE }}
      </p>

      <!-- 行业标签：移动端横滑，桌面端换行居中 -->
      <div class="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:mt-6 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible">
        <span
          v-for="industry in TRUST_INDUSTRIES"
          :key="industry"
          class="inline-flex shrink-0 items-center rounded-pill border border-line/50 bg-white/60 px-3 py-1 text-xs font-medium text-ink-secondary backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm"
        >
          {{ industry }}
        </span>
      </div>

      <!-- 匿名证言轮播 -->
      <div class="mt-6 sm:mt-8">
        <a-carousel autoplay dots class="trust-carousel">
          <div
            v-for="(item, idx) in TRUST_TESTIMONIALS"
            :key="idx"
            class="px-2 pb-2"
          >
            <div class="mx-auto max-w-lg rounded-card border border-line/40 p-4">
              <div class="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-lighter text-sm font-semibold text-brand-dark">
                  {{ item.avatar }}
                </div>
                <div>
                  <p class="text-sm italic text-ink-secondary sm:text-base">"{{ item.quote }}"</p>
                  <p class="mt-1 text-xs text-muted sm:text-sm">— {{ item.role }}</p>
                </div>
              </div>
            </div>
          </div>
        </a-carousel>
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
</style>
