/** 版本公告已读标记：按用户 + 公告 ID 存 localStorage，同一公告只弹一次 */

const STORAGE_PREFIX = 'ai_resume_announcement_seen_v1'

function getUserIdentity(userInfo = {}) {
  return String(userInfo.userId || userInfo.user_id || userInfo.account || '').trim()
}

function getSeenKey(userInfo, announcementId) {
  const identity = getUserIdentity(userInfo)
  if (!identity || !announcementId) return ''
  return `${STORAGE_PREFIX}:${identity}:${announcementId}`
}

export function hasSeenAnnouncement(userInfo, announcementId) {
  const key = getSeenKey(userInfo, announcementId)
  return Boolean(key && localStorage.getItem(key) === '1')
}

export function markAnnouncementSeen(userInfo, announcementId) {
  const key = getSeenKey(userInfo, announcementId)
  if (!key) return false
  localStorage.setItem(key, '1')
  return true
}
