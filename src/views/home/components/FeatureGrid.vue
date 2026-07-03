<script setup>
/**
 * 首页功能卡片网格 - 响应式 6 列布局
 */
defineProps({
  features: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <a-row :gutter="[20, 20]">
    <a-col
      v-for="item in features"
      :key="item.title"
      :xs="24"
      :sm="12"
      :md="8"
      :lg="8"
      :xl="4"
    >
      <a-card
        class="h-full cursor-pointer border border-line/40 bg-surface/70 text-center shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover"
        hoverable
        @click="emit('click', item)"
      >
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
          :class="item.iconBg || 'bg-brand-lighter/60'"
        >
          {{ item.icon }}
        </div>
        <h3 class="mb-2 text-base font-semibold text-ink sm:text-lg">{{ item.title }}</h3>
        <p class="text-xs leading-relaxed text-ink-secondary sm:text-sm">{{ item.desc }}</p>
      </a-card>
    </a-col>
  </a-row>
</template>
