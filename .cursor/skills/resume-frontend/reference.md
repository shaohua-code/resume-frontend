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

- PDF：`useResumeExportPrint`（浏览器打印，逐页固定 A4 页盒，打印 iframe 按页数撑高后离屏打印）
- 无 VIP 校验，`ensureCanExport` 仅保存+记录导出

## resume_json 字段

基本信息扩展：`work_years`, `marital_status`, `height`, `weight`, `ethnicity`, `native_place`, `political_status`, `expected_salary`, `custom_fields[]`

教育背景：`educations[]`（`school`, `major`, `main_course`, `degree`, `start_date`, `end_date`），编辑器模块 key 为 `educations`；`major` 为专业，`main_course` 为主修

经历模块：

- `projects[]`：`name`, `role`, `description`, `tech_stack`, `start_date`, `end_date`
- `internships[]`：`company`, `position`, `description`, `start_date`, `end_date`
- `work_experiences[]`：`company`, `position`, `department`, `description`, `start_date`, `end_date`

编辑器 AI 优化类型：`summary | skills | project | internship | work_experience`。

兼容扁平：`school`, `major`, `main_course`, `education` ↔ `educations[0]`

时间字段：教育、项目、实习、工作经历的 `start_date` / `end_date` 在编辑器中使用月份选择器，保存格式为 `YYYY.MM`。

工具：`constants/resumeFieldSchema.js`、`useResumeFields.js`；共享表单：`ResumeBasicFieldsSection.vue`、`ResumeEducationListSection.vue`

## 模板与全行业示例

- 模板注册：`constants/templateRegistry.js`（20 套，带分类、说明与主题色）
- 模板库：`views/templates/index.vue`（分类筛选、完整预览、移动端单列）
- 示例数据：`views/home/utils/demoResume.js`（按模板映射多行业画像）
- 本地品牌资源：`public/brand-mark.svg`, `public/demo-avatar.svg`
- 模板不得根据技能数组下标虚构熟练度或百分比；缺失模块保持不显示。

## 响应式基线

- 375px+ 无页面级横向滚动，窄屏表单单列，主要触控区域至少 44px。
- 全局移动端 Modal 最大宽度 `calc(100vw - 24px)`，正文内部滚动。
- A4 简历只缩放预览，保持打印/导出尺寸。
- 移动端编辑器不显示分页控制器，但继续纵向滚动展示多张 A4。
- 编辑器每一页（含最后一页）都显示完整 A4 纸张，内容不足时留白，不按内容高度缩短。
- 编辑器内容、模板、字体、颜色、皮肤、模块显示与间距变更后会防抖自动保存；手动保存仍保留完整必填校验与提示。
- 间距面板的“左右边距”仅控制 A4 左右内边距，范围 0-50；上下留白使用页眉/页脚安全边距。
- 模板分页依赖 `data-resume-module`、`rt-section`、`rt-item`、`rt-desc` 等标记；金融会计等非标准时间轴模板必须补齐标记，模板根节点不得裁切分页内容。

## Vite

- 端口 5173，proxy `/api` → localhost:8000
