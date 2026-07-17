<script setup>
/**
 * 渐变主按钮 - 原生按钮 + Glassmorphism 渐变样式
 * 全站统一 40px（h-10）高度
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

// small/middle 均使用标准高度 btn 类，表格行内用 -sm 变体仅缩小横向 padding
const btnClass = computed(() => {
  if (props.variant === 'heroPrimary') return 'btn-hero-primary'
  if (props.variant === 'ghost' || props.ghost) {
    return props.size === 'small' ? 'btn-ghost-sm' : 'btn-ghost'
  }
  return props.size === 'small' ? 'btn-primary-sm' : 'btn-primary'
})
</script>

<template>
  <button
    :class="[btnClass, { 'w-full': block }]"
    :type="htmlType"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="gradient-button-spinner" aria-hidden="true" />
    <template v-if="variant === 'heroPrimary'">
      <slot name="prefix" />
      <span class="bg-gradient-to-r from-brand via-brand-light to-accent bg-clip-text text-transparent">
        <slot />
      </span>
      <slot name="suffix" />
    </template>
    <slot v-else />
  </button>
</template>

<style scoped>
.gradient-button-spinner {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: gradient-button-spin 0.75s linear infinite;
}

@keyframes gradient-button-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-button-spinner {
    animation-duration: 1.5s;
  }
}
</style>
