/**
 * 可拖拽浮动元素 composable
 * 默认右下角，位置持久化到 localStorage
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

const STORAGE_KEY = 'feedback_btn_pos'
const DRAG_THRESHOLD = 5

export function useDraggable(options = {}) {
  const {
    defaultRight = 24,
    defaultBottom = 24,
    storageKey = STORAGE_KEY,
  } = options

  const elRef = ref(null)
  const pos = ref({ right: defaultRight, bottom: defaultBottom })
  const dragging = ref(false)

  let startX = 0
  let startY = 0
  let startRight = 0
  let startBottom = 0
  let moved = false

  // 从 localStorage 恢复位置
  function loadPosition() {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (typeof parsed.right === 'number' && typeof parsed.bottom === 'number') {
        pos.value = { right: parsed.right, bottom: parsed.bottom }
      }
    } catch {
      // 忽略损坏的缓存
    }
  }

  // 持久化位置
  function savePosition() {
    localStorage.setItem(storageKey, JSON.stringify(pos.value))
  }

  function clampPosition() {
    const el = elRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const maxRight = Math.max(0, window.innerWidth - rect.width)
    const maxBottom = Math.max(0, window.innerHeight - rect.height)
    pos.value.right = Math.min(Math.max(0, pos.value.right), maxRight)
    pos.value.bottom = Math.min(Math.max(0, pos.value.bottom), maxBottom)
  }

  function onPointerDown(e) {
    if (e.button !== 0) return
    dragging.value = true
    moved = false
    startX = e.clientX
    startY = e.clientY
    startRight = pos.value.right
    startBottom = pos.value.bottom
    elRef.value?.setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging.value) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      moved = true
    }
    pos.value.right = startRight - dx
    pos.value.bottom = startBottom - dy
    clampPosition()
  }

  function onPointerUp(e) {
    if (!dragging.value) return
    dragging.value = false
    elRef.value?.releasePointerCapture?.(e.pointerId)
    savePosition()
  }

  // 区分点击与拖拽
  function wasDragged() {
    return moved
  }

  onMounted(() => {
    loadPosition()
    clampPosition()
    window.addEventListener('resize', clampPosition)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', clampPosition)
  })

  return {
    elRef,
    pos,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    wasDragged,
  }
}
