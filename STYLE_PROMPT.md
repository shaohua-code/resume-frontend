# AI 简历 · Glassmorphism 风格提示词

> 本文档供 AI 辅助开发 / 设计师参考，确保新增页面与现有 Glassmorphism 视觉一致。
> 所有色值以 [`src/constants/theme.js`](src/constants/theme.js) 为唯一来源。

---

## 一、Keywords（双语）

**English:** Glassmorphism, Frosted Glass, Backdrop Blur, Soft Gradients, Cyan to Purple, Neon Glow Border, Rounded Corners, Modern UI, Futuristic Tech, Clean White Space, Subtle Grid Background, Ant Design Vue, Mobile-first Responsive

**中文：** 玻璃拟态、磨砂玻璃、背景模糊、青紫渐变、霓虹发光边框、大圆角、现代 UI、未来科技感、留白、 subtle 网格背景、Ant Design Vue、移动优先响应式

---

## 二、色彩与 Token（来自 theme.js）

| Token | 色值 | 用途 |
| --- | --- | --- |
| brand | `#00D4FF` | 主色、按钮、高亮 |
| brand.light | `#4FACFE` | 渐变中间色 |
| brand.lighter | `#E0F7FA` | 选中背景、标签 |
| brand.dark | `#0891B2` | hover、链接 |
| accent | `#A855F7` | 辅助紫、渐变终点 |
| cream | `#F8FAFC` | 页面底色 |
| surface | `#FFFFFF` | 卡片底（可配合 70% 透明度） |
| ink | `#1E293B` | 标题、正文 |
| ink.secondary | `#64748B` | 描述、辅助文字 |

**渐变：**
- 主按钮 / 主渐变：`linear-gradient(90deg, #00D4FF, #4FACFE, #A855F7)`
- Hero 背景：`linear-gradient(135deg, #00D4FF 0%, #4FACFE 50%, #A855F7 100%)`

**圆角：** 卡片 16px · 按钮 10px · Banner 20px · 胶囊 9999px

**阴影：** 卡片双层浅阴影 · 按钮外发光 `0 0 20px rgba(0,212,255,0.3)`

---

## 三、组件描述模板

### Header（顶栏）
Semi-transparent frosted glass header (`backdrop-blur-xl`, `bg-white/70`, `border-white/60`). Logo left, horizontal `a-menu` center on desktop, `a-drawer` on mobile. Right: search icon + gradient CTA button「免费开户」.

### Hero（首屏）
Full-width gradient hero (`--gradient-hero`). Large bold title, subtitle, **stat-glass** compact pill badges (`min-w-[88px] px-4 py-2.5`, numbers `text-2xl sm:text-3xl`, labels `text-xs sm:text-sm`), dual CTA slot via **HeroActions** (primary: white bg + gradient text `heroPrimary`; secondary: frosted ghost). Mobile compact: `py-6`, title `text-xl`. Optional JD input below.

### HeroActions（双 CTA）
Primary「立即开始」/「开始生成简历」：`GradientButton variant="heroPrimary"`。Secondary「上传 PDF 优化」：`btn-ghost-sm` white border glass. No login button on hero (login stays in AppHeader).

### stat-glass（数据背书）
`.stat-glass` — `rounded-full bg-white/25 backdrop-blur-xl border-white/40 min-w-[88px] px-4 py-2.5`. Number: `text-2xl sm:text-3xl font-extrabold text-white drop-shadow-sm`. Label: `text-xs sm:text-sm text-white/95`. First stat:「AI / 智能一键生成」.

### FeatureCard（功能卡片）
Responsive grid `xs=24 md=12 lg=8 xl=4`. Icon in rounded square, title, description, **「立即体验 →」** link (`text-brand-dark`). Hover: `hover:-translate-y-2 hover:shadow-card-hover`.

### TemplatePreview（精选模板轮播）
`a-carousel` centerMode 三列透视（桌面 `slidesToShow: 3`，移动端 1 列）。中心 slide `scale(1) opacity-100`，左右相邻 `scale(0.75) opacity-50` 略微下沉。主预览 scale 提升至 0.42~0.48。真实模板组件 + 固定演示数据（张三）。Link to `/templates` for full gallery.

### TrustOfferWall（信任背书）
Centered copy with bold offer count. Industry tag wall（互联网·金融·教育等通用词，无商标，`opacity-60`）。Bottom `a-carousel` 2~3 条匿名评价，首字母圆形头像占位。

### Generate Page（生成页双模式）
`/generate` 容器页 + `a-segmented` 切换 upload/form。`UploadPanel`：PDF 上传 + 已上传简历直接优化。`FormPanel`：步骤表单，项目经历选填。URL `?mode=upload|form`。

### Templates Gallery（全部模板）
`/templates` page — grid of all 20 templates with same demo resume data, click → `/generate`.

### GlassCard（磨砂卡片）
Semi-transparent white card (`bg-surface/80`, `backdrop-blur-sm`, `border-line/60`, `rounded-card`, `shadow-card`). Optional `glass-glow` neon gradient border wrapper.

### JD Input Module（JD 输入）
Wide container with gradient glow border. Label「JD 输入模块」, `a-textarea` + gradient「开始生成」button. Mobile: stack vertically.

### Generate Stream UI（流式生成）
Step3 shows SSE typewriter in `pre` monospace box (`max-h-48 overflow-y-auto`), blinking cursor while generating. Progress steps advance with `streamText` length.

### Footer
Glass footer bar. Brand + links (关于/协议/隐私) + copyright.

---

## 四、响应式要求

```
mobile (default): 单列、Drawer 导航、表格 scroll x
md (768px):       功能卡 2 列（md=12）、表单 2 列、Steps 横向
lg (1024px):      功能卡 3 列（lg=8）、水平菜单、Admin Sider 展开
xl (1280px):      功能卡 6 列（xl=4）
```

Ant Design 用法示例：
- `a-col :xs="24" :md="12" :lg="8" :xl="4"`
- `a-layout-sider :breakpoint="'lg'" :collapsed-width="0"`
- `a-table :scroll="{ x: 'max-content' }"`

---

## 五、Ant Design Vue 组件映射

| 场景 | 组件 |
| --- | --- |
| 布局 | `a-layout`, `a-layout-header`, `a-layout-sider`, `a-layout-content` |
| 导航 | `a-menu`, `a-drawer` |
| 表单 | `a-form`, `a-input`, `a-select`, `a-upload-dragger` |
| 数据 | `a-table`, `a-descriptions`, `a-tag`, `a-progress` |
| 反馈 | `a-modal`, `a-drawer`, `a-spin`, `a-result` |
| 引导 | `a-steps`, `a-empty` |

样式由 Tailwind 公共类负责：`glass`, `card-base`, `btn-primary`, `page-container` 等。

---

## 六、新增页面标准 Prompt 模板

复制以下模板，替换 `{页面名称}` 和 `{功能描述}`：

```
为全行业 AI 简历新增 {页面名称} 页面。

风格：Glassmorphism UI。浅底 (#F8FAFC) + 青紫径向渐变光斑 + 网格纹理背景。
组件：半透明磨砂面板 (backdrop-blur-xl, bg-white/70)。主按钮青蓝→紫渐变 + 外发光。
圆角 16px，字体 Inter / PingFang SC。

技术：Vue 3 script setup + TailwindCSS 工具类 + Ant Design Vue 4。
目录：views/{page}/index.vue，页面组件放 views/{page}/components/，工具放 views/{page}/utils/。
全局组件仅用 src/components/ 下的 GlassCard、GradientButton、PageHero 等。

功能：{功能描述}

响应式：mobile-first，375px 可用，md 以上双列表单。
禁止硬编码色值，统一使用 theme.js token（text-ink、bg-surface、card-base）。
```

### 完整英文 Prompt 示例

```
Glassmorphism UI for AI Resume Assistant campus edition. Light background (#F8FAFC) with soft cyan-to-purple radial gradients and subtle grid texture. Frosted glass panels (backdrop-blur-xl, bg-white/70). Neon gradient borders on primary inputs. Rounded corners 16px. Primary button: linear-gradient(90deg, #00D4FF, #4FACFE, #A855F7) with soft glow. Use Ant Design Vue 4 with TailwindCSS utility classes only. Mobile-first responsive layout. Page structure: views/{page}/index.vue with local components/ and utils/ folders.
```

---

## 七、修改主题色

只需编辑 [`src/constants/theme.js`](src/constants/theme.js) 一处，将同步至：
- Tailwind（`tailwind.config.js`）
- CSS 变量（`global.css :root` + 运行时注入）
- Ant Design Vue（`App.vue` ConfigProvider token）
- 管理后台图表（`views/admin/utils/chartTheme.js`）
