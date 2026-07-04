<!--
  简历预览面板组件
  负责右侧 A4 多页预览、分页计算、页面导航
  核心设计：
  1. 使用 html2pdf + css page-break 导出为真实多页 PDF
  2. 屏幕预览：每页 overflow 窗口 + 负 marginTop 切片，与 PDF 分页对齐
  3. 分页线尽量落在 section/item/title 之间的空白处，避免文字被截断
  4. 大模块跨页时，优先保持标题完整，项目条目在合适位置拆分
-->
<template>
  <div ref="panelRef" class="resume-preview-panel">
    <!-- 页面导航栏 -->
    <div v-if="pageCount > 1" class="page-nav-bar">
      <div class="page-nav-info">
        <span class="page-nav-label">共 {{ pageCount }} 页</span>
      </div>
      <div class="page-nav-buttons">
        <a-button size="small" :disabled="currentPage <= 1" @click="scrollToPage(currentPage - 1)">
          <LeftOutlined /> 上一页
        </a-button>
        <a-select size="small" :value="currentPage" class="page-nav-select" @change="scrollToPage">
          <a-select-option v-for="p in pageCount" :key="p" :value="p">第 {{ p }} 页</a-select-option>
        </a-select>
        <a-button size="small" :disabled="currentPage >= pageCount" @click="scrollToPage(currentPage + 1)">
          下一页
          <RightOutlined />
        </a-button>
      </div>
    </div>

    <!-- 多页预览：隐藏层测量高度 + 每页 overflow 窗口切片显示 -->
    <div ref="stageRef" class="preview-stage">
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

      <!-- 可见分页：overflow + 负 marginTop 截取对应页内容 -->
      <div
        v-for="n in pageCount"
        :key="`${n}-${templateId}-${previewRenderKey}`"
        class="preview-page"
        :class="{ active: n === currentPage }"
        :style="{ height: pageHeightPx + 'px' }"
      >
        <div
          class="page-viewport"
          :style="{
            marginTop: pageTopGap + 'px',
            height: getPageContentHeight(n) + 'px',
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
        <span class="page-number">
          <span class="page-number-text">第 {{ n }} 页</span>
          <span class="page-number-divider">/</span>
          <span class="page-number-total">共 {{ pageCount }} 页</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { SKIN_COLOR_MAP, DEFAULT_SKIN } from '@/constants/skin'
import { DEFAULT_SPACING } from '@/constants/editorSettings'
import ResumeTemplate from '@/components/ResumeTemplate.vue'

const props = defineProps({
  resume: { type: Object, required: true },
  templateId: { type: Number, required: true },
  spacing: { type: Object, default: () => ({ ...DEFAULT_SPACING }) },
  fontSize: { type: [String, Number], default: 'medium' },
  fontFamily: { type: String, default: "'Microsoft YaHei', sans-serif" },
  skin: { type: String, default: DEFAULT_SKIN },
  visibleModules: { type: Array, default: () => [] },
})

const emit = defineEmits(['section-click'])

// 皮肤颜色映射（从共享常量导入，避免双源真相）
const skinColors = SKIN_COLOR_MAP

// 字号映射（兼容 String 枚举和 Number 直接值）
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

const ITEM_SELECTOR = '[class*="-item"]'
const PARA_SELECTOR = 'p, [class*="-text"], [class*="-desc"]'
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
  '--skin-color': skinColors[props.skin] || skinColors.blue,
  '--font-size': resolveFontSize(props.fontSize),
  '--font-family': props.fontFamily,
}))

// 设置变更时强制刷新分页窗口
const previewRenderKey = computed(() => [
  props.templateId,
  props.fontSize,
  props.fontFamily,
  props.skin,
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

// 导出 PDF 时克隆完整文档节点
function getPdfElement() {
  const el = contentRef.value
  if (!el) return null
  const clone = el.cloneNode(true)
  clone.style.visibility = 'visible'
  clone.style.opacity = '1'
  clone.style.position = 'relative'
  clone.style.left = '0'
  clone.style.top = '0'
  clone.style.width = '210mm'
  clone.style.background = '#fff'
  return clone
}

// 按预览分页生成逐页 DOM，供 PDF 导出与屏幕预览对齐
function getPdfPageElements() {
  const el = contentRef.value
  if (!el) return []
  const breaks = pageBreaks.value
  const count = pageCount.value
  const pageH = pageHeightPx.value
  const pages = []

  for (let n = 1; n <= count; n++) {
    const start = breaks[n - 1] ?? 0
    const end = n < count ? breaks[n] : totalHeight.value
    const viewportH = Math.max(0, end - start)
    const topGap = pageTopGap.value

    const pageWrapper = document.createElement('div')
    pageWrapper.style.cssText = `width:794px;height:${pageH}px;overflow:hidden;background:#fff;position:relative;box-sizing:border-box;`

    const viewport = document.createElement('div')
    viewport.style.cssText = `width:794px;height:${viewportH}px;overflow:hidden;margin-top:${topGap}px;max-height:${effectivePageHeight.value}px;`

    const clone = el.cloneNode(true)
    clone.style.visibility = 'visible'
    clone.style.opacity = '1'
    clone.style.width = '210mm'
    clone.style.background = '#fff'
    clone.style.margin = `-${start}px 0 0 0`
    clone.style.padding = el.style.padding || ''

    viewport.appendChild(clone)
    pageWrapper.appendChild(viewport)
    pages.push(pageWrapper)
  }
  return pages
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

/** 收集元素内每一行的 top/bottom（用于长段落行级分页） */
function collectLineRects(el, contentRect) {
  const lines = []
  if (!el || !el.textContent?.trim()) return lines
  const range = document.createRange()
  range.selectNodeContents(el)
  Array.from(range.getClientRects()).forEach((r) => {
    const top = r.top - contentRect.top
    const bottom = r.bottom - contentRect.top
    if (bottom - top > 0.5) lines.push({ top, bottom })
  })
  return lines
}

/** 合并相邻重复行矩形 */
function mergeLineRects(lines) {
  if (!lines.length) return lines
  const merged = [lines[0]]
  for (let i = 1; i < lines.length; i++) {
    const prev = merged[merged.length - 1]
    const cur = lines[i]
    if (Math.abs(cur.top - prev.top) < 2) {
      prev.bottom = Math.max(prev.bottom, cur.bottom)
    } else {
      merged.push({ ...cur })
    }
  }
  return merged.map((l) => ({ ...l, height: l.bottom - l.top }))
}

/** 跨页时在行边界或块顶寻找安全断点，禁止半行截断 */
function findSafeBreakBefore(crossing, pos, target, contentRect) {
  if (!crossing) return null
  const lineSource = crossing.el?.querySelector?.('.rt-desc, [class*="-desc"], [class*="-text"]') || crossing.el
  const lines = mergeLineRects(collectLineRects(lineSource, contentRect))

  if (lines.length) {
    const fitting = lines.filter((l) => l.bottom <= target + 0.5 && l.bottom > pos)
    if (fitting.length) return fitting[fitting.length - 1].bottom
    const nextLine = lines.find((l) => l.top >= pos && l.top < target)
    if (nextLine && nextLine.top > pos) return nextLine.top
  }

  if (crossing.type === 'line' && crossing.top > pos) return crossing.top
  if (crossing.top > pos) return crossing.top
  return null
}

/** 将元素内文本按行注册为分页候选段 */
function pushLineSegments(el, contentRect, segments) {
  mergeLineRects(collectLineRects(el, contentRect)).forEach((line) => {
    segments.push({ ...line, el, height: line.bottom - line.top, type: 'line' })
  })
}

/** 收集分页候选段（header / title / item / 行） */
function collectPageSegments(content, contentRect) {
  const segments = []
  const pageHeight = effectivePageHeight.value

  function pushBlock(el, type) {
    if (!el) return
    const box = measureEl(el, contentRect)
    if (box.height <= 0) return
    if (box.height > pageHeight && (type === 'paragraph' || type === 'text')) {
      pushLineSegments(el, contentRect, segments)
    } else {
      segments.push({ ...box, type })
    }
  }

  content.querySelectorAll('header').forEach((h) => pushBlock(h, 'header'))

  content.querySelectorAll('section').forEach((section) => {
    const title = section.querySelector('[class*="-title"], h2, h3')
    const items = [...section.querySelectorAll(ITEM_SELECTOR)]
    const paragraphs = [...section.querySelectorAll(PARA_SELECTOR)].filter(
      (p) => !p.closest(ITEM_SELECTOR),
    )

    if (title) pushBlock(title, 'title')
    items.forEach((item) => {
      pushBlock(item, 'item')
      // 项目/实习描述按行参与分页，避免整块 rt-item 跨页时被拦腰截断
      const desc = item.querySelector('.rt-desc, [class*="-desc"], [class*="-text"]')
      if (desc) pushLineSegments(desc, contentRect, segments)
    })
    paragraphs.forEach((p) => pushBlock(p, 'paragraph'))

    if (!title && items.length === 0 && paragraphs.length === 0) {
      pushBlock(section, 'section')
    }
  })

  return segments.sort((a, b) => a.top - b.top)
}

/** 收集所有可放置分页线的 Y 坐标 */
function collectBreakBoundaries(segments) {
  const set = new Set([0])
  segments.forEach((s) => {
    set.add(Math.round(s.top))
    set.add(Math.round(s.bottom))
  })
  return [...set].sort((a, b) => a - b)
}

/** 判断页段内是否存在真实可见内容，避免只切到 margin/padding 空白 */
function hasVisibleContent(start, end, segments) {
  const visibleHeight = segments.reduce((sum, s) => {
    const visibleTop = Math.max(s.top, start)
    const visibleBottom = Math.min(s.bottom, end)
    return sum + Math.max(0, visibleBottom - visibleTop)
  }, 0)
  return visibleHeight >= 2
}

/** 过滤幽灵页：去掉过短页段、重复断点与无可见内容的页段 */
function filterGhostPages(breaks, total, segments) {
  const filtered = [0]
  for (let i = 1; i < breaks.length; i++) {
    const b = breaks[i]
    const prev = filtered[filtered.length - 1]
    if (
      b > prev &&
      b - prev >= MIN_PAGE_CONTENT &&
      b < total &&
      hasVisibleContent(prev, b, segments)
    ) {
      filtered.push(b)
    }
  }
  const last = filtered[filtered.length - 1]
  if (!hasVisibleContent(last, total, segments) && filtered.length > 1) {
    filtered.pop()
  }
  return filtered
}

/**
 * 智能分页：行级断点 + 原子块边界，过滤幽灵页
 */
function calcSmartPageBreaks() {
  const content = contentRef.value
  if (!content) return [0]

  const contentRect = content.getBoundingClientRect()
  const chunkHeight = effectivePageHeight.value
  totalHeight.value = contentRect.height

  if (totalHeight.value <= chunkHeight) return [0]

  const segments = collectPageSegments(content, contentRect)
  const boundaries = collectBreakBoundaries(segments)
  const starts = [0]
  let pos = 0

  while (pos + MIN_PAGE_CONTENT < totalHeight.value) {
    let target = Math.min(pos + chunkHeight, totalHeight.value)
    if (target >= totalHeight.value) break

    let nextBreak = target

    const crossing = segments.find(
      (s) => s.bottom > pos && s.top < target && s.bottom > target + 1,
    )

    if (crossing) {
      const safeBreak = findSafeBreakBefore(crossing, pos, target, contentRect)
      if (safeBreak !== null && safeBreak > pos) {
        nextBreak = safeBreak
      } else if (crossing.height > chunkHeight) {
        const lineBefore = boundaries.filter((b) => b > pos && b <= target).pop()
        nextBreak = lineBefore && lineBefore > pos ? lineBefore : target
      } else if (crossing.top > pos) {
        nextBreak = crossing.top
      }
    } else {
      const snap = boundaries.filter((b) => b > pos && b <= target).pop()
      if (snap && target - snap > 80 && snap > pos) {
        nextBreak = snap
      }
    }

    if (nextBreak <= pos) {
      nextBreak = Math.min(pos + chunkHeight, totalHeight.value)
    }
    if (nextBreak >= totalHeight.value) break

    starts.push(nextBreak)
    pos = nextBreak
  }

  return filterGhostPages(starts, totalHeight.value, segments)
}

const panelRef = ref(null)
const contentRef = ref(null)
const pageCount = ref(1)
const currentPage = ref(1)
const pageBreaks = ref([0])
const totalHeight = ref(0)
let resizeObserver = null
let scrollHandler = null

function recalcPageCount() {
  const breaks = calcSmartPageBreaks()
  pageBreaks.value = breaks
  pageCount.value = Math.max(1, breaks.length)
}

function scrollToPage(page) {
  const container = panelRef.value
  if (!container) return
  const targetPage = Math.max(1, Math.min(page, pageCount.value))
  const pageEls = container.querySelectorAll('.preview-page')
  const targetEl = pageEls[targetPage - 1]
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function updateCurrentPage() {
  const container = panelRef.value
  if (!container) return
  const scrollTop = container.scrollTop
  const pageEls = Array.from(container.querySelectorAll('.preview-page'))
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

  window.addEventListener('resize', recalcPageCount)

  if (contentRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => recalcPageCount())
    resizeObserver.observe(contentRef.value)
  }

  scrollHandler = () => updateCurrentPage()
  panelRef.value?.addEventListener('scroll', scrollHandler, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', recalcPageCount)
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
    props.skin,
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
    recalcPageCount()
  },
  { deep: true }
)

// 暴露方法给父组件，用于导出 PDF / Word
defineExpose({
  getPdfElement,
  getPdfPageElements,
  getWordHtml,
  pageCount,
  pageBreaks,
  pageHeightPx,
  getPageCount: () => pageCount.value,
})
</script>

<style scoped>
/* 预览面板：深色背景，突出 A4 白纸 */
.resume-preview-panel {
  @apply relative flex w-full flex-1 flex-col items-center overflow-y-auto px-4 py-6 pb-10;
}

/* 页面导航栏：磨砂玻璃 */
.page-nav-bar {
  @apply sticky top-0 z-20 mb-4 flex w-[210mm] items-center justify-between rounded-card border border-line/60 bg-white/95 px-4 py-2 shadow-card backdrop-blur-md;
}

.page-nav-info {
  @apply flex items-center;
}

.page-nav-label {
  @apply text-sm font-medium text-ink-secondary;
}

.page-nav-buttons {
  @apply flex items-center;
}

.page-nav-select {
  @apply mx-2 w-24;
}

/* 多页预览舞台 */
.preview-stage {
  @apply relative flex w-[210mm] flex-col gap-6 pb-10;
}

/* 隐藏测量层：移出视口 + opacity 0，保留布局且 html2canvas 可渲染克隆节点 */
.measure-layer {
  @apply pointer-events-none absolute left-[-9999px] top-0 w-[210mm] opacity-0;
}

/* 每一页：固定 A4 高度，页眉/页脚留白由 page-viewport marginTop + 提前断点实现 */
.preview-page {
  @apply relative box-border w-[210mm] flex-shrink-0 cursor-pointer overflow-hidden rounded-sm bg-white shadow-card transition-shadow duration-300;
}

.preview-page.active {
  @apply shadow-card-hover;
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
  @apply w-[210mm] cursor-pointer bg-white px-[var(--preview-padding,40px)] py-[var(--preview-padding,40px)] text-[var(--font-size,13px)] leading-[var(--line-height,1.6)] text-[#2c3e50];
  font-family: var(--font-family, 'Microsoft YaHei', sans-serif);
}

/* 模块间距通过 section margin 控制 */
.resume-preview :deep(section) {
  margin-bottom: var(--section-gap, 12px);
}

/* 皮肤色：影响模板中的标题/强调色 */
.resume-preview :deep(h1),
.resume-preview :deep(h2),
.resume-preview :deep(h3),
.resume-preview :deep(.rt-title),
.resume-preview :deep([class*='-title']) {
  color: var(--skin-color, #1677ff);
}

/* 仅 item 级避免截断，section 整体允许跨页 */
.resume-preview :deep([class*="-item"]),
.resume-preview :deep(.no-break) {
  break-inside: avoid;
  page-break-inside: avoid;
}

.resume-preview :deep(h1),
.resume-preview :deep(h2),
.resume-preview :deep(h3) {
  break-after: avoid;
  page-break-after: avoid;
}

.resume-preview :deep(p) {
  orphans: 3;
  widows: 3;
}
</style>
