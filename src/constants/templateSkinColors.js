/**
 * 25 套模板皮肤默认预设（唯一配置源）
 * - 11 项字段对应 EditorSkinPanel 自定义颜色
 * - 用户未覆盖（null）时由 mergeSkinThemeWithTemplate + skinThemeToCssVars 注入
 */
import { clampTemplateId } from '@/constants/templateRegistry'

/** 皮肤 11 项字段 key（与 skin.js SKIN_COLOR_FIELDS 一致） */
export const SKIN_THEME_KEYS = [
  'titleColor',
  'dividerColor',
  'headerBg',
  'headerBorder',
  'itemBg',
  'itemBorder',
  'basicRowBg',
  'basicRowBorder',
  'skillBg',
  'skillBorder',
  'topBandBg',
]

/** G1 标准蓝系基准（全职业 / 校招 / 时间轴 / 技能进度） */
const BLUE_SKIN = {
  titleColor: '#1677ff',
  dividerColor: '#e5e7eb',
  headerBg: 'transparent',
  headerBorder: '#1f2937',
  itemBg: '#ffffff',
  itemBorder: '#edf0f5',
  basicRowBg: '#f8fafc',
  basicRowBorder: '#e5e7eb',
  skillBg: '#eef4ff',
  skillBorder: '#cfe0ff',
  topBandBg: '#1677ff',
}

/** G3 商务灰黑基准（表格 / 黑白 / 行政 / 金融 / Executive） */
const GRAY_SKIN = {
  titleColor: '#111827',
  dividerColor: '#d1d5db',
  headerBg: 'transparent',
  headerBorder: '#111827',
  itemBg: '#ffffff',
  itemBorder: '#e5e7eb',
  basicRowBg: '#f3f4f6',
  basicRowBorder: '#d1d5db',
  skillBg: '#f3f4f6',
  skillBorder: '#9ca3af',
  topBandBg: '#374151',
}

/** 25 套模板皮肤独立默认色（含中文注释说明视觉意图） */
export const TEMPLATE_SKIN_PRESETS = {
  // 1. 全职业通用：深靛蓝、朱砂橙与薄荷灰编辑杂志
  1: {
    titleColor: '#263a78',
    dividerColor: '#c9d2e3',
    headerBg: '#eef3f0',
    headerBorder: '#263a78',
    itemBg: '#fffdf8',
    itemBorder: '#d8dde8',
    basicRowBg: '#263a78',
    basicRowBorder: '#53679c',
    skillBg: '#dfeee8',
    skillBorder: '#73a895',
    topBandBg: '#ed6a4c',
  },

  // 2. 简约商务：深海军蓝、铜橙与雾蓝轻时间线
  2: {
    titleColor: '#284b7a',
    dividerColor: '#7186a1',
    headerBg: '#172a46',
    headerBorder: '#314966',
    itemBg: '#fffaf5',
    itemBorder: '#d9e1e8',
    basicRowBg: '#243b5c',
    basicRowBorder: '#46617f',
    skillBg: '#e6f0f5',
    skillBorder: '#83a9bd',
    topBandBg: '#c97954',
  },

  // 3. 新锐校招：深紫、酸橙与珊瑚海报
  3: {
    titleColor: '#30255a',
    dividerColor: '#cfc7e3',
    headerBg: '#282050',
    headerBorder: '#65578a',
    itemBg: '#fffaf4',
    itemBorder: '#e9d9cc',
    basicRowBg: '#3a3064',
    basicRowBorder: '#665a8c',
    skillBg: '#eefacb',
    skillBorder: '#ed725d',
    topBandBg: '#c7f35b',
  },

  // 4. 左右分栏：深色顶栏分栏区
  4: {
    titleColor: '#1677ff',
    dividerColor: '#e5e7eb',
    headerBg: '#1f2937',
    headerBorder: '#374151',
    itemBg: '#ffffff',
    itemBorder: '#edf0f5',
    basicRowBg: '#f8fafc',
    basicRowBorder: '#e5e7eb',
    skillBg: '#eef4ff',
    skillBorder: '#cfe0ff',
    topBandBg: '#1f2937',
  },

  // 5. 品牌色带：深海蓝头部 + 香槟金细节
  5: {
    titleColor: '#173f5f',
    dividerColor: '#7891a5',
    headerBg: '#173f5f',
    headerBorder: '#d1a33b',
    itemBg: '#fafcfd',
    itemBorder: '#d9e3e9',
    basicRowBg: '#274e6d',
    basicRowBorder: '#486b84',
    skillBg: '#edf3f6',
    skillBorder: '#b8ccd7',
    topBandBg: '#d1a33b',
  },

  // 6. 表格信息：严谨灰黑表格风
  6: {
    titleColor: '#334155',
    dividerColor: '#cbd5e1',
    headerBg: '#f8fafc',
    headerBorder: '#64748b',
    itemBg: '#ffffff',
    itemBorder: '#d5dde5',
    basicRowBg: '#eef2f5',
    basicRowBorder: '#cbd5e1',
    skillBg: '#f8edd5',
    skillBorder: '#d7ad5d',
    topBandBg: '#d59b2d',
  },

  // 7. 墨印排版：象牙纸、黑墨与钴蓝印记
  7: {
    titleColor: '#171717',
    dividerColor: '#383838',
    headerBg: '#fffdf7',
    headerBorder: '#171717',
    itemBg: '#fffdf7',
    itemBorder: '#b8b6ae',
    basicRowBg: '#f4f0e7',
    basicRowBorder: '#343434',
    skillBg: '#e8edff',
    skillBorder: '#2f57d9',
    topBandBg: '#2f57d9',
  },

  // 8. 现代扁平：左侧 slate 蓝灰边栏 + 右侧蓝色标题条
  8: {
    titleColor: '#5b6b7c',
    dividerColor: '#e2e8f0',
    headerBg: '#5b6b7c',
    headerBorder: '#5b6b7c',
    itemBg: '#ffffff',
    itemBorder: '#e2e8f0',
    basicRowBg: '#f1f5f9',
    basicRowBorder: '#cbd5e1',
    skillBg: '#eff6ff',
    skillBorder: '#bfdbfe',
    topBandBg: '#5b6b7c',
  },

  // 9. 行政文职：暖灰纸张 + 酒红档案线
  9: {
    titleColor: '#6d2735',
    dividerColor: '#cdb8bc',
    headerBg: '#fbfaf8',
    headerBorder: '#6d2735',
    itemBg: '#ffffff',
    itemBorder: '#ded7d3',
    basicRowBg: '#f4f1ed',
    basicRowBorder: '#d8cec7',
    skillBg: '#eee7e3',
    skillBorder: '#cdb8af',
    topBandBg: '#6d2735',
  },

  // 10. 销售市场：红色强调 + 浅红技能
  10: {
    titleColor: '#7c3aed',
    dividerColor: '#7c3aed',
    headerBg: '#7c3aed',
    headerBorder: '#7c3aed',
    itemBg: '#ffffff',
    itemBorder: '#7c3aed',
    basicRowBg: '#7c3aed',
    basicRowBorder: '#7c3aed',
    skillBg: '#7c3aed',
    skillBorder: '#7c3aed',
    topBandBg: '#7c3aed',
  },

  // 11. 教育培训：现代学院蓝金
  11: {
    titleColor: '#183153',
    dividerColor: '#c8d5e2',
    headerBg: '#183153',
    headerBorder: '#d8a33f',
    itemBg: '#f8fafc',
    itemBorder: '#d8e1ea',
    basicRowBg: '#294663',
    basicRowBorder: '#536f89',
    skillBg: '#edf3f7',
    skillBorder: '#c8d7e3',
    topBandBg: '#d8a33f',
  },

  // 12. 金融会计：顶部蓝色头部 + 时间轴内容区
  12: {
    ...GRAY_SKIN,
    titleColor: '#5b9bd5',
    headerBg: '#5b9bd5',
    headerBorder: '#5b9bd5',
    itemBorder: '#d1d5db',
  },

  // 13. 设计创意：紫罗兰、珊瑚、松石与向日葵黄
  13: {
    titleColor: '#5b3f8c',
    dividerColor: '#d8cfea',
    headerBg: '#fff7f1',
    headerBorder: '#ee6c5d',
    itemBg: '#ffffff',
    itemBorder: '#eadfd7',
    basicRowBg: '#f4ebfa',
    basicRowBorder: '#d7c0e5',
    skillBg: '#dff2ee',
    skillBorder: '#3b9b8f',
    topBandBg: '#f2b84b',
  },

  // 14. 极夜技术：午夜蓝、荧光青与柔紫蓝图
  14: {
    titleColor: '#126f83',
    dividerColor: '#b9d7dc',
    headerBg: '#0b1324',
    headerBorder: '#29405b',
    itemBg: '#f7fbfc',
    itemBorder: '#cddfe3',
    basicRowBg: '#14243a',
    basicRowBorder: '#31516b',
    skillBg: '#eeeafe',
    skillBorder: '#a68de0',
    topBandBg: '#00c9b7',
  },

  // 15. 跨境名片：航空海军蓝、邮戳红与亚麻白
  15: {
    titleColor: '#17324d',
    dividerColor: '#c9d5dc',
    headerBg: '#f7f1e8',
    headerBorder: '#17324d',
    itemBg: '#fffdf9',
    itemBorder: '#d9d2c7',
    basicRowBg: '#edf3f5',
    basicRowBorder: '#8ba7b8',
    skillBg: '#e8f0f1',
    skillBorder: '#5e9094',
    topBandBg: '#d94b50',
  },

  // 16. 时间轴：蓝色竖线时间轴
  16: { ...BLUE_SKIN },

  // 17. 能力矩阵：松石绿信息卡 + 暖铜编号
  17: {
    titleColor: '#245b54',
    dividerColor: '#c5d8d4',
    headerBg: '#f1f6f4',
    headerBorder: '#9bbdb5',
    itemBg: '#fbfdfc',
    itemBorder: '#dbe7e3',
    basicRowBg: '#e6f0ed',
    basicRowBorder: '#c4d9d3',
    skillBg: '#dfeeea',
    skillBorder: '#87b3a9',
    topBandBg: '#c98b5b',
  },

  // 18. 极简线条：墨蓝、杏色与克制钴蓝线条
  18: {
    titleColor: '#1d3557',
    dividerColor: '#cad3df',
    headerBg: 'transparent',
    headerBorder: '#5b7fb5',
    itemBg: 'transparent',
    itemBorder: '#d9dfe7',
    basicRowBg: '#f7f8fa',
    basicRowBorder: '#d6dce4',
    skillBg: '#eaf0fa',
    skillBorder: '#5b7fb5',
    topBandBg: '#e07a5f',
  },

  // 19. 个人品牌：梅子紫、陶土橙与鼠尾草绿杂志封面
  19: {
    titleColor: '#4b3355',
    dividerColor: '#d9ccd9',
    headerBg: '#f7f1f5',
    headerBorder: '#4b3355',
    itemBg: '#fffaf7',
    itemBorder: '#eadcd4',
    basicRowBg: '#f1e9ef',
    basicRowBorder: '#d8c7d5',
    skillBg: '#e5eee8',
    skillBorder: '#83a58e',
    topBandBg: '#c76d4f',
  },

  // 20. Executive：石墨、香槟金与钢蓝管理层次
  20: {
    titleColor: '#2f3b46',
    dividerColor: '#c7d0d7',
    headerBg: '#f8f7f4',
    headerBorder: '#b28a45',
    itemBg: '#ffffff',
    itemBorder: '#dce1e4',
    basicRowBg: '#eef1f3',
    basicRowBorder: '#d2d9de',
    skillBg: '#e7edf1',
    skillBorder: '#7892a6',
    topBandBg: '#b28a45',
  },

  // 21. 野兽派档案：太阳黄、珊瑚红与电光青
  21: {
    titleColor: '#171717',
    dividerColor: '#171717',
    headerBg: '#f4d738',
    headerBorder: '#171717',
    itemBg: '#fffdf2',
    itemBorder: '#171717',
    basicRowBg: '#ffffff',
    basicRowBorder: '#171717',
    skillBg: '#9ef0e9',
    skillBorder: '#171717',
    topBandBg: '#ff5c52',
  },

  // 22. 植物编辑：森林绿、陶粉与燕麦纸
  22: {
    titleColor: '#245544',
    dividerColor: '#b9c9bd',
    headerBg: '#f6efe2',
    headerBorder: '#6f927e',
    itemBg: '#fffdf8',
    itemBorder: '#d9d5c8',
    basicRowBg: '#e9f0e9',
    basicRowBorder: '#9bb4a3',
    skillBg: '#e4eee5',
    skillBorder: '#7b9f87',
    topBandBg: '#e48673',
  },

  // 23. 信息面板：靛青底、青绿状态与紫罗兰标识
  23: {
    titleColor: '#5066a5',
    dividerColor: '#d4dcef',
    headerBg: '#1d2747',
    headerBorder: '#405179',
    itemBg: '#ffffff',
    itemBorder: '#d9e0ee',
    basicRowBg: '#293658',
    basicRowBorder: '#50628d',
    skillBg: '#e9f8f7',
    skillBorder: '#3ad5d0',
    topBandBg: '#7158cc',
  },

  // 24. 构成主义：群青、砖红与芥末黄几何构成
  24: {
    titleColor: '#2846a2',
    dividerColor: '#b9c5e5',
    headerBg: '#2846a2',
    headerBorder: '#1c2f70',
    itemBg: '#fffaf0',
    itemBorder: '#d9cbb3',
    basicRowBg: '#3856ad',
    basicRowBorder: '#7890d0',
    skillBg: '#f8e8c3',
    skillBorder: '#c54535',
    topBandBg: '#e7aa32',
  },

  // 25. 策展画廊：午夜紫、朱红与薄荷绿拼贴
  25: {
    titleColor: '#3e3564',
    dividerColor: '#d8d1e8',
    headerBg: '#24213e',
    headerBorder: '#5b527e',
    itemBg: '#fffdf9',
    itemBorder: '#ddd6ca',
    basicRowBg: '#efeaf8',
    basicRowBorder: '#8c7eb7',
    skillBg: '#ddf1e9',
    skillBorder: '#6ec3a5',
    topBandBg: '#e65057',
  },
}

/** 未自定义皮肤时的空覆盖（preset: template 表示走模板默认） */
export const EMPTY_SKIN_OVERRIDES = {
  preset: 'template',
  titleColor: null,
  dividerColor: null,
  headerBg: null,
  headerBorder: null,
  itemBg: null,
  itemBorder: null,
  basicRowBg: null,
  basicRowBorder: null,
  skillBg: null,
  skillBorder: null,
  topBandBg: null,
}

/** 获取指定模板的皮肤默认色 */
export function getTemplateSkinDefaults(templateId) {
  const id = clampTemplateId(templateId)
  const preset = TEMPLATE_SKIN_PRESETS[id] || TEMPLATE_SKIN_PRESETS[1]
  return { ...preset }
}

/** 切换模板 / 重置皮肤：恢复为 template 预设空覆盖 */
export function applyTemplateSkinDefaults(skinThemeRef, templateId) {
  skinThemeRef.value = { ...EMPTY_SKIN_OVERRIDES }
}

/** 皮肤面板「重置」：恢复当前模板默认 */
export function resetTemplateSkinColors(skinThemeRef, templateId) {
  applyTemplateSkinDefaults(skinThemeRef, templateId)
}

/** 颜色选择器展示：字段为 null 时用模板默认 */
export function resolveSkinFieldDisplay(key, value, templateId) {
  if (value != null) return value
  const defaults = getTemplateSkinDefaults(templateId)
  return defaults[key] || '#1677ff'
}
