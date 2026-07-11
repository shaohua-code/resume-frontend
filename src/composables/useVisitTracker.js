/**
 * 访客访问追踪
 * 进入网站时上报一次，离开时更新停留时长
 */
import { createVisit, sendVisitDuration } from '@/api/visit'

const VISIT_ID_KEY = 'visit_id'
const VISIT_ENTER_KEY = 'visit_enter_at'

/**
 * 解析访问渠道来源
 */
function resolveVisitSource() {
  const params = new URLSearchParams(window.location.search)
  const utm = params.get('utm_source')
  if (utm) {
    return `utm:${utm}`
  }
  return document.referrer || ''
}

/**
 * 初始化访客追踪（每个 Tab 会话仅上报一次进入）
 */
export function useVisitTracker() {
  // 记录访客进入
  async function trackEnter() {
    if (sessionStorage.getItem(VISIT_ID_KEY)) {
      return
    }
    try {
      const res = await createVisit({
        landing_path: window.location.pathname,
        visit_source: resolveVisitSource(),
      })
      if (res?.success && res?.data?.id) {
        sessionStorage.setItem(VISIT_ID_KEY, String(res.data.id))
        sessionStorage.setItem(VISIT_ENTER_KEY, String(Date.now()))
      }
    } catch {
      // 静默失败，不影响用户使用
    }
  }

  // 页面离开时上报停留时长
  function trackLeave() {
    const visitId = sessionStorage.getItem(VISIT_ID_KEY)
    const enterAt = Number(sessionStorage.getItem(VISIT_ENTER_KEY))
    if (!visitId || !enterAt) {
      return
    }
    const durationSeconds = Math.floor((Date.now() - enterAt) / 1000)
    sendVisitDuration(visitId, durationSeconds)
  }

  function init() {
    trackEnter()
    // window.addEventListener('pagehide', trackLeave)
    // document.addEventListener('visibilitychange', () => {
    //   if (document.visibilityState === 'hidden') {
    //     // trackLeave()
    //   }
    // })
  }

  return { init }
}
