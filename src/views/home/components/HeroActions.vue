<script setup>
/**
 * 首屏双 CTA - 主按钮高亮 + 次按钮毛玻璃
 */
import { RocketOutlined, CloudUploadOutlined } from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'

defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['start', 'upload'])
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
    <GradientButton variant="heroPrimary" @click="emit('start')">
      <RocketOutlined />
      {{ isLoggedIn ? '开始生成简历' : '立即开始' }}
    </GradientButton>
    <button class="btn-hero-ghost" @click="emit('upload')">
      <CloudUploadOutlined /> 上传 PDF 优化
    </button>
  </div>
</template>
