<script setup>
/**
 * 渐变主按钮 - 封装 a-button + Glassmorphism 渐变样式
 */
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'middle',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  ghost: {
    type: Boolean,
    default: false,
  },
  htmlType: {
    type: String,
    default: 'button',
  },
})

const emit = defineEmits(['click'])

const btnClass = computed(() => {
  if (props.ghost) return 'btn-ghost'
  return props.size === 'small' ? 'btn-primary-sm' : 'btn-primary'
})
</script>

<template>
  <a-button
    :class="btnClass"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :html-type="htmlType"
    @click="emit('click', $event)"
  >
    <slot />
  </a-button>
</template>
