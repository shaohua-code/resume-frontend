<script setup>
/**
 * 页面 Hero 区域 - 标题/副标题/统计徽章/CTA 插槽
 */
defineProps({
  title: {
    type: String,
    default: 'AI简历助手 · 校园版',
  },
  subtitle: {
    type: String,
    default: '',
  },
  compact: {
    type: Boolean,
    default: false,
  },
  stats: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section
    class="relative overflow-hidden px-4 text-center text-white sm:px-6 lg:px-8"
    :class="compact ? 'py-6 sm:py-8' : 'py-16 sm:py-20'"
    style="background: var(--gradient-hero)"
  >
    <!-- 背景装饰光斑 -->
    <div class="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
    <div class="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />

    <div class="relative mx-auto max-w-4xl">
      <h1
        class="mb-4 font-bold tracking-tight"
        :class="compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl lg:text-5xl'"
      >
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="mx-auto"
        :class="compact ? 'mb-4 max-w-2xl text-sm text-white/90 sm:text-base' : 'mb-8 max-w-2xl text-base text-white/90 sm:text-lg'"
      >
        {{ subtitle }}
      </p>

      <!-- CTA 按钮插槽 -->
      <div v-if="$slots.actions" class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <slot name="actions" />
      </div>

      <!-- 统计徽章 -->
      <div
        v-if="stats.length"
        class="flex flex-wrap items-center justify-center gap-4 sm:gap-8"
        :class="compact ? 'mt-4 sm:mt-6' : 'mt-10 sm:mt-12'"
      >
        <template v-for="(stat, index) in stats" :key="stat.label">
          <div v-if="index > 0" class="hidden h-12 w-px bg-white/40 sm:block" />
          <div class="stat-glass">
            <span class="text-4xl font-extrabold text-white drop-shadow-sm sm:text-5xl">{{ stat.value }}</span>
            <span class="text-sm font-medium text-white/95">{{ stat.label }}</span>
          </div>
        </template>
      </div>

      <!-- 额外内容插槽（如 JD 输入模块） -->
      <div v-if="$slots.default" class="mt-10 sm:mt-12">
        <slot />
      </div>
    </div>
  </section>
</template>
