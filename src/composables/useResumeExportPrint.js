import { nextTick } from 'vue'
import { message } from 'ant-design-vue'

// 打印专用 iframe 标识，便于调试与清理
const PRINT_IFRAME_ID = 'resume-print-iframe'

/**
 * 将主文档中的样式表克隆到 iframe，保证 20 套模板 scoped 样式在打印时生效
 */
function copyDocumentStyles(targetDoc) {
  const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]')
  styleNodes.forEach((node) => {
    targetDoc.head.appendChild(node.cloneNode(true))
  })
}

/**
 * 注入固定页盒打印 CSS：像素与 A4 对齐，禁止页内二次分页导致文字截断
 */
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
    }
    .print-page {
      width: 794px;
      height: 1123px;
      overflow: hidden;
      position: relative;
      background: #fff;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
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
    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      body {
        margin: 0;
        background: #fff;
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
    Object.assign(iframe.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: '0',
      height: '0',
      border: 'none',
      visibility: 'hidden',
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
 * @param {Function} [options.beforeExport] - 导出前权限校验（如 VIP）
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
      // VIP 权限与后端导出记录
      if (beforeExport) {
        const canExport = await beforeExport()
        if (!canExport) return
      }

      // 等待预览页 DOM 渲染完成后再克隆
      await nextTick()
      const content = getPrintContent?.()
      if (!content?.pages?.length) {
        message.error('未找到简历内容')
        return
      }

      // 引导用户在打印对话框中选择「另存为 PDF」
      message.info('请在打印窗口中选择「另存为 PDF」或「Microsoft Print to PDF」完成导出', 5)

      await openPrintDialog(content)
      message.success('打印窗口已打开')
    } catch (e) {
      console.error('[导出PDF失败]', e)
      message.error('PDF导出失败')
    } finally {
      onEnd?.()
    }
  }

  return { handleExportPDF }
}
