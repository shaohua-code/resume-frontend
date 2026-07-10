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

/**
 * 流水类型中文映射
 * 包含注册赠送、管理员增减、额度池分配、AI 消费、退款等
 */
export const LEDGER_TYPE_LABEL_MAP = {
  REGISTER_GIFT: '注册赠送',
  ADMIN_GRANT: '管理员充值',
  ADMIN_DEDUCT: '管理员扣减',
  ADMIN_TRANSFER_OUT: '额度划拨',
  AI_CONSUME: 'AI 消费',
  REFUND: '退款',
  ADMIN_ALLOCATE: '额度池分配',
  ADMIN_POOL_GRANT: '额度池下发',
}

/**
 * 获取流水类型中文标签
 */
export function getLedgerTypeLabel(type) {
  return LEDGER_TYPE_LABEL_MAP[type] || type
}

/**
 * 获取流水类型选项列表（用于下拉筛选）
 */
export function getLedgerTypeOptions() {
  return Object.entries(LEDGER_TYPE_LABEL_MAP).map(([value, label]) => ({ value, label }))
}

/**
 * 判断流水类型是否显示实付金额
 */
export function hasPaidAmount(type) {
  return ['ADMIN_GRANT', 'ADMIN_ALLOCATE', 'ADMIN_POOL_GRANT'].includes(type)
}
