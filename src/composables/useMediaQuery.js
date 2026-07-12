import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 响应式媒体查询 Hook
 * @param {string} query - CSS 媒体查询字符串，默认 Tailwind lg 断点以下视为移动端
 * @returns {import('vue').Ref<boolean>} 是否匹配查询条件
 */
export function useMediaQuery(query = '(max-width: 1023px)') {
  const matches = ref(false)
  let mediaQueryList = null

  // 同步当前窗口是否匹配媒体查询
  function update() {
    if (!mediaQueryList) return
    matches.value = mediaQueryList.matches
  }

  onMounted(() => {
    mediaQueryList = window.matchMedia(query)
    update()
    mediaQueryList.addEventListener('change', update)
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    mediaQueryList?.removeEventListener('change', update)
    window.removeEventListener('resize', update)
    mediaQueryList = null
  })

  return matches
}
