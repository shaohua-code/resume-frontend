<script setup>
import { computed } from 'vue'

/**
 * 通用磨砂玻璃卡片
 * glow: 是否显示霓虹渐变边框
 * hoverable: 是否启用悬浮上浮效果
 * padding: 是否显示内边距
 */
const props = defineProps({
  glow: {
    type: Boolean,
    default: false,
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  padding: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
})

const cardClass = computed(() => {
  const base = props.hoverable ? 'card-hover' : 'card-base'
  return props.padding ? base : `${base} !p-0`
})
</script>

<template>
  <div v-if="glow" class="glass-glow">
    <div :class="['glass-glow-inner', padding ? '' : '!p-0']">
      <slot />
    </div>
  </div>
  <div v-else :class="[cardClass, bordered ? '' : 'border-0']">
    <slot />
  </div>
</template>
