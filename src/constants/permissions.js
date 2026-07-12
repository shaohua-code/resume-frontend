/**
 * 角色权限映射（与后端 utils/permissions.js 保持一致）
 * 前端用于菜单/路由展示；后端仍做最终校验
 */

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'admin:dashboard',
    'admin:manage_admins',
    'admin:manage_users',
    'admin:view_ai_calls',
    'admin:system_config',
    'admin:announcement',
    'admin:ai_model',
    'admin:stats',
    'admin:view_resumes',
    'admin:view_feedback',
    'admin:view_visits',
    'admin:wallet',
    'admin:view_ledgers',
    'admin:manage_invite_links',
    'admin:claim_users',
    'admin:recharge_manage',
    'admin:view_recharge_requests',
    'admin:approve_recharge',
    'admin:recharge_email_template',
    'user:resume_create',
    'user:resume_edit',
    'wallet:view_self',
    'wallet:manage_users',
    'wallet:grant_users',
  ],
  ADMIN: [
    'admin:dashboard',
    'admin:manage_users',
    'admin:view_ai_calls',
    'admin:view_resumes',
    'admin:stats',
    'admin:wallet',
    'admin:view_ledgers',
    'admin:manage_invite_links',
    'admin:claim_users',
    'admin:recharge_manage',
    'admin:view_recharge_requests',
    'admin:approve_recharge',
    'user:resume_create',
    'user:resume_edit',
    'wallet:view_self',
    'wallet:grant_users',
  ],
  USER: [
    'user:resume_create',
    'user:resume_edit',
    'wallet:view_self',
  ],
}

/** 根据角色获取有效权限列表 */
export function getRolePermissions(role = 'USER') {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.USER
}

/** 判断角色是否拥有指定权限 */
export function roleHasPermission(role, permission) {
  return getRolePermissions(role).includes(permission)
}
