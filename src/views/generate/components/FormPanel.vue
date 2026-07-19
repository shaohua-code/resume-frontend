<!--
  统一简历生成面板：顶部辅助识别回填表单；Tab 切换基本信息/教育/经历；底部固定 AI 操作。
-->
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useScrollToStreamPreview } from '@/composables/useScrollToStreamPreview'
import { useRouter } from 'vue-router'
import message from 'ant-design-vue/es/message'
import {
  AimOutlined,
  BulbOutlined,
  CheckCircleFilled,
  EditOutlined,
  ReadOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import JdResumeOptimizeModal from '@/components/JdResumeOptimizeModal.vue'
import { optimizeResumeByJdStream } from '@/api/resume'
import { useResumeStore } from '@/stores/resume'
import { getCurrentSessionOwner } from '@/utils/emailBindingGate'
import {
  createEmptyBasicForm,
  mergeRecognizedResume,
  normalizeResumeFields,
  syncFlatEducationFields,
  validateRequiredBasicFields,
} from '@/constants/resumeFieldSchema'
import RecognitionPanel from './RecognitionPanel.vue'
import ResumeBasicFieldsSection from './ResumeBasicFieldsSection.vue'
import ResumeEducationListSection from './ResumeEducationListSection.vue'
import ResumeExperienceSections from './ResumeExperienceSections.vue'
import StreamResumePreview from './StreamResumePreview.vue'
import { useGenerateDraft } from '../composables/useGenerateDraft'

const router = useRouter()
const resumeStore = useResumeStore()
/** 表单模块 Tab，交互对齐编辑器横向切换（仅渲染当前模块） */
const FORM_TABS = [
  { key: 'basic', title: '基本信息', hint: '姓名与岗位必填' },
  { key: 'education', title: '教育背景', hint: '选填' },
  { key: 'experience', title: '经历', hint: '选填' },
]
const activeFormTab = ref('basic')
const tabScrollRef = ref(null)
const basicFieldsRef = ref(null)
/** 生成/岗位优化结果锚点：开始流式时滚入视口 */
const generationPanelRef = ref(null)
const { scrollToStreamPreview } = useScrollToStreamPreview(generationPanelRef)

function selectFormTab(key) {
  activeFormTab.value = key
  nextTick(() => {
    const activeEl = tabScrollRef.value?.querySelector('[data-form-tab].is-active')
    activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  })
}
const recognitionRef = ref(null)
const recognitionLoading = ref(false)
const overLimitVisible = ref(false)
const jdOptimizeOpen = ref(false)
const pendingAction = ref(null)
const operationStarting = ref(false)
const pageSessionOwner = getCurrentSessionOwner()
let activeOperationController = null

const emptyProject = () => ({ name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' })
const emptyInternship = () => ({ company: '', position: '', description: '', start_date: '', end_date: '' })
const emptyWorkExperience = () => ({ company: '', position: '', department: '', description: '', start_date: '', end_date: '' })
const emptyGeneration = () => ({
  phase: 'idle',
  kind: 'generate',
  status: '',
  streamText: '',
  result: null,
  notes: [],
  resumeId: null,
  saveRequestId: '',
  lastJdText: '',
})

/** 为一次 AI 结果生成稳定保存键；重试保存复用该键，不会重复创建简历。 */
function createSaveRequestId() {
  return globalThis.crypto?.randomUUID?.()
    || `resume-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

const { state: draft, clear: clearDraft, persist: persistDraft } = useGenerateDraft(
  'ai-resume-unified-form-draft-v2',
  {
    currentStep: 0,
    basic: { ...createEmptyBasicForm(), skills: '', awards: '', certificates: '' },
    educations: [],
    projects: [emptyProject()],
    internships: [emptyInternship()],
    workExperiences: [emptyWorkExperience()],
    generation: emptyGeneration(),
  },
)

// 兼容旧草稿缺失的新字段，防止模板直接读取 undefined。
draft.basic = { ...createEmptyBasicForm(), skills: '', awards: '', certificates: '', ...(draft.basic || {}) }
draft.educations = Array.isArray(draft.educations) ? draft.educations : []
draft.projects = Array.isArray(draft.projects) && draft.projects.length ? draft.projects : [emptyProject()]
draft.internships = Array.isArray(draft.internships) && draft.internships.length ? draft.internships : [emptyInternship()]
draft.workExperiences = Array.isArray(draft.workExperiences) && draft.workExperiences.length
  ? draft.workExperiences
  : [emptyWorkExperience()]
draft.generation = { ...emptyGeneration(), ...(draft.generation || {}) }

// 刷新不自动重放付费请求；若最终结构已收到，则直接进入可重试保存态。
if (draft.generation.phase === 'streaming') {
  if (draft.generation.result && Object.keys(draft.generation.result).length) {
    draft.generation.phase = 'save_error'
    draft.generation.status = 'AI 结果已保留，请重试保存，无需重新生成'
    draft.generation.saveRequestId = draft.generation.saveRequestId || createSaveRequestId()
  } else {
    draft.generation.phase = 'interrupted'
    draft.generation.status = '页面刷新中断了上次生成，请检查已输出内容后手动重新生成'
  }
}
if (draft.generation.phase === 'save_error' && !draft.generation.saveRequestId) {
  draft.generation.saveRequestId = createSaveRequestId()
}

const generationLoading = computed(() => draft.generation.phase === 'streaming')
const formLocked = computed(() => recognitionLoading.value || generationLoading.value || operationStarting.value)
const hasGenerationPanel = computed(() => draft.generation.phase !== 'idle' || !!draft.generation.streamText)
const previewStreamText = computed(() => {
  // 完成或保存失败后以最终结构为权威预览；原始流仍在下方独立保留供核对。
  if (draft.generation.result && draft.generation.phase !== 'streaming') {
    return JSON.stringify(draft.generation.result, null, 2)
  }
  if (draft.generation.streamText) return draft.generation.streamText
  return draft.generation.result ? JSON.stringify(draft.generation.result, null, 2) : ''
})
const jdOptimizeResume = computed(() => getFormSnapshot())

onMounted(() => {
  const pendingJdKey = pageSessionOwner ? `pending_jd:${pageSessionOwner}` : ''
  const pendingJd = pendingJdKey ? sessionStorage.getItem(pendingJdKey) : ''
  if (pendingJd) {
    // 首页传来的是完整 JD，只预填岗位优化弹窗，绝不能污染“意向岗位”字段。
    draft.generation.lastJdText = pendingJd
    sessionStorage.removeItem(pendingJdKey)
  }
  // 固定旧键无法证明所属账号，升级后只清理不迁移，避免把上一账号的 JD 泄露给当前账号。
  sessionStorage.removeItem('pending_jd')

  // 只有本页草稿明确保存了 ID 才恢复，否则清除旧编辑器遗留状态。
  if (draft.generation.resumeId) {
    resumeStore.currentResumeId = draft.generation.resumeId
    resumeStore.currentResume = normalizeResumeFields(draft.generation.result || {})
  } else {
    resumeStore.resetGenerationContext()
  }
})

onBeforeUnmount(() => activeOperationController?.abort())

/** 每个付费流式操作只保留一个控制器，离页或新操作开始时可立即终止旧请求。 */
function createOperationController() {
  activeOperationController?.abort()
  activeOperationController = new AbortController()
  return activeOperationController
}

/** 将界面字段转换为后端统一简历结构，绝不读取旧 store 简历。 */
function getFormSnapshot() {
  const payload = {
    ...draft.basic,
    skills: String(draft.basic.skills || '').split(/[,，、]/).map((item) => item.trim()).filter(Boolean),
    awards: String(draft.basic.awards || '').split('\n').map((item) => item.trim()).filter(Boolean),
    certificates: String(draft.basic.certificates || '').split('\n').map((item) => item.trim()).filter(Boolean),
    educations: draft.educations.filter((item) => item.school || item.major || item.main_course || item.degree || item.start_date || item.end_date),
    projects: draft.projects
      .filter((item) => item.name || item.role || item.description || item.tech_stack || item.start_date || item.end_date)
      .map((item) => ({
        ...item,
        tech_stack: Array.isArray(item.tech_stack)
          ? item.tech_stack
          : String(item.tech_stack || '').split(/[,，、]/).map((value) => value.trim()).filter(Boolean),
      })),
    internships: draft.internships.filter((item) => (
      item.company || item.position || item.description || item.start_date || item.end_date
    )),
    work_experiences: draft.workExperiences.filter((item) => (
      item.company || item.position || item.department || item.description || item.start_date || item.end_date
    )),
  }
  return normalizeResumeFields(syncFlatEducationFields(payload))
}

/** 把识别结果写回唯一表单；空字段不会覆盖用户已有输入。 */
function applyRecognizedResume(recognized) {
  const merged = mergeRecognizedResume(getFormSnapshot(), recognized)
  Object.assign(draft.basic, {
    name: merged.name || '',
    target_position: merged.target_position || '',
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
    skills: (merged.skills || []).join('、'),
    awards: (merged.awards || []).join('\n'),
    certificates: (merged.certificates || []).join('\n'),
  })

  if (merged.educations?.length) draft.educations = merged.educations
  if (merged.projects?.length) {
    draft.projects = merged.projects.map((item) => ({
      ...item,
      tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack.join('、') : (item.tech_stack || ''),
    }))
  }
  if (merged.internships?.length) draft.internships = merged.internships
  if (merged.work_experiences?.length) draft.workExperiences = merged.work_experiences
}

async function validateBasicAndFocus() {
  // 必填失败时切回基本信息 Tab，方便用户补全
  selectFormTab('basic')
  await nextTick()
  const valid = await basicFieldsRef.value?.validate()
  const check = validateRequiredBasicFields(draft.basic)
  if (!valid || !check.ok) {
    message.warning(check.message || '请填写姓名和意向岗位')
    draft.currentStep = 0
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return false
  }
  draft.basic.name = check.name
  draft.basic.target_position = check.target_position
  return true
}

/** 新建达到上限时沿用既有二次确认；同一 ID 重新生成无需再检查数量。 */
async function runWithLimit(action) {
  if (resumeStore.currentResumeId) {
    await action()
    return
  }
  await resumeStore.fetchResumeCount()
  if (resumeStore.resumeTotal >= resumeStore.resumeMaxCount) {
    pendingAction.value = action
    overLimitVisible.value = true
    return
  }
  await action()
}

async function confirmOverLimit() {
  await runActionLocked(async () => {
    overLimitVisible.value = false
    const action = pendingAction.value
    pendingAction.value = null
    await action?.()
  })
}

/** 校验、数量查询和请求启动也纳入互斥区，阻止快速双击发起两个付费调用。 */
async function runActionLocked(action) {
  if (formLocked.value) return
  operationStarting.value = true
  try {
    return await action()
  } finally {
    operationStarting.value = false
  }
}

function beginGeneration(kind, status) {
  draft.generation.phase = 'streaming'
  draft.generation.kind = kind
  draft.generation.status = status
  draft.generation.streamText = ''
  draft.generation.result = null
  draft.generation.notes = []
  draft.generation.saveRequestId = createSaveRequestId()
  persistDraft()
  // 开始流式输出时把结果区滚入视口；预览内部由 StreamResumePreview 自动贴底
  scrollToStreamPreview({ behavior: 'smooth', block: 'start' })
}

/** 生成接口没有单独亮点字段时，根据实际输出模块生成可核对的摘要。 */
function buildHighlights(resume, kind, notes = []) {
  const provided = (Array.isArray(notes) ? notes : []).map((item) => String(item || '').trim()).filter(Boolean)
  if (provided.length) return provided

  const result = []
  if (resume.target_position) result.push(`围绕「${resume.target_position}」强化了岗位匹配表达`)
  if (resume.projects?.length || resume.internships?.length || resume.work_experiences?.length) {
    result.push('重组经历描述，突出行动、职责与可验证成果')
  }
  if (resume.skills?.length) result.push('整理核心技能关键词，便于招聘方快速定位优势')
  if (resume.summary) result.push('生成更聚焦的个人评价与职业定位')
  return result.length ? result : [kind === 'jd' ? '已结合岗位要求完成针对性优化' : '已完成简历结构与表达优化']
}

function completeGeneration(result, notes = []) {
  const normalized = normalizeResumeFields(result)
  draft.generation.result = normalized
  draft.generation.notes = buildHighlights(normalized, draft.generation.kind, notes)
  draft.generation.resumeId = resumeStore.currentResumeId
  draft.generation.phase = 'complete'
  draft.generation.status = '优化完成'
  if (!draft.generation.streamText) draft.generation.streamText = JSON.stringify(normalized, null, 2)
  persistDraft()
}

/** AI 完成后立即保存权威结构，落库失败时也能直接重试保存而无需再次调用模型。 */
function preserveGeneratedResult(result, notes = []) {
  const normalized = normalizeResumeFields(result)
  draft.generation.result = normalized
  draft.generation.notes = buildHighlights(normalized, draft.generation.kind, notes)
  persistDraft()
  return normalized
}

async function executeGenerate() {
  const controller = createOperationController()
  beginGeneration('generate', 'AI 正在生成并优化简历...')
  try {
    const outcome = await resumeStore.generateResume(getFormSnapshot(), {
      signal: controller.signal,
      clientRequestId: draft.generation.saveRequestId,
      onStatus: (status) => {
        draft.generation.status = status || 'AI 正在生成并优化简历...'
      },
      onChunk: (chunk) => {
        draft.generation.streamText += chunk
        draft.generation.status = 'AI 正在流式输出简历内容...'
      },
      onResult: (result) => preserveGeneratedResult(result),
    })

    if (outcome?.persisted) {
      completeGeneration(outcome.resume)
    } else if (outcome?.resume && outcome?.persistError) {
      preserveGeneratedResult(outcome.resume)
      draft.generation.phase = 'save_error'
      draft.generation.status = 'AI 已生成完成，但保存失败，请直接重试保存'
    } else if (outcome?.cancelled) {
      draft.generation.phase = outcome.resume ? 'interrupted' : 'cancelled'
      draft.generation.status = outcome.resume
        ? '登录状态已变化，已保留生成结果但未保存'
        : '已取消邮箱验证，本次生成未执行'
    } else if (draft.generation.phase === 'streaming') {
      draft.generation.phase = 'error'
      draft.generation.status = '生成未完成，请检查已输出内容后重试'
    }
  } finally {
    if (activeOperationController === controller) activeOperationController = null
  }
}

async function handleGenerate() {
  await runActionLocked(async () => {
    if (!(await validateBasicAndFocus())) return
    await runWithLimit(executeGenerate)
  })
}

async function openJdOptimize() {
  await runActionLocked(async () => {
    if (!(await validateBasicAndFocus())) return
    jdOptimizeOpen.value = true
  })
}

async function executeJdOptimize(jdText) {
  const controller = createOperationController()
  const sessionOwner = getCurrentSessionOwner()
  const snapshot = getFormSnapshot()
  beginGeneration('jd', 'AI 正在结合岗位要求优化简历...')
  draft.generation.lastJdText = jdText
  let finalData = null

  try {
    const returned = await optimizeResumeByJdStream(snapshot, jdText, {
      signal: controller.signal,
      onStatus: (status) => {
        draft.generation.status = status || 'AI 正在结合岗位要求优化简历...'
      },
      onChunk: (chunk) => {
        draft.generation.streamText += chunk
        draft.generation.status = '岗位优化内容正在流式输出...'
      },
      onDone: (data) => {
        finalData = data
      },
    })
    finalData = finalData || returned
    const optimizedResume = finalData?.resume || finalData
    if (!optimizedResume || !Object.keys(optimizedResume).length) throw new Error('AI 未返回有效简历')
    const normalized = preserveGeneratedResult(optimizedResume, finalData?.optimization_notes || [])
    if (!sessionOwner || getCurrentSessionOwner() !== sessionOwner) {
      draft.generation.phase = 'interrupted'
      draft.generation.status = '登录状态已变化，已保留优化结果但未保存'
      return
    }
    try {
      const persisted = await resumeStore.persistGeneratedResume(normalized, {
        clientRequestId: draft.generation.saveRequestId,
      })
      completeGeneration(persisted, finalData?.optimization_notes || [])
      message.success('岗位优化完成')
    } catch {
      draft.generation.phase = 'save_error'
      draft.generation.status = '岗位优化已完成，但保存失败，请直接重试保存'
      message.error(draft.generation.status)
    }
  } catch (error) {
    if (error?.silent) {
      draft.generation.phase = 'cancelled'
      draft.generation.status = '已取消邮箱验证，本次优化未执行'
      return
    }
    draft.generation.phase = 'error'
    draft.generation.status = error?.message || '岗位优化失败，请重试'
    message.error(draft.generation.status)
  } finally {
    if (activeOperationController === controller) activeOperationController = null
  }
}

async function handleJdConfirmStart({ jdText }) {
  await runActionLocked(async () => {
    const trimmed = String(jdText || '').trim()
    if (!trimmed) return
    await runWithLimit(() => executeJdOptimize(trimmed))
  })
}

async function restartGeneration() {
  await runActionLocked(async () => {
    if (!(await validateBasicAndFocus())) return
    if (draft.generation.kind === 'jd') {
      if (!draft.generation.lastJdText) {
        jdOptimizeOpen.value = true
        return
      }
      await runWithLimit(() => executeJdOptimize(draft.generation.lastJdText))
      return
    }
    await runWithLimit(executeGenerate)
  })
}

/** 只重试数据库保存，不重复调用已计费的 AI。 */
async function retrySaveResult() {
  await runActionLocked(async () => {
    if (!draft.generation.result) return
    if (!pageSessionOwner || getCurrentSessionOwner() !== pageSessionOwner) {
      message.warning('登录状态已变化，请重新进入生成页')
      return
    }
    try {
      const persisted = await resumeStore.persistGeneratedResume(draft.generation.result, {
        clientRequestId: draft.generation.saveRequestId,
      })
      completeGeneration(persisted, draft.generation.notes)
      message.success('简历保存成功')
    } catch {
      draft.generation.phase = 'save_error'
      draft.generation.status = '保存仍未成功，请稍后重试；AI 结果已为你保留'
      message.error(draft.generation.status)
    }
  })
}

async function goToEditor() {
  const id = resumeStore.currentResumeId || draft.generation.resumeId
  if (!id) {
    message.warning('简历尚未保存成功，请重新生成后再进入编辑器')
    return
  }
  resumeStore.currentResume = normalizeResumeFields(draft.generation.result || {})
  resumeStore.currentResumeId = id
  // 子组件会在导航完成时卸载，因此两份草稿必须先清理。
  clearDraft()
  recognitionRef.value?.clearDraft?.()
  await router.push(`/editor/${encodeURIComponent(id)}`)
}
</script>

<template>
  <div class="mx-auto max-w-6xl pb-28 sm:pb-24">
    <RecognitionPanel
      ref="recognitionRef"
      :disabled="generationLoading || operationStarting"
      @loading-change="recognitionLoading = $event"
      @partial="applyRecognizedResume"
      @complete="applyRecognizedResume"
    />

    <!-- Tab + 内容同一外框；Tab 等分居中；表单内容限宽居中 -->
    <div class="relative mb-4 overflow-hidden rounded-card border border-line/60 bg-white shadow-sm">
      <div class="border-b border-line/40 bg-cream/50">
        <div ref="tabScrollRef" class="overflow-x-auto scrollbar-hide">
          <ul class="mx-auto flex w-full max-w-3xl items-stretch" role="tablist">
            <li
              v-for="tab in FORM_TABS"
              :key="tab.key"
              data-form-tab
              role="tab"
              :aria-selected="activeFormTab === tab.key"
              class="flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center border-b-2 border-transparent px-2 py-2.5 text-sm text-ink-secondary transition-colors duration-200 hover:text-brand-dark sm:px-4"
              :class="{
                'is-active border-b-brand-dark font-semibold text-brand-dark': activeFormTab === tab.key,
              }"
              @click="selectFormTab(tab.key)"
            >
              <span class="flex items-center justify-center gap-1.5">
                <UserOutlined v-if="tab.key === 'basic'" />
                <ReadOutlined v-else-if="tab.key === 'education'" />
                <AimOutlined v-else />
                <b class="font-semibold">{{ tab.title }}</b>
              </span>
              <span class="mt-0.5 text-center text-xs font-normal text-muted">{{ tab.hint }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="px-4 py-6 sm:px-8"
        :class="formLocked ? 'pointer-events-none select-none opacity-60' : ''"
        :inert="formLocked ? '' : null"
        :aria-busy="formLocked"
      >
        <!-- 内容区限宽居中，避免宽屏左右空、表单拉得过散 -->
        <div class="mx-auto w-full max-w-3xl">
          <template v-if="activeFormTab === 'basic'">
            <ResumeBasicFieldsSection
              ref="basicFieldsRef"
              v-model="draft.basic"
              :show-summary="false"
              :show-avatar="false"
              collapsible-advanced
              :disabled="formLocked"
            />
            <a-form layout="vertical" class="mt-4">
              <a-form-item label="技能标签">
                <a-input v-model:value="draft.basic.skills" class="input-field" placeholder="用逗号分隔，如：Vue3、JavaScript" />
              </a-form-item>
              <a-form-item label="获奖情况">
                <a-textarea v-model:value="draft.basic.awards" :rows="2" class="input-field" placeholder="每行一条" />
              </a-form-item>
              <a-form-item label="证书">
                <a-textarea v-model:value="draft.basic.certificates" :rows="2" class="input-field" placeholder="每行一条" />
              </a-form-item>
            </a-form>
          </template>

          <template v-else-if="activeFormTab === 'education'">
            <ResumeEducationListSection v-model="draft.educations" />
          </template>

          <template v-else>
            <ResumeExperienceSections
              v-model:projects="draft.projects"
              v-model:internships="draft.internships"
              v-model:work-experiences="draft.workExperiences"
            />
          </template>
        </div>
      </div>

      <!-- 锁定层只覆盖表单，生成结果仍持续可见 -->
      <div
        v-if="formLocked"
        class="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/20 pt-28 backdrop-blur-[1px]"
      >
        <div class="rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-brand-dark shadow-card">
          <a-spin size="small" class="mr-2" />{{ recognitionLoading ? '识别中，表单暂时锁定' : 'AI 输出中，表单暂时锁定' }}
        </div>
      </div>
    </div>

    <!-- 吸底操作栏：按钮组居中 -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 border-t border-line/50 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(31,41,55,0.06)] backdrop-blur-sm"
    >
      <div class="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:px-6">
        <GradientButton
          class="min-h-11 w-full justify-center sm:w-auto sm:min-w-[170px]"
          :loading="generationLoading && draft.generation.kind === 'generate'"
          :disabled="formLocked && !(generationLoading && draft.generation.kind === 'generate')"
          @click="handleGenerate"
        >
          <ThunderboltOutlined v-if="!generationLoading || draft.generation.kind !== 'generate'" />
          开始 AI 生成
        </GradientButton>
        <button
          type="button"
          class="btn-ghost min-h-11 w-full sm:w-auto sm:min-w-[180px]"
          :disabled="formLocked"
          @click="openJdOptimize"
        >
          <AimOutlined /> 按岗位优化简历
        </button>
      </div>
    </div>

    <!-- 流式结果：单层外框；生成/岗位优化时自动滚入并贴底 -->
    <div
      v-if="hasGenerationPanel"
      ref="generationPanelRef"
      class="mt-5 overflow-hidden rounded-card border border-line/40 bg-white px-4 py-5 sm:px-6"
    >
      <div class="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
        <a-spin v-if="generationLoading" size="small" />
        <CheckCircleFilled v-else-if="draft.generation.phase === 'complete'" class="text-success" />
        <span>{{ draft.generation.status || 'AI 处理结果' }}</span>
      </div>

      <div class="rounded-lg bg-cream/50 p-2 sm:p-4">
        <StreamResumePreview
          :stream-text="previewStreamText"
          :loading="generationLoading"
          :template-id="resumeStore.currentTemplateId"
          :loading-hint="draft.generation.status || 'AI 正在处理...'"
        />
      </div>

      <div v-if="['complete', 'save_error'].includes(draft.generation.phase)" class="mt-5 rounded-card bg-emerald-50/50 p-4">
        <h3 class="mb-3 flex items-center gap-2 font-semibold text-ink"><BulbOutlined class="text-warning" /> 本次优化亮点</h3>
        <ul class="space-y-2 text-sm text-ink-secondary">
          <li v-for="(note, index) in draft.generation.notes" :key="index" class="flex gap-2"><span class="text-success">✓</span><span>{{ note }}</span></li>
        </ul>
      </div>

      <div v-if="draft.generation.phase === 'complete'" class="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <GradientButton class="min-h-11 w-full justify-center sm:w-auto sm:min-w-[150px]" @click="goToEditor"><EditOutlined /> 进入编辑</GradientButton>
        <button type="button" class="btn-ghost min-h-11 w-full sm:w-auto sm:min-w-[150px]" @click="restartGeneration"><ReloadOutlined /> 重新生成</button>
      </div>
      <div v-else-if="draft.generation.phase === 'save_error'" class="mt-5 flex justify-center">
        <GradientButton class="min-h-11 w-full justify-center sm:w-auto sm:min-w-[170px]" @click="retrySaveResult">
          <ReloadOutlined /> 重试保存结果
        </GradientButton>
      </div>
      <div v-else-if="['error', 'interrupted'].includes(draft.generation.phase)" class="mt-5 flex justify-center">
        <button type="button" class="btn-ghost min-h-11 w-full sm:w-auto sm:min-w-[160px]" @click="restartGeneration"><ReloadOutlined /> 重新生成</button>
      </div>
    </div>

    <JdResumeOptimizeModal
      v-model:open="jdOptimizeOpen"
      :resume="jdOptimizeResume"
      :template-id="resumeStore.currentTemplateId"
      :initial-jd-text="draft.generation.lastJdText"
      @confirm-start="handleJdConfirmStart"
    />

    <a-modal v-model:open="overLimitVisible" title="简历数量超限提醒" ok-text="继续生成（替换最早一份）" cancel-text="取消" @ok="confirmOverLimit">
      <p class="py-2 text-sm leading-7 text-ink-secondary">每人最多保存 {{ resumeStore.resumeMaxCount }} 份简历。继续生成将替换最早的一份简历，请确认是否继续。</p>
    </a-modal>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
