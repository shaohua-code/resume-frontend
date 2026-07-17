# 前端代码提交规范

本目录是独立 Git 仓库。前后端联动修改必须分别在 `resume-frontend` 与 `resume-backend-node` 创建提交，不在上级工作区执行 Git。

## 提交前检查

1. 查看已暂存、未暂存和未跟踪文件，定向审查实际差异，不覆盖其他人的改动。
2. 确认新增或改写代码有说明用途、约束或原因的邻近中文注释。
3. 源码、配置或依赖变化运行 `npm run build`；只有 Markdown 文档变化时可跳过构建。
4. 接口、权限、AI 标签、模板注册、字段或跨层契约变化时，运行项目根 Skill 的契约检查。
5. 涉及模板 DOM、分页或打印时，按独立 `add-resume-template` Skill 完成验证。
6. 运行 `git diff --check` 与 `git diff --cached --check`，修复空白错误后再提交。

## 提交信息

使用 `type(scope): 中文祈使短句`：

| 类型 | 用途 |
|---|---|
| `feat` | 新增用户能力 |
| `fix` | 修复缺陷 |
| `perf` | 性能优化 |
| `refactor` | 不改变行为的重构 |
| `docs` | 仅文档 |
| `style` | 仅格式或样式整理 |
| `test` | 测试代码 |
| `build` / `ci` | 构建、依赖或流水线 |
| `chore` | 其他维护工作 |

`scope` 使用具体模块，例如 `home`、`editor`、`auth`、`resume`、`admin`、`template`、`skill`。主题必须说明结果，不得使用“更新代码”“修改内容”或无意义编号。

示例：

```text
feat(editor): 增加简历模块快速定位
perf(home): 延迟加载首屏以下模板预览
docs(skill): 补充前端提交验证规则
```

破坏性变化使用 `type(scope)!:`，并在正文中增加 `BREAKING CHANGE:` 说明。

## 暂存与安全

- 按单一目的拆分原子提交，使用 `git add -A -- <明确文件列表>`；禁止无范围的 `git add .`。
- 不提交 `.env*`、密钥、凭据、上传文件、日志、`node_modules`、`dist` 或其他可重建产物。
- 不使用 `--no-verify` 绕过提交钩子，不自动 amend、rebase 或 push。
- 输入 `--提交` 时，由 `commit-ai-resume` Skill 审查当前改动、执行验证并创建本地提交。
