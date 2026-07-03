/**
 * 管理后台菜单配置 - 供侧栏与路由共用
 */
import {
  LayoutDashboard, ShieldCheck, Users, ShoppingCart, Bot, FileText,
  Megaphone, Cpu, Crown, Settings,
} from 'lucide-vue-next'

export const ADMIN_MENU_ITEMS = [
  { key: 'stats', path: '/admin/stats', label: '数据中心', desc: '核心业务大盘', group: '数据中心', permission: 'admin:stats', icon: LayoutDashboard },
  { key: 'admins', path: '/admin/admins', label: '管理员账号', desc: '后台账号权限', group: '用户管理', permission: 'admin:manage_admins', icon: ShieldCheck },
  { key: 'users', path: '/admin/users', label: '用户账号', desc: '普通/VIP用户', group: '用户管理', permission: 'admin:manage_users', icon: Users },
  { key: 'orders', path: '/admin/orders', label: '业务订单', desc: '会员订单状态', group: '业务管理', permission: 'admin:view_orders', icon: ShoppingCart },
  { key: 'aiCalls', path: '/admin/ai-calls', label: 'AI调用记录', desc: '模型调用审计', group: '业务管理', permission: 'admin:view_ai_calls', icon: Bot },
  { key: 'resumes', path: '/admin/resumes', label: '简历资源', desc: '只读查看简历', group: '业务管理', permission: 'admin:view_resumes', icon: FileText },
  { key: 'announcements', path: '/admin/announcements', label: '公告管理', desc: '运营通知内容', group: '业务管理', permission: 'admin:announcement', icon: Megaphone },
  { key: 'models', path: '/admin/models', label: 'AI模型管理', desc: '模型与VIP限制', group: 'AI模型管理', permission: 'admin:ai_model', icon: Cpu },
  { key: 'plans', path: '/admin/plans', label: '会员套餐', desc: 'VIP套餐配置', group: '系统管理', permission: 'admin:membership_plan', icon: Crown },
  { key: 'configs', path: '/admin/configs', label: '系统配置', desc: '平台运行参数', group: '系统管理', permission: 'admin:system_config', icon: Settings },
]

export function getMenuByPath(path, menus) {
  return menus.find((item) => item.path === path) || menus[0]
}
