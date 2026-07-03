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
  // 按钮视觉变体：heroPrimary 用于首页 Hero 白底渐变字主 CTA
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'ghost', 'heroPrimary'].includes(v),
  },
  htmlType: {
    type: String,
    default: 'button',
  },
})

const emit = defineEmits(['click'])

const btnClass = computed(() => {
  if (props.variant === 'heroPrimary') return 'btn-hero-primary'
  if (props.variant === 'ghost' || props.ghost) return 'btn-ghost'
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
    <template v-if="variant === 'heroPrimary'">
      <slot name="prefix" />
      <span class="bg-gradient-to-r from-brand via-brand-light to-accent bg-clip-text text-transparent">
        <slot />
      </span>
      <slot name="suffix" />
    </template>
    <slot v-else />
  </a-button>
</template>
