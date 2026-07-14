---
name: add-resume-template
description: >-
  为 AI 简历助手新增或调整 Vue 简历模板，并在不修改公共业务逻辑的前提下接入模板注册、
  字段展示、模板库与编辑器预览。用户要求新增简历模板、复制现有模板形成新样式、调整模板
  DOM/排版、检查字体与间距兼容、分页截断、PDF 预览或点击预览定位编辑模块时使用。
---

# 新增简历模板

在 `resume-frontend` 中实现模板。把现有字段、编辑器设置、分页和点击定位当作只读契约；通过模板 DOM 与样式适配这些契约。

## 不可突破的修改边界

只允许修改以下内容：

1. 新建或调整 `src/components/resume-templates/Tpl*.vue` 的展示型脚本、DOM 和样式。
2. 在 `src/constants/templateRegistry.js` 增加最小注册信息：import、`MAX_TEMPLATE_ID`、`TEMPLATE_LIST`、`TEMPLATE_MAP`。
3. 在 `src/constants/templateFontColors.js` 和 `templateSkinColors.js` 增加该模板的默认视觉预设。

除非用户明确扩大范围，否则禁止修改：

- 简历字段 Schema、表单、AI Prompt、后端接口或数据库。
- `ResumeTemplate.vue`、编辑器、模板库、Pinia store、保存/生成/导出流程。
- `ResumePreview.vue` 的 A4 尺寸、分页算法、选择器、打印克隆和点击定位逻辑。
- 字体、间距、皮肤面板及其范围或持久化结构。
- 公共模板 CSS；优先把新增样式放进新模板的 scoped style，避免影响已有模板。
- `demoResume.js`、首页精选列表或业务文案；新模板默认复用通用演示数据。只有用户明确要求运营配置时才改。

如果现有公共逻辑不能承载设计，调整模板 DOM/样式；不要修改公共逻辑。若确实无法实现，停止并说明冲突点。

## 开始前读取

按任务读取以下参考：

- 所有新增模板任务：读取 [references/template-code-map.md](references/template-code-map.md)。
- 编写模板 DOM 前：读取 [references/template-fields.md](references/template-fields.md)。
- 处理字体、间距、分页、打印或点击定位：读取 [references/template-render-contract.md](references/template-render-contract.md)。

同时检查当前代码，参考文件只记录基线；代码与文档冲突时以当前代码为准并更新本 Skill。

## 工作流

### 1. 确定模板 ID 与实现方式

1. 从 `TEMPLATE_LIST` 和 `TEMPLATE_MAP` 找到当前最大 ID，使用下一个连续整数。
2. 生成符合 `TplNNPascalCase.vue` 的文件名；`NN` 使用两位数字。
3. 默认新建独立模板组件，复用 `useResumeFields()`、字段格式化函数和 `resumeTemplateBase.css`。
4. 仅当视觉差异只是装饰时，才使用 `TplVariant`；不要为新模板修改共享标准 DOM。

### 2. 写最小展示型脚本

模板只执行展示映射：

- 声明 `resume` 与 `visibleModules` props。
- 通过 `useResumeFields(props.resume)` 读取归一化字段。
- 根据 `visibleModules` 计算显隐；不得改写简历数据。
- 允许计算展示字符串、日期范围和模块清单；不得引入保存、路由、分页或编辑器状态。

### 3. 写符合契约的 DOM

1. 根节点包含 `resume-template`，保持正常文档流和 `w-full`。
2. 基本信息使用 `header[data-resume-module="basic"]`。
3. 每个可编辑模块使用独立、非嵌套的 `section[data-resume-module="..."]`。
4. 使用 `rt-section`、`rt-title`、`rt-item`、`rt-desc`、`rt-preserve-text` 等语义类，让分页和字体规则识别内容。
5. 缺失数据不渲染空模块；模块开关为 false 时不渲染对应模块。
6. 个人评价归入 `basic`；工作经历必须使用 `work_experience`，实习使用 `internships`。

分页语义补充：

- 编辑器按每页可用高度直接裁切，标题、模块和 `rt-item` 都允许跨页；模板不要自行添加强制换页或 keep-together 规则。
- `rt-item`、`rt-text`、`rt-desc` 仍用于内容识别、点击定位、打印检查和尾部幽灵页过滤，但不会触发提前换页。
- 不要用固定高度、负 margin 或空占位尝试控制某一页的断点；需要改变落点时由用户调整字号、行距、模块间距和页边距。

完整键和值见 [references/template-render-contract.md](references/template-render-contract.md)。

### 4. 写变量驱动的样式

1. 继承 `--font-family`、`--font-size`、`--line-height`，不要硬编码覆盖用户设置。
2. 文本颜色使用四个字体变量；背景和边框使用皮肤变量。
3. 模块间距交给 `--section-gap`；A4 左右边距交给外层 `--preview-padding`。
4. 不在模板根节点或主体内容容器设置裁切型 `overflow`。
5. 头像等局部媒体框可使用 `overflow: hidden`，但不得包住分页正文。
6. 避免 fixed、sticky、负高度、整体 transform、CSS 多栏和不参与文档流的正文布局。

### 5. 完成最小注册

在 `templateRegistry.js`：

1. import 新组件。
2. 更新 `MAX_TEMPLATE_ID`。
3. 向 `TEMPLATE_LIST` 添加 `{ id, name, category, desc, color }`。
4. 向 `TEMPLATE_MAP` 添加 `id: Component`。

在两个颜色预设文件中添加同一 ID。不要修改派生的 `templateNames.js`，也不要改模板库或编辑器抽屉；它们会读取注册表自动出现。

### 6. 验收

至少完成以下检查：

1. 运行 `npm run build`。
2. 模板库卡片、完整弹窗预览、生成页带入模板、编辑器抽屉切换均能显示新模板。
3. 所有字段有数据、无数据、单条和多条时布局正常。
4. 字体族、字号、四类字体颜色、模块间距、行距、左右边距、页眉和页脚安全边距均生效。
5. 制造两页以上内容，确认非末页按固定有效页高直接裁切、无幽灵页或根容器裁切，最后一页保持完整 A4 留白。
   特别覆盖“一条超长经历，描述前还有岗位/日期等短文本”的场景，确认非末页按完整可用高度直接裁切，不因条目完整性留下大面积空白。
6. 点击基本信息、教育、技能、项目、工作、实习、荣誉和个人评价，能定位到正确编辑 Tab。
7. PDF 打印预览与屏幕分页逐页一致（同一断点、偏移和裁切高度），头像和背景色可见。
8. 检查 git diff，确认没有修改边界之外的文件。

## 交付要求

说明模板 ID、名称、实现文件、注册文件和验证结果。若发现公共逻辑缺陷，不顺手修复；单独列为观察项。
