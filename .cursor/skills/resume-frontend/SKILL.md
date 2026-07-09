---
name: resume-frontend
description: >-
  AI简历助手 Vue3 前端项目指南（Vite + Tailwind + Ant Design Vue + Pinia）。
  在 resume-frontend 目录编写/修改页面、组件、路由、钱包/用量、API、模板或编辑器时使用。
  每次改动路由、字段、计费相关 UI 或跨端契约后须同步更新本 skill 与 reference.md。
---

# resume-frontend

AI 简历助手校园版前端。**计费模式：顶栏/用户中心展示余额，AI 扣费后自动刷新；已移除 VIP 会员 UI。**

## 何时读取

- 修改 `views/`、`stores/`、`api/`、`router/`
- 用户中心、管理端额度、余额展示
- 对接 wallet API

详细见 [reference.md](reference.md)。

## 项目结构（节选）

```
api/           auth | resume | wallet | admin | upload | feedback
stores/        user.js | wallet.js | resume.js
views/user/    index.vue + components/UsagePanel.vue
views/admin/   AdminWalletPanel.vue（用户额度）
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

## 导出

登录即可导出；`editor/index.vue` 的 `ensureCanExport` 仅保存并 `POST /resume/export`

## 强制代码规范

见原 skill：`<script setup>`、Tailwind、`defineModel`、中文注释等。

## Skill 维护

改动路由/wallet/管理端菜单后更新 `reference.md` 与后端 skill。
