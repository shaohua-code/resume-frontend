<script setup>
/**
 * 模板缩略预览 - 缩放渲染真实模板组件
 * previewMode: thumb 缩略图 | page A4 单页 | full 完整简历
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { DEFAULT_MODULES, fontColorsToCssVars } from '@/constants/editorSettings'
import { getTemplateName } from '@/constants/templateRegistry'

const props = defineProps({
  templateId: {
    type: Number,
    default: 1,
  },
  resume: {
    type: Object,
    required: true,
  },
  scale: {
    type: Number,
    default: 0.32,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  // thumb: 520px 缩略 | page: A4 整页 | full: 完整简历高度
  previewMode: {
    type: String,
    default: 'thumb',
    validator: (value) => ['thumb', 'page', 'full'].includes(value),
  },
})

const visibleModules = DEFAULT_MODULES.filter((m) => m.visible).map((m) => m.key)

// A4 纸张尺寸（与编辑器预览一致）
const A4_WIDTH = 794
const A4_HEIGHT = 1123
const THUMB_HEIGHT = 520

const contentRef = ref(null)
const contentHeight = ref(A4_HEIGHT)
let resizeObserver = null

// 测量完整简历内容高度（full 模式）
async function measureContentHeight() {
  await nextTick()
  if (!contentRef.value) return
  contentHeight.value = Math.max(contentRef.value.scrollHeight, A4_HEIGHT)
}

// 根据预览模式计算容器高度
const displayHeight = computed(() => {
  if (props.previewMode === 'full') return contentHeight.value
  if (props.previewMode === 'page') return A4_HEIGHT
  return THUMB_HEIGHT
})

const wrapperStyle = computed(() => ({
  width: `${A4_WIDTH * props.scale}px`,
  height: `${displayHeight.value * props.scale}px`,
}))

const innerStyle = computed(() => ({
  width: `${A4_WIDTH}px`,
  transform: `scale(${props.scale})`,
  transformOrigin: 'top left',
}))

const wrapperClass = computed(() => {
  if (props.previewMode === 'full') return 'overflow-visible'
  return 'overflow-hidden'
})

// 按 templateId 注入模板默认字体色 CSS 变量（与编辑器预览一致）
const templateFontStyle = computed(() =>
  fontColorsToCssVars({ templateId: props.templateId }),
)

watch(
  () => [props.resume, props.templateId, props.previewMode, props.scale],
  () => {
    if (props.previewMode === 'full') measureContentHeight()
  },
  { deep: true },
)

onMounted(() => {
  if (props.previewMode !== 'full') return
  measureContentHeight()
  resizeObserver = new ResizeObserver(() => measureContentHeight())
  if (contentRef.value) resizeObserver.observe(contentRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="relative bg-white border rounded-card border-line/60 shadow-card"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <div class="origin-top-left bg-white pointer-events-none" :style="innerStyle">
        <div
          ref="contentRef"
          class="w-[794px] px-8 py-8 text-sm leading-relaxed text-ink"
          :style="templateFontStyle"
        >
          <ResumeTemplate
            :resume="resume"
            :template-id="templateId"
            :visible-modules="visibleModules"
          />
        </div>
      </div>
      <!-- 缩略模式保留底部渐变，暗示还有更多内容 -->
      <div
        v-if="previewMode === 'thumb'"
        class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/90 to-transparent"
      />
    </div>
    <p v-if="showLabel" class="mt-2 text-sm font-medium text-ink">{{ getTemplateName(templateId) }}</p>
  </div>
</template>
