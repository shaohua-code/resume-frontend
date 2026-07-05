---
name: resume-frontend
description: >-
  AI简历助手 Vue3 前端项目指南（Vite + Tailwind + Ant Design Vue + Pinia）。
  在 resume-frontend 目录编写/修改页面、组件、路由、API、模板或编辑器时使用。
  每次改动路由、字段、模板或跨端契约后须同步更新本 skill 与 reference.md。
---

# resume-frontend

AI 简历助手校园版前端。Vue 3.5 + Vite 5 + Tailwind 3 + Ant Design Vue 4 + Pinia。

## 何时读取

- 修改 `views/`、`components/`、`stores/`、`api/`、`router/`
- 新增页面、简历模板、编辑器字段
- 对接后端 API 或鉴权跳转

详细路由与 API 映射见 [reference.md](reference.md)。

## 项目结构

```
src/
├── main.js                 # Pinia + Router + Antd + global.css
├── App.vue                 # AppHeader + router-view（hideLayout 控制）
├── api/                    # auth.js | resume.js | admin.js
├── utils/request.js        # Axios + Token 刷新 + 401 处理
├── utils/loginRedirect.js  # 登录回跳 redirect 工具
├── router/index.js         # 路由 + requireAuth 守卫
├── stores/user.js          # 认证、RBAC、Token
├── stores/resume.js        # 简历 CRUD、AI 生成流
├── constants/              # theme | templateRegistry | editorSettings | skin | roles
├── components/             # 全局 UI + ResumeTemplate.vue
├── components/resume-templates/  # 20 套模板 + shared/
├── composables/useTheme.js
├── styles/global.css       # Tailwind + @layer components
└── views/                  # home | generate | editor | templates | user | admin | auth
```

## 强制代码规范

| 规则 | 要求 |
|------|------|
| API | 100% `<script setup>`，禁止选项式 API |
| 样式 | 页面/布局 100% Tailwind 工具类；禁止页面级原生 CSS / 自定义 class / !important |
| 模板组件 | `resume-templates/` 用独立 CSS（`rt-*`），不用 Tailwind（PDF 友好） |
| v-model | 优先 `defineModel` |
| Props | `defineProps` + 类型 + 默认值 |
| 引号 | 单引号 |
| 分号 | 不使用 |
| 缩进 | 2 空格 |
| 注释 | 文件头 + 新增逻辑中文注释 |
| 组件结构 | script → template → style（style 仅 `@apply` 抽离） |
| Tailwind 顺序 | 布局 → 显示 → 尺寸 → 间距 → 文字 → 颜色 → 圆角/阴影 → 交互 → 响应式 |

## 鉴权与登录回跳

1. **路由守卫**（`router/index.js`）：`meta.requireAuth` 无 token → `/login?redirect=fullPath`
2. **Axios**（`request.js`）：自动带 Token；401 refresh 失败 → `navigateToLogin(router)`
3. **登录成功**：`resolveLoginRedirect(route.query)`，默认 `/generate`
4. **跳转登录**：用 `@/utils/loginRedirect` 的 `buildLoginRoute` / `navigateToLogin`，保留 redirect
5. **Admin**：`meta.roles` + 侧栏 `hasPermission()` + 子路由 `meta.permission`

公开路径（未登录可访问）：`/`, `/templates`, `/login`, `/register`, `/forgot-password`

## Pinia 职责

**useUserStore**：token/refresh、login/register、getValidToken、hasPermission、logout

**useResumeStore**：currentResume/currentResumeId/currentTemplateId、generateResume（SSE 优先）、saveResume（**仅 update，需已有 id**）、fetchList/Detail、AI optimize/match/score

## API 层约定

- `request.js`：`baseURL = ${VITE_API_URL}/api`，响应直接 `response.data`
- 普通请求：`api/*.js` + Axios
- **SSE 流式**：`fetch` + 读 stream（见 `api/resume.js` generate/uploadOptimize）
- 超时 60s

## 简历模板系统

```
ResumeTemplate.vue → Tpl01…Tpl20 → TplVariant.vue → ResumeStandardContent.vue
```

- 注册：`constants/templateRegistry.js`（TEMPLATE_LIST / TEMPLATE_MAP / clampTemplateId）
- 字段映射：`shared/useResumeFields.js`
- 模块显隐：`DEFAULT_MODULES` → `visibleModules` → `showModule(key)`
- 模块 key：`basic`, `skills`, `projects`, `internships`, `awards`
- 演示数据：`views/home/utils/demoResume.js`（DEMO_RESUME，虚构公司/学校）
- 预览组件：`TemplateMiniPreview.vue`，`previewMode`: `thumb` | `page` | `full`

## 编辑器架构

```
editor/index.vue
├── EditorToolbar（模板/间距/字体/皮肤 + AI + 保存/导出）
├── ResumePreview（A4 多页、智能分页、PDF 导出）
└── EditorEditPanel → ResumeEditorForm（Tab 驱动，defineModel resume/modules）
```

- 设置持久化：`resume._editorSettings`（`constants/editorSettings.js`）
- 基本信息含 **target_position（意向岗位）**，对应模板顶部标语与「岗位」行
- 进入：`/editor/:id` → fetchDetail；从 generate 带 store 数据
- 保存：`resume_json: JSON.stringify(resume)` + `template_id`

## 样式单源

- `constants/theme.js` → `tailwind.config.js` + Ant Design token + CSS 变量
- 语义色：brand, cream, ink, line, muted, surface…
- 全局工具类：`global.css` 中 page-container, glass, btn-primary, input-field, link-text 等

## 环境

| 环境 | VITE_API_URL | 说明 |
|------|--------------|------|
| 开发 | 空 | Vite proxy `/api` → localhost:8000 |
| 生产 | Render 后端 URL | `.env.production` |

```bash
npm run dev      # :5173
npm run build
```

localStorage：`token`, `refresh_token`, `expires_at`, `userInfo`

## 新增功能检查清单

### 用户页面

1. `views/<feature>/index.vue`
2. `router/index.js` 注册 + meta
3. 需 API → `api/*.js` + 可选 store
4. 导航 → `AppHeader.vue`；登录拦截 → `loginRedirect.js`
5. **更新 reference.md**

### Admin 页

1. router child + `meta.permission`
2. `views/admin/utils/menu.js` ADMIN_MENU_ITEMS
3. `views/admin/components/AdminXxxPanel.vue`
4. `api/admin.js`

### 简历模板（第 N 套）

1. `components/resume-templates/TplNXxx.vue` → `TplVariant :variant="N"`
2. `templateRegistry.js` 注册 + MAX_TEMPLATE_ID
3. `shared/templateVariants.css` 加 `.rt-vN`
4. **更新 reference.md 模板表**

### resume_json 新字段

1. `useResumeFields.js`
2. `ResumeEditorForm.vue` 对应 Tab
3. `ResumeStandardContent.vue` 渲染
4. **同步后端 resume_json 约定 + 两端 skill**

## Skill 维护（必须）

**每次在本项目生成或修改代码后**，检查并更新：

1. 本文件 `SKILL.md`：新页面、约定、架构变更
2. `reference.md`：路由表、API 函数、resume_json 字段、模板 ID
3. 若影响后端契约，同步更新 `resume-backend-node/.cursor/skills/resume-backend-node/`

更新原则：只记录 agent 无法从代码一眼推断的项目知识，保持简洁。
