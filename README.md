# AI 简历 · 前端项目

面向全行业、全职业阶段求职者的响应式 AI 简历前端，提供 AI 生成简历、在线编辑、上传优化、岗位匹配分析、AI 评分、多格式导出与 50 套分类模板等完整能力。

## 一、技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Vue | 3.5.13 | `<script setup>` 组合式 API |
| Vue Router | 4.4.5 | 单页路由 |
| Pinia | 2.2.4 | 全局状态 |
| Vite | 5.4.8 | 构建工具 |
| TailwindCSS | 3.4.19 | 原子化样式 |
| Ant Design Vue | 4.2.6 | UI 组件库 |
| Axios | 1.7.7 | HTTP 请求（普通接口） |
| fetch + ReadableStream | - | SSE 流式接口（AI 生成 / 分模块优化 / PDF 优化） |
| @vueup/vue-quill | 1.2.0 | 富文本编辑器（用户反馈） |
| markdown-it | 14.1.0 | Markdown 渲染（管理端反馈预览） |
| ECharts | 6.1.0 | 管理后台图表 |
| file-saver | 2.0.5 | Word/Markdown 文件下载 |

## 二、目录规范

### 标准分层

页面、路由、接口、状态、组件、组合逻辑、常量和工具按职责分层；页面内部的专属组件与工具继续放在对应页面目录，只有跨页面复用的内容进入公共层。

```
src/
├── views/               # 页面；每个页面可自带 components/ 与 utils/
├── router/              # 路由定义与守卫
├── api/                 # 按业务域拆分的接口封装
├── stores/              # Pinia 状态
├── components/          # 跨页面复用组件与简历模板
├── composables/         # 跨页面复用组合逻辑
├── constants/           # 权限、字段、模板与主题常量
├── utils/               # 请求、日期与分页等通用工具
├── styles/              # 公共样式
├── App.vue              # 应用壳
└── main.js              # Vue 启动入口
```

不得把页面、接口、状态和服务揉进同一个目录；页面私有内容就近放在 `views/<page>/`，真正跨页面复用的内容才抽离到公共层。

## 三、系统界面主题

当前内置 5 套完整主题：清新渐变（默认）、简约风、商务风、经典黑白、雅致暖色。登录用户可在桌面账户下拉或移动端账户 Drawer 的“界面主题”高级面板中切换；偏好以 `ai-resume-ui-theme-v2` 保存在本地，无效值或存储不可用时回退默认主题。

[`src/constants/theme.js`](src/constants/theme.js) 是系统界面设计令牌的唯一来源，通过 [`src/composables/useTheme.js`](src/composables/useTheme.js) 同步：

1. **CSS / Tailwind** — 品牌色、页面、卡片、文字、边框、渐变、圆角、阴影、玻璃质感和各交互状态
2. **Ant Design Vue** — `App.vue` 的响应式 ConfigProvider token，覆盖按钮、表格、表单、弹窗、分页、菜单等业务控件
3. **图表** — 用户与管理数据图表的响应式色板
4. **跨标签页** — 本地偏好变更会同步到同源页面

系统主题只控制站点外壳和业务页面；简历 A4 的字体色、皮肤色与打印样式继续由模板独立配置，不随系统主题变化。

## 四、Glassmorphism 设计规范

| 元素 | 规范 |
| --- | --- |
| 页面底 | `#F8FAFC` + 径向渐变光斑 + 网格纹理（`.page-bg`） |
| 磨砂玻璃 | `.glass` — `bg-white/70 backdrop-blur-xl` |
| 霓虹边框 | `.glass-glow` — 渐变边框 + 外发光 |
| 卡片 | `.card-base` / `.card-hover` |
| 主按钮 | `.btn-primary` — 青紫渐变 + glow |
| 圆角 | 卡片 16px / 按钮 10px |

公共类详见 [`src/styles/global.css`](src/styles/global.css)。

## 五、全局共享组件

| 组件 | 路径 | 用途 |
| --- | --- | --- |
| AppHeader | `src/components/AppHeader.vue` | 磨砂顶栏 + 移动端 Drawer |
| AppFooter | `src/components/AppFooter.vue` | 页脚 |
| GlassCard | `src/components/GlassCard.vue` | 通用磨砂卡片 |
| GradientButton | `src/components/GradientButton.vue` | 渐变主按钮 |
| PageHero | `src/components/PageHero.vue` | 页面 Hero 区 |

首页专用：`src/views/home/components/` 下：

| 组件 | 用途 |
| --- | --- |
| HeroActions | 首屏双 CTA（主按钮 heroPrimary + 次按钮毛玻璃） |
| FeatureGrid | 6 功能卡片，Hover 上浮 +「立即体验 →」 |
| TemplatePreview | 精选模板 centerMode 三列轮播（放大中心项，左右露出相邻模板） |
| TrustOfferWall | Offer 数量 + 行业标签 + 匿名证言轮播 |
| JdInputPanel | JD 输入模块 |

模板预览页：`src/views/templates/index.vue`（`/templates`）展示全部 50 套模板，并在卡片接近视口时按需加载真实 A4 预览。

首页模块顺序：Hero → 核心功能 → 精选模板预览 → 信任背书 → 使用流程。

### 首屏加载策略

- 首页与 404 路由使用 `meta.lightweight`；其他业务页会在路由解析完成前异步安装 `utils/installAntDesign.js` 中实际使用的 Ant Design Vue 组件清单，不再注册完整组件库。
- `AppHeader` 异步加载，用户反馈与访问追踪在浏览器空闲阶段启动。
- 首页模板预览、信任背书及模板库真实 A4 卡片由 `LazyRender` 在接近视口时加载，避免模板组件和轮播依赖进入首屏入口包。
- 未知地址统一进入 `/:pathMatch(.*)*`，展示轻量 404 页面并提供首页、上一页、模板库和生成页入口。
- 当前生产构建入口 gzip 82.45kB、Ant 业务组件块 gzip 236.41kB；优化前基线分别为 124.77kB 和 318.72kB。新增全局 `a-*` 标签时必须同步按需注册清单并重新构建。

## 六、统一简历生成页

`/generate` 只维护一份结构化表单。页面上方提供“智能 PDF 识别”和“智能文字识别”，识别结果通过 SSE 持续展示并安全回填下方表单；两者只抽取原文事实和映射字段，不润色、不补写、不推断，用户也可跳过识别直接填写。

| 区域 | 组件 | 说明 |
| --- | --- | --- |
| 智能识别 | `RecognitionPanel.vue` | PDF/文字两种输入；PDF 可直接识别已存唯一文件；每种模式仅一个主识别按钮；识别期间锁定表单，完成后恢复编辑，仅回填原文事实，不触发生成、优化或保存 |
| 统一表单 | `FormPanel.vue` | 基本信息 → 教育背景 → 经历信息 → AI 结果；仅姓名与意向岗位必填 |
| 个人评价 | `ResumeBasicFieldsSection.vue` | `summary` 在基本信息中始终显示，选填；PDF/文字识别结果可回填，应用识别结果时不会丢失 |
| 更多内容 | `ResumeBasicFieldsSection.vue` | 身高、体重、民族、籍贯、政治面貌、期望薪资和自定义信息默认收起 |
| 最终结果 | `StreamResumePreview.vue` | 流式内容完成后继续保留，展示优化亮点，再提供进入编辑和重新生成 |

旧 `?mode=form|lazy|upload` 和 `/upload-optimize` 仅用于兼容入口并选择默认识别方式，不再挂载三套独立生成状态。识别完成后由用户检查或编辑表单，只有显式点击最终“开始 AI 生成”或“按岗位优化简历”按钮才会发起下一次 AI 请求。表单、最终结果和最近操作使用按用户隔离的 `sessionStorage` 草稿恢复；刷新不会自动重放可能计费的 AI 请求。

PDF/文字事实识别的任务值为 `resume_extract`；用户用量、管理流水、任务模型与任务提示词等前端界面统一通过 `constants/aiTasks.js` 显示为“简历信息识别”，禁止回退为原始英文值。

Hero 数据背书（stat-glass）：紧凑胶囊 `min-w-[88px] px-4 py-2.5`，数字 `text-2xl sm:text-3xl`，标签 `text-xs sm:text-sm`。首项文案「AI / 智能一键生成」。

## 七、响应式约定

| 断点 | 策略 |
| --- | --- |
| 默认 | 单列、Drawer 导航 |
| md (768px) | 功能卡 CSS Grid 2 列 |
| lg (1024px) | 功能卡 CSS Grid 3 列、水平菜单 |
| xl (1280px) | 功能卡 CSS Grid 6 列 |

首页允许自然滚动（已移除 `min-h-[calc(100vh-4rem)]` 一屏限制）。顶栏搜索与「免费开户」间距 `ml-6`（24px）。

AI 简历生成支持 SSE 流式输出（`/api/ai/generate/stream`），生成页 Step3（AI 生成）展示打字机预览。

### `resume_json` 字段约定

| 模块 | 字段（snake_case） | 说明 |
| --- | --- | --- |
| 基本信息 | `name`, `target_position`, `phone`, `email`, `summary`, `avatar` | 姓名、求职方向为常用必填 |
| 扩展基本信息 | `work_years`, `marital_status`, `height`, `weight`, `ethnicity`, `native_place`, `political_status`, `expected_salary` | 均可选 |
| 自定义字段 | `custom_fields: [{ label, value }]` | 放在基本信息内展示 |
| 教育背景 | `educations: [{ school, major, degree, start_date, end_date }]` | 独立模块，可 0~N 条 |
| 兼容 | `school`, `major`, `education` | 与 `educations[0]` 双向同步 |
| 其他 | `skills`, `projects`, `internships`, `work_experiences`, `awards`, `certificates`, `_editorSettings` | 全行业经历模块 |

归一化工具：`src/constants/resumeFieldSchema.js`；模板读取：`src/components/resume-templates/shared/useResumeFields.js`。

## 八、接口请求约定

所有业务接口统一以 `/api` 为前缀，与后端 `resume-backend-node` 路由一一对应。

| 类型 | 实现 | 说明 |
| --- | --- | --- |
| 普通请求 | `src/utils/request.js`（Axios，`baseURL = /api`） | 自动携带 JWT、401 自动刷新 token |
| SSE 流式 | 原生 `fetch` + `readSSEStream`（`src/api/resume.js`） | AI 生成、分模块优化、PDF 优化等流式场景 |

### 接口前缀映射

| 前缀 | 前端文件 | 后端路由 | 职责 |
| --- | --- | --- | --- |
| `/api/auth` | `api/auth.js` | `routers/auth.js` | 随机账号注册、登录、邮箱绑定验证码、密码重置 |
| `/api/ai` | `api/resume.js` | `routers/ai.js` | AI 生成、分模块优化、岗位匹配分析、评分 |
| `/api/pdf` | `api/resume.js` | `routers/pdf.js` | PDF 上传、解析、优化 |
| `/api/wallet` | `api/wallet.js` | `routers/wallet.js` | 余额、流水 |
| `/api/admin` | `api/admin.js` | `routers/admin.js` | 管理后台 |
| `/api/upload` | `api/upload.js` | `routers/upload.js` | 通用文件上传 |
| `/api/feedback` | `api/feedback.js` | `routers/feedback.js` | 用户反馈 |

## 九、简历编辑器 AI 优化

编辑器（`src/views/editor/`）支持对简历五类模块进行 AI 流式优化，基于「意向岗位 + 完整简历内容」生成更专业的描述。

| 模块 | 类型 | 入口 |
| --- | --- | --- |
| 个人评价 | `summary` | `ResumeEditorForm.vue` 个人评价下方按钮 |
| 技能特长 | `skills` | `ResumeEditorForm.vue` 技能标签区下方按钮 |
| 项目经历 | `project` | `ResumeEditorForm.vue` 每个项目卡片底部按钮 |
| 实习经历 | `internship` | `ResumeEditorForm.vue` 每个实习卡片底部按钮 |
| 工作经历 | `work_experience` | `ResumeEditorForm.vue` 每个正式工作卡片底部按钮 |

- **调用方式**：`useResumeOptimizer({ resume })` 返回 `{ optimize, isOptimizing, streamingText, streamingSkillsText }`
- **接口**：`POST /api/ai/optimize/:type/stream`，`type ∈ summary|skills|project|internship|work_experience`
- **流式回填**：文本类字段实时回填到对应输入框；技能类先在临时输入框展示打印机效果，完成后解析为数组
- **前置校验**：若 `resume.target_position` 为空会提示「请先填写意向岗位」

## 十、PDF 导出

使用 `useResumeExportPrint` 组合式函数，基于浏览器打印 API：

- 创建隐藏 iframe，注入打印样式
- 用户需在打印对话框选择「另存为 PDF」
- 导出前自动保存简历并记录 `export_record`（无 VIP 限制）

## 十一、Token 计费（钱包）

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| API | `src/api/wallet.js` | `GET /wallet/balance`、`GET /wallet/ledger` |
| Store | `src/stores/wallet.js` | 余额、流水状态 |
| 用户中心 | `src/views/user/components/UsagePanel.vue` | 用量明细 Tab |
| 顶栏 | `AppHeader.vue` | 显示当前余额 |

AI 调用成功后 `resume` store 自动刷新余额。

## 十二、用户反馈

| 端 | 组件 | 说明 |
| --- | --- | --- |
| 用户端 | `src/components/FeedbackFloatingButton.vue` | 右下角可拖拽悬浮按钮 |
| 用户端 | `src/components/FeedbackModal.vue` | Quill 富文本弹窗，支持图片上传 |
| 管理端 | `src/views/admin/components/AdminFeedbackPanel.vue` | 仅 SUPER_ADMIN 可见，Markdown 预览 |
| 接口 | `src/api/feedback.js` | `POST /api/feedback` |

## 十三、新页面开发 Checklist

1. 在 `src/views/{page}/` 创建 `index.vue`
2. 页面私有组件放该页面的 `components/`，工具放该页面的 `utils/`
3. 使用 `PageHero` / `GlassCard` / `GradientButton`，禁止硬编码色值
4. 路由注册到 `router/index.js`
5. 375px 宽度下验证布局
6. 参考 [`STYLE_PROMPT.md`](STYLE_PROMPT.md) 获取 AI 风格提示词

## 十四、开发与构建

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建
npm run preview  # 预览构建
```

提交代码前阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)。输入 `--提交` 时，项目的 `commit-ai-resume` Skill 会审查当前差异、运行必要验证，并按规范创建本地提交；不会自动推送。

## 十五、注意事项

1. **简历模板**（`src/components/resume-templates/`）使用独立 CSS（`rt-*`），保证 PDF/打印友好
2. **编辑器组件**位于 `src/views/editor/components/`
3. 环境变量：`.env.development` / `.env.production`；生产通过 `VITE_API_URL` 指定后端
4. **计费与门禁**：AI 按账户余额扣费，余额不足时接口返回 402；未绑定邮箱时返回 `EMAIL_BINDING_REQUIRED` 并由全局弹窗完成绑定后重试一次；导出对登录用户免费
5. 全功能说明见项目根目录 [`AI简历-项目全功能说明.md`](../AI简历-项目全功能说明.md)

## 十六、风格提示词

新增页面或模块时，请复制 [`STYLE_PROMPT.md`](STYLE_PROMPT.md) 中的 Prompt 模板，确保视觉一致。
