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
})

const emit = defineEmits(['start'])
</script>

<template>
  <GradientButton
    variant="heroPrimary"
    class="inline-flex h-10 min-w-[160px] items-center justify-center gap-2 shadow-lift transition-all duration-200 hover:shadow-float"
    @click="emit('start')"
  >
    <template #prefix>
      <RocketOutlined class="text-base text-brand" />
    </template>
    {{ isLoggedIn ? '开始生成简历' : '立即开始' }}
    <template #suffix>
      <ThunderboltOutlined class="text-base text-accent" />
    </template>
  </GradientButton>
</template>
