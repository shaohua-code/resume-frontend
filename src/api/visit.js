/**
 * 访客记录公开 API（无需登录，已登录时可选附带 Token）
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * 记录访客进入
 * @param {Object} data
 */
export async function createVisit(data) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}/api/visits`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  return res.json()
}

/**
 * 页面离开时上报停留时长（keepalive 请求）
 * @param {number|string} visitId
 * @param {number} durationSeconds
 */
export function sendVisitDuration(visitId, durationSeconds) {
  fetch(`${API_BASE}/api/visits/${visitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration_seconds: durationSeconds }),
    keepalive: true,
  }).catch(() => {})
}
