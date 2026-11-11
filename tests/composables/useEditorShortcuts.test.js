/**
 * 编辑器快捷键测试
 */
import { describe, it, expect } from 'vitest'
import { getShortcutHint, SHORTCUT_KEYS, isMacOS } from '@/composables/useEditorShortcuts'

describe('SHORTCUT_KEYS 配置', () => {
  it('应包含保存快捷键配置', () => {
    expect(SHORTCUT_KEYS.save).toBeDefined()
    expect(SHORTCUT_KEYS.save.key).toBe('s')
    expect(SHORTCUT_KEYS.save.ctrl).toBe(true)
  })

  it('应包含导出 PDF 快捷键配置', () => {
    expect(SHORTCUT_KEYS.exportPdf).toBeDefined()
    expect(SHORTCUT_KEYS.exportPdf.key).toBe('p')
    expect(SHORTCUT_KEYS.exportPdf.ctrl).toBe(true)
    expect(SHORTCUT_KEYS.exportPdf.shift).toBe(true)
  })

  it('应包含导出 Word 快捷键配置', () => {
    expect(SHORTCUT_KEYS.exportWord).toBeDefined()
    expect(SHORTCUT_KEYS.exportWord.key).toBe('w')
    expect(SHORTCUT_KEYS.exportWord.ctrl).toBe(true)
    expect(SHORTCUT_KEYS.exportWord.shift).toBe(true)
  })

  it('应包含切换面板快捷键配置', () => {
    expect(SHORTCUT_KEYS.togglePanel).toBeDefined()
    expect(SHORTCUT_KEYS.togglePanel.key).toBe('b')
    expect(SHORTCUT_KEYS.togglePanel.ctrl).toBe(true)
  })
})

describe('getShortcutHint', () => {
  it('应为 save 生成正确的提示文本', () => {
    const hint = getShortcutHint('save')
    // 在非 Mac 环境下应返回 Ctrl+S
    expect(hint).toMatch(/Ctrl\+S|⌘S/)
  })

  it('应为 exportPdf 生成正确的提示文本', () => {
    const hint = getShortcutHint('exportPdf')
    // 应包含 Shift 修饰键
    expect(hint).toMatch(/Ctrl\+Shift\+P|⌘⇧P/)
  })

  it('应为未知快捷键返回空字符串', () => {
    const hint = getShortcutHint('unknown_shortcut')
    expect(hint).toBe('')
  })
})

describe('isMacOS', () => {
  it('应返回布尔值', () => {
    const result = isMacOS()
    expect(typeof result).toBe('boolean')
  })
})
