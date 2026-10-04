/**
 * 管理后台菜单配置
 */
import {
  LayoutDashboard, ShieldCheck, Users, Wallet, Bot, FileText, ListChecks,
  Megaphone, Cpu, Settings, MessageSquare, Receipt, Eye, QrCode, ClipboardList, Share2,
} from 'lucide-vue-next'

export const ADMIN_MENU_ITEMS = [
  // 分组按管理员日常任务组织，路由和权限标识保持兼容既有调用链。
  { key: 'stats', path: '/admin/stats', label: '工作台', desc: '业务概况与趋势', group: '工作台', permission: 'admin:stats', icon: LayoutDashboard },
  { key: 'admins', path: '/admin/admins', label: '管理员账号', desc: '后台账号权限', group: '用户与资金', permission: 'admin:manage_admins', icon: ShieldCheck },
  { key: 'users', path: '/admin/users', label: '用户账号', desc: '普通用户管理', group: '用户与资金', permission: 'admin:manage_users', icon: Users },
  { key: 'wallets', path: '/admin/wallets', label: '用户额度', desc: '余额与额度调整', group: '用户与资金', permission: 'admin:wallet', icon: Wallet },
  { key: 'recharge', path: '/admin/recharge', label: '充值设置', desc: '付款码与联系二维码', group: '用户与资金', permission: 'admin:recharge_manage', icon: QrCode },
  { key: 'rechargeRequests', path: '/admin/recharge-requests', label: '充值审核', desc: '凭证审核与入账', group: '用户与资金', permission: 'admin:view_recharge_requests', icon: ClipboardList },
  { key: 'ledgers', path: '/admin/ledgers', label: '资金流水', desc: '额度变动记录', group: '用户与资金', permission: 'admin:view_ledgers', icon: Receipt },
  { key: 'aiCalls', path: '/admin/ai-calls', label: 'AI调用记录', desc: '模型调用审计', group: '运营与审计', permission: 'admin:view_ai_calls', icon: Bot },
  { key: 'resumes', path: '/admin/resumes', label: '简历资源', desc: '只读查看简历', group: '运营与审计', permission: 'admin:view_resumes', icon: FileText },
  { key: 'interview-bank', path: '/admin/interview-bank', label: '面试题库', desc: '按权限只读查看生成题库', group: '运营与审计', permission: 'admin:view_interview_bank', icon: ListChecks },
  { key: 'feedbacks', path: '/admin/feedbacks', label: '用户反馈', desc: '用户意见与建议', group: '运营与审计', permission: 'admin:view_feedback', icon: MessageSquare },
  { key: 'announcements', path: '/admin/announcements', label: '公告管理', desc: '运营通知内容', group: '运营与审计', permission: 'admin:announcement', icon: Megaphone },
  { key: 'models', path: '/admin/models', label: '模型管理', desc: '模型、供应商与单价', group: 'AI 配置', permission: 'admin:ai_model', icon: Cpu },
  { key: 'task-models', path: '/admin/task-models', label: '任务模型', desc: '为任务选择模型', group: 'AI 配置', permission: 'admin:ai_model', icon: Cpu },
  { key: 'task-prompts', path: '/admin/task-prompts', label: '任务提示词', desc: '默认业务指令', group: 'AI 配置', permission: 'admin:ai_model', icon: FileText },
  { key: 'configs', path: '/admin/configs', label: '系统配置', desc: '平台运行参数', group: '平台管理', permission: 'admin:system_config', icon: Settings },
  { key: 'visits', path: '/admin/visits', label: '访客记录', desc: '近30天访问日志', group: '平台管理', permission: 'admin:view_visits', icon: Eye },
  { key: 'share-links', path: '/admin/share-links', label: '分享链接', desc: '按平台复制追踪链接', group: '平台管理', permission: 'admin:view_visits', icon: Share2 },
]

export function getMenuByPath(path, menus) {
  return menus.find((item) => item.path === path) || menus[0]
}
