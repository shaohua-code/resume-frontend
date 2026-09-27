<script setup>
import { computed } from 'vue'

/**
 * 通用实体卡片兼容组件；旧 glow 调用仍可工作，但不会额外叠加霓虹边框。
 * hoverable: 是否显示轻微悬停反馈；padding: 是否保留卡片内边距。
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
