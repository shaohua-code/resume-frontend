/**
 * 编辑器键盘快捷键组合式函数
 * 提供常用的编辑器快捷键支持
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { message } from 'ant-design-vue'

/**
 * 快捷键配置
 */
export const SHORTCUT_KEYS = {
  save: { key: 's', ctrl: true, label: '保存', hint: 'Ctrl+S' },
  exportPdf: { key: 'p', ctrl: true, shift: true, label: '导出 PDF', hint: 'Ctrl+Shift+P' },
  exportWord: { key: 'w', ctrl: true, shift: true, label: '导出 Word', hint: 'Ctrl+Shift+W' },
  undo: { key: 'z', ctrl: true, label: '撤销', hint: 'Ctrl+Z' },
  togglePanel: { key: 'b', ctrl: true, label: '折叠/展开面板', hint: 'Ctrl+B' },
}

/**
 * 检测是否为 Mac 系统
 */
export function isMacOS() {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
}

/**
 * 获取快捷键提示文本（自动适配 Mac/Windows）
 */
export function getShortcutHint(shortcutKey) {
  const config = SHORTCUT_KEYS[shortcutKey]
  if (!config) return ''
  const isMac = isMacOS()
  let hint = ''
  if (config.ctrl) hint += isMac ? '⌘' : 'Ctrl+'
  if (config.shift) hint += isMac ? '⇧' : 'Shift+'
  if (config.alt) hint += isMac ? '⌥' : 'Alt+'
  hint += config.key.toUpperCase()
  return hint
}

/**
 * 编辑器快捷键 Hook
 * @param {Object} handlers 快捷键处理函数
 * @param {Function} handlers.onSave 保存回调
 * @param {Function} handlers.onExportPdf 导出 PDF 回调
 * @param {Function} handlers.onExportWord 导出 Word 回调
 * @param {Function} handlers.onUndo 撤销回调
 * @param {Function} handlers.onTogglePanel 切换面板回调
 */
export function useEditorShortcuts(handlers = {}) {
  const shortcutsEnabled = ref(true)

  function handleKeydown(event) {
    if (!shortcutsEnabled.value) return
    
    // 检查是否在输入框中（避免干扰正常输入）
    const tagName = event.target?.tagName?.toLowerCase()
    const isEditable = event.target?.isContentEditable
    const isInput = tagName === 'input' || tagName === 'textarea' || isEditable
    
    // Ctrl/Cmd 键
    const isCtrlOrCmd = event.ctrlKey || event.metaKey
    
    // Ctrl/Cmd + S: 保存
    if (isCtrlOrCmd && event.key.toLowerCase() === 's') {
      event.preventDefault()
      handlers.onSave?.()
      return
    }
    
    // Ctrl/Cmd + Shift + P: 导出 PDF
    if (isCtrlOrCmd && event.shiftKey && event.key.toLowerCase() === 'p') {
      event.preventDefault()
      handlers.onExportPdf?.()
      return
    }
    
    // Ctrl/Cmd + Shift + W: 导出 Word
    if (isCtrlOrCmd && event.shiftKey && event.key.toLowerCase() === 'w') {
      event.preventDefault()
      handlers.onExportWord?.()
      return
    }
    
    // Ctrl/Cmd + B: 切换面板（不在输入框中时）
    if (isCtrlOrCmd && event.key.toLowerCase() === 'b' && !isInput) {
      event.preventDefault()
      handlers.onTogglePanel?.()
      return
    }
    
    // Ctrl/Cmd + Z: 撤销（只在非输入框中触发自定义撤销）
    // 注意：输入框中的撤销由浏览器原生处理
    if (isCtrlOrCmd && event.key.toLowerCase() === 'z' && !isInput) {
      event.preventDefault()
      handlers.onUndo?.()
      return
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    shortcutsEnabled,
    getShortcutHint,
  }
}
