/**
 * 首页模板预览固定演示数据 - 张三校招简历
 */
export const DEMO_RESUME = {
  name: '张三',
  target_position: '前端开发工程师',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  school: '清华大学',
  major: '计算机科学与技术',
  education: '本科',
  summary: '热爱前端工程化与用户体验，具备 Vue3 + TypeScript 全栈开发经验，参与多个校园与企业级项目，注重性能优化与代码质量。',
  skills: ['Vue3', 'TypeScript', 'Vite', 'Pinia', 'Node.js', 'TailwindCSS'],
  projects: [
    {
      name: '校园二手交易平台',
      role: '前端负责人',
      tech_stack: 'Vue3, Pinia, Ant Design Vue',
      start_date: '2024.03',
      end_date: '2024.06',
      description: '独立负责前端架构设计与核心模块开发，通过懒加载与组件拆分将首屏加载时间降低 60%，支撑日均 5000+ 访问。',
    },
    {
      name: 'AI 简历助手',
      role: '全栈开发',
      tech_stack: 'Vue3, Node.js, DeepSeek API',
      start_date: '2025.01',
      end_date: '2025.04',
      description: '基于 STAR 法则设计 AI 生成流程，实现 20 套模板在线编辑与 PDF 导出，用户生成简历平均耗时 10 分钟。',
    },
  ],
  internships: [
    {
      company: '字节跳动',
      position: '前端开发实习生',
      start_date: '2024.07',
      end_date: '2024.10',
      description: '参与内部管理系统重构，使用 Vue3 组合式 API 优化组件复用率，协助完成 3 个核心业务模块上线。',
    },
  ],
  awards: ['2024 国家励志奖学金', 'ACM 程序设计竞赛校级二等奖'],
  certificates: ['CET-6 520分', '计算机二级'],
}

/** 首页轮播展示的模板 ID（从库中精选） */
export const FEATURED_TEMPLATE_IDS = [1, 3, 8, 14, 16, 20]
