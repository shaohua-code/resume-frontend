# 模板渲染、样式、分页与定位契约

## 目录

1. DOM 标记
2. 字体与颜色
3. 间距
4. A4 与分页
5. 点击定位
6. 模板预览
7. 验收矩阵

## 1. DOM 标记

### 模块键

| 内容 | `data-resume-module` | 编辑 Tab |
|---|---|---|
| 姓名、头像、联系方式、扩展基本信息 | `basic` | 基本信息 |
| 个人评价 | `basic` | 基本信息 |
| 教育背景 | `educations` | 教育背景 |
| 技能 | `skills` | 技能特长 |
| 项目 | `projects` | 项目经验 |
| 正式工作 | `work_experience` | 工作经历 |
| 实习 | `internships` | 实习经历 |
| 奖项与证书 | `awards` | 荣誉证书 |

不要嵌套两个带 `data-resume-module` 的容器。分页收集器会跳过被另一模块包裹的模块，点击定位也会命中最近的祖先标记。

### 推荐骨架

```vue
<div class="resume-template rt-custom-NN w-full bg-white">
  <header data-resume-module="basic">...</header>
  <main>
    <section
      v-if="showModule('educations') && f.educations.length"
      data-resume-module="educations"
      class="rt-section"
    >
      <h2 class="rt-title"><span>教育背景</span></h2>
      <article v-for="edu in f.educations" class="rt-item">...</article>
    </section>
  </main>
</div>
```

### 分页语义类

| 类 | 用途 | 分页影响 |
|---|---|---|
| `rt-section` | 模块外层 | 模块允许跨页 |
| `rt-title` | 模块标题 | 分页尽量避免标题孤立在页底 |
| `rt-item` | 一条教育/项目/经历 | 作为原子块候选；描述行仍可参与安全断点 |
| `rt-desc` | 条目长描述 | 逐行收集断点 |
| `rt-text` | 普通长文本 | 可逐行分页 |
| `rt-preserve-text` | 用户输入的描述/列表 | `pre-wrap`、强制长串换行 |
| `rt-list` | 荣誉/证书列表 | 列表和列表项参与断点 |
| `rt-skills` / `rt-skill` | 技能容器/标签 | 接收皮肤与字体设置 |
| `rt-label` | 基本信息标签 | 接收标签字体色 |
| `rt-value` | 基本信息值 | 接收基本信息内容色 |
| `rt-name` | 顶栏大姓名 | 接收姓名颜色和统一字号比例 |

分页选择器把任何类名中含 `-item` 的元素视作 item，把含 `-text` 或 `-desc` 的元素视作段落。不要把这些片段用于无关装饰节点。

## 2. 字体与颜色

### 字体变量

| 变量 | 用户设置 | 模板要求 |
|---|---|---|
| `--font-family` | 8 个字体选项 | 根节点继承，不硬编码覆盖 |
| `--font-size` | 10、11、12、13、14、15、16、18、20px | 正文用 `1em` 附近的相对字号 |
| `--line-height` | 1.3–2.2 | 正文、标题继承或使用该变量 |
| `--font-label-color` | 基本信息标签色 | `rt-label` |
| `--font-basic-content-color` | 基本信息值色 | `rt-value` |
| `--font-name-color` | 姓名色 | `rt-name` |
| `--font-content-color` | 正文色 | 段落、列表、条目、技能 |

不要使用 Tailwind 的固定 `text-slate-*` 作为最终文字颜色；公共基础 CSS 只会覆盖已识别的 `rt-*` 类。自定义 DOM 的文字节点必须加语义类或显式使用变量。

### 皮肤变量

```text
--skin-title-color
--skin-divider-color
--skin-header-bg
--skin-header-border
--skin-item-bg
--skin-item-border
--skin-basic-row-bg
--skin-basic-row-border
--skin-skill-bg
--skin-skill-border
--skin-top-band-bg
```

在 `templateSkinColors.js` 为新 ID 提供全部 11 项。模板样式直接消费变量，不重复写另一套固定颜色。

在 `templateFontColors.js` 提供 `label`、`basicValue`、`name`、`content` 四项。切换模板时用户覆盖会被清空，运行时自动使用新模板预设。

## 3. 间距

| 设置 | 范围 | 实际作用 |
|---|---|---|
| `sectionGap` | 5–50px | 基础 CSS 覆盖 `section` 和类名含 `-section`/`-header` 的 margin-bottom |
| `lineHeight` | 1.3–2.2 | `--line-height` |
| `padding` | 0–50px | A4 外层 `.resume-preview` 的左右 padding |
| `pageTopGap` | 0–80px | 每页 viewport 顶部安全留白，并减少可用分页高度 |
| `pageBottomGap` | 0–80px | 减少每页可用分页高度 |

模板要求：

- 根节点宽度跟随父级；不要再加全局 A4 左右 padding。
- 允许模块内部小间距，但模块之间使用 `var(--section-gap)` 或交给基础 CSS。
- 类名含 `-header` 会被公共基础 CSS 设置模块间距。内部元信息行若不希望受影响，使用不含 `-header` 的类名，例如 `rt-item-meta`。
- 不用根节点 padding 模拟页眉/页脚；安全边距由外部分页窗口控制。

## 4. A4 与分页

### 固定尺寸

- A4 预览宽度：794px / 210mm。
- A4 预览高度：约 1123px / 297mm。
- 有效内容高度：`1123 - pageTopGap - pageBottomGap`，最低 24px。
- 移动端只对 A4 做等比缩放，不改变模板布局。
- 每页外层始终保持完整 A4；最后一页内容不足时保留白纸空白。

### 算法识别内容

分页器收集：

1. `header`。
2. 顶层 `[data-resume-module]`。
3. 模块内标题：`[class*="-title"]`、`h2`、`h3`。
4. item：`[class*="-item"]`。
5. 段落：`p`、`[class*="-text"]`、`[class*="-desc"]`。
6. `ul.rt-list` 及其 `li`。
7. 模块直属 `.grid`。

长描述通过浏览器 Range 获取每一行矩形，在行底寻找断点。DOM 标记不正确时，分页只能按大块或目标高度硬切。

### 禁止的布局

- 模板根节点、main 或包住多个模块的容器使用 `overflow: hidden/clip/auto`。
- 正文使用 `position: fixed`、大面积 absolute、整体 transform 或 translate。
- CSS columns、多列流式排版、瀑布流或高度依赖 JavaScript 的正文。
- 对整个模板设置固定高度、`max-height` 或负 margin 来模拟分页。
- 把多个经历拼成一个不可拆分的大 `rt-item`。
- 只用背景图承载正文、标题或字段值。

局部头像圆形裁切可使用 overflow hidden；它不能包含任何正文。

## 5. 点击定位

点击可见预览时，`ResumePreview.handleSectionClick()` 从点击节点向上寻找最近的 `data-resume-module`，随后发出 `section-click`。编辑器：

1. 设置 `highlightModule`。
2. 设置 `activeModule`。
3. 调用底部编辑面板 `scrollToModule(moduleKey)`。
4. 激活对应 Tab、滚动编辑内容并短暂高亮。

规则：

- 每个用户可点击的模块都必须位于正确标记内。
- 工作与实习必须分别标记，不能依赖标题文字兜底。
- 自我评价标记为 `basic`。
- 装饰层使用 `pointer-events: none`，避免遮挡模块点击。
- 不增加新的模块键；编辑器不会识别。

标题文字推断只是兜底，且不能可靠区分所有模块。新模板必须依赖明确标记。

## 6. 模板预览

公开模板库与编辑器使用同一 `ResumeTemplate` 组件，因此不能为缩略图写另一套模板 DOM。

- 缩略卡片会真实渲染模板并缩放。
- 完整弹窗会按内容高度展开。
- 编辑器测量层、每个可见页面和打印页都会重复渲染/克隆同一模板。
- 模板渲染必须无副作用、无随机值、无异步业务请求。
- 头像加载可能改变高度；使用固定宽高避免分页抖动。

## 7. 验收矩阵

### 内容

- 最少字段、完整字段、超长姓名/邮箱/英文串。
- 0/1/多条教育、项目、工作、实习。
- 多行描述、长段落、长技能标签、大量荣誉。
- 有头像与无头像。

### 设置

- 字号最小与最大。
- 行距 1.3 与 2.2。
- 模块间距 5 与 50。
- 左右边距 0 与 50。
- 页眉/页脚安全边距 0 与 80。
- 四类字体颜色逐项修改。
- 模板默认皮肤与至少一个推荐皮肤。

### 页面

- 模板库桌面卡片和 375px 单列卡片。
- 完整预览弹窗。
- 编辑器一页、两页、三页以上。
- 每个模块点击定位。
- 打印预览/PDF，确认分页、背景、图片和字体。
