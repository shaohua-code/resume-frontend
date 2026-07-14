# 简历字段契约

## 目录

1. 存储外层
2. 基本信息
3. 数组模块
4. 兼容字段
5. 编辑器设置
6. 展示规则

## 1. 存储外层

后端 `resume` 记录：

| 字段 | 含义 |
|---|---|
| `id` | 简历 ID |
| `title` | 列表标题 |
| `resume_json` | 完整简历内容与 `_editorSettings`，数据库中为文本 |
| `template_id` | 当前模板整数 ID |
| `score` | AI 评分 |

模板组件只读取解析后的 `resume_json` 对象，不读取存储外层。

## 2. 基本信息

### 编辑器直接维护

| 字段 | 类型 | 展示语义 |
|---|---|---|
| `avatar` | string | 上传头像 URL，由 `resolveUploadUrl` 处理 |
| `name` | string | 姓名，必填；空值展示兜底“姓名” |
| `target_position` | string | 意向岗位，必填 |
| `phone` | string | 电话 |
| `email` | string | 邮箱 |
| `summary` | string | 个人评价；点击定位到 `basic` |
| `work_years` | string | 工作年限 |
| `marital_status` | string | 婚姻状况 |
| `height` | string | 身高 |
| `weight` | string | 体重 |
| `ethnicity` | string | 民族 |
| `native_place` | string | 籍贯 |
| `political_status` | string | 政治面貌 |
| `expected_salary` | string | 期望薪资 |
| `custom_fields` | `{label,value}[]` | 自定义基本信息；标签和值同时存在才展示 |

`buildBasicInfoDisplayItems()` 默认生成电话、邮箱、工作年限、婚姻状况、身高、体重、民族、籍贯、政治面貌、期望薪资，再追加自定义字段。不要在模板中复制另一套筛选规则。

### 字段工具可读取但当前表单不一定直接维护

| 字段 | `useResumeFields` 名称 | 用途 |
|---|---|---|
| `gender` | `gender` | 性别 |
| `age` | `age` | 年龄 |
| `city` | `city` | 城市 |
| `origin` | `origin` | 旧籍贯/城市兼容 |
| `target_city` / `targetCity` | `targetCity` | 意向城市 |
| `entry_time` / `entryTime` | `entryTime` | 到岗时间 |
| `qr_code` / `qrCode` | `qrCode` | 二维码 |

不要为了展示这些可选字段修改字段 Schema 或表单。只有数据存在时才显示。

## 3. 数组模块

### `educations[]`

```text
{ school, major, main_course, degree, start_date, end_date }
```

- 模块键：`educations`。
- 时间格式：`YYYY.MM`，允许单侧为空。
- 使用 `formatEducationDateRange()` 与 `formatEducationDetail()`。

### `projects[]`

```text
{ name, role, description, tech_stack, start_date, end_date }
```

- 模块键：`projects`。
- `tech_stack` 的界面语义是“专业技能 / 工具”，不限技术岗。
- 描述使用 `rt-desc rt-preserve-text`。

### `internships[]`

```text
{ company, position, description, start_date, end_date }
```

- 模块键：`internships`。
- 与正式工作经历分开。

### `work_experiences[]`

```text
{ company, position, department, description, start_date, end_date }
```

- 模块键：`work_experience`，注意字段为复数、模块键为单数。

### 简单数组

| 字段 | 类型 | 模块键 | 规则 |
|---|---|---|---|
| `skills` | `string[]` | `skills` | 只展示真实标签；不得按下标伪造熟练度或百分比 |
| `awards` | `string[]` | `awards` | 与证书合并显示 |
| `certificates` | `string[]` | `awards` | `useResumeFields.honorList` 已合并两者 |

## 4. 兼容字段

教育首条会与以下扁平字段双向兼容：

- `school`
- `major`
- `main_course` / `mainCourse`
- `education`（对应 `degree`）

基本信息还有 camelCase/旧字段兼容，例如 `workYears`、`maritalStatus`、`nativePlace`、`politicalStatus`、`expectedSalary`。模板只使用 `useResumeFields()` 返回值，不自行增加兼容分支。

## 5. 编辑器设置

`resume._editorSettings` 由公共逻辑读写，模板不得修改其结构：

```text
spacing: {
  sectionGap,
  lineHeight,
  padding,
  pageTopGap,
  pageBottomGap
}
fontSize
fontFamily
labelColor
basicContentColor
nameColor
contentColor
skinTheme: { preset, ...非空颜色覆盖 }
modules: [{ key, title, visible }]
```

模块列表固定为：`basic`、`educations`、`skills`、`projects`、`work_experience`、`internships`、`awards`。模板不能新增只有自己认识的编辑模块。

## 6. 展示规则

1. 缺失字段不显示占位块、空边框或空标题。
2. `name` 可使用字段工具的“姓名”兜底；其他字段不要虚构内容。
3. 多行描述保留换行和连续空格，并允许长英文/数字串换行。
4. 头像有值才渲染；图片必须有固定尺寸与 `object-fit: cover`。
5. 日期只拼接已有值，不显示孤立的分隔符。
6. 奖项和证书使用 `honorList`，避免重复合并。
7. 不根据行业、模板 ID 或数组位置改写用户数据含义。
