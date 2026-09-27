<script setup>
/**
 * 首页功能卡片网格 - 响应式 + Hover 动效 + 立即体验引导
 */
defineProps({
  features: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['click'])

function handleClick(item) {
  emit('click', item)
}
</script>

<template>
  <div class="feature-grid">
    <button
      v-for="item in features"
      :key="item.title"
      type="button"
      class="feature-card group"
      @click="handleClick(item)"
    >
      <div class="flex items-start gap-3 sm:block sm:text-center">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl sm:mx-auto sm:mb-4 sm:h-14 sm:w-14 sm:text-2xl"
          :class="item.iconBg || 'bg-brand-lighter/60'"
        >
          <!-- 功能入口使用同一图标笔画体系，彩色强调由主题令牌控制。 -->
          <component :is="item.icon" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="mb-1.5 text-sm font-semibold text-ink sm:mb-2 sm:text-lg">{{ item.title }}</h3>
          <p class="text-xs leading-relaxed text-ink-secondary sm:text-sm">{{ item.desc }}</p>
        </div>
      </div>
      <span class="mt-3 inline-flex pl-[60px] text-xs font-medium text-brand-dark transition-colors group-hover:underline sm:mt-4 sm:justify-center sm:pl-0">
        立即体验 →
      </span>
    </button>
  </div>
</template>

<style scoped>
.feature-grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3;
}

.feature-card {
  @apply flex h-full min-h-11 cursor-pointer flex-col rounded-card border border-line/80 bg-surface p-4 text-left shadow-card transition-all duration-200 hover:border-brand/30 hover:shadow-card-hover sm:p-6;
}

@media (hover: hover) {
  .feature-card:hover {
    transform: translateY(-2px);
  }
}
</style>
