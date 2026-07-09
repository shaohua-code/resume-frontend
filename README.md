# AI 简历助手 · 前端项目

Glassmorphism 浅色科技风前端，面向校园招聘与年轻求职者，提供 AI 生成简历、在线编辑、上传优化、JD 匹配、AI 评分、多格式导出等完整能力。

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

### 页面目录（views）

每个页面独立文件夹，`index.vue` 为主入口：

```
views/
├── home/index.vue          + components/ + utils/
├── login/index.vue         + components/ + utils/
├── register/index.vue
├── generate/index.vue      + components/（UploadPanel、FormPanel 双模式）
├── upload-optimize/        （旧路由，已 redirect 至 /generate?mode=upload）
├── user/index.vue
├── editor/index.vue        + components/（编辑器子组件）
└── admin/index.vue         + components/ + utils/
```

- **页面组件** → `views/{page}/components/`
- **页面工具** → `views/{page}/utils/`
- **全局组件** → `src/components/`（AppHeader、AppFooter、GlassCard、GradientButton、PageHero 等）
- **全局工具** → `src/utils/`（如 request.js）

### 全局共享

```
src/
├── components/          # 全局 UI 组件
├── composables/         # 业务组合式函数
│   ├── useResumeExportPrint.js  # 浏览器打印 API 导出 PDF
│   ├── useResumeOptimizer.js    # 简历分模块 AI 优化
│   ├── useDraggable.js        # 可拖拽元素（反馈悬浮按钮等）
│   └── useTheme.js            # 主题切换
├── constants/theme.js   # 唯一配色源
├── styles/global.css    # 公共类 + CSS 变量
└── api/                 # 按业务域拆分的接口封装
    ├── auth.js          # 认证
    ├── resume.js        # AI / 简历 CRUD
    ├── wallet.js        # 余额与流水
    ├── admin.js         # 管理后台
    ├── upload.js        # 通用文件上传
    └── feedback.js      # 用户反馈
```

## 三、主题配置（改一处全局生效）

编辑 [`src/constants/theme.js`](src/constants/theme.js) 即可同步：

1. **Tailwind** — `tailwind.config.js` 引用 THEME.colors
2. **CSS 变量** — `global.css :root` + `App.vue` 运行时注入
3. **Ant Design Vue** — `App.vue` ConfigProvider `antdToken`
4. **图表** — `views/admin/utils/chartTheme.js`

主色参考：青 `#00D4FF` → 蓝 `#4FACFE` → 紫 `#A855F7`

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
| AppHeader | `components/AppHeader.vue` | 磨砂顶栏 + 移动端 Drawer |
| AppFooter | `components/AppFooter.vue` | 页脚 |
| GlassCard | `components/GlassCard.vue` | 通用磨砂卡片 |
| GradientButton | `components/GradientButton.vue` | 渐变主按钮 |
| PageHero | `components/PageHero.vue` | 页面 Hero 区 |

首页专用：`views/home/components/` 下：

| 组件 | 用途 |
| --- | --- |
| HeroActions | 首屏双 CTA（主按钮 heroPrimary + 次按钮毛玻璃） |
| FeatureGrid | 6 功能卡片，Hover 上浮 +「立即体验 →」 |
| TemplatePreview | 精选模板 centerMode 三列轮播（放大中心项，左右露出相邻模板） |
| TrustOfferWall | Offer 数量 + 行业标签 + 匿名证言轮播 |
| JdInputPanel | JD 输入模块 |

模板预览页：`views/templates/index.vue`（`/templates`）展示全部 20 套模板。

首页模块顺序：Hero → 使用流程 → 核心功能 → 精选模板预览 → 信任背书。

## 六、生成页三模式

`/generate` 统一入口，顶部 `a-segmented` 切换：

| 模式 | URL 参数 | 组件 | 说明 |
| --- | --- | --- | --- |
| 上传 PDF | `?mode=upload` | `UploadPanel.vue` | PDF 校验、流式优化、已上传简历可直接引用优化 |
| 表单填写 | `?mode=form` | `FormPanel.vue` | 步骤式表单，项目经历选填 |
| 智能识别 | `?mode=lazy` | `LazyPanel.vue` | 自由文本键值对填写，AI 智能解析生成 |

旧路由 `/upload-optimize` 自动 redirect 至 `/generate?mode=upload`。

Hero 数据背书（stat-glass）：紧凑胶囊 `min-w-[88px] px-4 py-2.5`，数字 `text-2xl sm:text-3xl`，标签 `text-xs sm:text-sm`。首项文案「AI / 智能一键生成」。

## 七、响应式约定

| 断点 | 策略 |
| --- | --- |
| 默认 | 单列、Drawer 导航 |
| md (768px) | 功能卡 2 列（`:md="12"`） |
| lg (1024px) | 功能卡 3 列（`:lg="8"`）、水平菜单 |
| xl (1280px) | 功能卡 6 列（`:xl="4"`） |

首页允许自然滚动（已移除 `min-h-[calc(100vh-4rem)]` 一屏限制）。顶栏搜索与「免费开户」间距 `ml-6`（24px）。

AI 简历生成支持 SSE 流式输出（`/api/ai/generate/stream`），生成页 Step3 展示打字机预览。

## 八、接口请求约定

所有业务接口统一以 `/api` 为前缀，与后端 `resume-backend-node` 路由一一对应。

| 类型 | 实现 | 说明 |
| --- | --- | --- |
| 普通请求 | `src/utils/request.js`（Axios，`baseURL = /api`） | 自动携带 JWT、401 自动刷新 token |
| SSE 流式 | 原生 `fetch` + `readSSEStream`（`src/api/resume.js`） | AI 生成、分模块优化、PDF 优化等流式场景 |

### 接口前缀映射

| 前缀 | 前端文件 | 后端路由 | 职责 |
| --- | --- | --- | --- |
| `/api/auth` | `api/auth.js` | `routers/auth.js` | 登录、验证码、密码重置 |
| `/api/ai` | `api/resume.js` | `routers/ai.js` | AI 生成、分模块优化、JD 匹配、评分 |
| `/api/pdf` | `api/resume.js` | `routers/pdf.js` | PDF 上传、解析、优化 |
| `/api/wallet` | `api/wallet.js` | `routers/wallet.js` | 余额、流水 |
| `/api/admin` | `api/admin.js` | `routers/admin.js` | 管理后台 |
| `/api/upload` | `api/upload.js` | `routers/upload.js` | 通用文件上传 |
| `/api/feedback` | `api/feedback.js` | `routers/feedback.js` | 用户反馈 |

## 九、简历编辑器 AI 优化

编辑器（`views/editor/`）支持对简历四个模块进行 AI 流式优化，基于「意向岗位 + 完整简历内容」生成更专业的描述。

| 模块 | 类型 | 入口 |
| --- | --- | --- |
| 个人评价 | `summary` | `ResumeEditorForm.vue` 个人评价下方按钮 |
| 技能特长 | `skills` | `ResumeEditorForm.vue` 技能标签区下方按钮 |
| 项目经历 | `project` | `ResumeEditorForm.vue` 每个项目卡片底部按钮 |
| 实习经历 | `internship` | `ResumeEditorForm.vue` 每个实习卡片底部按钮 |

- **调用方式**：`useResumeOptimizer({ resume })` 返回 `{ optimize, isOptimizing, streamingText, streamingSkillsText }`
- **接口**：`POST /api/ai/optimize/:type/stream`，`type ∈ summary|skills|project|internship`
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
| API | `api/wallet.js` | `GET /wallet/balance`、`GET /wallet/ledger` |
| Store | `stores/wallet.js` | 余额、流水状态 |
| 用户中心 | `views/user/components/UsagePanel.vue` | 用量明细 Tab |
| 顶栏 | `AppHeader.vue` | 显示当前余额 |

AI 调用成功后 `resume` store 自动刷新余额。

## 十二、用户反馈

| 端 | 组件 | 说明 |
| --- | --- | --- |
| 用户端 | `components/FeedbackFloatingButton.vue` | 右下角可拖拽悬浮按钮 |
| 用户端 | `components/FeedbackModal.vue` | Quill 富文本弹窗，支持图片上传 |
| 管理端 | `views/admin/components/AdminFeedbackPanel.vue` | 仅 SUPER_ADMIN 可见，Markdown 预览 |
| 接口 | `api/feedback.js` | `POST /api/feedback` |

## 十三、新页面开发 Checklist

1. 在 `views/{page}/` 创建 `index.vue`
2. 页面私有组件放 `components/`，工具放 `utils/`
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

## 十五、注意事项

1. **简历模板**（`components/resume-templates/`）使用独立 CSS（`rt-*`），保证 PDF/打印友好
2. **编辑器组件**位于 `views/editor/components/`
3. 环境变量：`.env.development` / `.env.production`；生产通过 `VITE_API_URL` 指定后端
4. **计费**：AI 按账户余额扣费，余额不足时接口返回 402；导出对登录用户免费
5. 全功能说明见项目根目录 [`AI简历助手-项目全功能说明.md`](../AI简历助手-项目全功能说明.md)

## 十六、风格提示词

新增页面或模块时，请复制 [`STYLE_PROMPT.md`](STYLE_PROMPT.md) 中的 Prompt 模板，确保视觉一致。
