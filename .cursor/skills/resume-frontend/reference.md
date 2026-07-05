# resume-frontend 路由与 API 速查

## 路由表（router/index.js）

| Path | Name | Auth | Layout |
|------|------|------|--------|
| `/` | Home | 否 | 默认 |
| `/login` | Login | 否 | hideLayout |
| `/register` | Register | 否 | hideLayout |
| `/forgot-password` | ForgotPassword | 否 | hideLayout |
| `/templates` | Templates | 否 | 默认 |
| `/generate` | Generate | requireAuth | 默认 |
| `/upload-optimize` | — | redirect → `/generate?mode=upload` | |
| `/editor/:id?` | Editor | requireAuth | hideLayout |
| `/user` | UserCenter | requireAuth | 默认 |
| `/admin/stats` | AdminStats | requireAuth + ADMIN 角色 | hideLayout |
| `/admin/admins` | AdminAdmins | permission: admin:manage_admins | |
| `/admin/users` | AdminUsers | admin:manage_users | |
| `/admin/orders` | AdminOrders | admin:view_orders | |
| `/admin/ai-calls` | AdminAiCalls | admin:view_ai_calls | |
| `/admin/resumes` | AdminResumes | admin:view_resumes | |
| `/admin/announcements` | AdminAnnouncements | admin:announcement | |
| `/admin/models` | AdminModels | admin:ai_model | |
| `/admin/plans` | AdminPlans | admin:membership_plan | |
| `/admin/configs` | AdminConfigs | admin:system_config | |

Admin 父路由 `meta.roles`: SUPER_ADMIN, ADMIN

## api/auth.js → 后端 /api/auth

| 函数 | Method | Path |
|------|--------|------|
| sendCode | POST | /auth/sendCode |
| login | POST | /auth/login |
| register | POST | /auth/register |
| loginPassword | POST | /auth/loginPassword |
| refreshToken | POST | /auth/refresh |
| resetPassword | POST | /auth/resetPassword |
| updatePassword | POST | /auth/updatePassword |

## api/resume.js → 后端 /api/resume

| 函数 | Method | Path | 备注 |
|------|--------|------|------|
| generateResume | POST | /resume/generate | Axios |
| generateResumeStream | POST | /resume/generate/stream | fetch SSE |
| optimizeProject | POST | /resume/optimize | |
| matchJd | POST | /resume/match | |
| scoreResume | GET | /resume/score?resume_id= | |
| createResume | POST | /resume/create | |
| updateResume | PUT | /resume/update/:id | |
| saveResume | PUT | /resume/update/:id | 别名 |
| getResumeList | GET | /resume/list | |
| getResumeDetail | GET | /resume/detail?resume_id= | |
| deleteResume | DELETE | /resume/delete | |
| exportResume | POST | /resume/export | |
| uploadOptimizeResumeStream | POST | /resume/uploadOptimize/stream | FormData SSE |
| uploadOptimizeExistingStream | POST | /resume/uploadOptimize/existing/stream | JSON SSE |
| getUploadedResume | GET | /resume/uploadedFile | |
| deleteUploadedResume | DELETE | /resume/uploadedFile | |

## api/admin.js → 后端 /api/admin

getAdminStats, getAdminDashboard, 用户/订单/AI/简历/配置 CRUD

createCrudApi：`/admin/plans`, `/admin/announcements`, `/admin/models`

## resume_json 字段

```js
{
  name, target_position, phone, email, school, major, education, summary,
  skills: string[],
  projects: [{ name, role, description, tech_stack, start_date, end_date }],
  internships: [{ company, position, description, start_date, end_date }],
  awards: string[],
  certificates: string[],
  _editorSettings: {
    spacing: { sectionGap, lineHeight, padding, pageTopGap, pageBottomGap },
    fontSize, fontFamily, skin,
    modules: [{ key, title, visible }]
  }
}
```

持久化：`title`, `resume_json`（字符串）, `template_id`, `score`

## 模板注册（templateRegistry.js）

- 20 套，id 1–20
- `clampTemplateId(id)` 防越界
- 首页精选：FEATURED_TEMPLATE_IDS = [1, 3, 8, 14, 16, 20]（demoResume.js）

## 关键视图文件

| 路径 | 用途 |
|------|------|
| views/home/index.vue | 首页 |
| views/home/components/TemplatePreview.vue | 精选模板轮播 |
| views/home/components/TemplateMiniPreview.vue | 缩放预览 |
| views/templates/index.vue | 全部模板网格 + 弹窗 full 预览 |
| views/generate/index.vue | AI 生成（form/upload） |
| views/generate/components/FormPanel.vue | 四步向导 + target_position |
| views/editor/index.vue | 编辑器主页面 |
| views/editor/components/ResumePreview.vue | A4 多页预览 |
| views/editor/components/ResumeEditorForm.vue | 底部 Tab 表单 |
| views/user/index.vue | 用户中心 |
| views/admin/AdminLayout.vue | 管理后台 |
| views/login/index.vue | 双 Tab 登录 + redirect 回跳 |

## 登录回跳工具（utils/loginRedirect.js）

| 函数 | 用途 |
|------|------|
| resolveLoginRedirect(query) | 登录成功后解析 redirect，默认 /generate |
| buildLoginRoute(path) | 带 redirect 的登录路由 |
| navigateToLogin(router, path?) | 跳转登录并记录来源 |
| buildAuthRouteWithRedirect(path, redirect) | 认证页互跳保留 redirect |

## 角色与权限

角色：SUPER_ADMIN, ADMIN, VIP, USER（constants/roles.js）

前端 `userStore.hasPermission(permission)` 与后端 permission 字符串一致。

## Vite 配置

- 端口 5173
- alias `@` → `src/`
- proxy `/api` → `http://localhost:8000`
