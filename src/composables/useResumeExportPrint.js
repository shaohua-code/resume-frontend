import { nextTick } from 'vue'
import { message } from 'ant-design-vue'

// 打印专用 iframe 标识，便于调试与清理
const PRINT_IFRAME_ID = 'resume-print-iframe'

/**
 * 将主文档中的样式表克隆到 iframe，保证全部注册模板的 scoped 样式在打印时生效
 */
function copyDocumentStyles(targetDoc) {
  const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]')
  styleNodes.forEach((node) => {
    targetDoc.head.appendChild(node.cloneNode(true))
  })
}

/** 注入固定页盒打印 CSS：只分页外层 A4，内部完全沿用屏幕裁切。 */
function injectPrintStyles(targetDoc) {
  const printStyle = targetDoc.createElement('style')
  printStyle.setAttribute('data-resume-print', 'true')
  printStyle.textContent = `
    @page {
      size: 794px 1123px;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      width: 794px;
      overflow: visible;
    }
    .print-page {
      display: block;
      width: 794px;
      height: 1123px;
      overflow: hidden;
      position: relative;
      background: #fff;
      box-sizing: border-box;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid;
      break-inside: avoid;
      border-radius: 0 !important;
      box-shadow: none !important;
      cursor: default !important;
    }
    .print-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .print-page .page-viewport,
    .print-page-viewport {
      overflow: hidden !important;
      position: relative;
    }
    .resume-preview {
      width: 794px;
      box-sizing: border-box;
      background: #fff;
    }
    /* 内部内容禁止触发浏览器自己的分页重排，断点只由屏幕 page-viewport 决定。 */
    .print-page .resume-preview * {
      page-break-before: auto !important;
      page-break-after: auto !important;
      page-break-inside: auto !important;
      break-before: auto !important;
      break-after: auto !important;
      break-inside: auto !important;
      orphans: initial !important;
      widows: initial !important;
    }
    /* 打印时与屏幕预览一致：保留换行并强制长串断行 */
    .rt-preserve-text {
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: anywhere;
    }
    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      body {
        margin: 0;
        background: #fff;
        width: 210mm;
        height: auto;
        overflow: visible;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .print-page {
        width: 210mm;
        height: 297mm;
        overflow: hidden !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .print-page .page-viewport,
      .print-page-viewport {
        overflow: hidden !important;
      }
    }
  `
  targetDoc.head.appendChild(printStyle)
}

/**
 * 构建 iframe 打印文档：复制样式 + 注入打印规则 + 挂载逐页切片 DOM
 */
function buildPrintDocument(iframe, content) {
  const doc = iframe.contentDocument
  doc.open()
  doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>简历打印</title></head><body></body></html>')
  doc.close()

  copyDocumentStyles(doc)
  injectPrintStyles(doc)

  // 按预览 pageBreaks 生成的逐页容器，每页对应一张 A4
  const { pages } = content
  pages.forEach((pageEl) => {
    doc.body.appendChild(pageEl)
  })
}

/**
 * 销毁打印 iframe
 */
function removePrintIframe() {
  const iframe = document.getElementById(PRINT_IFRAME_ID)
  if (iframe) {
    iframe.remove()
  }
}

/**
 * 等待 iframe 内图片加载完成，避免打印时头像空白
 */
function waitForImages(doc) {
  const images = Array.from(doc.images || [])
  const pending = images.filter((img) => !img.complete)
  if (!pending.length) return Promise.resolve()

  return Promise.all(
    pending.map(
      (img) =>
        new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
        }),
    ),
  )
}

function nextPaint() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve))
}

function getPrintLayoutSignature(content) {
  return (content?.pages || []).map((page) => {
    const viewport = page.querySelector('.page-viewport')
    const resume = viewport?.querySelector('.resume-preview')
    return [
      page.style.height,
      viewport?.style.marginTop,
      viewport?.style.height,
      viewport?.style.maxHeight,
      resume?.style.marginTop,
    ].join('|')
  }).join('||')
}

/** 连续三帧分页布局完全相同才允许导出，避免字体/ResizeObserver 尚未稳定。 */
async function getStablePrintContent(getPrintContent) {
  await nextTick()
  if (document.fonts?.ready) await document.fonts.ready

  let previousSignature = ''
  let stableFrames = 0
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await nextPaint()
    const content = await getPrintContent?.()
    if (!content?.pages?.length) {
      previousSignature = ''
      stableFrames = 0
      continue
    }

    const signature = getPrintLayoutSignature(content)
    stableFrames = signature === previousSignature ? stableFrames + 1 : 0
    previousSignature = signature
    if (stableFrames >= 2) return content
  }
  return null
}

/**
 * 打开浏览器打印对话框（用户需选择「另存为 PDF」）
 */
function openPrintDialog(content) {
  return new Promise((resolve, reject) => {
    removePrintIframe()

    const iframe = document.createElement('iframe')
    iframe.id = PRINT_IFRAME_ID
    iframe.setAttribute('aria-hidden', 'true')
    // 离屏放置，避免闪烁
    const pageCount = Math.max(1, content?.pages?.length || content?.pageCount || 1)
    Object.assign(iframe.style, {
      position: 'absolute',
      left: '-10000px',
      top: '0',
      width: '794px',
      height: `${pageCount * 1123}px`,
      border: 'none',
      opacity: '0',
      pointerEvents: 'none',
      overflow: 'visible',
    })
    document.body.appendChild(iframe)

    try {
      buildPrintDocument(iframe, content)

      const win = iframe.contentWindow
      const doc = iframe.contentDocument
      if (!win || !doc) {
        reject(new Error('无法创建打印窗口'))
        return
      }

      // 等待样式、图片、字体加载后再触发打印，避免分页截断
      const triggerPrint = async () => {
        await waitForImages(doc)
        if (doc.fonts?.ready) {
          await doc.fonts.ready
        }
        const cleanup = () => {
          win.removeEventListener('afterprint', cleanup)
          removePrintIframe()
          resolve()
        }
        win.addEventListener('afterprint', cleanup)
        win.focus()
        win.print()
      }

      // 给 iframe 内资源一点渲染时间
      setTimeout(triggerPrint, 300)
    } catch (err) {
      removePrintIframe()
      reject(err)
    }
  })
}

/**
 * 浏览器打印 API 导出 PDF 组合式函数
 * @param {Object} options
 * @param {Function} options.getPrintContent - 从 ResumePreview 获取逐页打印内容
 * @param {Function} [options.beforeExport] - 导出前权限校验
 * @param {Function} [options.onStart] - 开始导出回调
 * @param {Function} [options.onEnd] - 结束导出回调
 */
export function useResumeExportPrint({
  getPrintContent,
  beforeExport,
  onStart,
  onEnd,
}) {
  async function handleExportPDF() {
    onStart?.()
    try {
      // 导出前权限校验与后端导出记录
      if (beforeExport) {
        const canExport = await beforeExport()
        if (!canExport) return
      }

      // 连续三帧读取到相同屏幕分页后才导出，PDF 只使用这批可见页克隆。
      const content = await getStablePrintContent(getPrintContent)
      if (!content?.pages?.length) {
        message.error('预览分页尚未稳定，请稍后重试')
        return
      }

      // 引导用户在打印对话框中选择「另存为 PDF」
      message.info('请在打印窗口中选择「另存为 PDF」或「Microsoft Print to PDF」完成导出', 5)

      await openPrintDialog(content)
  
    } catch (e) {
      console.error('[导出PDF失败]', e)
      message.error('PDF导出失败')
    } finally {
      onEnd?.()
    }
  }

  return { handleExportPDF }
}
