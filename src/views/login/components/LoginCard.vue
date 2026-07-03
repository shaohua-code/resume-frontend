<script setup>
/**
 * 登录卡片容器 - 磨砂玻璃外壳
 */
import GlassCard from '@/components/GlassCard.vue'
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6" style="background: var(--gradient-hero)">
    <div class="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
    <div class="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
    <GlassCard glow class="relative w-full max-w-[420px] animate-scale-in">
      <div class="mb-6 text-center">
        <img src="/vite.svg" alt="Logo" class="mx-auto mb-3 h-12 w-12" />
        <h2 class="mb-1 text-2xl font-bold text-ink">AI 简历助手</h2>
        <p class="text-sm text-ink-secondary">专业简历，让求职更简单</p>
      </div>
      <slot />
      <div v-if="$slots.footer" class="mt-4 text-center text-sm text-ink-secondary">
        <slot name="footer" />
      </div>
    </GlassCard>
  </div>
</template>
