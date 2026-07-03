<script setup>
/**
 * 信任背书区 - Offer 数量 + 名企 Logo 文字墙
 */
import GlassCard from '@/components/GlassCard.vue'
import { TRUST_OFFER_COUNT, TRUST_COMPANIES } from '../utils/trust'
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <GlassCard class="text-center">
      <p class="text-base text-ink-secondary sm:text-lg">
        已帮助
        <span class="mx-1 text-2xl font-bold text-brand-dark sm:text-3xl">{{ TRUST_OFFER_COUNT }}</span>
        位求职者斩获心仪 Offer
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-10">
        <div
          v-for="company in TRUST_COMPANIES"
          :key="company.name"
          class="flex flex-col items-center opacity-40 grayscale transition-opacity duration-300 hover:opacity-60"
        >
          <span class="text-sm font-semibold text-ink sm:text-base">{{ company.name }}</span>
          <span class="text-[10px] uppercase tracking-wider text-muted sm:text-xs">{{ company.abbr }}</span>
        </div>
      </div>
    </GlassCard>
  </section>
</template>
