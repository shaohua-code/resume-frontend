<script setup>
/**
 * 流式生成/优化时的简历模板实时预览
 * 固定使用 Tpl03 应届校招，不展示原始 JSON
 */
import { computed } from 'vue'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { DEFAULT_MODULES, fontColorsToCssVars } from '@/constants/editorSettings'
import { parsePartialResumeJson, hasStreamResumeContent } from '../utils/streamResumeParser'

const props = defineProps({
  streamText: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  scale: {
    type: Number,
    default: 0.45,
  },
})

// 流式文本增量解析为简历对象
const resume = computed(() => parsePartialResumeJson(props.streamText))
const hasContent = computed(() => hasStreamResumeContent(resume.value))
const visibleModules = DEFAULT_MODULES.filter((m) => m.visible).map((m) => m.key)

const wrapperStyle = computed(() => ({
  width: `${794 * props.scale}px`,
  minHeight: `${400 * props.scale}px`,
}))

const innerStyle = computed(() => ({
  width: '794px',
  transform: `scale(${props.scale})`,
  transformOrigin: 'top left',
}))

// 模板 3 默认字体色 CSS 变量（与编辑器/ preset 一致）
const templateFontStyle = computed(() => fontColorsToCssVars({ templateId: 3 }))
</script>

<template>
  <div class="animate-fade-in">
    <p class="mb-3 text-center text-sm font-medium text-brand-dark">
      AI 正在生成你的简历...
    </p>

    <div
      v-if="hasContent"
      class="relative mx-auto overflow-hidden rounded-card border border-line/50 bg-white shadow-card"
      :style="wrapperStyle"
    >
      <div class="pointer-events-none origin-top-left bg-white" :style="innerStyle">
        <div
          class="w-[794px] px-8 py-8 text-sm leading-relaxed text-ink"
          :style="templateFontStyle"
        >
          <ResumeTemplate
            :resume="resume"
            :template-id="3"
            :visible-modules="visibleModules"
          />
        </div>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
      <span
        v-if="loading"
        class="absolute bottom-3 left-4 inline-block h-4 w-0.5 animate-pulse bg-brand-dark"
      />
    </div>

    <!-- 未解析出字段时显示骨架屏 -->
    <div
      v-else
      class="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-line/40 bg-cream/80 p-8"
    >
      <div class="skeleton-soft h-6 w-32 rounded-button" />
      <div class="skeleton-soft h-4 w-48 rounded-button" />
      <div class="flex w-full flex-col gap-2">
        <div class="skeleton-soft h-3 w-full rounded" />
        <div class="skeleton-soft h-3 w-5/6 rounded" />
        <div class="skeleton-soft h-3 w-4/6 rounded" />
      </div>
      <div v-if="loading" class="flex gap-1.5">
        <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 0ms" />
        <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 150ms" />
        <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 300ms" />
      </div>
    </div>
  </div>
</template>
