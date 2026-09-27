<!--
  统一简历生成面板：顶部辅助识别回填表单；
  Tab 用 IntersectionObserver + fixed 吸顶（全局 overflow-x:hidden 会导致 sticky 失效）；
  底部两枚 AI 操作按钮横排固定。
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
import OptimizeDiffPanel from '@/components/OptimizeDiffPanel.vue'
import { optimizeResumeByJdStream } from '@/api/resume'
import { useResumeStore } from '@/stores/resume'
import { getCurrentSessionOwner } from '@/utils/emailBindingGate'
import {
  createEmptyBasicForm,
  mergeOptimizedResume,
  mergeRecognizedResume,
  normalizeResumeFields,
  syncFlatEducationFields,
  validateRequiredBasicFields,
} from '@/constants/resumeFieldSchema'
import {
  diffResumeSections,
  formatResumeSummary,
  snapshotResume,
} from '@/utils/optimizeDiff'
import {
  buildFallbackOptimizationNotes,
  normalizeOptimizationNotes,
  resolveOptimizationNotes,
} from '@/utils/optimizationNotes'
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
const tabSentinelRef = ref(null)
const tabBarRef = ref(null)
/** 是否已滚过原位，改用 fixed 贴在顶栏下（避开全局 overflow-x 导致 sticky 失效） */
const tabsStuck = ref(false)
const tabBarHeight = ref(0)
const basicFieldsRef = ref(null)
/** 生成/岗位优化结果锚点：开始流式时滚入视口 */
const generationPanelRef = ref(null)
const { scrollToStreamPreview } = useScrollToStreamPreview(generationPanelRef)
let tabStickObserver = null

function selectFormTab(key) {
  activeFormTab.value = key
  nextTick(() => {
    const activeEl = tabScrollRef.value?.querySelector('[data-form-tab].is-active')
    activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  })
}

/** 测量 Tab 高度，固定定位时用占位避免表单上跳 */
function syncTabBarHeight() {
  tabBarHeight.value = tabBarRef.value?.offsetHeight || 0
}

/** 监听哨兵：离开顶栏下方视口后启用吸顶副本态 */
function setupTabStickObserver() {
  if (typeof IntersectionObserver === 'undefined' || !tabSentinelRef.value) return
  tabStickObserver?.disconnect()
  // rootMargin 顶部 -64px：与 AppHeader h-16 对齐
  tabStickObserver = new IntersectionObserver(
    ([entry]) => {
      tabsStuck.value = !entry.isIntersecting
      nextTick(syncTabBarHeight)
    },
    { root: null, threshold: 0, rootMargin: '-64px 0px 0px 0px' },
  )
  tabStickObserver.observe(tabSentinelRef.value)
}
const recognitionRef = ref(null)
const recognitionLoading = ref(false)
const overLimitVisible = ref(false)
const jdOptimizeOpen = ref(false)
// 岗位优化对比：应用前不落库
const jdDiffOpen = ref(false)
const jdBeforeSnapshot = ref(null)
// 逐项应用累积稿（以优化前为底）；一键应用仍落库完整优化后结果
const jdPartialApplied = ref(null)
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
const hasGenerationPanel = computed(() => !['idle', 'cancelled'].includes(draft.generation.phase) || !!draft.generation.streamText)
const profileReadiness = computed(() => {
  const nameReady = !!String(draft.basic.name || '').trim()
  const positionReady = !!String(draft.basic.target_position || '').trim()
  const hasRecordContent = (record) => Object.values(record || {}).some((value) => (
    Array.isArray(value)
      ? value.some((item) => String(item ?? '').trim())
      : String(value ?? '').trim()
  ))
  const educationCount = draft.educations.filter(hasRecordContent).length
  const experienceCount = [
    ...draft.workExperiences,
    ...draft.internships,
    ...draft.projects,
  ].filter(hasRecordContent).length

  return {
    nameReady,
    positionReady,
    requiredCount: Number(nameReady) + Number(positionReady),
    percent: (Number(nameReady) + Number(positionReady)) * 50,
    educationCount,
    experienceCount,
  }
})
const previewStreamText = computed(() => {
  // 完成或保存失败后以最终结构为权威预览；原始流仍在下方独立保留供核对。
  if (draft.generation.result && draft.generation.phase !== 'streaming') {
    return JSON.stringify(draft.generation.result, null, 2)
  }
  if (draft.generation.streamText) return draft.generation.streamText
  return draft.generation.result ? JSON.stringify(draft.generation.result, null, 2) : ''
})
const jdOptimizeResume = computed(() => getFormSnapshot())

// 岗位优化对比面板数据
const jdBeforeSummary = computed(() => formatResumeSummary(jdBeforeSnapshot.value || {}))
const jdAfterSummary = computed(() => formatResumeSummary(draft.generation.result || {}))
const jdDiffSections = computed(() => {
  if (!jdBeforeSnapshot.value || !draft.generation.result) return []
  return diffResumeSections(jdBeforeSnapshot.value, draft.generation.result)
})
const jdDiffNotes = computed(() => displayOptimizationNotes.value)

/** 完成态始终可展示的亮点：草稿 notes → 按结果兜底 */
const displayOptimizationNotes = computed(() => {
  const existing = normalizeOptimizationNotes(draft.generation.notes)
  if (existing.length) return existing
  if (!['complete', 'save_error', 'review'].includes(draft.generation.phase)) return []
  if (!draft.generation.result) return []
  const mode = draft.generation.kind === 'jd' ? 'optimize' : 'generate'
  return buildFallbackOptimizationNotes(draft.generation.result, mode)
})

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

  nextTick(() => {
    syncTabBarHeight()
    setupTabStickObserver()
  })
  window.addEventListener('resize', syncTabBarHeight)
})

onBeforeUnmount(() => {
  activeOperationController?.abort()
  tabStickObserver?.disconnect()
  tabStickObserver = null
  window.removeEventListener('resize', syncTabBarHeight)
})

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
    summary: merged.summary || '',
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

/** 规范化亮点；为空时按简历内容兜底，保证完成态一定能展示总结 */
function ensureGenerationNotes(result, notes, mode = 'generate') {
  return resolveOptimizationNotes(
    { optimization_notes: notes },
    normalizeResumeFields(result || {}),
    mode,
  )
}

function completeGeneration(result, notes = []) {
  const normalized = normalizeResumeFields(result)
  const mode = draft.generation.kind === 'jd' ? 'optimize' : 'generate'
  draft.generation.result = normalized
  draft.generation.notes = ensureGenerationNotes(normalized, notes, mode)
  draft.generation.resumeId = resumeStore.currentResumeId
  draft.generation.phase = 'complete'
  draft.generation.status = '优化完成'
  if (!draft.generation.streamText) draft.generation.streamText = JSON.stringify(normalized, null, 2)
  persistDraft()
}

/** AI 完成后立即保存权威结构，落库失败时也能直接重试保存而无需再次调用模型。 */
function preserveGeneratedResult(result, notes) {
  const normalized = normalizeResumeFields(result)
  draft.generation.result = normalized
  // 显式传入 notes 时更新；未传则保留已有 AI 亮点（避免重试保存清空）
  if (notes !== undefined) {
    const mode = draft.generation.kind === 'jd' ? 'optimize' : 'generate'
    draft.generation.notes = ensureGenerationNotes(normalized, notes, mode)
  }
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
      onResult: (result, notes) => preserveGeneratedResult(result, notes),
    })

    if (outcome?.persisted) {
      completeGeneration(outcome.resume, outcome.optimizationNotes)
    } else if (outcome?.resume && outcome?.persistError) {
      preserveGeneratedResult(outcome.resume, outcome.optimizationNotes)
      draft.generation.phase = 'save_error'
      draft.generation.status = 'AI 已生成完成，但保存失败，请直接重试保存'
    } else if (outcome?.cancelled) {
      if (outcome.resume) preserveGeneratedResult(outcome.resume, outcome.optimizationNotes)
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
  // 冻结表单快照作为「优化前」，流式结果只进 generation，确认后再落库
  const snapshot = getFormSnapshot()
  jdBeforeSnapshot.value = snapshotResume(snapshot)
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
    // 仅本地保留结果，等待用户在对比面板确认后再 persist
    // 岗位优化亮点同样走统一解析（含兜底）
    preserveGeneratedResult(
      optimizedResume,
      resolveOptimizationNotes(finalData, optimizedResume, 'optimize'),
    )
    if (!sessionOwner || getCurrentSessionOwner() !== sessionOwner) {
      draft.generation.phase = 'interrupted'
      draft.generation.status = '登录状态已变化，已保留优化结果但未保存'
      return
    }
    draft.generation.phase = 'review'
    draft.generation.status = '岗位优化完成，请对比后选择应用或放弃'
    jdDiffOpen.value = true
    message.success('岗位优化完成，请对比后应用')
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

/**
 * 岗位优化：一键应用并落库
 * - 若已逐项选择：保存累积稿（优化前 + 已选项）
 * - 否则：保存完整优化后结果
 */
async function applyJdDiffAll() {
  const toSave = jdPartialApplied.value || draft.generation.result
  if (!toSave) return
  await persistJdOptimizeResult(toSave)
}

/**
 * 岗位优化：逐项把某分区并入累积稿（以优化前为底）
 * 点「一键应用」时若存在累积稿则只保存已选项
 */
function applyJdDiffSection(sectionKey) {
  if (!draft.generation.result || !jdBeforeSnapshot.value || !sectionKey) return
  if (!jdPartialApplied.value) {
    jdPartialApplied.value = snapshotResume(jdBeforeSnapshot.value)
  }
  jdPartialApplied.value = mergeOptimizedResume(
    jdPartialApplied.value,
    draft.generation.result,
    [sectionKey],
  )
  message.success('已加入待保存；可继续选择，或点「一键应用」保存已选内容')
}

/** 放弃岗位优化对比：不落库，清空结果 */
function discardJdDiff() {
  jdDiffOpen.value = false
  jdBeforeSnapshot.value = null
  jdPartialApplied.value = null
  draft.generation.phase = 'idle'
  draft.generation.result = null
  draft.generation.streamText = ''
  draft.generation.status = ''
  draft.generation.notes = []
  persistDraft()
  message.info('已放弃本次岗位优化结果')
}

/**
 * 将岗位优化结果落库并进入完成态
 * @param {object} resumeToSave
 */
async function persistJdOptimizeResult(resumeToSave) {
  if (!pageSessionOwner || getCurrentSessionOwner() !== pageSessionOwner) {
    message.warning('登录状态已变化，请重新进入生成页')
    return
  }
  const normalized = preserveGeneratedResult(resumeToSave, draft.generation.notes)
  try {
    const persisted = await resumeStore.persistGeneratedResume(normalized, {
      clientRequestId: draft.generation.saveRequestId,
      historyType: 'jd_resume_optimize',
    })
    completeGeneration(persisted, draft.generation.notes)
    jdDiffOpen.value = false
    jdBeforeSnapshot.value = null
    jdPartialApplied.value = null
    message.success('岗位优化已应用并保存')
  } catch {
    draft.generation.phase = 'save_error'
    draft.generation.status = '岗位优化已完成，但保存失败，请直接重试保存'
    message.error(draft.generation.status)
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
        historyType: draft.generation.kind === 'jd' ? 'jd_resume_optimize' : 'resume_generate',
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
  <div class="mx-auto max-w-[1500px] pb-28 sm:pb-24">
    <div class="generate-workspace" :class="{ 'has-result': hasGenerationPanel }">
      <main class="generate-main min-w-0">
    <RecognitionPanel
      ref="recognitionRef"
      :disabled="generationLoading || operationStarting"
      @loading-change="recognitionLoading = $event"
      @partial="applyRecognizedResume"
      @complete="applyRecognizedResume"
    />

    <!-- 哨兵：滚出顶栏下方后切换 Tab 为 fixed 吸顶 -->
    <div ref="tabSentinelRef" class="h-px w-full" aria-hidden="true" />

    <div
      ref="tabBarRef"
      class="z-30 border-b border-line/40 bg-cream/95 backdrop-blur-md"
      :class="tabsStuck
        ? 'fixed inset-x-0 top-16 shadow-[0_6px_16px_rgba(15,23,42,0.08)]'
        : 'relative rounded-t-card border border-b-0 border-line/60'"
    >
      <div ref="tabScrollRef" class="overflow-x-auto scrollbar-hide">
        <ul
          class="mx-auto flex w-full max-w-3xl items-stretch px-0 sm:px-0"
          role="tablist"
        >
          <li
            v-for="tab in FORM_TABS"
            :key="tab.key"
            data-form-tab
            role="tab"
            :aria-selected="activeFormTab === tab.key"
            class="resume-form-tab flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center border-b-2 border-transparent px-2 py-2.5 text-sm text-ink-secondary transition-colors duration-200 hover:text-brand-dark sm:px-4"
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

    <!-- fixed 后保留原高度，避免表单内容上窜 -->
    <div
      v-if="tabsStuck"
      class="w-full"
      :style="{ height: `${tabBarHeight}px` }"
      aria-hidden="true"
    />

    <div
      class="relative mb-4 overflow-hidden border border-line/60 bg-surface shadow-card"
      :class="tabsStuck ? 'rounded-card' : 'rounded-b-card border-t-0'"
    >
      <div
        class="px-3 py-4 sm:px-6 sm:py-6"
        :class="formLocked ? 'pointer-events-none select-none opacity-60' : ''"
        :inert="formLocked ? '' : null"
        :aria-busy="formLocked"
      >
        <!-- 内容区限宽居中，避免宽屏左右空、表单拉得过散 -->
        <div class="mx-auto w-full max-w-3xl">
          <template v-if="activeFormTab === 'basic'">
            <!-- 个人评价复用既有 summary 字段，保持选填并承接识别结果回填。 -->
            <ResumeBasicFieldsSection
              ref="basicFieldsRef"
              v-model="draft.basic"
              :show-summary="true"
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

      <!-- 锁定层只覆盖表单内容，不挡住吸顶 Tab -->
      <div
        v-if="formLocked"
        class="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-surface/20 pt-16 backdrop-blur-[1px]"
      >
        <div class="rounded-full bg-surface/95 px-4 py-2 text-sm font-medium text-brand-dark shadow-card">
          <a-spin size="small" class="mr-2" />{{ recognitionLoading ? '识别中，表单暂时锁定' : 'AI 输出中，表单暂时锁定' }}
        </div>
      </div>
    </div>

    <!-- 吸底操作栏按生成状态呈现下一步动作，避免完成后继续误点付费生成。 -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 border-t border-line/50 bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-card backdrop-blur-sm"
    >
      <div class="generate-action-bar">
        <p v-if="!hasGenerationPanel">填写姓名和意向岗位即可开始，生成后仍可逐项核对</p>
        <div class="flex flex-row items-center justify-center gap-2 sm:gap-3">
          <template v-if="draft.generation.phase === 'complete'">
            <GradientButton class="min-h-11 min-w-0 flex-1 justify-center px-2 text-sm sm:flex-none sm:min-w-[170px] sm:px-4 sm:text-base" @click="goToEditor">
              <EditOutlined /> 进入编辑
            </GradientButton>
            <button type="button" class="btn-ghost min-h-11 min-w-0 flex-1 px-2 text-sm sm:flex-none sm:min-w-[150px] sm:px-4 sm:text-base" @click="restartGeneration">
              <ReloadOutlined /> 重新生成
            </button>
          </template>
          <template v-else-if="draft.generation.phase === 'review'">
            <GradientButton class="min-h-11 min-w-0 flex-1 justify-center px-2 text-sm sm:flex-none sm:min-w-[190px] sm:px-4 sm:text-base" @click="jdDiffOpen = true">
              查看优化对比
            </GradientButton>
            <button type="button" class="btn-ghost min-h-11 min-w-0 flex-1 px-2 text-sm sm:flex-none sm:min-w-[140px] sm:px-4 sm:text-base" @click="discardJdDiff">
              放弃结果
            </button>
          </template>
          <template v-else-if="draft.generation.phase === 'save_error'">
            <GradientButton class="min-h-11 min-w-0 flex-1 justify-center px-2 text-sm sm:flex-none sm:min-w-[190px] sm:px-4 sm:text-base" @click="retrySaveResult">
              <ReloadOutlined /> 重试保存结果
            </GradientButton>
          </template>
          <template v-else-if="['error', 'interrupted'].includes(draft.generation.phase)">
            <GradientButton class="min-h-11 min-w-0 flex-1 justify-center px-2 text-sm sm:flex-none sm:min-w-[190px] sm:px-4 sm:text-base" @click="restartGeneration">
              <ReloadOutlined /> 重新尝试本次操作
            </GradientButton>
          </template>
          <template v-else>
            <GradientButton
              class="min-h-11 min-w-0 flex-1 justify-center px-2 text-sm sm:flex-none sm:min-w-[170px] sm:px-4 sm:text-base"
              :loading="generationLoading && draft.generation.kind === 'generate'"
              :disabled="formLocked && !(generationLoading && draft.generation.kind === 'generate')"
              @click="handleGenerate"
            >
              <ThunderboltOutlined v-if="!generationLoading || draft.generation.kind !== 'generate'" />
              开始 AI 生成
            </GradientButton>
            <button
              type="button"
              class="btn-ghost min-h-11 min-w-0 flex-1 px-2 text-sm sm:flex-none sm:min-w-[180px] sm:px-4 sm:text-base"
              :disabled="formLocked"
              @click="openJdOptimize"
            >
              <AimOutlined /> 按岗位优化简历
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 流式结果：单层外框；生成/岗位优化时自动滚入并贴底 -->
    <div
      v-if="hasGenerationPanel"
      ref="generationPanelRef"
      class="mt-5 overflow-hidden rounded-card border border-line/40 bg-surface px-4 py-5 sm:px-6"
    >
      <div class="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
        <a-spin v-if="generationLoading" size="small" />
        <CheckCircleFilled v-else-if="['complete', 'review'].includes(draft.generation.phase)" class="text-success" />
        <span>{{ draft.generation.status || 'AI 处理结果' }}</span>
      </div>

      <div class="generation-result-grid">
        <section class="generation-preview-card" aria-label="简历预览">
          <div v-if="!generationLoading && !previewStreamText" class="generation-empty-preview">
            <span aria-hidden="true">!</span>
            <strong>{{ draft.generation.status || '暂时没有可预览内容' }}</strong>
            <p>已填写的信息仍然保留，可以重新尝试本次操作。</p>
          </div>
          <StreamResumePreview
            v-else
            class="generate-stream-preview"
            :stream-text="previewStreamText"
            :loading="generationLoading"
            :scale="0.68"
            :template-id="resumeStore.currentTemplateId"
            :expand-completed-preview="true"
            :loading-hint="generationLoading ? (draft.generation.status || 'AI 正在处理...') : '简历预览'"
          />
        </section>

        <aside class="generation-summary-card" aria-label="结果说明">
          <template v-if="['error', 'interrupted'].includes(draft.generation.phase)">
            <p class="generation-summary-card__eyebrow">操作未完成</p>
            <h3>你的填写内容已保留</h3>
            <p class="generation-summary-card__copy">检查网络后，可以从底部重新尝试；不会清空已填写的简历信息。</p>
          </template>
          <template v-else-if="displayOptimizationNotes.length">
            <p class="generation-summary-card__eyebrow">本次优化</p>
            <h3>表达调整一览</h3>
            <ul class="generation-notes">
              <li v-for="(note, index) in displayOptimizationNotes" :key="index"><span>✓</span><span>{{ note }}</span></li>
            </ul>
          </template>
          <template v-else>
            <p class="generation-summary-card__eyebrow">下一步建议</p>
            <h3>先核对，再完善</h3>
            <p class="generation-summary-card__copy">预览用于快速检查整体结构。请确认联系方式、任职时间和项目成果准确，再进入编辑继续调整。</p>
            <ol class="generation-review-steps">
              <li><span>01</span>检查个人信息</li>
              <li><span>02</span>核对经历与成果</li>
              <li><span>03</span>进入编辑调整样式</li>
            </ol>
          </template>
          <div class="generation-trust-note"><BulbOutlined /><span>AI 负责整理表达，最终内容由你确认。</span></div>
        </aside>
      </div>
    </div>
    </main>

      <aside class="generate-aside" aria-label="简历准备情况">
        <section class="readiness-card">
          <div class="readiness-card__top">
            <div>
              <p class="readiness-card__eyebrow">创作进度</p>
              <h2>让简历从真实信息开始</h2>
            </div>
            <span class="readiness-card__count">{{ profileReadiness.requiredCount }}<small>/2</small></span>
          </div>
          <p class="readiness-card__caption">填写两项必需信息即可开始；其他经历可以稍后补充。</p>
          <div class="readiness-progress" role="progressbar" :aria-valuenow="profileReadiness.percent" aria-valuemin="0" aria-valuemax="100" aria-label="必填信息完成度">
            <span :style="{ width: `${profileReadiness.percent}%` }" />
          </div>
          <div class="readiness-list">
            <div class="readiness-row">
              <span class="readiness-row__mark" :class="{ 'is-ready': profileReadiness.nameReady }"><CheckCircleFilled v-if="profileReadiness.nameReady" /><i v-else /></span>
              <span>姓名</span>
              <span class="readiness-row__status">{{ profileReadiness.nameReady ? '已填写' : '待填写' }}</span>
            </div>
            <div class="readiness-row">
              <span class="readiness-row__mark" :class="{ 'is-ready': profileReadiness.positionReady }"><CheckCircleFilled v-if="profileReadiness.positionReady" /><i v-else /></span>
              <span>意向岗位</span>
              <span class="readiness-row__status">{{ profileReadiness.positionReady ? '已填写' : '待填写' }}</span>
            </div>
          </div>
        </section>

        <section class="experience-card">
          <p class="readiness-card__eyebrow">可选补充</p>
          <h2>让经历更完整</h2>
          <div class="experience-counts">
            <div><strong>{{ profileReadiness.educationCount }}</strong><span>段教育经历</span></div>
            <div><strong>{{ profileReadiness.experienceCount }}</strong><span>段工作或项目</span></div>
          </div>
          <p>暂时没有也没关系，生成后仍可在编辑器里继续完善。</p>
        </section>

        <section class="trust-card">
          <span class="trust-card__spark"><BulbOutlined /></span>
          <div>
            <h2>内容由你做主</h2>
            <p>识别只回填原文。AI 整理完成后，你可以先核对，再决定是否保存。</p>
          </div>
        </section>
      </aside>
    </div>

    <!-- 岗位优化前后对比：桌面左右栏，移动端 Tab；确认后才落库 -->
    <OptimizeDiffPanel
      v-model="jdDiffOpen"
      mode="resume"
      title="岗位优化对比"
      :before-summary="jdBeforeSummary"
      :after-summary="jdAfterSummary"
      :before-resume="jdBeforeSnapshot"
      :after-resume="draft.generation.result"
      :template-id="resumeStore.currentTemplateId"
      :sections="jdDiffSections"
      :notes="jdDiffNotes"
      apply-all-label="一键应用并保存"
      @apply-all="applyJdDiffAll"
      @apply-section="applyJdDiffSection"
      @discard="discardJdDiff"
    />

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

/* 三段表单导航使用轻量胶囊态，清楚标记进度又不做成后台标签栏。 */
.resume-form-tab { min-height: 62px; margin: 5px 3px; border: 0; border-radius: 13px; }
.resume-form-tab.is-active { border: 0; background: var(--color-brand-lighter); color: var(--color-brand-dark); }
.resume-form-tab > span:last-child { color: var(--color-ink-secondary); font-size: 10px; }

/* 桌面创作页采用工作区与真实表单准备度双栏；小屏完整保留单栏填写流。 */
.generate-workspace { display: grid; grid-template-columns: minmax(0, 1fr); align-items: start; gap: 20px; }
.generate-workspace.has-result { grid-template-columns: minmax(0, 1fr); }
.generate-aside { display: none; }
.generate-workspace.has-result .generate-aside { display: none; }
.generate-action-bar { display: flex; max-width: 1452px; margin: 0 auto; align-items: center; justify-content: space-between; gap: 20px; padding: 10px 24px; }
.generate-action-bar > p { margin: 0; color: var(--color-ink-secondary); font-size: 13px; }
.readiness-card, .experience-card { padding: 20px; border: 1px solid var(--color-line); border-radius: 18px; background: var(--color-surface); box-shadow: 0 10px 28px color-mix(in srgb, var(--color-ink) 5%, transparent); }
.readiness-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.readiness-card__eyebrow { margin: 0 0 7px; color: var(--color-brand-dark); font-size: 10px; font-weight: 800; letter-spacing: .12em; }
.readiness-card h2, .experience-card h2, .trust-card h2 { margin: 0; color: var(--color-ink); font-size: 16px; font-weight: 750; line-height: 1.4; }
.readiness-card__count { color: var(--color-brand-dark); font-size: 28px; font-weight: 800; line-height: 1; }
.readiness-card__count small { color: var(--color-muted); font-size: 13px; font-weight: 650; }
.readiness-card__caption { margin: 11px 0 14px; color: var(--color-ink-secondary); font-size: 12px; line-height: 1.65; }
.readiness-progress { height: 5px; overflow: hidden; border-radius: 999px; background: var(--color-brand-lighter); }
.readiness-progress > span { display: block; height: 100%; border-radius: inherit; background: var(--color-brand); transition: width 180ms ease; }
.readiness-list { display: grid; gap: 12px; margin-top: 18px; }
.readiness-row { display: flex; align-items: center; gap: 9px; color: var(--color-ink); font-size: 13px; }
.readiness-row__mark { display: grid; width: 18px; height: 18px; place-items: center; border: 1px solid var(--color-line); border-radius: 50%; color: var(--color-success); font-size: 17px; }
.readiness-row__mark i { width: 5px; height: 5px; border-radius: 50%; background: var(--color-muted); }
.readiness-row__mark.is-ready { border-color: transparent; }
.readiness-row__status { margin-left: auto; color: var(--color-muted); font-size: 11px; }
.experience-card { margin-top: 14px; }
.experience-counts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0 13px; }
.experience-counts > div { display: grid; gap: 3px; padding: 12px; border-radius: 12px; background: var(--color-cream); }
.experience-counts strong { color: var(--color-ink); font-size: 22px; line-height: 1.1; }
.experience-counts span { color: var(--color-ink-secondary); font-size: 10px; }
.experience-card > p:last-child { margin: 0; color: var(--color-ink-secondary); font-size: 11px; line-height: 1.7; }
.trust-card { display: flex; gap: 11px; margin-top: 14px; padding: 16px; border: 1px solid color-mix(in srgb, var(--color-brand) 16%, var(--color-line)); border-radius: 16px; background: color-mix(in srgb, var(--color-brand-lighter) 62%, var(--color-surface)); }
.trust-card__spark { display: grid; width: 30px; height: 30px; flex: 0 0 auto; place-items: center; border-radius: 10px; background: var(--color-surface); color: var(--color-brand-dark); }
.trust-card h2 { font-size: 13px; }
.trust-card p { margin: 5px 0 0; color: var(--color-ink-secondary); font-size: 11px; line-height: 1.7; }
.generation-result-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
.generation-preview-card { min-width: 0; overflow: hidden; padding: 14px; border: 1px solid var(--color-line); border-radius: 16px; background: color-mix(in srgb, var(--color-cream) 48%, var(--color-surface)); }
.generation-empty-preview { display: grid; min-height: 240px; align-content: center; justify-items: center; gap: 11px; padding: 26px; text-align: center; }
.generation-empty-preview > span { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--color-warning) 12%, white); color: var(--color-warning); font-size: 20px; font-weight: 800; }
.generation-empty-preview strong { color: var(--color-ink); font-size: 16px; }
.generation-empty-preview p { max-width: 360px; margin: 0; color: var(--color-ink-secondary); font-size: 12px; line-height: 1.7; }
.generation-summary-card { padding: 20px; border: 1px solid var(--color-line); border-radius: 16px; background: var(--color-surface); }
.generation-summary-card__eyebrow { margin: 0 0 8px; color: var(--color-brand-dark); font-size: 10px; font-weight: 800; letter-spacing: .12em; }
.generation-summary-card h3 { margin: 0; color: var(--color-ink); font-size: 17px; font-weight: 750; }
.generation-summary-card__copy { margin: 10px 0 0; color: var(--color-ink-secondary); font-size: 12px; line-height: 1.8; }
.generation-notes { display: grid; gap: 13px; margin: 17px 0 0; padding: 0; list-style: none; }
.generation-notes li { display: flex; gap: 9px; color: var(--color-ink-secondary); font-size: 12px; line-height: 1.7; }
.generation-notes li > span:first-child { display: grid; width: 18px; height: 18px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--color-success) 12%, white); color: var(--color-success); font-size: 11px; font-weight: 800; }
.generation-review-steps { display: grid; gap: 11px; margin: 17px 0 0; padding: 0; list-style: none; }
.generation-review-steps li { display: flex; align-items: center; gap: 10px; color: var(--color-ink-secondary); font-size: 12px; }
.generation-review-steps li > span { color: var(--color-brand-dark); font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.generation-trust-note { display: flex; gap: 8px; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--color-line); color: var(--color-muted); font-size: 11px; line-height: 1.6; }
.generation-trust-note :deep(.anticon) { flex: 0 0 auto; color: var(--color-brand-dark); }

@media (min-width: 1280px) {
  .generate-workspace { grid-template-columns: minmax(0, 1fr) 294px; gap: 22px; }
  .generate-aside { position: sticky; top: 86px; display: block; }
  .generation-result-grid { grid-template-columns: minmax(0, 794px) 286px; justify-content: center; gap: 18px; }
  .generation-preview-card { padding: 18px; }
}

@media (max-width: 767px) {
  .generate-action-bar { padding: 9px 12px; }
  .generate-action-bar > p { display: none; }
  .generation-preview-card { padding: 8px; }
  .generation-summary-card { padding: 16px; }
}
</style>
