<script setup>
/**
 * 流式生成/优化时的简历模板实时预览
 * 使用当前选中模板渲染，不展示原始 JSON
 */
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { DEFAULT_MODULES, fontColorsToCssVars } from '@/constants/editorSettings'
import { skinThemeToCssVars, EMPTY_SKIN_OVERRIDES } from '@/constants/skin'
import { clampTemplateId } from '@/constants/templateRegistry'
import { usePreviewScale } from '@/composables/usePreviewScale'
import { parsePartialResumeJson, hasStreamResumeContent } from '../utils/streamResumeParser'

const A4_WIDTH_PX = 794
const MAX_PREVIEW_VH = 0.7

const props = defineProps({
  streamText: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // 桌面端缩放上限，H5 会按容器宽度等比缩小
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
})

const containerRef = ref(null)
const innerRef = ref(null)
/** 可滚动预览容器：流式输出时自动贴底 */
const scrollBoxRef = ref(null)
const rawContentHeight = ref(0)
let resizeObserver = null

/** 流式增量后将预览滚到底部 */
async function scrollPreviewToBottom() {
  await nextTick()
  const el = scrollBoxRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

// 根据容器宽度自适应缩放，不超过 props.scale
const { scale: containerScale } = usePreviewScale(containerRef, {
  horizontalPadding: 0,
  maxScale: 1,
})
const effectiveScale = computed(() => Math.min(props.scale, containerScale.value))

// 流式文本增量解析为简历对象
const resume = computed(() => parsePartialResumeJson(props.streamText))
const hasContent = computed(() => hasStreamResumeContent(resume.value))
const visibleModules = DEFAULT_MODULES.filter((m) => m.visible).map((m) => m.key)
const resolvedTemplateId = computed(() => clampTemplateId(props.templateId))

// 缩放后的视觉高度与宽度
const scaledHeight = computed(() => Math.ceil(rawContentHeight.value * effectiveScale.value))
const scaledWidth = computed(() => Math.ceil(A4_WIDTH_PX * effectiveScale.value))
const maxPreviewHeightPx = computed(() => Math.floor(window.innerHeight * MAX_PREVIEW_VH))
const exceedsMaxHeight = computed(() => scaledHeight.value > maxPreviewHeightPx.value)

/** 测量内容原始高度，修正 transform scale 的布局占位 */
function updateScaledHeight() {
  if (!innerRef.value) return
  rawContentHeight.value = innerRef.value.scrollHeight || innerRef.value.offsetHeight || 0
}

// 外层容器样式：精确匹配视觉高度，消除底部留白
const wrapperStyle = computed(() => {
  const height = scaledHeight.value || undefined
  return {
    width: `${scaledWidth.value}px`,
    height: height ? `${Math.min(height, maxPreviewHeightPx.value)}px` : 'auto',
    maxHeight: `${maxPreviewHeightPx.value}px`,
    overflow: exceedsMaxHeight.value ? 'auto' : 'hidden',
  }
})

// 内层滚动占位（超长时可滚动）
const scrollSpacerStyle = computed(() => {
  if (!scaledHeight.value) return {}
  return {
    width: `${scaledWidth.value}px`,
    height: `${scaledHeight.value}px`,
    position: 'relative',
  }
})

const innerStyle = computed(() => ({
  width: `${A4_WIDTH_PX}px`,
  transform: `scale(${effectiveScale.value})`,
  transformOrigin: 'top left',
}))

const templatePreviewStyle = computed(() => ({
  ...fontColorsToCssVars({ templateId: resolvedTemplateId.value }),
  ...skinThemeToCssVars(EMPTY_SKIN_OVERRIDES, resolvedTemplateId.value),
}))

watch(
  () => [props.streamText, effectiveScale.value, props.templateId, resume.value, props.loading],
  async () => {
    await nextTick()
    updateScaledHeight()
    // AI 生成 / 岗位优化流式过程中始终滚到底部
    if (props.loading) await scrollPreviewToBottom()
  },
  { flush: 'post' },
)

onMounted(async () => {
  await nextTick()
  updateScaledHeight()
  if (innerRef.value && typeof ResizeObserver !== 'undefined') {
    // 内容高度变化时同步测量；流式中同步贴底
    resizeObserver = new ResizeObserver(() => {
      updateScaledHeight()
      if (props.loading) scrollPreviewToBottom()
    })
    resizeObserver.observe(innerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div ref="containerRef" class="animate-fade-in">
    <p class="mb-2 text-center text-sm font-medium text-brand-dark lg:mb-3">
      {{ loadingHint }}
    </p>

    <div
      v-if="hasContent"
      ref="scrollBoxRef"
      class="relative mx-auto rounded-card border border-line/30 bg-white"
      :style="wrapperStyle"
    >
      <!-- 绝对定位缩放层 + 精确占位高度 -->
      <div :style="scrollSpacerStyle">
        <div
          ref="innerRef"
          class="pointer-events-none absolute left-0 top-0 origin-top-left bg-white"
          :style="innerStyle"
        >
          <div
            class="w-[794px] px-4 py-4 text-sm leading-relaxed text-ink lg:px-8 lg:py-8"
            :style="templatePreviewStyle"
          >
            <ResumeTemplate
              :resume="resume"
              :template-id="resolvedTemplateId"
              :visible-modules="visibleModules"
            />
          </div>
        </div>
      </div>
      <span
        v-if="loading"
        class="absolute bottom-3 left-4 z-10 inline-block h-4 w-0.5 animate-pulse bg-brand-dark"
      />
    </div>

    <!-- 未解析出字段时显示骨架屏 -->
    <div
      v-else
      class="mx-auto flex max-w-md flex-col items-center gap-4 rounded-card border border-line/40 bg-cream/80 p-4 lg:p-8"
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
