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
| Axios | 1.7.7 | HTTP 请求 |
| ECharts | 6.1.0 | 管理后台图表 |

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
├── composables/         # useTheme 等
├── constants/theme.js   # 唯一配色源
├── styles/global.css    # 公共类 + CSS 变量
└── api/                 # 接口封装
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

## 六、生成页双模式

`/generate` 统一入口，顶部 `a-segmented` 切换：

| 模式 | URL 参数 | 组件 | 说明 |
| --- | --- | --- | --- |
| 上传 PDF | `?mode=upload` | `UploadPanel.vue` | PDF 校验、流式优化、已上传简历可直接引用优化 |
| 表单填写 | `?mode=form` | `FormPanel.vue` | 步骤式表单，项目经历选填 |

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

AI 简历生成支持 SSE 流式输出（`/resume/generate/stream`），生成页 Step3 展示打字机预览。

## 八、新页面开发 Checklist

1. 在 `views/{page}/` 创建 `index.vue`
2. 页面私有组件放 `components/`，工具放 `utils/`
3. 使用 `PageHero` / `GlassCard` / `GradientButton`，禁止硬编码色值
4. 路由注册到 `router/index.js`
5. 375px 宽度下验证布局
6. 参考 [`STYLE_PROMPT.md`](STYLE_PROMPT.md) 获取 AI 风格提示词

## 九、开发与构建

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建
npm run preview  # 预览构建
```

## 十、注意事项

1. **简历模板**（`components/resume-templates/`）20 套不在 UI 改造范围，避免影响 PDF 导出
2. **编辑器组件**位于 `views/editor/components/`
3. 环境变量：`.env.development` / `.env.production`，勿提交敏感信息
4. VIP 权限由后端控制

## 十一、风格提示词

新增页面或模块时，请复制 [`STYLE_PROMPT.md`](STYLE_PROMPT.md) 中的 Prompt 模板，确保视觉一致。
