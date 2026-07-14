<!--
  表单填写生成简历面板
  Step0~4：基本信息 → 教育背景 → 经历信息（项目/实习/工作）→ AI 生成 → 预览编辑
-->
<template>
  <div class="mx-auto max-w-6xl">
    <a-card class="card-base mb-4" :bordered="false">
      <a-steps :current="currentStep" class="gen-steps">
        <a-step title="基本信息" description="填写个人资料" />
        <a-step title="教育背景（选填）" description="就读与毕业信息" />
        <a-step title="经历信息（选填）" description="项目、实习与工作经历" />
        <a-step title="AI生成" description="智能生成简历" />
        <a-step title="预览编辑" description="进入编辑器" />
      </a-steps>
    </a-card>

    <div class="animate-slide-up">
      <!-- Step0: 基本信息 -->
      <div v-show="currentStep === 0">
        <a-alert
          message="提示"
          description="姓名与求职方向为必填项，其余字段选填，填写越完整 AI 生成质量越高。"
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
          <ResumeBasicFieldsSection ref="basicFieldsRef" v-model="basicForm" :show-summary="false" :show-avatar="false" />
          <a-form layout="vertical" class="mt-4">
            <a-row :gutter="[16, 0]">
              <a-col :xs="24" :sm="12">
                <a-form-item label="技能标签">
                  <a-input :value="basicForm.skills" placeholder="用逗号分隔，如：Vue3,JavaScript" size="large" class="input-field" @update:value="basicForm.skills = $event" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="获奖情况">
                  <a-textarea :value="basicForm.awards" :rows="2" placeholder="每行一条" class="input-field" @update:value="basicForm.awards = $event" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="证书">
                  <a-textarea :value="basicForm.certificates" :rows="2" placeholder="每行一条" class="input-field" @update:value="basicForm.certificates = $event" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>

        <div class="flex justify-center p-4">
          <GradientButton class="inline-flex h-10 min-w-[160px] items-center justify-center gap-2" @click="nextFromBasic">
            下一步：教育背景（选填）
            <ArrowRightOutlined />
          </GradientButton>
        </div>
      </div>

      <!-- Step1: 教育背景 -->
      <div v-show="currentStep === 1">
        <a-alert
          message="教育背景为选填"
          description="可添加多条教育经历，包括就读时间与毕业时间。"
          type="info"
          show-icon
          closable
          class="mb-4"
        />
        <a-card class="card-base mb-4" :bordered="false">
          <template #title>
            <span class="flex items-center gap-2 text-base font-semibold text-ink">
              <ReadOutlined /> 教育背景
            </span>
          </template>
          <ResumeEducationListSection v-model="educations" />
        </a-card>
        <div class="flex flex-col-reverse items-stretch justify-center gap-3 p-4 sm:flex-row sm:items-center">
          <button class="btn-ghost inline-flex h-10 min-w-[160px] items-center justify-center" @click="currentStep = 0">
            <ArrowLeftOutlined /> 上一步
          </button>
          <GradientButton class="inline-flex h-10 min-w-[160px] items-center justify-center gap-2" @click="currentStep = 2">
            下一步：经历信息（选填）
            <ArrowRightOutlined />
          </GradientButton>
        </div>
      </div>

      <!-- Step2: 项目、实习与正式工作经历（选填） -->
      <div v-show="currentStep === 2">
        <a-alert
          message="经历信息均为选填，填写越详细 AI 生成质量越高"
          description="可填写项目、实习或正式工作经历。AI 会结合目标岗位和真实信息，用 STAR 法则优化表达。"
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
                  <a-form-item label="专业技能 / 工具">
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
                    <a-input :value="intern.company" placeholder="如：某公司 / 医院 / 学校 / 机构" class="input-field" @update:value="intern.company = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="岗位">
                    <a-input :value="intern.position" placeholder="如：运营实习生 / 助教 / 工程实习生" class="input-field" @update:value="intern.position = $event" />
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

        <!-- 工作经历（正式全职工作，选填） -->
        <a-card class="card-base mb-4" :bordered="false">
          <template #title>
            <span class="flex items-center gap-2 text-base font-semibold text-ink">
              <BankOutlined /> 工作经历（选填）
              <span class="badge">{{ workExperiences.filter(w => w.company || w.description).length }} 段工作</span>
            </span>
          </template>
          <div class="space-y-4">
          <div v-for="(exp, index) in workExperiences" :key="index" class="rounded-card border border-line/50 bg-canvas/50 p-4 transition-shadow duration-200 hover:shadow-sm sm:p-5">
            <div class="mb-4 flex items-center justify-between">
              <h4 class="flex items-center gap-2 text-base font-semibold text-ink">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark text-xs font-semibold text-white">{{ index + 1 }}</span> 工作 {{ index + 1 }}
              </h4>
              <button v-if="workExperiences.length > 1" class="link-text text-xs text-danger hover:text-red-500" @click="removeWorkExperience(index)">
                <DeleteOutlined /> 删除
              </button>
            </div>
            <a-form layout="vertical">
              <a-row :gutter="[16, 0]">
                <a-col :xs="24" :sm="12">
                  <a-form-item label="公司名称">
                    <a-input :value="exp.company" placeholder="如：某科技有限公司" class="input-field" @update:value="exp.company = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="岗位">
                    <a-input :value="exp.position" placeholder="如：销售顾问 / 会计 / 工程师" class="input-field" @update:value="exp.position = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="部门（选填）">
                    <a-input :value="exp.department" placeholder="如：技术研发部" class="input-field" @update:value="exp.department = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="开始时间">
                    <a-date-picker :value="exp.start_date" picker="month" value-format="YYYY.MM" placeholder="2023.01" class="input-field w-full" @update:value="exp.start_date = $event" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="结束时间">
                    <a-date-picker :value="exp.end_date" picker="month" value-format="YYYY.MM" placeholder="2024.06 或 至今" class="input-field w-full" @update:value="exp.end_date = $event" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="工作描述（简单描述即可，AI 会自动优化）">
                    <a-textarea
                      :value="exp.description"
                      :auto-size="{ minRows: 4, maxRows: 8 }"
                      :maxlength="500"
                      show-count
                      placeholder="例如：负责公司前端架构设计与核心业务开发，带领 3 人团队完成后台管理系统重构。AI 会自动用 STAR 法则改写为更专业的描述。"
                      class="project-desc-field"
                      @update:value="exp.description = $event"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          </div>
          <button class="btn-ghost mt-4 w-full border-dashed py-2.5" @click="addWorkExperience">
            <PlusOutlined /> 添加工作经历
          </button>
        </a-card>

        <div class="flex flex-col-reverse items-stretch justify-center gap-3 p-4 sm:flex-row sm:items-center">
          <button class="btn-ghost inline-flex h-10 min-w-[160px] items-center justify-center" @click="currentStep = 1">
            <ArrowLeftOutlined /> 上一步
          </button>
          <GradientButton class="inline-flex h-10 min-w-[160px] items-center justify-center" :loading="resumeStore.generating" @click="handleGenerate">
            <ThunderboltOutlined v-if="!resumeStore.generating" class="mr-1" />
            AI 生成简历
          </GradientButton>
          <button
            v-if="canShowJdOptimize"
            type="button"
            class="btn-ghost inline-flex h-10 min-w-[160px] items-center justify-center gap-1.5"
            @click="openJdOptimize"
          >
            <AimOutlined /> 按 JD 优化简历
          </button>
        </div>
      </div>

      <!-- Step3: AI生成中 -->
      <div v-show="currentStep === 3">
        <a-card class="card-base mb-4 py-12 text-center" :bordered="false">
          <div class="mx-auto max-w-2xl">
            <div class="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <div class="absolute inset-0 animate-pulse rounded-full bg-brand/20 blur-xl" />
              <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-lighter">
                <a-spin size="large" class="text-brand-dark" />
              </div>
            </div>
            <h2 class="mb-2 text-xl font-semibold text-brand-dark">
              {{ isJdOptimizing ? 'AI 正在根据岗位 JD 优化你的简历...' : 'AI 正在为你生成专业简历...' }}
            </h2>
            <p class="mb-2 text-sm text-muted">
              {{ isJdOptimizing ? '结合岗位 JD 与表单内容，针对性优化简历' : '结合目标行业优化经历描述，突出岗位优势' }}
            </p>
            <div class="mb-6 flex items-center justify-center gap-1.5">
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 0ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand-light" style="animation-delay: 150ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-accent" style="animation-delay: 300ms" />
            </div>

            <div class="animate-fade-in rounded-card border border-line/50 bg-cream p-4 text-left sm:p-5">
              <StreamResumePreview
                :stream-text="isJdOptimizing ? jdStreamText : resumeStore.streamText"
                :loading="isJdOptimizing ? jdLoading : resumeStore.generating"
                :template-id="resumeStore.currentTemplateId"
                :loading-hint="isJdOptimizing ? 'AI 正在根据岗位 JD 优化你的简历...' : undefined"
              />
            </div>

            <div v-if="!isJdOptimizing" class="mt-6 rounded-card bg-cream p-5 text-left">
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
            <p class="mt-6 text-xs text-warning">
              {{ isJdOptimizing ? 'JD 优化流式输出中，请耐心等待完成' : '流式生成中，请耐心等待完成' }}
            </p>
          </div>
        </a-card>
      </div>

      <!-- Step4: 生成成功 -->
      <div v-show="currentStep === 4">
        <a-card class="card-base mb-4 py-8" :bordered="false">
          <a-result status="success" title="🎉 简历生成成功！" sub-title="AI 已根据目标岗位生成专业求职简历，前往编辑器进行预览、修改和导出">
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

    <!-- 超过 5 份简历时的二次确认弹窗 -->
    <a-modal
      v-model:open="overLimitVisible"
      title="简历数量超限提醒"
      ok-text="继续生成（替换最后一份）"
      cancel-text="取消"
      @ok="confirmOverLimit"
    >
      <div class="py-2 text-sm leading-relaxed text-ink-secondary">
        每人最多生成 <span class="font-semibold text-danger">5</span> 份简历，继续生成将
        <span class="font-semibold text-danger">替换最后一份简历</span>，简历将无法找回。
        <br /><br />
        是否继续操作？
      </div>
    </a-modal>

    <!-- JD 优化弹窗：确定后跳转 Step3 页内流式预览 -->
    <JdResumeOptimizeModal
      v-model:open="jdOptimizeOpen"
      :resume="jdOptimizeResume"
      :template-id="resumeStore.currentTemplateId"
      @confirm-start="handleJdConfirmStart"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined, PlusOutlined, ThunderboltOutlined,
  UserOutlined, CodeOutlined, BankOutlined, ReadOutlined,
  ArrowLeftOutlined, ArrowRightOutlined, EditOutlined, ReloadOutlined,
  AimOutlined,
} from '@ant-design/icons-vue'
import { useResumeStore } from '@/stores/resume'
import { createResume as createApi } from '@/api/resume'
import GradientButton from '@/components/GradientButton.vue'
import JdResumeOptimizeModal from '@/components/JdResumeOptimizeModal.vue'
import StreamResumePreview from './StreamResumePreview.vue'
import { useJdResumeOptimize } from '@/composables/useJdResumeOptimize'
import ResumeBasicFieldsSection from './ResumeBasicFieldsSection.vue'
import ResumeEducationListSection from './ResumeEducationListSection.vue'
import { createEmptyBasicForm, syncFlatEducationFields, validateRequiredBasicFields, mergeOptimizedResume, normalizeResumeFields } from '@/constants/resumeFieldSchema'

const router = useRouter()
const resumeStore = useResumeStore()
const basicFieldsRef = ref(null)

// 读取首页 JD 输入模块暂存的内容
onMounted(() => {
  const pendingJd = sessionStorage.getItem('pending_jd')
  if (pendingJd) {
    basicForm.target_position = pendingJd
    sessionStorage.removeItem('pending_jd')
  }
})

const currentStep = ref(0)

// 超过 5 份简历时的二次确认弹窗状态
const overLimitVisible = ref(false)
// 标记是否已确认超限，避免重复弹窗
const overLimitConfirmed = ref(false)

const basicForm = reactive({
  ...createEmptyBasicForm(),
  skills: '',
  awards: '',
  certificates: '',
})

const educations = reactive([])

const projects = reactive([
  { name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' },
])

const internships = reactive([
  { company: '', position: '', description: '', start_date: '', end_date: '' },
])

// 工作经历列表（正式全职工作，区别于实习）
const workExperiences = reactive([
  { company: '', position: '', department: '', start_date: '', end_date: '', description: '' },
])

// JD 优化弹窗与页内流式状态
const jdOptimizeOpen = ref(false)
const jdOptimizeResume = ref({})
const isJdOptimizing = ref(false)
const pendingJdText = ref('')
const {
  streamText: jdStreamText,
  loading: jdLoading,
  optimizeResult: jdOptimizeResult,
  startOptimize: startJdOptimize,
} = useJdResumeOptimize()

// Step2 且已填姓名即可 JD 优化（不要求意向岗位）
const canShowJdOptimize = computed(() => {
  if (currentStep.value !== 2) return false
  return !!basicForm.name?.trim()
})

/** 打开 JD 优化输入弹窗 */
function openJdOptimize() {
  if (!basicForm.name?.trim()) {
    message.warning('请先填写姓名')
    return
  }
  jdOptimizeResume.value = getResumeSnapshot()
  jdOptimizeOpen.value = true
}

/** 执行 JD 流式优化并落库 */
async function runJdOptimize(jdText) {
  const snapshot = getResumeSnapshot()
  isJdOptimizing.value = true
  currentStep.value = 3

  const ok = await startJdOptimize(snapshot, {
    jdText,
    skipBasicCheck: true,
    successMessage: 'JD 优化完成',
  })

  if (ok && jdOptimizeResult.value?.resume) {
    resumeStore.currentResume = jdOptimizeResult.value.resume
    try {
      const createRes = await createApi({
        title: jdOptimizeResult.value.resume?.name
          ? `${jdOptimizeResult.value.resume.name}的简历`
          : '未命名简历',
        resume_json: jdOptimizeResult.value.resume,
        template_id: resumeStore.currentTemplateId || 1,
        score: 0,
      })
      if (createRes.success && createRes.data?.id) {
        resumeStore.currentResumeId = createRes.data.id
      }
    } catch (createErr) {
      console.warn('[FormPanel] JD 优化后自动创建简历失败:', createErr)
    }
    currentStep.value = 4
    overLimitConfirmed.value = false
  } else {
    currentStep.value = 2
  }
  isJdOptimizing.value = false
}

/** 弹窗确定：校验超限后进入 Step3 页内预览 */
async function handleJdConfirmStart({ jdText }) {
  if (!basicForm.name?.trim()) {
    message.warning('请先填写姓名')
    return
  }

  if (!overLimitConfirmed.value) {
    await resumeStore.fetchResumeCount()
    if (resumeStore.resumeTotal >= resumeStore.resumeMaxCount) {
      pendingJdText.value = jdText
      overLimitVisible.value = true
      return
    }
  }

  await runJdOptimize(jdText)
}

const progressSteps = [
  '分析基本信息',
  '优化项目描述',
  '生成个人评价中...',
  '整理技能标签',
]

const progressIndex = computed(() => {
  if (currentStep.value !== 3 || isJdOptimizing.value) return progressSteps.length
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

// ====== 工作经历增删方法 ======

/** 添加一条工作经历（正式全职工作） */
function addWorkExperience() {
  workExperiences.push({ company: '', position: '', department: '', start_date: '', end_date: '', description: '' })
}

/** 删除指定索引的工作经历 */
function removeWorkExperience(index) {
  workExperiences.splice(index, 1)
}

async function nextFromBasic() {
  const valid = await basicFieldsRef.value?.validate()
  if (!valid) return
  const check = validateRequiredBasicFields(basicForm)
  if (!check.ok) {
    message.warning(check.message)
    return
  }
  basicForm.name = check.name
  basicForm.target_position = check.target_position
  currentStep.value = 1
}

async function handleGenerate() {
  const valid = await basicFieldsRef.value?.validate()
  if (!valid) {
    currentStep.value = 0
    return
  }
  const check = validateRequiredBasicFields(basicForm)
  if (!check.ok) {
    message.warning(check.message)
    currentStep.value = 0
    return
  }
  basicForm.name = check.name
  basicForm.target_position = check.target_position

  if (!overLimitConfirmed.value) {
    await resumeStore.fetchResumeCount()
    if (resumeStore.resumeTotal >= resumeStore.resumeMaxCount) {
      overLimitVisible.value = true
      return
    }
  }

  currentStep.value = 3  // 跳转到 Step3（AI生成页）
  const payload = {
    ...basicForm,
    educations: educations.filter((e) => e.school || e.major || e.main_course || e.degree || e.start_date || e.end_date),
    projects: projects.filter((p) => p.name || p.description),
    internships: internships.filter((i) => i.company || i.description),
    // 新增：工作经历（正式全职工作）
    work_experiences: workExperiences.filter((w) => w.company || w.description),
  }
  syncFlatEducationFields(payload)
  const result = await resumeStore.generateResume(payload)
  if (result) {
    currentStep.value = 4  // 跳转到 Step4（生成成功页）
    overLimitConfirmed.value = false
  } else {
    currentStep.value = 2  // 失败回退到 Step2（经历信息页）
    overLimitConfirmed.value = false
  }
}

// 确认超限后继续生成或 JD 优化
async function confirmOverLimit() {
  overLimitVisible.value = false
  overLimitConfirmed.value = true
  if (pendingJdText.value) {
    const jd = pendingJdText.value
    pendingJdText.value = ''
    await runJdOptimize(jd)
    return
  }
  await handleGenerate()
}

function goToEditor() {
  router.push('/editor')
}

/**
 * 构建当前表单简历快照，供 JD 优化弹窗使用
 */
function getResumeSnapshot() {
  // 若已 AI 生成完成，优先使用 store 中的完整简历
  if (resumeStore.currentResume && Object.keys(resumeStore.currentResume).length) {
    return normalizeResumeFields({ ...resumeStore.currentResume })
  }
  const payload = {
    ...basicForm,
    skills: basicForm.skills
      ? basicForm.skills.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
      : [],
    awards: basicForm.awards ? basicForm.awards.split('\n').map((s) => s.trim()).filter(Boolean) : [],
    certificates: basicForm.certificates ? basicForm.certificates.split('\n').map((s) => s.trim()).filter(Boolean) : [],
    educations: educations.filter((e) => e.school || e.major || e.main_course || e.degree || e.start_date || e.end_date),
    projects: projects
      .filter((p) => p.name || p.description)
      .map((p) => ({
        ...p,
        tech_stack: p.tech_stack
          ? (Array.isArray(p.tech_stack) ? p.tech_stack : p.tech_stack.split(/[,，、]/).map((s) => s.trim()).filter(Boolean))
          : [],
      })),
    internships: internships.filter((i) => i.company || i.description),
    // 工作经历（供 JD 优化使用）
    work_experiences: workExperiences.filter((w) => w.company || w.description),
  }
  syncFlatEducationFields(payload)
  return normalizeResumeFields(payload)
}

/**
 * 用户确认应用 JD 优化结果后，合并到表单与 store
 */
function applyOptimizedResume(optimized) {
  const merged = mergeOptimizedResume(getResumeSnapshot(), optimized)
  // 回填基本信息
  Object.assign(basicForm, {
    name: merged.name || basicForm.name,
    target_position: merged.target_position || basicForm.target_position,
    phone: merged.phone || '',
    email: merged.email || '',
    work_years: merged.work_years || '',
    marital_status: merged.marital_status || undefined,
    height: merged.height || '',
    weight: merged.weight || '',
    ethnicity: merged.ethnicity || '',
    native_place: merged.native_place || '',
    political_status: merged.political_status || undefined,
    expected_salary: merged.expected_salary || '',
    custom_fields: merged.custom_fields || [],
    skills: Array.isArray(merged.skills) ? merged.skills.join('、') : '',
    awards: Array.isArray(merged.awards) ? merged.awards.join('\n') : '',
    certificates: Array.isArray(merged.certificates) ? merged.certificates.join('\n') : '',
    summary: merged.summary || '',
  })
  // 回填教育、项目、实习
  educations.splice(0, educations.length, ...(merged.educations || []))
  if (!educations.length) educations.push({ school: '', major: '', main_course: '', degree: '', start_date: '', end_date: '' })
  projects.splice(0, projects.length, ...(merged.projects || []).map((p) => ({
    name: p.name || '',
    role: p.role || '',
    description: p.description || '',
    tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join('、') : (p.tech_stack || ''),
    start_date: p.start_date || '',
    end_date: p.end_date || '',
  })))
  if (!projects.length) projects.push({ name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' })
  internships.splice(0, internships.length, ...(merged.internships || []))
  if (!internships.length) internships.push({ company: '', position: '', description: '', start_date: '', end_date: '' })
  resumeStore.currentResume = merged
  message.success('已应用 JD 优化结果')
}

defineExpose({ getResumeSnapshot, applyOptimizedResume })
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
