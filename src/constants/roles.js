/**
 * 角色展示常量
 * 统一维护角色文案和状态描述，避免多个页面显示不一致。
 */

export const ROLE_LABEL_MAP = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  USER: '普通用户',
}

export const ROLE_COLOR_MAP = {
  SUPER_ADMIN: 'purple',
  ADMIN: 'blue',
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

/** 格式化余额展示文案 */
export function formatBalanceText(balance = 0) {
  return `¥${Number(balance || 0).toFixed(2)}`
}
