/**
 * 模板预览演示数据。
 * 按模板定位提供多行业示例，避免所有模板都只展示互联网开发岗位。
 * 公司、学校与业绩均为版式演示内容，不代表真实个人或机构。
 */

const COMMON = {
  phone: '138 0000 0000',
  email: 'candidate@example.com',
  custom_fields: [],
  educations: [],
  school: '',
  major: '',
  education: '',
  skills: [],
  projects: [],
  internships: [],
  work_experiences: [],
  awards: [],
  certificates: [],
}

const GENERAL_DEMO = {
  ...COMMON,
  name: '林悦',
  target_position: '品牌运营经理',
  work_years: '5年',
  native_place: '浙江杭州',
  expected_salary: '面议',
  custom_fields: [{ label: '到岗时间', value: '一个月内' }],
  educations: [{ school: '示例财经大学', major: '市场营销', degree: '本科', start_date: '2015.09', end_date: '2019.06' }],
  school: '示例财经大学',
  major: '市场营销',
  education: '本科',
  summary: '具备品牌策略、内容运营与跨部门项目推进经验，能够从用户洞察出发制定传播方案并推动落地。熟悉预算管理、供应商协同和复盘机制，重视品牌长期价值与可衡量的业务结果。',
  skills: ['品牌策略', '内容运营', '用户洞察', '活动策划', '数据复盘', '项目管理', 'Excel', 'PowerPoint'],
  projects: [{
    name: '年度品牌焕新项目', role: '项目负责人', tech_stack: '用户调研、品牌定位、内容矩阵、供应商管理', start_date: '2023.02', end_date: '2023.10',
    description: '围绕品牌认知分散问题组织用户访谈与竞品研究，重构核心价值主张和内容规范；统筹设计、渠道与供应商按阶段交付，推动官网、物料及重点活动统一升级，并建立季度品牌指标复盘机制。',
  }],
  work_experiences: [
    { company: '示例消费品有限公司', position: '品牌运营经理', department: '市场中心', start_date: '2022.03', end_date: '至今', description: '负责年度品牌传播与重点营销项目，统筹内容、渠道、预算和合作伙伴；通过主题活动与用户分层触达，持续提升核心客群互动和线索转化质量。' },
    { company: '示例文化传播有限公司', position: '内容运营专员', department: '内容部', start_date: '2019.07', end_date: '2022.02', description: '搭建公众号、短视频及社群内容计划，建立选题、审核、发布和复盘流程；协同销售与设计沉淀行业案例，提升内容交付效率和品牌表达一致性。' },
  ],
  awards: ['年度优秀项目奖', '跨部门协作之星'],
  certificates: ['PMP 项目管理专业人士认证'],
}

const CAMPUS_DEMO = {
  ...COMMON,
  name: '周宁',
  target_position: '供应链管理培训生',
  work_years: '应届毕业生',
  expected_salary: '面议',
  educations: [{ school: '示例理工大学', major: '物流管理', degree: '本科', start_date: '2022.09', end_date: '2026.06' }],
  school: '示例理工大学',
  major: '物流管理',
  education: '本科',
  summary: '物流管理专业应届毕业生，掌握采购、库存与运输管理基础，具备数据整理和流程分析能力。通过企业实习和校园项目积累协作与执行经验，能够快速学习业务规则并推动任务闭环。',
  skills: ['供应链基础', '库存分析', '采购流程', 'Excel 数据透视表', 'Power BI', '英语 CET-6', '沟通协调'],
  projects: [{ name: '校园物资周转优化调研', role: '小组负责人', tech_stack: '问卷调研、流程梳理、Excel、Power BI', start_date: '2024.09', end_date: '2025.01', description: '针对社团物资重复采购与闲置问题，组织访谈并梳理领用流程，建立物资分类台账和周转看板；形成共享与预约方案，为校园物资管理提供可执行建议。' }],
  internships: [{ company: '示例物流有限公司', position: '运营实习生', start_date: '2025.03', end_date: '2025.06', description: '协助维护订单与库存日报，核对异常数据并跟进仓配节点；整理高频异常原因和处理记录，支持团队优化日常交接与问题追踪。' }],
  awards: ['校级一等奖学金', '全国大学生物流设计大赛省级二等奖'],
  certificates: ['大学英语六级', '计算机二级'],
}

const ADMIN_DEMO = {
  ...COMMON,
  name: '陈安',
  target_position: '行政主管',
  work_years: '6年',
  expected_salary: '面议',
  educations: [{ school: '示例师范学院', major: '行政管理', degree: '本科', start_date: '2013.09', end_date: '2017.06' }],
  school: '示例师范学院', major: '行政管理', education: '本科',
  summary: '拥有行政运营、制度建设与会务统筹经验，熟悉固定资产、采购、档案和供应商管理。注重服务体验与流程规范，能够协调多部门资源并保障日常运营稳定。',
  skills: ['行政制度建设', '会务管理', '固定资产管理', '采购与供应商管理', '档案管理', 'Office 办公软件'],
  work_experiences: [{ company: '示例实业集团', position: '行政主管', department: '综合管理部', start_date: '2020.04', end_date: '至今', description: '负责办公运营、采购、资产、会议和接待管理，完善常用行政流程与台账；统筹跨部门大型会议及搬迁项目，保障关键节点按期完成。' }, { company: '示例服务有限公司', position: '行政专员', department: '行政部', start_date: '2017.07', end_date: '2020.03', description: '执行办公用品采购、合同归档、考勤与会议支持，维护供应商信息和费用记录，为团队日常运营提供稳定支持。' }],
  certificates: ['企业行政管理师'],
}

const SALES_DEMO = {
  ...COMMON,
  name: '吴桐', target_position: '大客户销售经理', work_years: '7年', expected_salary: '面议',
  educations: [{ school: '示例商学院', major: '工商管理', degree: '本科', start_date: '2012.09', end_date: '2016.06' }],
  school: '示例商学院', major: '工商管理', education: '本科',
  summary: '具备企业客户开发、解决方案销售与长期关系经营经验，能够完成从商机识别、需求澄清到谈判交付的完整闭环。擅长整合售前、产品和交付资源，以客户价值为导向推进复杂项目。',
  skills: ['大客户开发', '顾问式销售', '商务谈判', '销售漏斗管理', '客户关系管理', 'CRM', '方案呈现'],
  projects: [{ name: '重点行业客户拓展专项', role: '销售负责人', tech_stack: '行业研究、客户地图、解决方案销售、CRM', start_date: '2023.01', end_date: '2023.12', description: '聚焦重点行业梳理目标客户与关键决策链，联合售前制定分层触达方案；通过标杆案例复用和阶段性商务推进，提升重点商机覆盖和团队协同效率。' }],
  work_experiences: [{ company: '示例企业服务有限公司', position: '大客户销售经理', department: '行业销售部', start_date: '2020.01', end_date: '至今', description: '负责重点行业客户开发与年度经营，推进需求分析、方案沟通、商务谈判和交付回访；维护客户关系并挖掘续约与增购机会。' }, { company: '示例科技服务有限公司', position: '客户经理', department: '销售部', start_date: '2016.07', end_date: '2019.12', description: '通过电话、活动和渠道合作获取商机，维护销售漏斗与客户档案，协同售前完成方案演示和项目跟进。' }],
  awards: ['年度销售贡献奖'],
}

const EDUCATION_DEMO = {
  ...COMMON,
  name: '许知夏', target_position: '中学语文教师', work_years: '4年', expected_salary: '面议',
  educations: [{ school: '示例师范大学', major: '汉语言文学', degree: '硕士', start_date: '2017.09', end_date: '2020.06' }],
  school: '示例师范大学', major: '汉语言文学', education: '硕士',
  summary: '具备中学语文教学、班级管理与课程设计经验，坚持以学习目标和学生反馈改进课堂。熟悉教案设计、分层作业与家校沟通，能够组织教研活动并沉淀可复用教学资源。',
  skills: ['语文教学', '课程设计', '班级管理', '分层教学', '家校沟通', '教研活动组织', '多媒体课件制作'],
  projects: [{ name: '整本书阅读课程建设', role: '课程负责人', tech_stack: '课程设计、阅读任务单、课堂观察、学习评价', start_date: '2022.09', end_date: '2023.06', description: '围绕学生阅读兴趣和表达能力设计阶段性阅读任务，组织公开课与同伴评课，结合学生作品和课堂反馈持续调整课程活动。' }],
  work_experiences: [{ company: '示例实验中学', position: '语文教师', department: '语文教研组', start_date: '2020.09', end_date: '至今', description: '承担初中语文教学与班级管理，独立完成备课、授课、作业评价和学情分析；参与年级教研与家校沟通，持续优化课堂活动和分层辅导。' }],
  certificates: ['中学语文教师资格证', '普通话一级乙等'],
}

const FINANCE_DEMO = {
  ...COMMON,
  name: '沈言', target_position: '财务分析师', work_years: '5年', expected_salary: '面议',
  educations: [{ school: '示例财经大学', major: '会计学', degree: '本科', start_date: '2014.09', end_date: '2018.06' }],
  school: '示例财经大学', major: '会计学', education: '本科',
  summary: '具备预算管理、经营分析和管理报表经验，能够从收入、成本与效率维度识别经营问题。熟悉财务模型、预算滚动预测和跨部门沟通，重视数据准确性与业务可执行性。',
  skills: ['经营分析', '全面预算管理', '管理会计', '财务建模', 'Excel Power Query', 'Power BI', 'ERP'],
  projects: [{ name: '滚动预算与经营看板建设', role: '财务负责人', tech_stack: '预算模型、Power Query、Power BI、指标体系', start_date: '2022.04', end_date: '2022.11', description: '针对预算反馈滞后问题梳理业务口径与数据来源，搭建月度滚动预测和经营看板；建立差异分析与责任跟进机制，为经营会议提供统一数据依据。' }],
  work_experiences: [{ company: '示例制造集团', position: '财务分析师', department: '财务管理部', start_date: '2021.01', end_date: '至今', description: '负责月度经营分析、预算跟踪和管理报表，联动业务部门解释关键差异并跟进改善计划；参与投资测算和专项成本分析。' }, { company: '示例会计师事务所', position: '审计助理', department: '审计部', start_date: '2018.07', end_date: '2020.12', description: '执行审计底稿、凭证抽查和往来函证，协助识别流程与内控问题，按项目计划完成资料整理和沟通跟进。' }],
  certificates: ['中级会计职称', 'CPA 专业阶段部分科目通过'],
}

const CREATIVE_DEMO = {
  ...COMMON,
  name: '顾一', target_position: '视觉设计师', work_years: '4年', expected_salary: '面议',
  educations: [{ school: '示例艺术学院', major: '视觉传达设计', degree: '本科', start_date: '2016.09', end_date: '2020.06' }],
  school: '示例艺术学院', major: '视觉传达设计', education: '本科',
  summary: '专注品牌视觉、数字界面与营销物料设计，能够从品牌策略和用户场景出发建立一致的视觉语言。具备需求拆解、方案提案和多方协作经验，关注创意质量与实际落地。',
  skills: ['品牌视觉设计', 'UI 设计', '信息排版', '设计系统', 'Figma', 'Adobe Illustrator', 'Adobe Photoshop'],
  projects: [{ name: '生活方式品牌视觉升级', role: '主视觉设计师', tech_stack: '品牌识别、视觉规范、Figma、Adobe Illustrator', start_date: '2023.03', end_date: '2023.09', description: '根据品牌定位重构色彩、字体与图形语言，完成线上商城、社交媒体和线下物料的统一延展；与市场团队协作制定设计模板和交付规范。' }],
  work_experiences: [{ company: '示例创意设计有限公司', position: '视觉设计师', department: '品牌设计部', start_date: '2020.07', end_date: '至今', description: '负责品牌活动、数字界面和营销物料设计，参与需求澄清、创意提案与交付验收；沉淀组件与模板，提升团队视觉一致性。' }],
  awards: ['青年视觉设计作品入选奖'],
}

const TECH_DEMO = {
  ...COMMON,
  name: '唐沐', target_position: '机械设计工程师', work_years: '3年', expected_salary: '面议',
  educations: [{ school: '示例工业大学', major: '机械设计制造及其自动化', degree: '本科', start_date: '2017.09', end_date: '2021.06' }],
  school: '示例工业大学', major: '机械设计制造及其自动化', education: '本科',
  summary: '具备非标设备结构设计、工程制图与试制跟进经验，熟悉从需求评审、方案设计到装配验证的工作流程。重视可制造性、成本与安全边界，能够协同电气、采购和生产团队解决现场问题。',
  skills: ['机械结构设计', 'SolidWorks', 'AutoCAD', '工程图与公差', '材料选型', 'DFMEA', 'BOM 管理', '试制验证'],
  projects: [{ name: '自动上料机构改造', role: '机械设计负责人', tech_stack: 'SolidWorks、工程图、DFMEA、试制验证', start_date: '2023.02', end_date: '2023.08', description: '针对原机构卡料与维护不便问题完成现场测绘和失效分析，重新设计导向、快拆与防护结构；协同加工和装配验证方案，沉淀图纸、BOM 与维护说明。' }],
  work_experiences: [{ company: '示例智能装备有限公司', position: '机械设计工程师', department: '研发部', start_date: '2021.07', end_date: '至今', description: '负责非标设备机械方案、三维建模、工程图和BOM，跟进加工、装配与现场调试；参与设计评审并处理干涉、强度和维护性问题。' }],
  certificates: ['机械工程师能力认证'],
}

const EXECUTIVE_DEMO = {
  ...COMMON,
  name: '陆衡', target_position: '运营总监', work_years: '12年', expected_salary: '面议',
  educations: [{ school: '示例大学', major: '企业管理', degree: '硕士', start_date: '2009.09', end_date: '2012.06' }],
  school: '示例大学', major: '企业管理', education: '硕士',
  summary: '拥有多业务线运营管理、组织建设与经营改善经验，能够将公司战略拆解为可执行目标和协同机制。擅长搭建指标体系、识别关键经营问题并推动跨部门闭环，兼顾增长、效率与团队能力建设。',
  skills: ['经营管理', '战略落地', '组织建设', '业务流程优化', '预算与成本管理', '跨部门协同', '风险管理'],
  work_experiences: [{ company: '示例产业集团', position: '运营总监', department: '运营管理中心', start_date: '2018.06', end_date: '至今', description: '统筹年度经营计划、重点项目和组织协同机制，建立业务复盘与风险跟踪体系；推动流程标准化、资源配置和管理梯队建设。' }, { company: '示例连锁企业', position: '区域运营经理', department: '运营部', start_date: '2012.07', end_date: '2018.05', description: '负责区域门店经营、人员培养与服务标准落地，协同市场、供应链和财务解决经营问题并推进区域改善项目。' }],
  awards: ['年度卓越管理者'],
}

export const DEMO_RESUME = GENERAL_DEMO

const PROFILE_BY_TEMPLATE = {
  3: CAMPUS_DEMO,
  6: ADMIN_DEMO,
  9: ADMIN_DEMO,
  10: SALES_DEMO,
  11: EDUCATION_DEMO,
  12: FINANCE_DEMO,
  13: CREATIVE_DEMO,
  14: TECH_DEMO,
  16: CAMPUS_DEMO,
  19: CREATIVE_DEMO,
  20: EXECUTIVE_DEMO,
  // 其余模板按类目补齐人设，便于 /templates 页头像轮换更丰富
  1: GENERAL_DEMO,
  2: GENERAL_DEMO,
  4: SALES_DEMO,
  5: GENERAL_DEMO,
  7: FINANCE_DEMO,
  8: TECH_DEMO,
  15: SALES_DEMO,
  17: TECH_DEMO,
  18: GENERAL_DEMO,
  21: CREATIVE_DEMO,
  22: EDUCATION_DEMO,
  23: TECH_DEMO,
  24: CREATIVE_DEMO,
  25: CREATIVE_DEMO,
  26: CAMPUS_DEMO,
  27: CAMPUS_DEMO,
  // 28–50 按模板目标场景分配演示画像，校招模板统一展示应届生经历，避免预览语义错位。
  28: GENERAL_DEMO,
  29: EXECUTIVE_DEMO,
  30: GENERAL_DEMO,
  31: CREATIVE_DEMO,
  32: TECH_DEMO,
  33: CREATIVE_DEMO,
  34: GENERAL_DEMO,
  35: GENERAL_DEMO,
  36: TECH_DEMO,
  37: EDUCATION_DEMO,
  38: CREATIVE_DEMO,
  39: TECH_DEMO,
  40: FINANCE_DEMO,
  41: CREATIVE_DEMO,
  42: CREATIVE_DEMO,
  43: CAMPUS_DEMO,
  44: CREATIVE_DEMO,
  45: GENERAL_DEMO,
  46: TECH_DEMO,
  47: GENERAL_DEMO,
  48: CAMPUS_DEMO,
  49: CAMPUS_DEMO,
  50: CAMPUS_DEMO,
}

/**
 * 模板预览统一演示头像：AI 生成职业肖像（非真人/非明星），本地静态资源，避免侵权与外链依赖。
 * 对应文件：public/demo-avatar.webp
 */
export const DEMO_AVATAR = '/demo-avatar.webp'

/** @deprecated 旧逻辑：仅部分模板带头像；现已全量模板预览带头像 */
export const DEMO_AVATAR_TEMPLATE_IDS = Array.from({ length: 50 }, (_, i) => i + 1)

function resolveDemoAvatar() {
  return DEMO_AVATAR
}

export function getDemoResume(templateId) {
  const source = PROFILE_BY_TEMPLATE[templateId] || GENERAL_DEMO
  const resume = JSON.parse(JSON.stringify(source))
  // /templates 与首页预览统一写入演示头像，让版式中的头像位有肖像示例
  resume.avatar = resolveDemoAvatar()
  return resume
}

/** 首页轮播精选，覆盖通用、职场、销售、教育、财务与工程场景 */
export const FEATURED_TEMPLATE_IDS = [1, 3, 11, 19, 23, 25]
