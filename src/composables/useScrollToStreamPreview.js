import { nextTick } from 'vue'

/**
 * 流式预览区域滚动 Hook
 * 生成/优化开始后，将预览框滚动到可视区域
 * @param {import('vue').Ref<HTMLElement|null>} anchorRef - 预览锚点元素 ref
 */
export function useScrollToStreamPreview(anchorRef) {
  /** 平滑滚动到流式预览区域 */
  async function scrollToStreamPreview(options = {}) {
    const { behavior = 'smooth', block = 'start' } = options
    await nextTick()
    // 等待 v-show / v-if 切换完成后再滚动
    requestAnimationFrame(() => {
      anchorRef.value?.scrollIntoView?.({ behavior, block })
    })
  }

  return { scrollToStreamPreview }
}
