<!--
  表单填写生成简历面板
  Step0~Step3：基本信息 → 项目/实习经历（选填）→ AI 生成 → 预览编辑
-->
<template>
  <div class="mx-auto max-w-6xl">
    <a-card class="card-base mb-4" :bordered="false">
      <a-steps :current="currentStep" class="gen-steps">
        <a-step title="基本信息" description="填写个人资料" />
        <a-step title="项目经历（选填）" description="描述你做过的项目" />
        <a-step title="AI生成" description="智能生成简历" />
        <a-step title="预览编辑" description="进入编辑器" />
      </a-steps>
    </a-card>

    <div class="animate-slide-up">
      <!-- Step1: 基本信息 -->
      <div v-show="currentStep === 0">
        <a-alert
          message="提示"
          description="带 * 号的字段为必填项，AI 生成质量取决于信息完整度。"
          type="info"
          show-icon
          closable
          class="mb-4"
        />
        <a-card class="card-base mb-4" :bordered="false">
          <template #title>
            <span class="flex items-center gap-2 text-base font-semibold text-ink">
              <UserOutlined /> 基本信息
            </span>
          </template>
          <a-form :model="basicForm" layout="vertical">
            <a-row :gutter="[16, 0]">
              <a-col :xs="24" :sm="12">
                <a-form-item label="姓名" required>
                  <a-input :value="basicForm.name" placeholder="请输入姓名" size="large" class="input-field" @update:value="basicForm.name = $event" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item label="学校" required>
                  <a-input :value="basicForm.school" placeholder="如：清华大学" size="large" class="input-field" @update:value="basicForm.school = $event" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item label="专业" required>
                  <a-input :value="basicForm.major" placeholder="如：计算机科学与技术" size="large" class="input-field" @update:value="basicForm.major = $event" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item label="学历" required>
                  <a-select :value="basicForm.education" placeholder="请选择学历" size="large" class="w-full" @update:value="basicForm.education = $event">
                    <a-select-option value="本科">本科</a-select-option>
                    <a-select-option value="硕士">硕士</a-select-option>
                    <a-select-option value="博士">博士</a-select-option>
                    <a-select-option value="大专">大专</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item label="求职方向" required>
                  <a-input :value="basicForm.target_position" placeholder="如：前端开发工程师" size="large" class="input-field" @update:value="basicForm.target_position = $event" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item label="技能标签">
                  <a-input :value="basicForm.skills" placeholder="用逗号分隔，如：Vue3,JavaScript,Python" size="large" class="input-field" @update:value="basicForm.skills = $event" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item label="手机号">
                  <a-input :value="basicForm.phone" placeholder="请输入手机号" size="large" class="input-field" @update:value="basicForm.phone = $event" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item label="邮箱">
                  <a-input :value="basicForm.email" placeholder="请输入邮箱" size="large" class="input-field" @update:value="basicForm.email = $event" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="获奖情况">
                  <a-textarea :value="basicForm.awards" :rows="2" placeholder="如：2024年全国大学生数学建模竞赛一等奖" class="input-field" @update:value="basicForm.awards = $event" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="证书">
                  <a-textarea :value="basicForm.certificates" :rows="2" placeholder="如：CET-6 550分、软件设计师中级" class="input-field" @update:value="basicForm.certificates = $event" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>

        <div class="flex justify-center p-4">
          <GradientButton class="inline-flex h-10 min-w-[160px] items-center justify-center gap-2" @click="nextStep">
            <CodeOutlined />
            下一步：填写项目经历（选填）
            <ArrowRightOutlined />
          </GradientButton>
        </div>
      </div>

      <!-- Step2: 项目经历（选填） -->
      <div v-show="currentStep === 1">
        <a-alert
          message="项目经历为选填，填写越详细 AI 生成质量越高"
          description="建议每个项目都填写：项目名、角色、技术栈、时间和 2-3 句简单描述。AI 会自动用 STAR 法则美化你的描述。"
          type="success"
          show-icon
          closable
          class="mb-4"
        />
        <a-card class="card-base mb-4" :bordered="false">
          <template #title>
            <span class="flex items-center gap-2 text-base font-semibold text-ink">
              <CodeOutlined /> 项目经历（选填）
              <span class="badge">{{ projects.filter(p => p.name || p.description).length }} 个项目</span>
            </span>
          </template>
          <div class="space-y-4">
          <div v-for="(project, index) in projects" :key="index" class="rounded-card border border-line/50 bg-canvas/50 p-4 transition-shadow duration-200 hover:shadow-sm sm:p-5">
            <div class="mb-4 flex items-center justify-between">
              <h4 class="flex items-center gap-2 text-base font-semibold text-ink">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark text-xs font-semibold text-white">{{ index + 1 }}</span> 项目 {{ index + 1 }}
              </h4>
              <button v-if="projects.length > 1" class="link-text text-xs text-danger hover:text-red-500" @click="removeProject(index)">
                <DeleteOutlined /> 删除
              </button>
            </div>
            <a-form layout="vertical">
              <a-row :gutter="[16, 0]">
                <a-col :xs="24" :sm="12">
                  <a-form-item label="项目名称">
                    <a-input :value="project.name" placeholder="如：校园二手交易平台" class="input-field" @update:value="project.name = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="你的角色">
                    <a-input :value="project.role" placeholder="如：前端负责人" class="input-field" @update:value="project.role = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="开始时间">
                    <a-date-picker :value="project.start_date" picker="month" value-format="YYYY.MM" placeholder="2024.03" class="input-field w-full" @update:value="project.start_date = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="结束时间">
                    <a-date-picker :value="project.end_date" picker="month" value-format="YYYY.MM" placeholder="2024.06" class="input-field w-full" @update:value="project.end_date = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="24">
                  <a-form-item label="技术栈">
                    <a-input :value="project.tech_stack" placeholder="如：Vue3,Pinia,Ant Design Vue" class="input-field" @update:value="project.tech_stack = $event" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="项目描述（简单描述即可，AI 会自动优化）">
                    <a-textarea
                      :value="project.description"
                      :auto-size="{ minRows: 4, maxRows: 8 }"
                      :maxlength="500"
                      show-count
                      placeholder="例如：基于 Vue3 开发后台管理系统，实现登录和权限管理。AI 会自动用 STAR 法则改写为更专业的描述。"
                      class="project-desc-field"
                      @update:value="project.description = $event"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          </div>
          <button class="btn-ghost mt-4 w-full border-dashed py-2.5" @click="addProject">
            <PlusOutlined /> 添加项目
          </button>
        </a-card>

        <a-card class="card-base mb-4" :bordered="false">
          <template #title>
            <span class="flex items-center gap-2 text-base font-semibold text-ink">
              <BankOutlined /> 实习经历（选填）
              <span class="badge">{{ internships.filter(i => i.company).length }} 段实习</span>
            </span>
          </template>
          <div class="space-y-4">
          <div v-for="(intern, index) in internships" :key="index" class="rounded-card border border-line/50 bg-canvas/50 p-4 transition-shadow duration-200 hover:shadow-sm sm:p-5">
            <div class="mb-4 flex items-center justify-between">
              <h4 class="flex items-center gap-2 text-base font-semibold text-ink">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-warning text-xs font-semibold text-white">{{ index + 1 }}</span> 实习 {{ index + 1 }}
              </h4>
              <button v-if="internships.length > 1" class="link-text text-xs text-danger hover:text-red-500" @click="removeInternship(index)">
                <DeleteOutlined /> 删除
              </button>
            </div>
            <a-form layout="vertical">
              <a-row :gutter="[16, 0]">
                <a-col :xs="24" :sm="12">
                  <a-form-item label="公司名称">
                    <a-input :value="intern.company" placeholder="如：某互联网公司" class="input-field" @update:value="intern.company = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="岗位">
                    <a-input :value="intern.position" placeholder="如：前端开发实习生" class="input-field" @update:value="intern.position = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="开始时间">
                    <a-date-picker :value="intern.start_date" picker="month" value-format="YYYY.MM" placeholder="2024.06" class="input-field w-full" @update:value="intern.start_date = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="结束时间">
                    <a-date-picker :value="intern.end_date" picker="month" value-format="YYYY.MM" placeholder="2024.09" class="input-field w-full" @update:value="intern.end_date = $event" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="工作描述">
                    <a-textarea :value="intern.description" :rows="2" placeholder="描述你的工作内容和成果" class="input-field" @update:value="intern.description = $event" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          </div>
          <button class="btn-ghost mt-4 w-full border-dashed py-2.5" @click="addInternship">
            <PlusOutlined /> 添加实习
          </button>
        </a-card>

        <div class="flex flex-col-reverse items-stretch justify-center gap-3 p-4 sm:flex-row sm:items-center">
          <button class="btn-ghost inline-flex h-10 min-w-[160px] items-center justify-center" @click="currentStep = 0">
            <ArrowLeftOutlined /> 上一步
          </button>
          <GradientButton class="inline-flex h-10 min-w-[160px] items-center justify-center" :loading="resumeStore.generating" @click="handleGenerate">
            <ThunderboltOutlined v-if="!resumeStore.generating" class="mr-1" />
            AI 生成简历
          </GradientButton>
        </div>
      </div>

      <!-- Step3: AI生成中（流式模板预览 + 动画） -->
      <div v-show="currentStep === 2">
        <a-card class="card-base mb-4 py-12 text-center" :bordered="false">
          <div class="mx-auto max-w-2xl">
            <div class="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <div class="absolute inset-0 animate-pulse rounded-full bg-brand/20 blur-xl" />
              <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-lighter">
                <a-spin size="large" class="text-brand-dark" />
              </div>
            </div>
            <h2 class="mb-2 text-xl font-semibold text-brand-dark">AI 正在为你生成专业简历...</h2>
            <p class="mb-2 text-sm text-muted">使用 STAR 法则优化项目描述，突出技术亮点</p>
            <div class="mb-6 flex items-center justify-center gap-1.5">
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 0ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand-light" style="animation-delay: 150ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-accent" style="animation-delay: 300ms" />
            </div>

            <div class="animate-fade-in rounded-card border border-line/50 bg-cream p-4 text-left sm:p-5">
              <StreamResumePreview
                :stream-text="resumeStore.streamText"
                :loading="resumeStore.generating"
              />
            </div>

            <div class="mt-6 rounded-card bg-cream p-5 text-left">
              <div
                v-for="(step, idx) in progressSteps"
                :key="idx"
                class="flex items-center gap-3 py-2 text-sm"
                :class="progressClass(idx)"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full text-xs"
                  :class="idx === progressIndex ? 'animate-spin' : ''"
                >
                  {{ idx < progressIndex ? '✓' : idx === progressIndex ? '⟳' : '○' }}
                </span>
                {{ step }}
              </div>
            </div>
            <p class="mt-6 text-xs text-warning">流式生成中，请耐心等待完成</p>
          </div>
        </a-card>
      </div>

      <!-- Step4: 生成成功 -->
      <div v-show="currentStep === 3">
        <a-card class="card-base mb-4 py-8" :bordered="false">
          <a-result status="success" title="🎉 简历生成成功！" sub-title="AI 已根据你的信息生成专业校招简历，前往编辑器进行预览、修改和导出">
            <template #extra>
              <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <GradientButton class="inline-flex h-10 items-center" @click="goToEditor">
                  <EditOutlined /> 进入编辑器
                </GradientButton>
                <GradientButton ghost class="inline-flex h-10 items-center" @click="currentStep = 0">
                  <ReloadOutlined /> 重新生成
                </GradientButton>
              </div>
            </template>
          </a-result>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined, PlusOutlined, ThunderboltOutlined,
  UserOutlined, CodeOutlined, BankOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, EditOutlined, ReloadOutlined,
} from '@ant-design/icons-vue'
import { useResumeStore } from '@/stores/resume'
import GradientButton from '@/components/GradientButton.vue'
import StreamResumePreview from './StreamResumePreview.vue'

const router = useRouter()
const resumeStore = useResumeStore()

// 读取首页 JD 输入模块暂存的内容
onMounted(() => {
  const pendingJd = sessionStorage.getItem('pending_jd')
  if (pendingJd) {
    basicForm.target_position = pendingJd
    sessionStorage.removeItem('pending_jd')
  }
})

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

const progressSteps = [
  '分析基本信息',
  '优化项目描述',
  '生成个人评价中...',
  '整理技能标签',
]

const progressIndex = computed(() => {
  if (currentStep.value !== 2) return progressSteps.length
  const len = resumeStore.streamText.length
  if (len > 800) return 3
  if (len > 400) return 2
  if (len > 100) return 1
  return 0
})

function progressClass(idx) {
  if (idx < progressIndex.value) return 'text-success'
  if (idx === progressIndex.value) return 'font-medium text-brand-dark'
  return 'text-muted'
}

function addProject() {
  projects.push({ name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' })
}

function removeProject(index) {
  projects.splice(index, 1)
}

function addInternship() {
  internships.push({ company: '', position: '', description: '', start_date: '', end_date: '' })
}

function removeInternship(index) {
  internships.splice(index, 1)
}

function nextStep() {
  if (!basicForm.name || !basicForm.school || !basicForm.major || !basicForm.education || !basicForm.target_position) {
    message.warning('请填写完必填项（姓名/学校/专业/学历/求职方向）')
    return
  }
  currentStep.value = 1
}

// 项目经历非必填，允许空数组传入 AI
async function handleGenerate() {
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
:deep(.ant-card-head) {
  @apply border-b border-line/70 px-6;
}

:deep(.ant-card-body) {
  @apply px-4 py-5 sm:px-6;
}

:deep(.ant-form-item-label > label) {
  @apply text-sm font-medium text-ink-secondary;
}

:deep(.gen-steps .ant-steps-item-process .ant-steps-item-icon) {
  @apply border-brand-dark bg-brand-dark;
}

:deep(.gen-steps .ant-steps-item-finish .ant-steps-item-icon) {
  @apply border-brand-dark text-brand-dark;
}

:deep(.gen-steps .ant-steps-item-finish .ant-steps-item-tail::after) {
  @apply bg-brand;
}

:deep(.gen-steps .ant-steps-item-title) {
  @apply text-sm font-medium text-ink;
}

:deep(.gen-steps .ant-steps-item-description) {
  @apply text-xs text-muted;
}

/* 项目描述输入框：单层边框 + 更大书写区域 */
:deep(.project-desc-field.ant-input-textarea-show-count) {
  @apply relative border-0 bg-transparent p-0 shadow-none;
}

:deep(.project-desc-field textarea.ant-input) {
  @apply min-h-[120px] resize-y rounded-button border border-line bg-white/80 px-4 py-2.5 pb-8 text-sm leading-relaxed text-ink placeholder:text-muted transition-colors hover:border-brand/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15;
}

:deep(.project-desc-field.ant-input-textarea-show-count::after) {
  @apply absolute bottom-3 right-3 text-xs text-muted;
}
</style>
