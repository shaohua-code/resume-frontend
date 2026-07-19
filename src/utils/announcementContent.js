/**
 * 公告内容：新数据为富文本 HTML；旧 Markdown 仍可渲染预览/回填编辑器。
 */
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { resolveUploadUrl } from '@/api/upload'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

/** 粗判是否已是 HTML（Quill 产出） */
export function looksLikeHtml(content) {
  return /<\/?[a-z][\s\S]*>/i.test(String(content || ''))
}

/** 打开编辑器时：HTML 原样；纯 Markdown 先转 HTML 便于所见即所得 */
export function toEditorHtml(content) {
  const text = String(content || '').trim()
  if (!text) return ''
  if (looksLikeHtml(text)) return text
  return md.render(text)
}

/** 用户端/预览：消毒后输出可 v-html 的 HTML */
export function renderAnnouncementHtml(content) {
  const text = String(content || '')
  if (!text.trim()) return ''
  let html = looksLikeHtml(text) ? text : md.render(text)
  // 补全上传图片相对路径
  html = html.replace(/src="(\/uploads\/[^"]+)"/g, (_, path) => `src="${resolveUploadUrl(path)}"`)
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'],
  })
}
