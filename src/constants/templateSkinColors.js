/**
 * 50 套模板皮肤默认预设（唯一配置源）
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

/** 50 套模板皮肤独立默认色（含中文注释说明视觉意图） */
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

  // 26. 晨光校刊：学院蓝、晨光橙与温暖纸张色，突出校园档案感。
  26: {
    titleColor: '#173f5f',
    dividerColor: '#b8c7cf',
    headerBg: '#fff8ec',
    headerBorder: '#7894a3',
    itemBg: '#fffdf8',
    itemBorder: '#d7c9b4',
    basicRowBg: '#f1eadc',
    basicRowBorder: '#cbbda7',
    skillBg: '#e7f0ed',
    skillBorder: '#7fa89e',
    topBandBg: '#e68a4f',
  },

  // 27. 起跑计划：深海蓝、活力青绿与浅青卡片，强化校招成长路径。
  27: {
    titleColor: '#126e82',
    dividerColor: '#c4dadd',
    headerBg: '#164e63',
    headerBorder: '#4e8c98',
    itemBg: '#ffffff',
    itemBorder: '#cfe1e2',
    basicRowBg: '#eef8f6',
    basicRowBorder: '#a9d0ca',
    skillBg: '#dcf3ef',
    skillBorder: '#56b8aa',
    topBandBg: '#35b7a6',
  },

  // 28. 瑞士网格：象牙白、石墨黑与信号红，强调精确栏线。
  28: {
    titleColor: '#171717',
    dividerColor: '#cfd3d4',
    headerBg: '#f4f5f2',
    headerBorder: '#1c1c1c',
    itemBg: '#ffffff',
    itemBorder: '#c9ced1',
    basicRowBg: '#ffffff',
    basicRowBorder: '#b7bdc0',
    skillBg: '#f2f3f1',
    skillBorder: '#737b80',
    topBandBg: '#e63946',
  },

  // 29. 黑金社论：墨黑刊头、旧纸底与香槟金栏目标记。
  29: {
    titleColor: '#171717',
    dividerColor: '#b9ad96',
    headerBg: '#f6f0e4',
    headerBorder: '#24211d',
    itemBg: '#fffdf8',
    itemBorder: '#cfc4b2',
    basicRowBg: '#faf7f0',
    basicRowBorder: '#9f947f',
    skillBg: '#efe7d8',
    skillBorder: '#9c7a3c',
    topBandBg: '#171717',
  },

  // 30. 海岸波纹：深海蓝、浅礁青与雾白信息岛。
  30: {
    titleColor: '#075f70',
    dividerColor: '#b5d8dd',
    headerBg: '#e7f5f7',
    headerBorder: '#4d8d99',
    itemBg: '#fbfeff',
    itemBorder: '#c8e0e4',
    basicRowBg: '#eff9fa',
    basicRowBorder: '#9bc7cd',
    skillBg: '#dff5f2',
    skillBorder: '#54b7ad',
    topBandBg: '#0ea5a8',
  },

  // 31. 樱色手账：柔粉页签、莓果线条与温暖便签纸。
  31: {
    titleColor: '#9b4f63',
    dividerColor: '#e2c2cb',
    headerBg: '#fff6f7',
    headerBorder: '#c98999',
    itemBg: '#fffdfb',
    itemBorder: '#e5cbd0',
    basicRowBg: '#fbecef',
    basicRowBorder: '#d8adb7',
    skillBg: '#f8dfe6',
    skillBorder: '#c66f86',
    topBandBg: '#be6477',
  },

  // 32. 工程蓝图：深工程蓝、天青标线与冷白图纸。
  32: {
    titleColor: '#0c5f84',
    dividerColor: '#bedce8',
    headerBg: '#0c4a6e',
    headerBorder: '#7dd3fc',
    itemBg: '#f5fbfe',
    itemBorder: '#75a9bd',
    basicRowBg: '#164e63',
    basicRowBorder: '#4f91a9',
    skillBg: '#e0f2fe',
    skillBorder: '#38bdf8',
    topBandBg: '#0284c7',
  },

  // 33. 陶土卡片：赤陶、燕麦与深棕，突出手作厚度。
  33: {
    titleColor: '#7d3f30',
    dividerColor: '#d7bda9',
    headerBg: '#f3dfcf',
    headerBorder: '#9a5947',
    itemBg: '#fffaf5',
    itemBorder: '#d9b8a2',
    basicRowBg: '#f7e9dc',
    basicRowBorder: '#c89478',
    skillBg: '#efe1d1',
    skillBorder: '#ad7357',
    topBandBg: '#9a4f3b',
  },

  // 34. 城市路线：深海军蓝、珊瑚站点与浅蓝线路牌。
  34: {
    titleColor: '#1d5b76',
    dividerColor: '#b7cdd6',
    headerBg: '#173b57',
    headerBorder: '#4f7892',
    itemBg: '#ffffff',
    itemBorder: '#bdd1d9',
    basicRowBg: '#234d67',
    basicRowBorder: '#5d8196',
    skillBg: '#e6f1f4',
    skillBorder: '#67a6b3',
    topBandBg: '#f05d5e',
  },

  // 35. 北欧留白：雾白、冷灰绿与柔和石墨线。
  35: {
    titleColor: '#415f5a',
    dividerColor: '#d4dfdd',
    headerBg: 'transparent',
    headerBorder: '#7e9792',
    itemBg: '#ffffff',
    itemBorder: '#d9e1df',
    basicRowBg: '#f4f8f7',
    basicRowBorder: '#c9d6d3',
    skillBg: '#eef4f2',
    skillBorder: '#819d97',
    topBandBg: '#607f78',
  },

  // 36. 霓虹终端：深墨绿底、荧光薄荷与电子蓝状态线。
  36: {
    titleColor: '#4dffc3',
    dividerColor: '#24524b',
    headerBg: '#071a1d',
    headerBorder: '#2f6c62',
    itemBg: '#0d2024',
    itemBorder: '#2b5f57',
    basicRowBg: '#10272b',
    basicRowBorder: '#34736a',
    skillBg: '#11342f',
    skillBorder: '#39ffb6',
    topBandBg: '#00c98b',
  },

  // 37. 东方印鉴：米纸、黛棕与朱砂印章。
  37: {
    titleColor: '#6e302d',
    dividerColor: '#cdbb9c',
    headerBg: '#fbf4e8',
    headerBorder: '#6a5140',
    itemBg: '#fffdf7',
    itemBorder: '#d8c8ad',
    basicRowBg: '#f5ecdd',
    basicRowBorder: '#baa684',
    skillBg: '#efe5d2',
    skillBorder: '#9c7651',
    topBandBg: '#a4473d',
  },

  // 38. 丝带作品：梅紫、莓红与柔雾紫展板。
  38: {
    titleColor: '#5d3676',
    dividerColor: '#d9cde0',
    headerBg: '#f2eaf4',
    headerBorder: '#725184',
    itemBg: '#fffafd',
    itemBorder: '#dfcedc',
    basicRowBg: '#eee2f0',
    basicRowBorder: '#a88aaf',
    skillBg: '#f4e1e8',
    skillBorder: '#d16d8a',
    topBandBg: '#e05a7a',
  },

  // 39. 水晶面板：雾紫蓝、薄荷切面与通透灰线。
  39: {
    titleColor: '#5066a5',
    dividerColor: '#d4d9e8',
    headerBg: '#f4f6fb',
    headerBorder: '#8291bd',
    itemBg: '#fbfcff',
    itemBorder: '#ccd3e6',
    basicRowBg: '#eef1fa',
    basicRowBorder: '#a6b0d0',
    skillBg: '#e4f4ef',
    skillBorder: '#74bda8',
    topBandBg: '#7183c5',
  },

  // 40. 纸本账册：牛皮棕、账簿绿灰与纸张米白。
  40: {
    titleColor: '#6f4a25',
    dividerColor: '#d4c6ac',
    headerBg: '#f4ecdd',
    headerBorder: '#6b5a42',
    itemBg: '#fffdf7',
    itemBorder: '#cbbd9f',
    basicRowBg: '#f6efe1',
    basicRowBorder: '#aa9672',
    skillBg: '#e8ede4',
    skillBorder: '#7f967c',
    topBandBg: '#9a6b31',
  },

  // 41. 极光流线：柔紫、湖蓝与薄荷青的连续渐变。
  41: {
    titleColor: '#5156a5',
    dividerColor: '#d2d8e9',
    headerBg: '#f3f3fb',
    headerBorder: '#8588bf',
    itemBg: '#fcfcff',
    itemBorder: '#d8d8e9',
    basicRowBg: '#eef3fa',
    basicRowBorder: '#aab8d3',
    skillBg: '#e4f5f1',
    skillBorder: '#66bfb3',
    topBandBg: '#695fd2',
  },

  // 42. 包豪斯积木：炭黑、原色红黄与克制纸白。
  42: {
    titleColor: '#111111',
    dividerColor: '#b9b9b9',
    headerBg: '#f2c230',
    headerBorder: '#111111',
    itemBg: '#fffdf5',
    itemBorder: '#111111',
    basicRowBg: '#ffffff',
    basicRowBorder: '#111111',
    skillBg: '#e7f0ec',
    skillBorder: '#276f66',
    topBandBg: '#de3c2f',
  },

  // 43. 学院徽章：学院蓝、古铜金与年鉴米白。
  43: {
    titleColor: '#173f5f',
    dividerColor: '#c5b999',
    headerBg: '#fbf8ef',
    headerBorder: '#173f5f',
    itemBg: '#fffdf8',
    itemBorder: '#d4ccb7',
    basicRowBg: '#f3efe4',
    basicRowBorder: '#b7a987',
    skillBg: '#e8eef1',
    skillBorder: '#7793a5',
    topBandBg: '#b6904b',
  },

  // 44. 柑橘工作室：鲜橙、鼠尾草绿与奶油纸色。
  44: {
    titleColor: '#a8501e',
    dividerColor: '#d8d3b8',
    headerBg: '#fff5dc',
    headerBorder: '#d57923',
    itemBg: '#fffdf5',
    itemBorder: '#e4cca2',
    basicRowBg: '#f4f0cf',
    basicRowBorder: '#b9b57e',
    skillBg: '#e4f1e9',
    skillBorder: '#64a692',
    topBandBg: '#ee8b2d',
  },

  // 45. 黑白索引：纯黑目录块、冷灰线条与白色档案页。
  45: {
    titleColor: '#ffffff',
    dividerColor: '#a3a3a3',
    headerBg: '#ffffff',
    headerBorder: '#111111',
    itemBg: '#ffffff',
    itemBorder: '#111111',
    basicRowBg: '#111111',
    basicRowBorder: '#5c5c5c',
    skillBg: '#f0f0f0',
    skillBorder: '#111111',
    topBandBg: '#111111',
  },

  // 46. 深空坐标：深靛夜空、电光蓝紫与冰青坐标。
  46: {
    titleColor: '#75e8ff',
    dividerColor: '#334476',
    headerBg: '#10183a',
    headerBorder: '#5063a8',
    itemBg: '#151f43',
    itemBorder: '#40538b',
    basicRowBg: '#1b2850',
    basicRowBorder: '#5266a3',
    skillBg: '#202f5d',
    skillBorder: '#6a7cff',
    topBandBg: '#5268ff',
  },

  // 47. 亚麻书信：亚麻米、暖棕邮线与鼠尾草信签。
  47: {
    titleColor: '#6b5136',
    dividerColor: '#d4c7b2',
    headerBg: '#f8f2e8',
    headerBorder: '#8b765c',
    itemBg: '#fffdf9',
    itemBorder: '#d8ccb9',
    basicRowBg: '#f3ede2',
    basicRowBorder: '#b9aa91',
    skillBg: '#e9eee5',
    skillBorder: '#8ca086',
    topBandBg: '#8b6f47',
  },

  // 48. 校园成长档案：学院绿、成长黄与档案米白，强调学习路径。
  48: {
    titleColor: '#275d4d',
    dividerColor: '#c9d3bd',
    headerBg: '#f6f1df',
    headerBorder: '#557b6d',
    itemBg: '#fffdf6',
    itemBorder: '#d4c9ae',
    basicRowBg: '#eef3e7',
    basicRowBorder: '#a8b99c',
    skillBg: '#e3efe7',
    skillBorder: '#6fa087',
    topBandBg: '#e9b949',
  },

  // 49. 实践冲刺：深蓝看板、活力橙与状态青，突出实习项目成果。
  49: {
    titleColor: '#1d5a75',
    dividerColor: '#c4d4db',
    headerBg: '#173b67',
    headerBorder: '#50749a',
    itemBg: '#ffffff',
    itemBorder: '#c7d7df',
    basicRowBg: '#214c76',
    basicRowBorder: '#5c7fa0',
    skillBg: '#e4f4f1',
    skillBorder: '#48b9a8',
    topBandBg: '#f47a3c',
  },

  // 50. 新星作品集：展览紫、票签酸橙与薄荷能力证明卡。
  50: {
    titleColor: '#4d3ca6',
    dividerColor: '#d3cee8',
    headerBg: '#eeeafb',
    headerBorder: '#6656ad',
    itemBg: '#fffefe',
    itemBorder: '#d8d1ea',
    basicRowBg: '#f3f0fa',
    basicRowBorder: '#aa9ed1',
    skillBg: '#e1f3ec',
    skillBorder: '#5dbb9b',
    topBandBg: '#d8ff4f',
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
