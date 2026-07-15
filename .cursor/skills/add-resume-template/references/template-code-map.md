# 模板代码地图与接入链路

## 目录

1. 允许修改的接入点
2. 只读公共链路
3. 模板选择与持久化
4. 预览与导出链路
5. 现有实现类型

## 1. 允许修改的接入点

所有路径相对 `resume-frontend/`。

| 文件 | 作用 | 新模板动作 |
|---|---|---|
| `src/components/resume-templates/TplNNName.vue` | 模板 DOM 与局部样式 | 新建；主要实现位置 |
| `src/constants/templateRegistry.js` | 模板唯一注册表 | import、最大 ID、元数据、组件映射 |
| `src/constants/templateFontColors.js` | 四类字体色默认值 | 增加同 ID 预设 |
| `src/constants/templateSkinColors.js` | 11 类皮肤默认值 | 增加同 ID 预设 |

`templateNames.js` 从 `TEMPLATE_LIST` 派生，不需要手工维护。

默认不要改 `demoResume.js`。`getDemoResume(id)` 对未单独映射的模板自动使用 `GENERAL_DEMO`，因此新模板仍有完整预览数据。

## 2. 只读公共链路

| 文件 | 作用 | 新模板必须适配的事实 |
|---|---|---|
| `src/components/ResumeTemplate.vue` | 根据 `templateId` 从 `TEMPLATE_MAP` 动态渲染 | 注册正确即可，无需增加分支 |
| `src/components/resume-templates/shared/useResumeFields.js` | 模板字段归一化 | 模板通过它取展示字段 |
| `src/components/resume-templates/shared/resumeTemplateBase.css` | 字体、颜色、皮肤和常用语义类 | 使用 CSS 变量与 `rt-*` 类接入 |
| `src/views/home/components/TemplateMiniPreview.vue` | 模板库真实缩略图与完整预览 | 自动读取注册表和模板默认色 |
| `src/views/templates/index.vue` | 分类、卡片、弹窗、使用模板 | `TEMPLATE_LIST` 自动驱动 |
| `src/views/editor/index.vue` | 模板抽屉、设置、保存、自动保存 | `TEMPLATE_LIST` 自动驱动；保存 `template_id` |
| `src/views/editor/components/ResumePreview.vue` | A4 测量、分页、点击定位、打印页克隆 | 模板 DOM 必须满足其选择器契约 |
| `src/constants/editorSettings.js` | 设置默认值、范围、持久化 | 模板不得新增私有编辑设置 |
| `src/composables/useResumeExportPrint.js` | 克隆逐页 DOM 到 iframe 打印 | 屏幕预览 DOM 即打印 DOM |

## 3. 模板选择与持久化

### 模板库进入生成

`views/templates/index.vue`：

1. 点击卡片只设置 `previewId` 并打开完整预览。
2. 点击“使用此模板生成”把 ID 写入 `resumeStore.currentTemplateId`。
3. 跳转 `/generate?template_id=<id>`。

`views/generate/index.vue` 在挂载时读取 `route.query.template_id`，经过 `clampTemplateId()` 后写回 store。

### 生成与编辑

`stores/resume.js` 创建简历时把 `currentTemplateId` 写入请求的 `template_id`。进入编辑器后：

- 新生成简历继续使用 store 中的模板 ID。
- 已保存简历通过详情接口读取 `template_id` 并写回 store。
- 编辑器抽屉由 `TEMPLATE_LIST` 渲染，选择后更新 `templateId` 并重置为该模板的字体/皮肤默认值。
- 自动保存与手动保存都提交 `template_id`。

后端 `resume.template_id` 是普通整数，默认 1；仓库层直接持久化，不维护模板最大值。因此新增模板不需要修改后端。

## 4. 预览与导出链路

`TemplateMiniPreview` 负责公开页面：

- 固定内容宽 794px。
- `page` 模式固定高 1123px并裁切为单页展示。
- `full` 模式测量 `scrollHeight`，至少一页高。
- 注入模板默认字体色和皮肤色。

`ResumePreview` 负责编辑器：

1. 在离屏测量层渲染完整模板。
2. 读取真实内容底部，按 A4 每页可用高度生成固定间隔断点；标题、模块与条目不触发提前换页。
3. 每页再次渲染完整模板，以负 `marginTop` 在固定 A4 窗口中切片。
4. 打印时只克隆屏幕上的逐页窗口；分页尚未稳定或页面数量不一致时停止导出，不从测量层另建打印页。

PDF 导出等待分页测量和浏览器绘制稳定后，只克隆同一批屏幕分页窗口；不使用另一套测量层重新生成打印页。因而屏幕与 PDF 的断点、负偏移、页边距和裁切高度完全同源。

因此模板必须是确定性的正常文档流。不要基于“当前是第几页”渲染不同 DOM，也不要让正文高度依赖父级裁切窗口。

## 5. 现有实现类型

- 共享标准 DOM + 模板私有布局：3、5、7、9、14、15、16、17、21、22、23、24、25。
- 独立定制 DOM：1、2、4、6、8、10、11、12、13、18、19、20。

每个新模板必须有独立 `TplNNName.vue` 文件。仅需改变视觉结构时，可复用 `ResumeStandardContent` 并用模板根类与 scoped CSS 建立完全不同的版式；需要改变模块内部 DOM 时，再使用 `useResumeFields` 编写独立 DOM。不要为了一个新模板修改现有模板或共享标准 DOM。
