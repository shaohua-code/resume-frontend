<script setup>
/**
 * 数字滚动动画
 * 用 requestAnimationFrame 从 0 平滑递增到目标值，支持前后缀。
 */
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 1000,
  },
  prefix: {
    type: String,
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
  decimals: {
    type: Number,
    default: 0,
  },
})

const display = ref(0)

// 执行一次从当前值到目标值的缓动动画
function animate(target) {
  const start = performance.now()
  const from = 0
  const step = (now) => {
    const progress = Math.min((now - start) / props.duration, 1)
    // easeOutCubic 缓动，结尾更自然
    const eased = 1 - Math.pow(1 - progress, 3)
    display.value = from + (target - from) * eased
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// 按千分位格式化展示值
const formatted = computed(() => display.value.toLocaleString('en-US', {
  minimumFractionDigits: props.decimals,
  maximumFractionDigits: props.decimals,
}))

onMounted(() => animate(props.value))
// 目标值变化时重新播放动画
watch(() => props.value, (val) => animate(val))
</script>

<template>
  <span>{{ prefix }}{{ formatted }}{{ suffix }}</span>
</template>
