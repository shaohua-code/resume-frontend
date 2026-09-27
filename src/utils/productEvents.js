/** 全站产品事件只发送路由类别和严格白名单属性；网络故障不得打断用户操作。 */
const API_BASE = import.meta.env.VITE_API_URL || ''
const SESSION_KEY = 'product_event_session_v1'
const ANONYMOUS_KEY = 'product_event_visitor_v1'

function getSessionContext() {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, sessionId)
    }
    let anonymousId = sessionStorage.getItem(ANONYMOUS_KEY)
    if (!anonymousId) {
      anonymousId = crypto.randomUUID()
      sessionStorage.setItem(ANONYMOUS_KEY, anonymousId)
    }
    return { session_id: sessionId, anonymous_id: anonymousId }
  } catch {
    return null
  }
}

const PAGE_BY_ROUTE = Object.freeze({
  Home: 'home', Login: 'login', Register: 'register', ForgotPassword: 'forgot_password',
  Templates: 'templates', Generate: 'generate', Editor: 'editor', UserCenter: 'user',
  BrowserExtension: 'extension', ExtensionConnect: 'extension_connect',
  AdminStats: 'admin', AdminAdmins: 'admin', AdminUsers: 'admin', AdminWallets: 'admin', AdminRecharge: 'admin',
  AdminRechargeRequests: 'admin', AdminLedgers: 'admin', AdminAiCalls: 'admin', AdminResumes: 'admin',
  AdminFeedbacks: 'admin', AdminAnnouncements: 'admin', AdminModels: 'admin', AdminTaskModels: 'admin',
  AdminTaskPrompts: 'admin', AdminConfigs: 'admin', AdminVisits: 'admin', AdminShareLinks: 'admin',
  NotFound: 'not_found',
})

export async function emitProductEvent(eventName, properties = {}) {
  const context = getSessionContext()
  if (!context) return
  const token = localStorage.getItem('token') || ''
  const event = {
    event_id: crypto.randomUUID(),
    event_name: eventName,
    ...context,
    occurred_at: new Date().toISOString(),
    properties,
  }
  try {
    await fetch(`${API_BASE}/api/product-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ events: [event] }),
      keepalive: true,
    })
  } catch {
    // 行为采集失败静默处理，保证注册、保存和编辑等主流程独立可用。
  }
}

export function trackPageView(routeName) {
  const page = PAGE_BY_ROUTE[routeName]
  if (page) void emitProductEvent('page_viewed', { page })
}
