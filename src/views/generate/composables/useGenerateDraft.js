/**
 * 统一生成页的 sessionStorage 草稿保护。
 * 只恢复用户输入与已经收到的流式文本，绝不自动重放被刷新中断的 AI 请求。
 */
import { onBeforeUnmount, reactive, watch } from 'vue'

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * 草稿按当前登录账号隔离，避免同一浏览器标签切换账号后看到上一位用户的简历内容。
 * 登录资料异常时使用 anonymous 兜底，但受保护的生成页正常情况下始终能取得 userId。
 */
function resolveUserStorageKey(storageKey) {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const owner = userInfo.userId || userInfo.user_id || userInfo.account || 'anonymous'
    return `${storageKey}:${encodeURIComponent(String(owner))}`
  } catch {
    return `${storageKey}:anonymous`
  }
}

function readDraft(storageKey, initialState) {
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return cloneValue(initialState)
    const saved = JSON.parse(raw)
    return { ...cloneValue(initialState), ...(saved || {}) }
  } catch {
    return cloneValue(initialState)
  }
}

export function useGenerateDraft(storageKey, initialState) {
  const resolvedStorageKey = resolveUserStorageKey(storageKey)
  const state = reactive(readDraft(resolvedStorageKey, initialState))
  let timer = null
  let persistenceDisabled = false

  // 浏览器完整刷新不保证触发 Vue 卸载钩子，pagehide/beforeunload 必须同步补写草稿。
  const persistBeforePageExit = () => persist()
  window.addEventListener('pagehide', persistBeforePageExit)
  window.addEventListener('beforeunload', persistBeforePageExit)

  /** 立即写入，离开页面前用于补上最后一次输入。 */
  function persist() {
    if (persistenceDisabled) return
    try {
      sessionStorage.setItem(resolvedStorageKey, JSON.stringify(state))
    } catch {
      // 浏览器禁用存储或容量不足时不影响主流程。
    }
  }

  /** 清理已完成会话，下一次进入生成页从空表单开始。 */
  function clear() {
    if (timer) clearTimeout(timer)
    timer = null
    persistenceDisabled = true
    try {
      sessionStorage.removeItem(resolvedStorageKey)
    } catch {
      // 忽略浏览器存储限制。
    }
  }

  watch(
    state,
    () => {
      if (persistenceDisabled) return
      // 使用节流而非持续重置的防抖，长时间流式输出期间也会定期落入 sessionStorage。
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        persist()
      }, 200)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
    timer = null
    persist()
    window.removeEventListener('pagehide', persistBeforePageExit)
    window.removeEventListener('beforeunload', persistBeforePageExit)
  })

  return { state, persist, clear }
}
