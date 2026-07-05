/**
 * 首页模板预览固定演示数据 - 虚构校招简历（公司/学校均为示例名称，避免侵权）
 */
export const DEMO_RESUME = {
  name: '张伟',
  target_position: '前端开发工程师',
  phone: '13800138000',
  email: 'zhangwei@example.com',
  school: '某某大学',
  major: '软件工程',
  education: '本科 · 2022.09 - 2026.06',
  summary:
    '热爱前端工程化与用户体验设计，熟悉 Vue3 / React 技术栈与组件化开发模式。具备从需求分析、页面搭建到性能优化的完整项目经验，注重代码规范、可维护性与交付效率。善于与产品、设计协作，能在快节奏迭代中保持高质量输出，期望加入重视技术氛围的团队持续成长。',
  skills: [
    'Vue3',
    'React',
    'TypeScript',
    'JavaScript',
    'HTML5 / CSS3',
    'Vite',
    'Webpack',
    'Pinia',
    'Node.js',
    'TailwindCSS',
    'Git',
    'RESTful API',
  ],
  projects: [
    {
      name: '校园综合服务管理平台',
      role: '前端负责人',
      tech_stack: 'Vue3, Pinia, Ant Design Vue, ECharts',
      start_date: '2024.03',
      end_date: '2024.08',
      description:
        '面向全校师生的统一办事门户，涵盖公告、报修、选课辅助等模块。负责前端架构设计与核心页面开发，拆分 40+ 业务组件并建立统一表单校验规范；通过路由懒加载、图片压缩与接口合并，将首屏加载时间从 4.2s 降至 1.6s，日活用户稳定在 3000+。',
    },
    {
      name: 'AI 智能简历助手',
      role: '全栈开发',
      tech_stack: 'Vue3, Node.js, Express, DeepSeek API',
      start_date: '2025.01',
      end_date: '2025.05',
      description:
        '基于 STAR 法则设计 AI 简历生成流程，支持 JD 解析、项目经历润色与多模板导出。实现流式生成预览、20 套模板在线编辑及 PDF 导出功能；完成前后端联调与部署，用户平均生成一份简历耗时约 10 分钟，模板切换与编辑体验获内测用户好评。',
    },
    {
      name: '电商活动运营后台',
      role: '前端开发',
      tech_stack: 'React, TypeScript, Zustand, Ant Design',
      start_date: '2024.09',
      end_date: '2025.01',
      description:
        '为 XX 电商团队搭建营销活动配置后台，支持优惠券、满减规则与 Banner 可视化编排。封装拖拽式页面搭建器与权限路由模块，减少运营重复配置时间约 40%；配合后端完成接口 Mock 与联调，保障大促期间系统稳定运行。',
    },
  ],
  internships: [
    {
      company: 'XX 科技有限公司',
      position: '前端开发实习生',
      start_date: '2024.07',
      end_date: '2024.10',
      description:
        '参与企业内部管理系统重构，使用 Vue3 组合式 API 拆分业务模块并沉淀通用表格、表单组件。协助完成权限管理、数据看板等 3 个核心模块上线，修复 20+ 兼容性缺陷；在 Code Review 中学习团队规范，提升单元测试与文档编写意识。',
    },
    {
      company: 'XX 网络科技有限公司',
      position: 'Web 前端实习生',
      start_date: '2025.02',
      end_date: '2025.04',
      description:
        '负责官网与活动落地页开发，基于 TailwindCSS 实现响应式布局并完成 SEO 基础优化。配合设计稿还原度达 98% 以上，通过图片懒加载与代码分割将 Lighthouse 性能评分提升至 90+；参与日常迭代与线上问题排查，积累真实业务交付经验。',
    },
  ],
  awards: [
    '2024 学年校级一等奖学金',
    '2024 全国大学生程序设计竞赛区域赛三等奖',
    '2025 校园创新创业大赛优秀项目奖',
    '2025 前端技术分享会最佳展示奖',
  ],
  certificates: [
    'CET-6 518 分',
    '计算机二级（Web 方向）',
    '阿里云 ACA 云计算助理工程师',
  ],
}

/** 首页轮播展示的模板 ID（从库中精选） */
export const FEATURED_TEMPLATE_IDS = [2, 4, 8, 10, 16, 1]
