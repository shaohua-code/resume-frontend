/**
 * 生成页简历源文件上传校验（PDF + Word .docx）
 * 旧版 .doc 明确拒绝，引导另存为 .docx
 */

export const RESUME_UPLOAD_ACCEPT = [
  'application/pdf',
  '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.docx',
].join(',')

/** 从 File 或文件名解析扩展名（含点号） */
export function getResumeFileExt(fileOrName) {
  const name = typeof fileOrName === 'string'
    ? fileOrName
    : String(fileOrName?.name || fileOrName?.filename || '')
  const lower = name.toLowerCase()
  if (lower.endsWith('.docx')) return '.docx'
  if (lower.endsWith('.pdf')) return '.pdf'
  if (lower.endsWith('.doc')) return '.doc'
  return ''
}

/** 是否为可内嵌预览的 PDF */
export function isPdfResumeFile(fileOrMeta) {
  const ext = getResumeFileExt(fileOrMeta)
  if (ext === '.pdf') return true
  if (ext === '.docx' || ext === '.doc') return false
  const mime = String(fileOrMeta?.type || fileOrMeta?.mime || '').toLowerCase()
  return mime === 'application/pdf' || mime.includes('pdf')
}

/**
 * 校验上传文件；返回空串表示通过，否则为中文错误提示
 * @param {File} file
 */
export function validateResumeUploadFile(file) {
  if (!file) return '请选择文件'
  if (file.size > 10 * 1024 * 1024) return '文件大小不能超过 10MB'
  const name = String(file.name || '').toLowerCase()
  if (name.endsWith('.doc') && !name.endsWith('.docx')) {
    return '暂不支持旧版 .doc，请另存为 .docx 后上传'
  }
  const ext = getResumeFileExt(file)
  const mime = String(file.type || '').toLowerCase()
  const mimeOk = !mime
    || mime === 'application/pdf'
    || mime.includes('pdf')
    || mime.includes('wordprocessingml')
    || mime === 'application/octet-stream'
  if ((ext === '.pdf' || ext === '.docx') && mimeOk) return ''
  return '仅支持 PDF 或 Word（.docx）文件'
}
