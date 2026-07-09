# resume-frontend 路由与 API 速查

## 路由表

| Path | Name | Auth | 说明 |
|------|------|------|------|
| `/` | Home | 否 | 首页 |
| `/login` | Login | 否 | hideLayout |
| `/register` | Register | 否 | hideLayout |
| `/templates` | Templates | 否 | 模板预览 |
| `/generate` | Generate | requireAuth | AI 生成 |
| `/editor/:id?` | Editor | requireAuth | hideLayout |
| `/user` | UserCenter | requireAuth | Tab：我的简历 / 用量明细 |
| `/admin/stats` | AdminStats | ADMIN | 数据中心 |
| `/admin/admins` | AdminAdmins | admin:manage_admins | |
| `/admin/users` | AdminUsers | admin:manage_users | |
| `/admin/wallets` | AdminWallets | admin:wallet | 用户额度 |
| `/admin/ai-calls` | AdminAiCalls | admin:view_ai_calls | |
| `/admin/resumes` | AdminResumes | admin:view_resumes | |
| `/admin/feedbacks` | AdminFeedbacks | admin:view_feedback | 仅 SUPER_ADMIN |
| `/admin/announcements` | AdminAnnouncements | admin:announcement | |
| `/admin/models` | AdminModels | admin:ai_model | 模型单价 |
| `/admin/configs` | AdminConfigs | admin:system_config | |

**已删除路由：** `/admin/orders`, `/admin/plans`

## api/wallet.js

| 函数 | Method | Path |
|------|--------|------|
| getWalletBalance | GET | /wallet/balance |
| getWalletLedger | GET | /wallet/ledger |

## api/admin.js（节选）

| 函数 | 说明 |
|------|------|
| getAdminWallets | GET /admin/wallets |
| adjustUserBalance | POST /admin/users/:id/balance |
| announcementApi / aiModelApi | CRUD |

## Pinia

**useUserStore**：登录态、role、permissions、logout

**useWalletStore**：balance、totalConsumed、fetchBalance、fetchLedger

**useResumeStore**：简历 CRUD、AI 生成/优化；成功后 `refreshWalletBalance()`

## 用户中心

- `views/user/index.vue`：Tab + 余额展示
- `views/user/components/UsagePanel.vue`：流水列表

## 顶栏余额

`AppHeader.vue` 登录后显示 `walletStore.balance`

## 角色

SUPER_ADMIN, ADMIN, USER（`constants/roles.js`，已移除 VIP 文案）

## 导出

- PDF：`useResumeExportPrint`（浏览器打印）
- 无 VIP 校验，`ensureCanExport` 仅保存+记录导出

## Vite

- 端口 5173，proxy `/api` → localhost:8000
