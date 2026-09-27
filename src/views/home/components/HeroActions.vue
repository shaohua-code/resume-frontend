<script setup>
/**
 * 首屏主 CTA - 单按钮高亮，上传入口收敛到 /generate 页内切换
 */
import { RocketOutlined, ThunderboltOutlined } from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'

defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  actionLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['start'])
</script>

<template>
  <GradientButton
    variant="heroPrimary"
    class="inline-flex h-11 min-w-[176px] items-center justify-center gap-2"
    @click="emit('start')"
  >
    <template #prefix>
      <RocketOutlined class="text-base text-white" />
    </template>
    {{ actionLabel || (isLoggedIn ? '开始生成简历' : '立即开始') }}
    <template #suffix>
      <ThunderboltOutlined class="text-base text-white/80" />
    </template>
  </GradientButton>
</template>
