/**
 * 邮箱绑定门禁状态
 * 仅负责在调用方与全局弹窗之间共享一次 Promise，不承载接口请求或用户数据。
 */
import { readonly, ref } from 'vue'

export const EMAIL_BINDING_REQUIRED_CODE = 'EMAIL_BINDING_REQUIRED'
export const EMAIL_BINDING_CANCELLED_CODE = 'EMAIL_BINDING_CANCELLED'
export const AI_OPERATION_CANCELLED_CODE = 'AI_OPERATION_CANCELLED'

const gateOpen = ref(false)
let pendingPromise = null
let resolvePending = null
let rejectPending = null
let activeBindingWaiters = 0

// 只读显隐状态供根组件和邮箱绑定弹窗消费，避免页面直接改写门禁。
export const emailBindingGateOpen = readonly(gateOpen)

/**
 * 请求完成邮箱绑定；并发调用复用同一个等待 Promise，防止重复弹窗。
 * @returns {Promise<unknown>}
 */
export function requestEmailBinding() {
  if (pendingPromise) return pendingPromise

  pendingPromise = new Promise((resolve, reject) => {
    resolvePending = resolve
    rejectPending = reject
  })
  gateOpen.value = true
  return pendingPromise
}

/** 邮箱绑定成功后释放所有等待中的受保护请求。 */
export function completeEmailBinding(payload = true) {
  const resolve = resolvePending
  gateOpen.value = false
  pendingPromise = null
  resolvePending = null
  rejectPending = null
  resolve?.(payload)
}

/**
 * 用户取消绑定时终止原请求；专用错误码便于上层停止流式回退与重复提示。
 */
export function cancelEmailBinding(detail = '已取消邮箱绑定') {
  const reject = rejectPending
  gateOpen.value = false
  pendingPromise = null
  resolvePending = null
  rejectPending = null
  if (!reject) return

  const error = new Error(detail)
  error.code = EMAIL_BINDING_CANCELLED_CODE
  error.silent = true
  reject(error)
}

/** 读取当前登录账号标识，供等待绑定的调用确认自己没有跨会话。 */
export function getCurrentSessionOwner() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return String(userInfo.userId || userInfo.user_id || userInfo.account || '')
  } catch {
    return ''
  }
}

/** 构造不会触发通用错误提示的调用级取消错误。 */
export function createOperationCancelledError(detail = '本次 AI 操作已取消') {
  const error = new Error(detail)
  error.code = AI_OPERATION_CANCELLED_CODE
  error.silent = true
  return error
}

/** 单个等待者可独立取消，不影响同一邮箱弹窗下的其他并发请求。 */
function waitForBindingWithSignal(signal) {
  if (signal?.aborted) return Promise.reject(createOperationCancelledError())

  return new Promise((resolve, reject) => {
    let settled = false
    activeBindingWaiters += 1
    const handleAbort = () => {
      cleanup()
      reject(createOperationCancelledError())
      // 最后一位调用者离开页面时关闭全局弹窗，避免留下无人等待的门禁。
      if (activeBindingWaiters === 0) cancelEmailBinding('本次 AI 操作已结束')
    }
    const cleanup = () => {
      if (settled) return
      settled = true
      activeBindingWaiters = Math.max(0, activeBindingWaiters - 1)
      signal?.removeEventListener('abort', handleAbort)
    }
    signal?.addEventListener('abort', handleAbort, { once: true })
    requestEmailBinding().then(
      (value) => {
        cleanup()
        resolve(value)
      },
      (error) => {
        cleanup()
        reject(error)
      },
    )
  })
}

/** 等待绑定成功后仅在调用仍存活且仍属于同一账号时重试一次。 */
export async function withEmailBindingRetry(retry, options = {}) {
  if (typeof retry !== 'function') {
    throw new TypeError('邮箱绑定门禁缺少可重试操作')
  }
  const expectedOwner = options.sessionOwner ?? getCurrentSessionOwner()
  // 先校验调用所属会话再打开弹窗，旧账号的迟到响应不能打扰当前账号。
  if (options.signal?.aborted || !expectedOwner || getCurrentSessionOwner() !== expectedOwner) {
    throw createOperationCancelledError('登录状态已变化，本次 AI 操作未继续')
  }
  await waitForBindingWithSignal(options.signal)
  if (options.signal?.aborted || !expectedOwner || getCurrentSessionOwner() !== expectedOwner) {
    throw createOperationCancelledError('登录状态已变化，本次 AI 操作未继续')
  }
  return retry()
}

// 保留语义明确的别名，便于 Axios 拦截器直接表达“等待后重试”。
export const waitForEmailBindingAndRetry = withEmailBindingRetry

/** 判断服务端是否要求绑定邮箱，Axios 与原生 fetch 可共用。 */
export function isEmailBindingRequiredError(error) {
  return error?.code === EMAIL_BINDING_REQUIRED_CODE
    || error?.response?.data?.code === EMAIL_BINDING_REQUIRED_CODE
}

/** 判断用户是否主动终止了邮箱绑定流程。 */
export function isEmailBindingCancelledError(error) {
  return error?.code === EMAIL_BINDING_CANCELLED_CODE
}
