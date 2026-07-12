<script setup>
/**
 * 页面 Hero 区域 - 标题/副标题/统计徽章/CTA 插槽
 */
defineProps({
  title: {
    type: String,
    default: 'AI简历助手',
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
    class="relative px-4 overflow-hidden text-center text-white sm:px-6 lg:px-8"
    :class="compact ? 'py-6 sm:py-8' : 'py-16 sm:py-20'"
    style="background: var(--gradient-hero)"
  >
    <!-- 背景装饰光斑 -->
    <div class="absolute w-64 h-64 rounded-full pointer-events-none -left-20 -top-20 bg-white/20 blur-3xl" />
    <div class="absolute rounded-full pointer-events-none -bottom-20 -right-20 h-80 w-80 bg-white/15 blur-3xl" />
    <div class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none left-1/2 top-1/2 h-96 w-96 bg-accent/20 blur-3xl" />

    <div class="relative max-w-4xl mx-auto">
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

      <!-- 统计徽章：白底高对比，适配亮点文案 -->
      <div
       v-if="stats.length"
        class="grid w-full max-w-lg grid-cols-3 gap-2 mx-auto sm:max-w-xl sm:gap-3"
        :class="compact ? 'mt-4 sm:mt-5' : 'mt-10 sm:mt-12'"
      >
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border border-white/25  px-2 py-2.5 shadow-lg shadow-black/10 backdrop-blur-sm sm:min-h-[5rem] sm:gap-1.5 sm:px-3 sm:py-3"
        >
          <span class="text-xs font-bold leading-none text-white whitespace-nowrap sm:text-sm">{{ stat.value }}</span>
          <span class="line-clamp-2 text-center text-[10px] leading-snug text-white sm:text-xs">{{ stat.label }}</span>
        </div>
      </div>
 
      <!-- 额外内容插槽（如 JD 输入模块） -->
      <div v-if="$slots.default" class="mt-10 sm:mt-12">
        <slot />
      </div>
    </div>
  </section>
</template>
