/**
 * 角色展示常量
 * 统一维护角色文案和状态描述，避免多个页面显示不一致。
 */

export const ROLE_LABEL_MAP = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  VIP: 'VIP用户',
  USER: '普通用户',
}

export const ROLE_COLOR_MAP = {
  SUPER_ADMIN: 'purple',
  ADMIN: 'blue',
  VIP: 'gold',
  USER: 'default',
}

export const STATUS_LABEL_MAP = {
  ACTIVE: '正常',
  BANNED: '已封禁',
}

export function getRoleLabel(role = 'USER') {
  return ROLE_LABEL_MAP[role] || ROLE_LABEL_MAP.USER
}

export function getRoleColor(role = 'USER') {
  return ROLE_COLOR_MAP[role] || ROLE_COLOR_MAP.USER
}

export function getStatusLabel(status = 'ACTIVE') {
  return STATUS_LABEL_MAP[status] || status
}

export function getVipStatusText(userInfo = {}) {
  if (['SUPER_ADMIN', 'ADMIN'].includes(userInfo.role)) {
    return ''
  }
  if (userInfo.role !== 'VIP') {
    return '当前为普通用户，可升级 VIP 解锁不限次数 AI 和导出能力'
  }
  if (!userInfo.vipExpireTime) {
    return 'VIP 有效期：长期有效'
  }
  const expireTime = new Date(userInfo.vipExpireTime).getTime()
  if (Number.isNaN(expireTime)) {
    return 'VIP 有效期：未知'
  }
  const remainDays = Math.ceil((expireTime - Date.now()) / (24 * 60 * 60 * 1000))
  return remainDays > 0 ? `VIP 剩余 ${remainDays} 天` : 'VIP 已到期，请续费'
}
