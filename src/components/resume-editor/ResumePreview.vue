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
  <div class="resume-preview-panel" ref="panelRef">
    <!-- 页面导航栏 -->
    <div class="page-nav-bar" v-if="pageCount > 1">
      <div class="page-nav-info">
        <span class="page-nav-label">共 {{ pageCount }} 页</span>
      </div>
      <div class="page-nav-buttons">
        <a-button size="small" :disabled="currentPage <= 1" @click="scrollToPage(currentPage - 1)">
          <LeftOutlined /> 上一页
        </a-button>
        <a-select size="small" :value="currentPage" style="width: 80px; margin: 0 8px;" @change="scrollToPage">
          <a-select-option v-for="p in pageCount" :key="p" :value="p">第 {{ p }} 页</a-select-option>
        </a-select>
        <a-button size="small" :disabled="currentPage >= pageCount" @click="scrollToPage(currentPage + 1)">
          下一页
          <RightOutlined />
        </a-button>
      </div>
    </div>

    <!-- 多页预览：隐藏层测量高度 + 每页 overflow 窗口切片显示 -->
    <div class="preview-stage" ref="stageRef">
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
            height: getPageContentHeight(n) + 'px',
          }"
        >
          <div
            class="resume-preview"
            :class="'template-' + templateId"
            :style="{
              ...previewStyle,
              marginTop: -(pageBreaks[n - 1] || 0) + 'px',
            }"
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

// 计算预览样式（CSS 变量会继承到 ResumeTemplate）
const previewStyle = computed(() => ({
  '--section-gap': (props.spacing?.sectionGap ?? DEFAULT_SPACING.sectionGap) + 'px',
  '--line-height': props.spacing?.lineHeight ?? DEFAULT_SPACING.lineHeight,
  '--preview-padding': (props.spacing?.padding ?? DEFAULT_SPACING.padding) + 'px',
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

    const pageWrapper = document.createElement('div')
    pageWrapper.style.cssText = `width:794px;height:${pageH}px;overflow:hidden;background:#fff;position:relative;box-sizing:border-box;`

    const viewport = document.createElement('div')
    viewport.style.cssText = `width:794px;height:${viewportH}px;overflow:hidden;`

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

const ITEM_SELECTOR = '[class*="-item"]'
const PARA_SELECTOR = 'p, [class*="-text"], [class*="-desc"]'
const MIN_FRAGMENT_PX = 48
const MIN_PAGE_CONTENT = 24

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

/** 收集分页候选段（header / title / item / 行） */
function collectPageSegments(content, contentRect) {
  const segments = []
  const pageHeight = pageHeightPx.value

  function pushBlock(el, type) {
    if (!el) return
    const box = measureEl(el, contentRect)
    if (box.height <= 0) return
    if (box.height > pageHeight && (type === 'paragraph' || type === 'text')) {
      collectLineRects(el, contentRect).forEach((line) => {
        segments.push({ ...line, height: line.bottom - line.top, type: 'line' })
      })
    } else {
      segments.push({ ...box, type })
    }
  }

  content.querySelectorAll('header').forEach((h) => pushBlock(h, 'header'))

  content.querySelectorAll('section').forEach((section) => {
    const title = section.querySelector('[class*="-title"], h2, h3')
    const items = [...section.querySelectorAll(ITEM_SELECTOR)]
    const paragraphs = [...section.querySelectorAll(PARA_SELECTOR)].filter(
      (p) => !p.closest(ITEM_SELECTOR)
    )

    if (title) pushBlock(title, 'title')
    items.forEach((item) => pushBlock(item, 'item'))
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
  const pageHeight = pageHeightPx.value
  totalHeight.value = contentRect.height

  if (totalHeight.value <= pageHeight) return [0]

  const segments = collectPageSegments(content, contentRect)
  const boundaries = collectBreakBoundaries(segments)
  const starts = [0]
  let pos = 0

  while (pos + MIN_PAGE_CONTENT < totalHeight.value) {
    let target = Math.min(pos + pageHeight, totalHeight.value)
    if (target >= totalHeight.value) break

    let nextBreak = target

    const crossing = segments.find(
      (s) => s.bottom > pos && s.top < target && s.bottom > target + 1
    )

    if (crossing) {
      const fragmentOnPage = target - crossing.top
      if (crossing.type === 'line') {
        // 行级：尽量在行顶切分，避免半行
        nextBreak = crossing.top > pos ? crossing.top : target
      } else if (crossing.height > pageHeight) {
        // 超高块：在最近行边界切
        const lineBefore = boundaries.filter((b) => b > pos && b <= target).pop()
        nextBreak = lineBefore && lineBefore > pos ? lineBefore : target
      } else if (fragmentOnPage < MIN_FRAGMENT_PX && crossing.top > pos) {
        nextBreak = crossing.top
      }
    } else {
      // 落在空白区：向前 snap 到最近内容边界，避免整页空白
      const snap = boundaries.filter((b) => b > pos && b <= target).pop()
      if (snap && target - snap > 80 && snap > pos) {
        nextBreak = snap
      }
    }

    if (nextBreak <= pos) {
      nextBreak = Math.min(pos + pageHeight, totalHeight.value)
    }
    if (nextBreak >= totalHeight.value) break

    starts.push(nextBreak)
    pos = nextBreak
  }

  return filterGhostPages(starts, totalHeight.value, segments)
}

// A4 高度：210×297mm，96dpi 下 297mm ≈ 1123px
const A4_HEIGHT_MM = 297
const MM_TO_PX = 96 / 25.4
const pageHeightPx = ref(Math.round(A4_HEIGHT_MM * MM_TO_PX))

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
.resume-preview-panel {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 24px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #39394d;
}

/* 页面导航栏 */
.page-nav-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 210mm;
  padding: 8px 16px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.page-nav-info {
  display: flex;
  align-items: center;
}

.page-nav-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.page-nav-buttons {
  display: flex;
  align-items: center;
}

/* 多页预览舞台 */
.preview-stage {
  width: 210mm;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;
  position: relative;
}

/* 隐藏测量层：移出视口 + opacity 0，保留布局且 html2canvas 可渲染克隆节点 */
.measure-layer {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 210mm;
  opacity: 0;
  pointer-events: none;
}

/* 每一页：固定 A4 高度（inline style 同步），内容不足时底部留白 */
.preview-page {
  position: relative;
  width: 210mm;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  border-radius: 2px;
  flex-shrink: 0;
  cursor: pointer;
}

.page-viewport {
  width: 210mm;
  overflow: hidden;
  pointer-events: auto;
}

.preview-page.active {
  box-shadow: 0 8px 32px rgba(22, 119, 255, 0.25);
}

/* 页码 */
.page-number {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #1677ff;
  background: #e6f4ff;
  padding: 4px 12px;
  border-radius: 10px;
  white-space: nowrap;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  z-index: 3;
  pointer-events: auto;
}

.page-number-text {
  color: #1677ff;
}

.page-number-divider {
  opacity: 0.5;
  margin: 0 2px;
}

.page-number-total {
  color: #666;
  font-weight: 500;
}

/* 简历预览基础样式 - 使用 CSS 变量支持间距/字号/字体/皮肤动态设置 */
.resume-preview {
  width: 210mm;
  min-height: auto;
  padding: var(--preview-padding, 40px);
  font-size: var(--font-size, 13px);
  font-family: var(--font-family, 'Microsoft YaHei', sans-serif);
  line-height: var(--line-height, 1.6);
  color: #2c3e50;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
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
