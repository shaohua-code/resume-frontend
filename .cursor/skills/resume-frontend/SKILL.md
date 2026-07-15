---
name: resume-frontend
description: >-
  AI简历助手 Vue3 前端项目指南（Vite + Tailwind + Ant Design Vue + Pinia）。
  在 resume-frontend 目录编写/修改页面、组件、路由、钱包/用量、API、模板或编辑器时使用。
  每次进入项目任务先阅读本 skill、reference.md 与后端 skill；改动路由、字段、模板、移动端、
  计费相关 UI 或跨端契约后须同步更新本 skill、reference.md 与 docs/PRD.md。
---

# resume-frontend

AI 简历助手全行业响应式前端，支持校招、社招、转岗和技术、职能、销售、制造、教育、医疗、金融、服务业等岗位。**计费模式：顶栏/用户中心展示余额，AI 扣费后自动刷新；已移除 VIP 会员 UI。**

## 何时读取

- 修改 `views/`、`stores/`、`api/`、`router/`
- 用户中心、管理端额度、余额展示
- 管理端 AI 模型、模型类型和任务模型映射
- 对接 wallet API
- 修改简历模板、编辑器字段、生成示例或移动端交互

详细见 [reference.md](reference.md)。

## 项目结构（节选）

```
api/           auth | resume | wallet | admin | upload | feedback
stores/        user.js | wallet.js | resume.js
views/user/    index.vue + components/UsagePanel.vue
views/admin/   AdminWalletPanel.vue（用户额度）
               AdminCrudPanel.vue（模型管理）
               AdminTaskModelsPanel.vue（任务模型配置）
composables/   useResumeExportPrint.js（PDF 打印导出）
```

## Pinia

**useWalletStore**：`fetchBalance()`, `fetchLedger()`, `reset()`（logout 时）

**useUserStore**：无 `isVip`；权限用 `hasPermission()`

## 用户中心 Tab

- `我的简历`：原简历列表
- `用量明细`：`UsagePanel.vue`

## Admin 额度

- 菜单：`/admin/wallets`，permission `admin:wallet`
- `AdminWalletPanel.vue`：列表 + 调额弹窗（管理员不可填负数）

## Admin AI 模型

- `/admin/models`：维护供应商、模型 Key、`text`/`vision` 模型类型、API 地址、密钥环境变量名与 Token 单价。
- `/admin/task-models`：每个任务选择一个已启用且类型匹配的模型。
- 两页均使用 `admin:ai_model`，当前只有 SUPER_ADMIN 可见；后端负责最终权限和类型校验。
- 模型类型显示使用 `constants/aiTasks.js`，未知类型回退显示原值，便于后续扩展。

## 导出

登录即可导出；`editor/index.vue` 的 `ensureCanExport` 仅保存并 `POST /resume/export`

## 全行业与模板约定

- 所有用户文案、示例和 AI 上下文不得默认互联网、技术岗或校招；首页与模板库应覆盖多个行业。
- 20 套模板注册信息在 `constants/templateRegistry.js`，包含通用、职场、校招、传统行业、行业、创意分类。
- 模板示例数据在 `views/home/utils/demoResume.js`，按模板映射运营、行政、销售、教育、财务、设计、工程和管理等画像；图片使用本地资源。
- 技能只展示用户真实填写的标签，不用数组下标生成“精通/熟练”或百分比。
- `projects.tech_stack` 的界面语义为“专业技能 / 工具”，同时兼容技术栈。

## 移动端强制验收

- 用户端页面以 375px 为最低验收宽度，不得出现页面级横向滚动。
- 表单字段在窄屏单列，按钮/输入等主要触控区域至少 44px。
- Modal 宽度不超过 `calc(100vw - 24px)`，正文使用内部滚动，主操作按钮始终可达。
- A4 简历保持打印尺寸，通过 `usePreviewScale` 缩放展示，不为手机改坏导出布局。
- 编辑器移动端隐藏上一页/页码/下一页控制器，但继续纵向展示多张 A4。
- 编辑器每一页预览与打印页盒都必须是完整 A4，最后一页内容未填满时保留纸张空白，不缩短纸张高度。
- 编辑器“左右边距”只控制 A4 左右内边距，最小值允许为 0；上下安全边距使用页眉/页脚设置。
- 定制模板不得在模板根节点使用会裁切分页内容的 `overflow-hidden`；非标准 DOM 结构必须用 `data-resume-module` / `rt-section` / `rt-item` 标记，供分页和点击定位识别。
- 模板库移动端单列，分类可横向滚动，完整预览受视口高度约束。

## 强制代码规范

见原 skill：`<script setup>`、Tailwind、`defineModel`、中文注释等。

## Skill 维护

每次项目任务先阅读本文件和后端 skill。改动路由、字段、模板、移动端、wallet、管理端菜单或跨端行为后，更新 `reference.md`、后端 skill（如相关）与 `../docs/PRD.md`。
