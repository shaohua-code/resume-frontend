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
  <a-row :gutter="[20, 20]">
    <a-col
      v-for="item in features"
      :key="item.title"
      :xs="24"
      :md="12"
      :lg="8"
      :xl="4"
    >
      <a-card
        class="group flex h-full cursor-pointer flex-col border border-line/40 bg-surface/70 text-center shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-brand/30 hover:shadow-card-hover"
        hoverable
        @click="handleClick(item)"
      >
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
          :class="item.iconBg || 'bg-brand-lighter/60'"
        >
          {{ item.icon }}
        </div>
        <h3 class="mb-2 text-base font-semibold text-ink sm:text-lg">{{ item.title }}</h3>
        <p class="mb-4 flex-1 text-xs leading-relaxed text-ink-secondary sm:text-sm">{{ item.desc }}</p>
        <span class="text-xs font-medium text-brand-dark transition-colors group-hover:underline">
          立即体验 →
        </span>
      </a-card>
    </a-col>
  </a-row>
</template>
