/**
 * 系统界面主题 composable
 * 维护全应用唯一的响应式主题状态，并同步 CSS 变量、Ant Design token 与本地偏好。
 */
import { computed, readonly, ref } from 'vue'
import {
  DEFAULT_SYSTEM_THEME_KEY,
  SYSTEM_THEME_OPTIONS,
  SYSTEM_THEME_STORAGE_KEY,
  createAntdTheme,
  createAntdToken,
  createCssVariables,
  getSystemTheme,
  normalizeSystemThemeKey,
} from '@/constants/theme'

function readStoredThemeKey() {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_THEME_KEY
  try {
    return normalizeSystemThemeKey(window.localStorage.getItem(SYSTEM_THEME_STORAGE_KEY))
  } catch {
    // 隐私模式、存储配额或浏览器策略异常时安全回退默认主题。
    return DEFAULT_SYSTEM_THEME_KEY
  }
}

const currentThemeKeyState = ref(readStoredThemeKey())
const currentTheme = computed(() => getSystemTheme(currentThemeKeyState.value))
let storageListenerBound = false

function resolveRoot(element) {
  if (element) return element
  if (typeof document === 'undefined') return null
  return document.documentElement
}

/** 将当前主题变量写入根节点；SSR 环境下为空操作。 */
export function applySystemThemeVariables(element, theme = currentTheme.value) {
  const root = resolveRoot(element)
  if (!root?.style) return

  Object.entries(createCssVariables(theme)).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  root.dataset.systemTheme = theme.key
  root.style.colorScheme = 'light'
}

function persistThemeKey(themeKey) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SYSTEM_THEME_STORAGE_KEY, themeKey)
  } catch {
    // 主题切换本身不依赖存储成功，写入失败时仍保持本次会话可用。
  }
}

export function setSystemTheme(themeKey, { persist = true } = {}) {
  const safeThemeKey = normalizeSystemThemeKey(themeKey)
  currentThemeKeyState.value = safeThemeKey
  applySystemThemeVariables(undefined, getSystemTheme(safeThemeKey))
  if (persist) persistThemeKey(safeThemeKey)
  return safeThemeKey
}

/**
 * 在应用挂载前调用，避免首屏出现浏览器默认白底。
 * 重复调用是安全的，并会在多标签页间同步用户偏好。
 */
export function initializeSystemTheme() {
  setSystemTheme(currentThemeKeyState.value, { persist: false })

  if (typeof window === 'undefined' || storageListenerBound) return
  window.addEventListener('storage', (event) => {
    if (event.key !== SYSTEM_THEME_STORAGE_KEY) return
    setSystemTheme(event.newValue, { persist: false })
  })
  storageListenerBound = true
}

export function useTheme() {
  const colors = computed(() => currentTheme.value.colors)
  const gradients = computed(() => currentTheme.value.gradients)
  const shadows = computed(() => currentTheme.value.shadows)
  const chartColors = computed(() => currentTheme.value.chart)
  const currentThemeName = computed(() => currentTheme.value.name)
  const antdToken = computed(() => createAntdToken(currentTheme.value))
  const antdTheme = computed(() => createAntdTheme(currentTheme.value))

  /** 渐变主按钮内联样式。 */
  const gradientBtnStyle = computed(() => ({
    background: currentTheme.value.gradients.primary,
    boxShadow: currentTheme.value.shadows.glow,
  }))

  function applyCssVariables(element) {
    applySystemThemeVariables(element, currentTheme.value)
  }

  return {
    currentThemeKey: readonly(currentThemeKeyState),
    currentTheme,
    currentThemeName,
    themeOptions: SYSTEM_THEME_OPTIONS,
    colors,
    gradients,
    shadows,
    chartColors,
    antdToken,
    antdTheme,
    gradientBtnStyle,
    setTheme: setSystemTheme,
    applyCssVariables,
  }
}
