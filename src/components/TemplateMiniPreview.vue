<script setup>
/**
 * 模板缩略预览 - 缩放渲染真实模板组件
 * previewMode: thumb 缩略图 | page A4 单页 | full 完整简历
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { DEFAULT_MODULES, fontColorsToCssVars } from '@/constants/editorSettings'
import { skinThemeToCssVars, EMPTY_SKIN_OVERRIDES, getSkinOverrideClassNames } from '@/constants/skin'
import { DEFAULT_TEMPLATE_ID, getTemplateName } from '@/constants/templateRegistry'

const props = defineProps({
  templateId: {
    type: Number,
    default: DEFAULT_TEMPLATE_ID,
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
  // 统一预览草稿设置，使 60 套模板缩略图与编辑器 A4 页面使用同一组变量。
  appearance: {
    type: Object,
    default: () => ({}),
  },
  visibleModules: {
    type: Array,
    default: () => DEFAULT_MODULES.map((module) => ({ ...module })),
  },
})

// 新旧调用都规整为模块对象，兼容历史上只传模块 key 的预览入口。
const resolvedVisibleModules = computed(() => {
  if (!props.visibleModules?.length) return DEFAULT_MODULES.map((module) => ({ ...module }))
  const byKey = new Map(props.visibleModules.map((item) => [typeof item === 'string' ? item : item.key, item]))
  return DEFAULT_MODULES.map((module) => {
    const selected = byKey.get(module.key)
    return { ...module, ...(typeof selected === 'object' ? selected : {}), visible: selected == null ? false : typeof selected === 'string' ? true : selected.visible !== false }
  })
})

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

// 缩略图和完整预览也使用与 A4 主预览相同的显式颜色覆盖标记。
const skinOverrideClasses = computed(() => getSkinOverrideClassNames(props.appearance?.skinTheme))

// 按 templateId 注入模板默认字体色 + 皮肤色 CSS 变量（与编辑器预览一致）
// 预览变量沿用编辑器的字体、字号、行距、页边距、颜色和模板专属皮肤。
const templatePreviewStyle = computed(() => {
  const appearance = props.appearance || {}
  const spacing = appearance.spacing || {}
  return {
    ...fontColorsToCssVars({
      templateId: props.templateId,
      labelColor: appearance.labelColor,
      basicContentColor: appearance.basicContentColor,
      nameColor: appearance.nameColor,
      contentColor: appearance.contentColor,
    }),
    ...skinThemeToCssVars(appearance.skinTheme || EMPTY_SKIN_OVERRIDES, props.templateId),
    '--font-family': appearance.fontFamily || "'Microsoft YaHei', sans-serif",
    '--font-size': `${appearance.fontSize || 13}px`,
    '--line-height': spacing.lineHeight ?? 1.6,
    '--section-gap': `${spacing.sectionGap ?? 5}px`,
    '--preview-padding': `${spacing.padding ?? 0}px`,
    paddingTop: `${spacing.pageTopGap ?? 0}px`,
    paddingRight: `${spacing.padding ?? 0}px`,
    paddingBottom: `${spacing.pageBottomGap ?? 0}px`,
    paddingLeft: `${spacing.padding ?? 0}px`,
  }
})

watch(
  () => [props.resume, props.templateId, props.previewMode, props.scale, props.appearance, props.visibleModules],
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
          class="w-[794px] text-[var(--font-size,13px)] leading-[var(--line-height,1.6)] text-ink"
          :class="skinOverrideClasses"
          :style="templatePreviewStyle"
        >
          <ResumeTemplate
            :resume="resume"
            :template-id="templateId"
            :visible-modules="resolvedVisibleModules"
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
