import { ref, onMounted, onUnmounted, watch } from 'vue'

const DEFAULT_A4_WIDTH = 794

/**
 * A4 预览缩放 Hook：根据容器可用宽度计算等比缩放比例
 * @param {import('vue').Ref<HTMLElement|null>} containerRef - 预览容器 ref
 * @param {object} options
 * @param {number} options.baseWidth - A4 基准宽度（px）
 * @param {number} options.horizontalPadding - 左右留白总和（px）
 * @param {number} options.maxScale - 最大缩放比例，桌面端不超过 1
 */
export function usePreviewScale(
  containerRef,
  {
    baseWidth = DEFAULT_A4_WIDTH,
    horizontalPadding = 32,
    maxScale = 1,
  } = {},
) {
  const scale = ref(1)
  let resizeObserver = null

  // 根据容器宽度计算缩放比例，保证 A4 预览不溢出屏幕
  function updateScale() {
    const container = containerRef.value
    const availableWidth = container
      ? container.clientWidth
      : window.innerWidth - horizontalPadding

    const nextScale = Math.min(maxScale, availableWidth / baseWidth)
    scale.value = Number(Math.max(0.2, nextScale).toFixed(4))
  }

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', updateScale)

    if (containerRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateScale())
      resizeObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  watch(containerRef, (element, _, onCleanup) => {
    resizeObserver?.disconnect()
    resizeObserver = null

    if (!element || typeof ResizeObserver === 'undefined') return

    resizeObserver = new ResizeObserver(() => updateScale())
    resizeObserver.observe(element)
    updateScale()

    onCleanup(() => {
      resizeObserver?.disconnect()
      resizeObserver = null
    })
  })

  return {
    scale,
    updateScale,
  }
}
