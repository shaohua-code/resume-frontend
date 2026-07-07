/**
 * 统一文件上传 API
 * 图片 / PDF / 文档均走 POST /api/upload/file
 */
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * 将相对路径转为可访问的完整 URL
 * @param {string} path - 如 /uploads/files/xxx/abc.jpg
 */
export function resolveUploadUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (API_BASE) return `${API_BASE.replace(/\/$/, '')}${path}`
  return path
}

/**
 * 上传单个文件
 * @param {File} file
 * @param {(percent: number) => void} [onProgress]
 */
export async function uploadFile(file, onProgress) {
  const userStore = useUserStore()
  const token = await userStore.getValidToken()

  const formData = new FormData()
  formData.append('file', file)

  const res = await axios.post(`${API_BASE}/api/upload/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 120000,
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })

  return res.data?.data || res.data
}
