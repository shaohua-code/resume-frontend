<script setup>
/**
 * 信任背书区 - Offer 数量 + 行业标签 + 匿名证言轮播
 */
import GlassCard from '@/components/GlassCard.vue'
import { TRUST_OFFER_COUNT, TRUST_INDUSTRIES, TRUST_TESTIMONIALS } from '../utils/trust'
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <GlassCard class="text-center">
      <p class="text-base text-ink-secondary sm:text-lg">
        已帮助
        <span class="mx-1 text-2xl font-bold text-brand-dark sm:text-3xl">{{ TRUST_OFFER_COUNT }}</span>
        位求职者斩获心仪 Offer
      </p>

      <!-- 行业标签墙 -->
      <div class="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span
          v-for="industry in TRUST_INDUSTRIES"
          :key="industry"
          class="inline-flex items-center rounded-pill border border-line/50 bg-white/60 px-3 py-1 text-xs font-medium text-ink-secondary opacity-60 backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm"
        >
          {{ industry }}
        </span>
      </div>

      <!-- 匿名证言轮播 -->
      <div class="mt-8">
        <a-carousel autoplay dots class="trust-carousel">
          <div
            v-for="(item, idx) in TRUST_TESTIMONIALS"
            :key="idx"
            class="px-2 pb-2"
          >
            <div class="mx-auto flex max-w-lg flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4 sm:text-left">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-lighter text-sm font-semibold text-brand-dark">
                {{ item.avatar }}
              </div>
              <div>
                <p class="text-sm italic text-ink-secondary sm:text-base">"{{ item.quote }}"</p>
                <p class="mt-1 text-xs text-muted sm:text-sm">— {{ item.role }}</p>
              </div>
            </div>
          </div>
        </a-carousel>
      </div>
    </GlassCard>
  </section>
</template>

<style scoped>
:deep(.trust-carousel .slick-dots li button) {
  @apply bg-brand/30;
}

:deep(.trust-carousel .slick-dots li.slick-active button) {
  @apply bg-brand-dark;
}
</style>
