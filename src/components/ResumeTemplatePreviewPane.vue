<script setup>
/**
 * 简历模板预览窗格
 * 用于 AI 优化对比和历史版本查看；只渲染传入快照，不参与编辑器分页、保存或导出。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { FullscreenOutlined } from '@ant-design/icons-vue'
import {
  DEFAULT_MODULES,
  extractEditorSettings,
  fontColorsToCssVars,
} from '@/constants/editorSettings'
import { EMPTY_SKIN_OVERRIDES, skinThemeToCssVars } from '@/constants/skin'
import { clampTemplateId } from '@/constants/templateRegistry'
import { normalizeResumeFields } from '@/constants/resumeFieldSchema'
import { useMediaQuery } from '@/composables/useMediaQuery'

const A4_WIDTH_PX = 794

const props = defineProps({
  resume: { type: [Object, String], default: () => ({}) },
  templateId: { type: Number, default: 1 },
  scale: { type: Number, default: 0.45 },
  maxHeight: { type: String, default: 'none' },
  scrollable: { type: Boolean, default: false },
  fullscreenable: { type: Boolean, default: true },
  fullscreenTitle: { type: String, default: '模板预览' },
})

const paperRef = ref(null)
const rawHeight = ref(1123)
const fullscreenOpen = ref(false)
const isMobile = useMediaQuery()
let resizeObserver = null

const resolvedResume = computed(() => {
  if (typeof props.resume === 'string') {
    try {
      return normalizeResumeFields(JSON.parse(props.resume || '{}'))
    } catch {
      return {}
    }
  }
  return normalizeResumeFields(props.resume || {})
})

const resolvedTemplateId = computed(() => clampTemplateId(props.templateId))
const settings = computed(() => extractEditorSettings(resolvedResume.value))
const visibleModules = computed(() => (
  settings.value.modules?.length
    ? settings.value.modules.filter((item) => item.visible !== false).map((item) => item.key)
    : DEFAULT_MODULES.filter((item) => item.visible).map((item) => item.key)
))

const previewStyle = computed(() => ({
  width: `${A4_WIDTH_PX}px`,
  transform: `scale(${props.scale})`,
  transformOrigin: 'top left',
  ...fontColorsToCssVars({
    templateId: resolvedTemplateId.value,
    labelColor: settings.value.labelColor,
    basicContentColor: settings.value.basicContentColor,
    nameColor: settings.value.nameColor,
    contentColor: settings.value.contentColor,
  }),
  ...skinThemeToCssVars(settings.value.skinTheme || EMPTY_SKIN_OVERRIDES, resolvedTemplateId.value),
  '--font-family': settings.value.fontFamily,
  '--font-size': `${settings.value.fontSize}px`,
  '--line-height': settings.value.spacing?.lineHeight,
  '--section-gap': `${settings.value.spacing?.sectionGap}px`,
}))

const spacerStyle = computed(() => ({
  width: `${Math.ceil(A4_WIDTH_PX * props.scale)}px`,
  minHeight: `${Math.ceil(rawHeight.value * props.scale)}px`,
}))

const fullscreenScale = computed(() => (isMobile.value ? 0.42 : 0.78))

function updateRawHeight() {
  if (!paperRef.value) return
  rawHeight.value = Math.max(1123, paperRef.value.scrollHeight || paperRef.value.offsetHeight || 1123)
}

watch(
  () => [resolvedResume.value, resolvedTemplateId.value, props.scale],
  async () => {
    await nextTick()
    updateRawHeight()
  },
  { flush: 'post' },
)

onMounted(async () => {
  await nextTick()
  updateRawHeight()
  if (paperRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateRawHeight)
    resizeObserver.observe(paperRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    class="template-preview-pane"
    :class="{ 'template-preview-pane--scrollable': scrollable }"
    :style="{ maxHeight }"
  >
    <button
      v-if="fullscreenable"
      type="button"
      class="template-preview-pane__fullscreen"
      @click.stop="fullscreenOpen = true"
    >
      <FullscreenOutlined />
      <span>全屏查看</span>
    </button>
    <div class="template-preview-pane__spacer" :style="spacerStyle">
      <div ref="paperRef" class="template-preview-pane__paper" :style="previewStyle">
        <ResumeTemplate
          :resume="resolvedResume"
          :template-id="resolvedTemplateId"
          :visible-modules="visibleModules"
        />
      </div>
    </div>

    <a-modal
      v-model:open="fullscreenOpen"
      :title="fullscreenTitle"
      :footer="null"
      :width="isMobile ? '96vw' : 1060"
      :body-style="{ maxHeight: 'calc(100vh - 108px)', overflowY: 'auto' }"
      class="modal-fresh"
      destroy-on-close
    >
      <!-- 全屏查看使用更大比例和弹窗单一滚动区域，避免普通对比区堆叠滚动条。 -->
      <ResumeTemplatePreviewPane
        :resume="resolvedResume"
        :template-id="resolvedTemplateId"
        :scale="fullscreenScale"
        max-height="none"
        :fullscreenable="false"
      />
    </a-modal>
  </div>
</template>

<style scoped>
/* 预览窗格使用正常模板 DOM 缩放显示，避免历史和对比退化成文本摘要。 */
.template-preview-pane {
  @apply relative overflow-hidden rounded-card border border-line/50 bg-white p-3;
}

/* 仅历史缩略等少数紧凑场景主动开启内部滚动；AI 对比默认交给弹窗整体滚动。 */
.template-preview-pane--scrollable {
  @apply overflow-auto;
}

.template-preview-pane__fullscreen {
  @apply absolute right-3 top-3 z-10 inline-flex min-h-8 items-center gap-1 rounded-button bg-white/90 px-2.5 text-xs font-medium text-brand-dark shadow-sm backdrop-blur transition-colors hover:bg-brand-lighter;
}

.template-preview-pane__spacer {
  @apply relative mx-auto;
}

.template-preview-pane__paper {
  @apply absolute left-0 top-0 bg-white px-8 py-8 text-sm text-ink;
}
</style>
