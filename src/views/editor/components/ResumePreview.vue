<!--
  简历预览面板组件
  负责右侧 A4 多页预览、分页计算、页面导航
  核心设计：
  1. 使用浏览器打印 API + CSS page-break 导出矢量 PDF
  2. 屏幕预览：每页 overflow 窗口 + 负 marginTop 切片，与 PDF 分页对齐
  3. 分页线严格按 A4 可用高度直接切片，不因标题或条目提前换页
  4. 模块和条目允许跨页，版面密度由字体与间距设置控制
-->
<template>
  <div
    ref="panelRef"
    class="resume-preview-panel"
    :class="editPanelCollapsed ? 'resume-preview-panel--mobile-collapsed' : 'resume-preview-panel--mobile-expanded'"
  >
    <!-- 页面导航栏：多页时桌面端展示；移动端直接纵向滚动多张 A4 -->
    <div v-if="pageCount > 1" class="page-nav-bar">
      <div class="page-nav-info">
        <span class="page-nav-label">共 {{ pageCount }} 页</span>
      </div>
      <div class="page-nav-buttons">
        <button
          type="button"
          class="btn-ghost-sm px-3 text-xs"
          :disabled="currentPage <= 1"
          @click="scrollToPage(currentPage - 1)"
        >
          <LeftOutlined /> 上一页
        </button>
        <a-select
          :value="currentPage"
          class="page-nav-select input-field"
          @change="scrollToPage"
        >
          <a-select-option v-for="p in pageCount" :key="p" :value="p">第 {{ p }} 页</a-select-option>
        </a-select>
        <button
          type="button"
          class="btn-ghost-sm px-3 text-xs"
          :disabled="currentPage >= pageCount"
          @click="scrollToPage(currentPage + 1)"
        >
          下一页
          <RightOutlined />
        </button>
      </div>
    </div>

    <!-- 多页预览：隐藏层测量高度 + 每页 overflow 窗口切片显示 -->
    <div ref="stageRef" class="preview-stage" :style="previewStageStyle">
      <!-- 隐藏完整文档：用于分页计算与 PDF 导出 -->
      <div class="measure-layer" aria-hidden="true">
        <div
          ref="contentRef"
          id="resume-preview-content"
          class="resume-preview"
          :class="'template-' + templateId"
          :style="previewStyle"
        >
          <ResumeTemplate
            :key="'measure-' + templateId"
            :resume="resume"
            :template-id="templateId"
            :visible-modules="visibleModules"
          />
        </div>
      </div>

      <!-- 可见分页：移动端等比缩放 + overflow 窗口切片 -->
      <div
        v-for="n in pageCount"
        :key="`${n}-${templateId}-${previewRenderKey}`"
        class="preview-page-outer"
        :class="{ active: n === currentPage }"
        :style="getPageOuterStyle(n)"
      >
        <div class="preview-page-scaler" :style="pageScalerStyle">
          <div
            class="preview-page"
            :style="{ height: getPreviewPageOuterHeight(n) + 'px' }"
          >
            <div
              class="page-viewport"
              :style="{
                marginTop: pageTopGap + 'px',
                height: getPageViewportHeight(n) + 'px',
                maxHeight: effectivePageHeight + 'px',
              }"
            >
              <div
                class="resume-preview"
                :class="'template-' + templateId"
                :style="{ ...previewStyle, marginTop: -(pageBreaks[n - 1] || 0) + 'px' }"
                @click="handleSectionClick"
              >
                <ResumeTemplate
                  :key="`page-${n}-${templateId}`"
                  :resume="resume"
                  :template-id="templateId"
                  :visible-modules="visibleModules"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { skinThemeToCssVars, EMPTY_SKIN_OVERRIDES } from '@/constants/skin'
import {
  DEFAULT_SPACING,
  fontColorsToCssVars,
} from '@/constants/editorSettings'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { usePreviewScale } from '@/composables/usePreviewScale'
import { calculateResumePageBreaks } from '@/utils/resumePagination'

const A4_WIDTH_PX = 794

const props = defineProps({
  resume: { type: Object, required: true },
  templateId: { type: Number, required: true },
  spacing: { type: Object, default: () => ({ ...DEFAULT_SPACING }) },
  fontSize: { type: [String, Number], default: 'medium' },
  fontFamily: { type: String, default: "'Microsoft YaHei', sans-serif" },
  labelColor: { type: String, default: null },
  basicContentColor: { type: String, default: null },
  nameColor: { type: String, default: null },
  contentColor: { type: String, default: null },
  skinTheme: { type: Object, default: () => ({ ...EMPTY_SKIN_OVERRIDES }) },
  visibleModules: { type: Array, default: () => [] },
  // 底部编辑栏是否收起，用于移动端预览区高度计算
  editPanelCollapsed: { type: Boolean, default: true },
})

const emit = defineEmits(['section-click'])

// 缩放由 preview-stage 容器宽度驱动
const panelRef = ref(null)
const stageRef = ref(null)
const { scale: previewScale } = usePreviewScale(stageRef, {
  baseWidth: A4_WIDTH_PX,
  horizontalPadding: 0,
  maxScale: 1,
})

// 容器宽度不足 A4 时启用等比缩放
const needsScale = computed(() => previewScale.value < 0.999)

// 多页间距随缩放比例同步缩小
const previewStageStyle = computed(() => {
  if (!needsScale.value) {
    return { gap: '24px' }
  }
  return { gap: `${24 * previewScale.value}px` }
})

// 794px 原始尺寸 + transform 等比缩小
const pageScalerStyle = computed(() => {
  if (!needsScale.value) {
    return { width: `${A4_WIDTH_PX}px` }
  }
  return {
    width: `${A4_WIDTH_PX}px`,
    transform: `scale(${previewScale.value})`,
    transformOrigin: 'top left',
  }
})

// 外层容器尺寸跟随缩放比例，避免横向溢出
function getPreviewPageOuterHeight() {
  return pageHeightPx.value
}

function getPageOuterStyle(n) {
  const pageHeight = getPreviewPageOuterHeight()
  if (!needsScale.value) {
    return { width: `${A4_WIDTH_PX}px`, height: `${pageHeight}px` }
  }
  const scale = previewScale.value
  return {
    width: `${A4_WIDTH_PX * scale}px`,
    height: `${pageHeight * scale}px`,
  }
}

// 皮肤 CSS 变量（仅 .rt-title 使用 titleColor，其余控制背景/边框）
const skinCssVars = computed(() => skinThemeToCssVars(props.skinTheme, props.templateId))

const fontSizeMap = {
  small: '12px',
  medium: '13px',
  large: '15px',
}

// 解析字号：支持数字(px)或字符串枚举
function resolveFontSize(size) {
  if (typeof size === 'number') return size + 'px'
  return fontSizeMap[size] || fontSizeMap.medium
}

const MODULE_SELECTOR = '[data-resume-module]'
const PAGE_ITEM_SELECTOR = '.rt-item, [data-page-item]'
const PAGE_TITLE_SELECTOR = '.rt-title, [data-page-title], h2, h3'
const PAGE_TEXT_SELECTOR = 'p, li, .rt-text, .rt-desc, [data-page-text], [class*="-text"], [class*="-desc"]'
const PAGE_DESC_SELECTOR = '.rt-desc, [class*="-desc"], [data-page-text]'
const PAGE_KEEP_SELECTOR = '.no-break, .rt-keep-together, [data-page-keep="always"]'
const MIN_PAGE_CONTENT = 24

// A4 高度：210×297mm，96dpi 下 297mm ≈ 1123px
const A4_HEIGHT_MM = 297
const MM_TO_PX = 96 / 25.4
const pageHeightPx = ref(Math.round(A4_HEIGHT_MM * MM_TO_PX))

// 页眉/页脚安全边距：缩小每页可用内容高度，避免分页截断文字
const pageTopGap = computed(() => props.spacing?.pageTopGap ?? DEFAULT_SPACING.pageTopGap)
const pageBottomGap = computed(() => props.spacing?.pageBottomGap ?? DEFAULT_SPACING.pageBottomGap)
const effectivePageHeight = computed(() =>
  Math.max(MIN_PAGE_CONTENT, pageHeightPx.value - pageTopGap.value - pageBottomGap.value),
)

// 计算预览样式（CSS 变量会继承到 ResumeTemplate）
const previewStyle = computed(() => ({
  '--section-gap': (props.spacing?.sectionGap ?? DEFAULT_SPACING.sectionGap) + 'px',
  '--line-height': props.spacing?.lineHeight ?? DEFAULT_SPACING.lineHeight,
  '--preview-padding': (props.spacing?.padding ?? DEFAULT_SPACING.padding) + 'px',
  '--page-top-gap': pageTopGap.value + 'px',
  '--page-bottom-gap': pageBottomGap.value + 'px',
  '--font-size': resolveFontSize(props.fontSize),
  '--font-family': props.fontFamily,
  ...skinCssVars.value,
  ...fontColorsToCssVars({
    labelColor: props.labelColor,
    basicContentColor: props.basicContentColor,
    nameColor: props.nameColor,
    contentColor: props.contentColor,
    templateId: props.templateId,
  }),
}))

// 设置变更时强制刷新分页窗口
const previewRenderKey = computed(() => [
  props.templateId,
  props.fontSize,
  props.fontFamily,
  props.labelColor,
  props.basicContentColor,
  props.nameColor,
  props.contentColor,
  JSON.stringify(props.skinTheme),
  props.spacing?.sectionGap,
  props.spacing?.lineHeight,
  props.spacing?.padding,
  props.spacing?.pageTopGap,
  props.spacing?.pageBottomGap,
].join('-'))

// 点击预览区域，根据 data-resume-module 跳转编辑 Tab
function handleSectionClick(e) {
  let el = e.target
  const root = e.currentTarget
  while (el && el !== root) {
    const moduleKey = el.getAttribute?.('data-resume-module')
    if (moduleKey) {
      emit('section-click', moduleKey)
      return
    }
    el = el.parentElement
  }
  // 兜底：按 section 标题文字推断
  const section = e.target.closest('section')
  if (!section) {
    const header = e.target.closest('header')
    if (header) {
      emit('section-click', 'basic')
    }
    return
  }
  const text = section.textContent || ''
  let moduleKey = 'basic'
  if (text.includes('技能')) moduleKey = 'skills'
  else if (text.includes('项目')) moduleKey = 'projects'
  else if (text.includes('实习') || text.includes('工作')) moduleKey = 'internships'
  else if (text.includes('获奖') || text.includes('证书') || text.includes('荣誉')) moduleKey = 'awards'
  emit('section-click', moduleKey)
}

// 当前页内容区高度（可小于 A4，不足部分由 preview-page 白底留白）
function getPageContentHeight(n) {
  const start = pageBreaks.value[n - 1] ?? 0
  const end = n < pageCount.value
    ? Math.min(pageBreaks.value[n] ?? totalHeight.value, totalHeight.value)
    : totalHeight.value
  return Math.max(0, end - start)
}

// 模板 8 左侧为整页色块，最后一页内容不足时也需要铺满 A4 可用高度
function getPageViewportHeight(n) {
  if (Number(props.templateId) === 8) {
    return effectivePageHeight.value
  }
  return getPageContentHeight(n)
}

// 按屏幕可见预览页克隆 DOM，保证打印分页与页面预览完全一致
function buildPrintPageElements() {
  const stage = stageRef.value
  const visiblePages = [...(stage?.querySelectorAll('.preview-page') || [])]
  if (visiblePages.length !== pageCount.value) return []

  return visiblePages.map((pageEl) => {
    // 整页原样克隆：不重新拼 DOM，不重新计算断点，PDF 与屏幕共用同一裁切窗口。
    const pageClone = pageEl.cloneNode(true)
    pageClone.classList.add('print-page')
    pageClone.querySelectorAll('.resume-preview').forEach((element) => {
      element.style.visibility = 'visible'
      element.style.opacity = '1'
      element.style.cursor = 'default'
    })
    return pageClone
  })
}

// 获取浏览器打印导出所需内容（逐页 DOM，与屏幕预览分页对齐）
function getPrintContent() {
  const pages = buildPrintPageElements()
  if (!pages.length) return null
  return {
    pages,
    pageCount: pageCount.value,
  }
}

// 获取 Word 导出用 HTML 字符串（含内联样式变量）
function getWordHtml() {
  const el = contentRef.value
  if (!el) return ''
  const clone = el.cloneNode(true)
  clone.style.visibility = 'visible'
  clone.style.opacity = '1'
  return clone.outerHTML
}

function measureEl(el, contentRect) {
  const r = el.getBoundingClientRect()
  const top = r.top - contentRect.top
  const height = r.height
  return { el, top, bottom: top + height, height }
}

function topLevelModuleElements(content) {
  return [...content.querySelectorAll(MODULE_SELECTOR)].filter((module) => (
    !module.parentElement?.closest(MODULE_SELECTOR)
  ))
}

function elementsOwnedByModule(module, selector) {
  return [...module.querySelectorAll(selector)].filter((element) => (
    element.closest(MODULE_SELECTOR) === module
  ))
}

function collectPageBlocks(content, contentRect) {
  const blocks = []
  const itemIdByElement = new WeakMap()
  let blockId = 0

  function pushBlock(element, type, id = `${type}-${blockId += 1}`) {
    if (!element) return null
    const box = measureEl(element, contentRect)
    if (box.height <= 0.5) return null
    blocks.push({ id, type, top: box.top, bottom: box.bottom, height: box.height })
    return id
  }

  content.querySelectorAll('header').forEach((header) => pushBlock(header, 'header'))

  topLevelModuleElements(content).forEach((module) => {
    if (module.matches('header')) return
    pushBlock(module, 'module')

    elementsOwnedByModule(module, PAGE_TITLE_SELECTOR).forEach((title) => {
      pushBlock(title, 'title')
    })

    const explicitItems = elementsOwnedByModule(module, PAGE_ITEM_SELECTOR).filter((item) => {
      const parentItem = item.parentElement?.closest(PAGE_ITEM_SELECTOR)
      return !parentItem || parentItem.closest(MODULE_SELECTOR) !== module
    })

    const inferredItems = elementsOwnedByModule(module, PAGE_DESC_SELECTOR)
      .filter((description) => !description.closest(PAGE_ITEM_SELECTOR))
      .map((description) => description.parentElement)
      .filter(Boolean)

    ;[...new Set([...explicitItems, ...inferredItems])].forEach((item) => {
      const id = pushBlock(item, 'item')
      if (id) itemIdByElement.set(item, id)
    })

    elementsOwnedByModule(module, PAGE_KEEP_SELECTOR).forEach((element) => {
      pushBlock(element, 'keep')
    })
  })

  return { blocks, itemIdByElement }
}

function closestMappedItemId(element, content, itemIdByElement) {
  let current = element
  while (current && current !== content) {
    const id = itemIdByElement.get(current)
    if (id) return id
    current = current.parentElement
  }
  return null
}

/**
 * 逐个文本节点读取浏览器真实行矩形，不再依赖某个模板的首个 rt-desc。
 * 同一视觉行上的多个 span/网格列会合并为一个横向分页边界。
 */
function collectTextLines(content, contentRect, itemIdByElement) {
  const fragments = []
  const groupIdByElement = new WeakMap()
  let groupId = 0
  const showText = window.NodeFilter?.SHOW_TEXT ?? 4
  const walker = document.createTreeWalker(content, showText)

  let textNode = walker.nextNode()
  while (textNode) {
    const parent = textNode.parentElement
    const text = textNode.nodeValue?.trim()
    if (parent && text && !parent.closest('[aria-hidden="true"]')) {
      const groupElement = parent.closest(PAGE_TEXT_SELECTOR)
      let currentGroupId = null
      if (groupElement) {
        currentGroupId = groupIdByElement.get(groupElement)
        if (!currentGroupId) {
          currentGroupId = `text-${groupId += 1}`
          groupIdByElement.set(groupElement, currentGroupId)
        }
      }

      const itemId = closestMappedItemId(parent, content, itemIdByElement)
      const range = document.createRange()
      range.selectNodeContents(textNode)
      Array.from(range.getClientRects()).forEach((rect) => {
        const top = rect.top - contentRect.top
        const bottom = rect.bottom - contentRect.top
        if (rect.width > 0.25 && bottom - top > 0.5) {
          fragments.push({
            top,
            bottom,
            left: rect.left - contentRect.left,
            groupId: currentGroupId,
            itemId,
          })
        }
      })
    }
    textNode = walker.nextNode()
  }

  fragments.sort((a, b) => a.top - b.top || a.left - b.left)
  const merged = []
  fragments.forEach((fragment) => {
    const current = merged[merged.length - 1]
    if (current && Math.abs(current.top - fragment.top) < 1.5) {
      current.top = Math.min(current.top, fragment.top)
      current.bottom = Math.max(current.bottom, fragment.bottom)
      if (fragment.groupId) current.groupIds.add(fragment.groupId)
      if (fragment.itemId) current.itemIds.add(fragment.itemId)
      return
    }
    merged.push({
      top: fragment.top,
      bottom: fragment.bottom,
      groupIds: new Set(fragment.groupId ? [fragment.groupId] : []),
      itemIds: new Set(fragment.itemId ? [fragment.itemId] : []),
    })
  })

  const lines = merged.map((line) => ({
    top: line.top,
    bottom: line.bottom,
    groupId: line.groupIds.size === 1 ? [...line.groupIds][0] : null,
    itemIds: [...line.itemIds],
  }))

  const linesByGroup = new Map()
  lines.forEach((line) => {
    if (!line.groupId) return
    const groupLines = linesByGroup.get(line.groupId) || []
    groupLines.push(line)
    linesByGroup.set(line.groupId, groupLines)
  })
  linesByGroup.forEach((groupLines) => {
    groupLines.forEach((line, index) => {
      line.lineIndex = index
      line.lineCount = groupLines.length
    })
  })

  return lines
}

function calcSmartPageBreaks() {
  const content = contentRef.value
  if (!content) return [0]

  const contentRect = content.getBoundingClientRect()
  totalHeight.value = contentRect.height
  if (totalHeight.value <= effectivePageHeight.value) return [0]

  const { blocks, itemIdByElement } = collectPageBlocks(content, contentRect)
  const lines = collectTextLines(content, contentRect, itemIdByElement)

  return calculateResumePageBreaks({
    totalHeight: totalHeight.value,
    pageHeight: effectivePageHeight.value,
    blocks,
    lines,
    minPageContent: MIN_PAGE_CONTENT,
  })
}

const contentRef = ref(null)
const pageCount = ref(1)
const currentPage = ref(1)
const pageBreaks = ref([0])
const totalHeight = ref(0)
let resizeObserver = null
let scrollHandler = null
let recalcFrame = null

function recalcPageCount() {
  const breaks = calcSmartPageBreaks()
  pageBreaks.value = breaks
  pageCount.value = Math.max(1, breaks.length)
}

function schedulePageRecalc() {
  if (recalcFrame !== null) window.cancelAnimationFrame(recalcFrame)
  recalcFrame = window.requestAnimationFrame(() => {
    recalcFrame = null
    recalcPageCount()
  })
}

function scrollToPage(page) {
  const container = panelRef.value
  if (!container) return
  const targetPage = Math.max(1, Math.min(page, pageCount.value))
  const pageEls = container.querySelectorAll('.preview-page-outer')
  const targetEl = pageEls[targetPage - 1]
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function updateCurrentPage() {
  const container = panelRef.value
  if (!container) return
  const scrollTop = container.scrollTop
  const pageEls = Array.from(container.querySelectorAll('.preview-page-outer'))
  let page = 1
  for (let i = 0; i < pageEls.length; i++) {
    const el = pageEls[i]
    if (scrollTop >= el.offsetTop - 50) {
      page = i + 1
    } else {
      break
    }
  }
  if (page !== currentPage.value) {
    currentPage.value = page
  }
}

onMounted(async () => {
  await nextTick()
  recalcPageCount()

  window.addEventListener('resize', schedulePageRecalc)

  // Web 字体和头像完成后尺寸可能变化，再测一次避免屏幕页与打印页错位。
  document.fonts?.ready?.then(schedulePageRecalc)
  contentRef.value?.querySelectorAll('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', schedulePageRecalc, { once: true })
  })

  if (contentRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(schedulePageRecalc)
    resizeObserver.observe(contentRef.value)
  }

  scrollHandler = () => updateCurrentPage()
  panelRef.value?.addEventListener('scroll', scrollHandler, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', schedulePageRecalc)
  if (recalcFrame !== null) window.cancelAnimationFrame(recalcFrame)
  if (resizeObserver) resizeObserver.disconnect()
  if (panelRef.value && scrollHandler) {
    panelRef.value.removeEventListener('scroll', scrollHandler)
  }
})

watch(
  () => [
    props.templateId,
    props.fontSize,
    props.fontFamily,
    JSON.stringify(props.skinTheme),
    props.spacing?.sectionGap,
    props.spacing?.lineHeight,
    props.spacing?.padding,
    props.spacing?.pageTopGap,
    props.spacing?.pageBottomGap,
    props.resume,
    props.visibleModules,
  ],
  async () => {
    await nextTick()
    schedulePageRecalc()
  },
  { deep: true }
)

// 缩放比例变化后同步当前页指示，避免翻页错位
watch(previewScale, async () => {
  await nextTick()
  updateCurrentPage()
})

// 暴露方法给父组件，用于导出 PDF / Word
defineExpose({
  getPrintContent,
  buildPrintPageElements,
  getWordHtml,
  pageCount,
  pageBreaks,
  pageHeightPx,
  getPageCount: () => pageCount.value,
})
</script>

<style scoped>
/* 预览面板：深色背景，突出 A4 白纸；移动端限定高度以启用内部滚动与 sticky 导航 */
.resume-preview-panel {
  @apply relative flex w-full max-w-full flex-1 flex-col items-center overflow-x-hidden overflow-y-visible px-4 py-6 pb-10 max-lg:min-h-0 max-lg:w-full lg:overflow-y-auto;
}

/* 移动端：底部编辑栏收起时让页面自然滚动多张 A4 */
.resume-preview-panel--mobile-collapsed {
  @apply max-lg:max-h-none;
}

/* 移动端：底部编辑栏展开时同样不制造内部长滚动 */
.resume-preview-panel--mobile-expanded {
  @apply max-lg:max-h-none;
}

/* 页面导航栏：sticky 固定在桌面预览滚动区顶部 */
.page-nav-bar {
  @apply sticky top-0 z-30 mb-4 flex w-full max-w-[210mm] shrink-0 items-center justify-between gap-2 rounded-card border border-line/60 bg-surface/95 px-3 py-2 shadow-card backdrop-blur-md max-lg:hidden;
}

.page-nav-info {
  @apply flex shrink-0 items-center;
}

.page-nav-label {
  @apply text-sm font-medium text-ink-secondary;
}

.page-nav-buttons {
  @apply flex flex-wrap items-center justify-end gap-2;
}

.page-nav-select {
  @apply mx-0 w-24 min-w-[96px];
}

/* 多页预览舞台：移动端居中且宽度随屏适配 */
.preview-stage {
  @apply relative flex w-full max-w-full flex-col items-center pb-10 max-lg:w-full lg:max-w-[210mm];
}

/* 缩放外层：控制可见区域尺寸，避免 A4 预览溢出 */
.preview-page-outer {
  @apply relative flex-shrink-0 overflow-hidden rounded-sm shadow-card transition-shadow duration-300 max-lg:mx-auto;
}

.preview-page-outer.active {
  @apply shadow-card-hover;
}

/* 缩放内层：794px 原始尺寸，移动端通过 transform 等比缩小 */
.preview-page-scaler {
  @apply origin-top-left;
}

/* 隐藏测量层：移出视口 + opacity 0，保留布局供分页计算与打印克隆 */
.measure-layer {
  @apply pointer-events-none absolute left-[-9999px] top-0 w-[210mm] opacity-0;
}

/* 每一页：固定 A4 高度，页眉/页脚留白由 page-viewport marginTop + 提前断点实现 */
.preview-page {
  @apply relative box-border w-[210mm] flex-shrink-0 cursor-pointer overflow-hidden bg-white;
}

.page-viewport {
  @apply w-[210mm] overflow-hidden;
}

.page-number {
  @apply absolute bottom-2 right-3 z-[3] whitespace-nowrap rounded-pill bg-brand-lighter px-3 py-1 text-xs font-semibold text-brand shadow-sm;
}

.page-number-divider {
  @apply mx-0.5 opacity-50;
}

.page-number-total {
  @apply font-medium text-ink-secondary;
}

/* 简历预览基础样式 - 使用 CSS 变量支持间距/字号/字体/皮肤动态设置 */
.resume-preview {
  @apply w-[210mm] cursor-pointer bg-white px-[var(--preview-padding,40px)] py-0 text-[var(--font-size,13px)] leading-[var(--line-height,1.6)] text-[#2c3e50];
  font-family: var(--font-family, 'Microsoft YaHei', sans-serif);
}

/* 仅指定字段保留用户输入的换行与连续空格，break-all 强制长数字/字母串换行 */
.resume-preview :deep(.rt-preserve-text) {
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: anywhere;
}

/* 模块间距通过 section margin 控制 */
.resume-preview :deep(section) {
  margin-bottom: var(--section-gap, 12px);
}

/* 页面按固定高度直接裁切；模板内部不声明分页保持规则，避免制造大面积留白。 */
</style>
