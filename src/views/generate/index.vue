<!--
  简历生成统一页
  双模式：上传 PDF 优化 / 表单填写生成
  支持 URL 参数 ?mode=upload | ?mode=form
-->
<template>
  <div class="min-h-[calc(100vh-64px)] animate-fade-in pb-16">
    <PageHero
      compact
      title="AI 智能生成简历"
      subtitle="上传 PDF 或填写信息，两种方式任选"
    />

    <div class="relative z-10 mx-auto -mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto mb-6 w-full max-w-md sm:max-w-lg">
        <div class="rounded-card border border-line/50 bg-surface/90 p-1.5 shadow-card backdrop-blur-sm">
          <a-segmented
            v-model:value="activeMode"
            :options="modeOptions"
            block
            size="large"
            class="gen-mode-segmented w-full"
          />
        </div>
      </div>

      <UploadPanel v-show="activeMode === 'upload'" />
      <FormPanel v-show="activeMode === 'form'" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import UploadPanel from './components/UploadPanel.vue'
import FormPanel from './components/FormPanel.vue'

const route = useRoute()
const router = useRouter()

const modeOptions = [
  { label: '上传 PDF', value: 'upload' },
  { label: '表单填写', value: 'form' },
]

const activeMode = ref('form')

// 从 URL query 初始化模式
onMounted(() => {
  const mode = route.query.mode
  if (mode === 'upload' || mode === 'form') {
    activeMode.value = mode
  }
})

// 切换模式时同步 URL（便于分享与导航）
watch(activeMode, (val) => {
  if (route.query.mode !== val) {
    router.replace({ query: { ...route.query, mode: val } })
  }
})
</script>

<style scoped>
:deep(.gen-mode-segmented) {
  @apply bg-transparent;
}

:deep(.gen-mode-segmented .ant-segmented-item-selected) {
  @apply font-semibold text-brand-dark shadow-soft;
}

:deep(.gen-mode-segmented .ant-segmented-item-label) {
  @apply py-1;
}
</style>
