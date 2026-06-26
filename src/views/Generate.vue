<!--
  简历生成页
  步骤式表单：Step1基本信息 → Step2项目经历 → Step3AI生成 → Step4预览编辑
-->
<template>
  <div class="generate-page">
    <!-- 顶部渐变Banner -->
    <div class="gen-banner">
      <div class="gen-banner-content">
        <h1 class="gen-banner-title">
          <ThunderboltFilled class="banner-icon" /> AI 智能生成简历
        </h1>
        <p class="gen-banner-desc">
          填写下方信息，AI 将根据你的内容自动生成专业校招简历，使用 STAR 法则突出技术亮点
        </p>
      </div>
    </div>

    <div class="gen-container">
      <!-- 步骤进度条 -->
      <a-card class="steps-card" :bordered="false">
        <a-steps :current="currentStep" class="gen-steps">
          <a-step title="基本信息" description="填写个人资料" />
          <a-step title="项目经历" description="描述你做过的项目" />
          <a-step title="AI生成" description="智能生成简历" />
          <a-step title="预览编辑" description="进入编辑器" />
        </a-steps>
      </a-card>

      <div class="step-content">
        <!-- Step1: 基本信息 -->
        <div v-show="currentStep === 0">
          <a-alert message="提示" description="带 * 号的字段为必填项，AI 生成质量取决于信息完整度。" type="info" show-icon
            style="margin-bottom: 16px" closable />
          <a-card class="form-card" :bordered="false">
            <template #title>
              <UserOutlined /> 基本信息
            </template>
            <a-form :model="basicForm" layout="vertical">
              <a-row :gutter="16">
                <a-col :xs="24" :sm="12">
                  <a-form-item label="姓名" required>
                    <a-input v-model:value="basicForm.name" placeholder="请输入姓名" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="学校" required>
                    <a-input v-model:value="basicForm.school" placeholder="如：清华大学" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="专业" required>
                    <a-input v-model:value="basicForm.major" placeholder="如：计算机科学与技术" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="学历" required>
                    <a-select v-model:value="basicForm.education" placeholder="请选择学历" size="large">
                      <a-select-option value="本科">本科</a-select-option>
                      <a-select-option value="硕士">硕士</a-select-option>
                      <a-select-option value="博士">博士</a-select-option>
                      <a-select-option value="大专">大专</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="求职方向" required>
                    <a-input v-model:value="basicForm.target_position" placeholder="如：前端开发工程师" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="技能标签">
                    <a-input v-model:value="basicForm.skills" placeholder="用逗号分隔，如：Vue3,JavaScript,Python"
                      size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="手机号">
                    <a-input v-model:value="basicForm.phone" placeholder="请输入手机号" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="邮箱">
                    <a-input v-model:value="basicForm.email" placeholder="请输入邮箱" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="获奖情况">
                    <a-textarea v-model:value="basicForm.awards" :rows="2" placeholder="如：2024年全国大学生数学建模竞赛一等奖" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="证书">
                    <a-textarea v-model:value="basicForm.certificates" :rows="2" placeholder="如：CET-6 550分、软件设计师中级" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
          <div class="step-actions">
            <a-button type="primary" size="large" @click="nextStep">
              下一步：填写项目经历
              <ArrowRightOutlined />
            </a-button>
          </div>
        </div>

        <!-- Step2: 项目经历 -->
        <div v-show="currentStep === 1">
          <a-alert message="项目经历越详细，AI 生成质量越高" description="建议每个项目都填写：项目名、角色、技术栈、时间和2-3句简单描述。AI 会自动用 STAR 法则美化你的描述。"
            type="success" show-icon style="margin-bottom: 16px" closable />
          <a-card class="form-card" :bordered="false">
            <template #title>
              <CodeOutlined /> 项目经历
              <a-tag color="blue" style="margin-left: 8px">{{ projects.length }} 个项目</a-tag>
            </template>
            <div v-for="(project, index) in projects" :key="index" class="project-item">
              <a-divider v-if="index > 0" />
              <div class="project-header">
                <h4 class="project-title">
                  <span class="project-num">{{ index + 1 }}</span> 项目 {{ index + 1 }}
                </h4>
                <a-button type="link" danger v-if="projects.length > 1" @click="projects.splice(index, 1)">
                  <DeleteOutlined /> 删除
                </a-button>
              </div>
              <a-form layout="vertical">
                <a-row :gutter="[16, 0]">
                <a-col :xs="24" :sm="12">
                  <a-form-item label="项目名称">
                    <a-input v-model:value="project.name" placeholder="如：校园二手交易平台" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="你的角色">
                    <a-input v-model:value="project.role" placeholder="如：前端负责人" />
                  </a-form-item>
                </a-col>

                <a-col :xs="24" :sm="12">
                  <a-form-item label="开始时间">
                    <a-date-picker v-model:value="project.start_date" picker="month" value-format="YYYY.MM"
                      placeholder="2024.03" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="结束时间">
                    <a-date-picker v-model:value="project.end_date" picker="month" value-format="YYYY.MM"
                      placeholder="2024.06" style="width: 100%" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="24">
                  <a-form-item label="技术栈">
                    <a-input v-model:value="project.tech_stack" placeholder="如：Vue3,Pinia,Ant Design Vue" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">  
                  <a-form-item label="项目描述（简单描述即可，AI 会自动优化）">
                    <a-textarea
                      v-model:value="project.description"
                      :rows="3"
                      :maxlength="500"
                      show-count
                      placeholder="例如：基于Vue3开发后台管理系统，实现登录和权限管理。AI 会自动用 STAR 法则改写为更专业的描述。"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              </a-form>
            </div>
            <a-button type="dashed" block @click="addProject" style="margin-top: 16px">
              <PlusOutlined /> 添加项目
            </a-button>
          </a-card>

          <a-card class="form-card" style="margin-top: 16px" :bordered="false">
            <template #title>
              <BankOutlined /> 实习经历（选填）
              <a-tag color="orange" style="margin-left: 8px">{{internships.filter(i => i.company).length}} 段实习</a-tag>
            </template>
            <div v-for="(intern, index) in internships" :key="index" class="project-item">
              <a-divider v-if="index > 0" />
              <div class="project-header">
                <h4 class="project-title">
                  <span class="project-num intern-num">{{ index + 1 }}</span> 实习 {{ index + 1 }}
                </h4>
                <a-button type="link" danger v-if="internships.length > 1" @click="internships.splice(index, 1)">
                  <DeleteOutlined /> 删除
                </a-button>
              </div>
              <a-form layout="vertical">
                <a-row :gutter="[16, 0]">
                  <a-col :xs="24" :sm="12">
                    <a-form-item label="公司名称">
                      <a-input v-model:value="intern.company" placeholder="如：字节跳动" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <a-form-item label="岗位">
                      <a-input v-model:value="intern.position" placeholder="如：前端开发实习生" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <a-form-item label="开始时间">
                      <a-date-picker
                        v-model:value="intern.start_date"
                        picker="month"
                        value-format="YYYY.MM"
                        placeholder="2024.06"
                        style="width: 100%"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12">
                    <a-form-item label="结束时间">
                      <a-date-picker
                        v-model:value="intern.end_date"
                        picker="month"
                        value-format="YYYY.MM"
                        placeholder="2024.09"
                        style="width: 100%"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="24">
                    <a-form-item label="工作描述">
                      <a-textarea v-model:value="intern.description" :rows="2" placeholder="描述你的工作内容和成果" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
            </div>
            <a-button type="dashed" block @click="addInternship" style="margin-top: 16px">
              <PlusOutlined /> 添加实习
            </a-button>
          </a-card>

          <div class="step-actions">
            <a-button size="large" @click="currentStep = 0">
              <ArrowLeftOutlined /> 上一步
            </a-button>
            <a-button type="primary" size="large" @click="handleGenerate" :loading="resumeStore.generating">
              <ThunderboltOutlined /> AI 生成简历
            </a-button>
          </div>
        </div>

        <!-- Step3: AI生成中 -->
        <div v-show="currentStep === 2">
          <a-card class="form-card generating-card" :bordered="false">
            <div class="generating-content">
              <div class="generating-icon">
                <a-spin size="large" />
              </div>
              <h2 class="generating-title">AI 正在为你生成专业简历...</h2>
              <p class="generating-desc">使用 STAR 法则优化项目描述，突出技术亮点</p>
              <div class="generating-progress">
                <div class="progress-step done">✓ 分析基本信息</div>
                <div class="progress-step done">✓ 优化项目描述</div>
                <div class="progress-step doing">⟳ 生成个人评价中...</div>
                <div class="progress-step">○ 整理技能标签</div>
              </div>
              <p class="generating-tip">💡 通常需要 10-30 秒，请耐心等待</p>
            </div>
          </a-card>
        </div>

        <!-- Step4: 生成成功 -->
        <div v-show="currentStep === 3">
          <a-card class="form-card success-card" :bordered="false">
            <a-result status="success" title="🎉 简历生成成功！" sub-title="AI 已根据你的信息生成专业校招简历，前往编辑器进行预览、修改和导出">
              <template #extra>
                <a-button type="primary" size="large" @click="goToEditor">
                  <EditOutlined /> 进入编辑器
                </a-button>
                <a-button size="large" @click="currentStep = 0">
                  <ReloadOutlined /> 重新生成
                </a-button>
              </template>
            </a-result>
          </a-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined, PlusOutlined, ThunderboltOutlined, ThunderboltFilled,
  UserOutlined, CodeOutlined, BankOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, EditOutlined, ReloadOutlined,
} from '@ant-design/icons-vue'
import { useResumeStore } from '@/stores/resume'

const router = useRouter()
const resumeStore = useResumeStore()
const currentStep = ref(0)

const basicForm = reactive({
  name: '',
  school: '',
  major: '',
  education: '',
  target_position: '',
  skills: '',
  phone: '',
  email: '',
  awards: '',
  certificates: '',
})

const projects = reactive([
  { name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' },
])

const internships = reactive([
  { company: '', position: '', description: '', start_date: '', end_date: '' },
])

function addProject() {
  projects.push({ name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' })
}

function addInternship() {
  internships.push({ company: '', position: '', description: '', start_date: '', end_date: '' })
}

// 切到下一步前简单校验
function nextStep() {
  if (!basicForm.name || !basicForm.school || !basicForm.major || !basicForm.education || !basicForm.target_position) {
    message.warning('请填写完必填项（姓名/学校/专业/学历/求职方向）')
    return
  }
  currentStep.value = 1
}

async function handleGenerate() {
  // 至少需要一个有内容的项目
  const hasProject = projects.some((p) => p.name || p.description)
  if (!hasProject) {
    message.warning('请至少填写一个项目经历')
    return
  }
  currentStep.value = 2
  const formData = {
    ...basicForm,
    projects: projects.filter((p) => p.name || p.description),
    internships: internships.filter((i) => i.company || i.description),
  }
  const result = await resumeStore.generateResume(formData)
  if (result) {
    currentStep.value = 3
  } else {
    currentStep.value = 1
  }
}

function goToEditor() {
  router.push('/editor')
}
</script>

<style scoped>
/* 整体布局 */
.generate-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

/* 顶部渐变Banner */
.gen-banner {
  background: linear-gradient(135deg, #1677ff 0%, #722ed1 100%);
  padding: 40px 24px;
  color: #fff;
}

.gen-banner-content {
  max-width: 1100px;
  margin: 0 auto;
}

.gen-banner-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon {
  font-size: 32px;
  color: #fadb14;
}

.gen-banner-desc {
  font-size: 14px;
  opacity: 0.92;
  max-width: 700px;
}

.gen-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  margin-top: -20px;
}

@media (max-width: 576px) {
  .gen-banner {
    padding: 28px 16px;
  }

  .gen-banner-title {
    font-size: 22px;
  }

  .gen-container {
    padding: 16px;
  }

  .step-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .step-actions .ant-btn {
    width: 100%;
  }

  .project-item {
    padding: 16px;
  }
}

/* 步骤进度卡 */
.steps-card {
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.gen-steps {
  padding: 12px 16px;
}

.form-card {
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
}

.form-card :deep(.ant-card-head-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-card :deep(.ant-form-item) {
  margin-bottom: 16px;
}

/* 项目卡片 */
.project-item {
  background: #fafbfc;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  transition: box-shadow 0.2s ease;
}

.project-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.project-title {
  margin: 0;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.intern-num {
  background: #fa8c16;
}

/* 操作按钮 */
.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px;
}

/* AI生成中 */
.generating-card {
  text-align: center;
  padding: 40px 0;
}

.generating-content {
  max-width: 480px;
  margin: 0 auto;
}

.generating-icon {
  margin-bottom: 24px;
}

.generating-title {
  font-size: 20px;
  font-weight: 600;
  color: #1677ff;
  margin-bottom: 8px;
}

.generating-desc {
  color: #888;
  margin-bottom: 24px;
}

.generating-progress {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px 20px;
  margin: 16px 0;
  text-align: left;
}

.progress-step {
  padding: 6px 0;
  font-size: 13px;
  color: #999;
}

.progress-step.done {
  color: #52c41a;
}

.progress-step.doing {
  color: #1677ff;
  font-weight: 500;
}

.generating-tip {
  margin-top: 16px;
  color: #faad14;
  font-size: 13px;
}

/* 成功页 */
.success-card {
  padding: 24px 0;
}
</style>
