// 首页以统一线性图标表达功能类别，避免插画 Emoji 打断产品界面的视觉秩序。
import {
  AppstoreOutlined,
  CloudUploadOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'

/**
 * 首页功能卡片数据
 */
export const HOME_FEATURES = [
  {
    icon: FileTextOutlined,
    title: 'AI 定制简历',
    path: '/generate',
    desc: '从你提供的经历出发生成初稿，重要事实由你核对和确认',
    iconBg: 'bg-brand-lighter/60',
  },
  {
    icon: CloudUploadOutlined,
    title: '统一入口快速创建',
    path: '/generate?mode=lazy',
    desc: '从 PDF 或文字提取已有信息，也可以直接填写后继续',
    iconBg: 'bg-accent-lighter/60',
  },
  {
    icon: ThunderboltOutlined,
    title: '岗位定向优化',
    path: '/generate',
    desc: '对照岗位要求查看相关经历、差距和可调整的表达',
    iconBg: 'bg-mint/60',
  },
  {
    icon: FundProjectionScreenOutlined,
    title: 'AI 评分与匹配',
    path: '/generate',
    desc: '查看简历结构和岗位匹配反馈，决定下一步怎么修改',
    iconBg: 'bg-brand-lighter/60',
  },
  {
    icon: AppstoreOutlined,
    title: '50 套专业模板',
    path: '/templates',
    desc: '覆盖校招、社招与多行业场景，字体、间距均可自由调整',
    iconBg: 'bg-accent-lighter/60',
  },
  {
    icon: FileDoneOutlined,
    title: '多格式免费导出',
    path: '/user',
    desc: '把确认后的简历导出为可用于后续申请的文件',
    iconBg: 'bg-mint/60',
  },
]
