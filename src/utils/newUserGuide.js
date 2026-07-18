const GUIDE_STORAGE_PREFIX = 'ai_resume_new_user_guide_v1'
export const NEW_USER_GUIDE_PENDING_EVENT = 'ai-resume:new-user-guide-pending'

function getUserIdentity(userInfo = {}) {
  return String(userInfo.userId || userInfo.user_id || userInfo.account || '').trim()
}

function getGuideStorageKey(userInfo) {
  const identity = getUserIdentity(userInfo)
  return identity ? `${GUIDE_STORAGE_PREFIX}:${identity}` : ''
}

/** 仅在注册成功时创建待引导标记，老账号登录不会被自动加入引导。 */
export function markNewUserGuidePending(userInfo) {
  const key = getGuideStorageKey(userInfo)
  if (!key) return false
  if (!localStorage.getItem(key)) localStorage.setItem(key, 'pending')
  window.dispatchEvent(new CustomEvent(NEW_USER_GUIDE_PENDING_EVENT))
  return true
}

export function hasPendingNewUserGuide(userInfo) {
  const key = getGuideStorageKey(userInfo)
  return Boolean(key && localStorage.getItem(key) === 'pending')
}

/** 跳过和完成都视为用户已处理，后续刷新或重新登录不再打扰。 */
export function completeNewUserGuide(userInfo) {
  const key = getGuideStorageKey(userInfo)
  if (!key) return false
  localStorage.setItem(key, 'done')
  return true
}
