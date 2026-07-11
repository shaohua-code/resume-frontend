<script setup>
/**
 * 流式生成/优化时的简历模板实时预览
 * 使用当前选中模板渲染，不展示原始 JSON
 */
import { computed } from 'vue'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { DEFAULT_MODULES, fontColorsToCssVars } from '@/constants/editorSettings'
import { skinThemeToCssVars, EMPTY_SKIN_OVERRIDES } from '@/constants/skin'
import { clampTemplateId } from '@/constants/templateRegistry'
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
  // 预览模板 ID，与 /templates 选择及编辑器 templateId 对齐
  templateId: {
    type: Number,
    default: 3,
  },
  // 流式过程中的提示文案
  loadingHint: {
    type: String,
    default: 'AI 正在生成你的简历...',
  },
  // 为 true 时高度随内容收缩，去除底部留白（JD 优化弹窗用）
  fitContent: {
    type: Boolean,
    default: false,
  },
})

// 流式文本增量解析为简历对象
const resume = computed(() => parsePartialResumeJson(props.streamText))
const hasContent = computed(() => hasStreamResumeContent(resume.value))
const visibleModules = DEFAULT_MODULES.filter((m) => m.visible).map((m) => m.key)
// 规范化模板 ID
const resolvedTemplateId = computed(() => clampTemplateId(props.templateId))

// 外层容器样式：fitContent 模式不固定 minHeight，避免大量留白
const wrapperStyle = computed(() => {
  const base = { width: `${794 * props.scale}px` }
  if (props.fitContent) {
    return { ...base, height: 'auto' }
  }
  return { ...base, minHeight: `${400 * props.scale}px` }
})

const innerStyle = computed(() => ({
  width: '794px',
  transform: `scale(${props.scale})`,
  transformOrigin: 'top left',
}))

// 按当前模板应用默认字体色与皮肤 CSS 变量
const templatePreviewStyle = computed(() => ({
  ...fontColorsToCssVars({ templateId: resolvedTemplateId.value }),
  ...skinThemeToCssVars(EMPTY_SKIN_OVERRIDES, resolvedTemplateId.value),
}))
</script>

<template>
  <div class="animate-fade-in">
    <p class="mb-3 text-center text-sm font-medium text-brand-dark">
      {{ loadingHint }}
    </p>

    <div
      v-if="hasContent"
      class="relative mx-auto overflow-hidden rounded-card border border-line/50 bg-white shadow-card"
      :class="fitContent ? 'max-h-[70vh] overflow-y-auto' : ''"
      :style="wrapperStyle"
    >
      <div class="pointer-events-none origin-top-left bg-white" :style="innerStyle">
        <div
          class="w-[794px] px-8 py-8 text-sm leading-relaxed text-ink"
          :style="templatePreviewStyle"
        >
          <ResumeTemplate
            :resume="resume"
            :template-id="resolvedTemplateId"
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
      <div class="h-6 w-32 rounded-button skeleton-soft" />
      <div class="h-4 w-48 rounded-button skeleton-soft" />
      <div class="flex w-full flex-col gap-2">
        <div class="h-3 w-full rounded skeleton-soft" />
        <div class="h-3 w-5/6 rounded skeleton-soft" />
        <div class="h-3 w-4/6 rounded skeleton-soft" />
      </div>
      <div v-if="loading" class="flex gap-1.5">
        <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 0ms" />
        <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 150ms" />
        <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 300ms" />
      </div>
    </div>
  </div>
</template>
