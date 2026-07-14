const EPSILON = 0.75

function finiteNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

/**
 * 固定高度直接分页。
 *
 * 不为标题、条目或文本行提前回退断点：每个非末页始终使用完整可用高度，
 * 模块和条目允许跨页。blocks/lines 只用于识别真实内容底部，防止纯尾部空白
 * 生成幽灵页，不参与断点选择。
 */
export function calculateResumePageBreaks({
  totalHeight,
  pageHeight,
  blocks = [],
  lines = [],
  minPageContent = 24,
}) {
  const safeTotalHeight = Math.max(0, finiteNumber(totalHeight))
  const safePageHeight = Math.max(minPageContent, finiteNumber(pageHeight, minPageContent))
  const visibleBottom = Math.max(
    0,
    ...blocks.map((block) => finiteNumber(block.bottom)),
    ...lines.map((line) => finiteNumber(line.bottom)),
  )
  const paginationEnd = visibleBottom > 0
    ? Math.min(safeTotalHeight, visibleBottom + EPSILON)
    : safeTotalHeight

  const starts = [0]
  for (let start = safePageHeight; start < paginationEnd - EPSILON; start += safePageHeight) {
    starts.push(start)
  }
  return starts
}

