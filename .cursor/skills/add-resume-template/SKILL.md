---
name: add-resume-template
description: >-
  为 AI 简历新增或调整 Vue 简历模板，并验证模板注册、字段展示、编辑器样式配置、分页与打印兼容。
  用户要求新增模板、复制模板形成新样式、调整模板 DOM/排版，或要求全部模板统一支持字体、配色与版式设置时使用。
---

# 新增简历模板

在 `resume-frontend` 中实现模板。单套模板任务优先通过模板 DOM 与样式适配现有契约；当用户明确要求全部模板共享样式配置时，按下文“全模板外观改造”扩大范围并修复不兼容模板。

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

用户明确要求所有模板支持统一配置、预览与保存时，即视为扩大范围授权：允许同步修改样式面板、`editorSettings.js`、编辑器预览适配器、共享模板样式及不兼容模板。发现不兼容时先调整模板 DOM/CSS 或参数透传，再按全部模板验收；不得仅报告限制或留下未适配模板。

普通新增模板仍不需要改动以上公共链路；仅在该任务明确要求的能力无法通过单模板适配时扩大到对应的最小公共范围。

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

- 所有新增或改写的脚本、模板 DOM 和样式都必须添加邻近中文注释，说明展示职责、分页约束或视觉意图；同一声明性代码块可由一条块级注释覆盖。
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

全模板外观改造：

1. 以 `templateRegistry.js` 中 ID 1–60 为逐套清单，确认所有模板组件接收完整 `visibleModules` 对象并使用同一 `ResumeTemplate` 渲染入口。
2. 检查四类文字色、11 类皮肤色、字体族、字号、行距、模块间距、额外左右留白和页首/页尾安全距；不能因为模板自定义类或 `!important` 覆盖而失效。
3. 确认模板候选、完整预览、编辑器 A4、历史预览和 PDF 使用相同的当前草稿/已应用设置。简约模板的透明默认外观应继续保持，同时允许显式用户覆盖生效。
4. 不兼容项通过调整具体模板和最小的公共适配器解决；禁止把设置项只对部分模板隐藏或改成模板私有配置。
5. 样式保存沿用 `_editorSettings` 并兼容没有新字段的旧简历；需要按模板记忆的配色使用模板 ID 键控，切回同一模板时恢复其配色。

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

全模板外观任务另外验收：

1. 静态逐一核对 ID 1–60 的组件加载、预览变量、模块透传和字体覆写点；抽查代表性的独立 DOM、标准 DOM、透明留白、深色页眉及自定义时间轴模板。
2. 配色从模板 A 切到 B 再回 A，检查独立颜色档案；取消不写入已应用设置，应用后自动保存，撤销恢复应用前完整外观。
3. 验证旧 `_editorSettings` 与只有旧式顶层文字色/皮肤字段的简历可读取并保存；新字段写在 `resume_json`，不增加数据库列。
4. 用构建和模板契约检查确认预览、历史和 PDF 链路均接受新设置格式；无法进行浏览器实测时清楚记录未验证的视图。

## 交付要求

说明模板 ID、名称、实现文件、注册文件和验证结果。若发现公共逻辑缺陷，不顺手修复；单独列为观察项。

## 维护记录（必须）

完成任何模板代码改动后，更新本 Skill 或相关 reference 中发生变化的事实，并在根目录 `.cursor/skills/maintain-ai-resume/references/change-log.md` 追加任务记录。即使渲染契约未变，也要记录模板 ID、改动文件、契约影响和验证结果。

本 Skill 是项目唯一保持独立的专用 Skill；通用前端和后端知识统一维护在根目录 `$maintain-ai-resume` 中。

当根 Skill 以 `--更新` 调度时，完整读取本文件以及 `references/` 下全部直接引用，校对模板注册、字段、分页、定位和打印契约，并与统一维护 Skill 一起完成同步。
