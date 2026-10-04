<!-- 用户私有题库：同一入口管理生成配置、套题历史与逐题练习。 -->
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { getCareerGoals } from '@/api/user'
import { getExtensionJobs } from '@/api/extensionJobs'
import {
  deleteInterviewQuestionSet,
  createInterviewAnswerReview,
  generateInterviewQuestions,
  getActiveInterviewQuestionJob,
  getInterviewQuestionJob,
  getInterviewQuestionSet,
  listInterviewAnswerReviews,
  listInterviewQuestionJobs,
  listInterviewQuestionSets,
  updateInterviewPractice,
} from '@/api/interviewQuestions'
import { useResumeStore } from '@/stores/resume'
import { formatDateTime } from '@/utils/date'
import { getErrorMessage } from '@/utils/errorMessage'

const props = defineProps({
  initialResumeId: { type: [String, Number], default: '' },
  autoGenerate: { type: Boolean, default: false },
})

const router = useRouter()
const resumeStore = useResumeStore()
const loading = ref(false)
const generating = ref(false)
const generationError = ref('')
const generationRequestKey = ref('')
const savingQuestion = ref('')
const loadError = ref('')
const sets = ref([])
const total = ref(0)
const goals = ref([])
const jobs = ref([])
const page = ref(1)
const keyword = ref('')
// 用明确的“全部练习状态”选项替代空白占位，避免移动端筛选框看起来像未渲染。
const statusFilter = ref('ALL')
const detailOpen = ref(false)
const selectedSet = ref(null)
const activeJob = ref(null)
const focusedJob = ref(null)
const recentJobs = ref([])
const reviewLoadingQuestion = ref('')
const reviewHistory = reactive({})
const reviewHistoryLoaded = reactive({})
const reviewExpanded = reactive({})
let jobPollTimer = null
let jobPollBusy = false
let lastCompletedNoticeId = ''
const generationOpen = ref(false)
const selectedResumeId = ref(null)
const selectedGoalId = ref(null)
const selectedJobId = ref(null)
const targetPosition = ref('')
const jdText = ref('')
const questionCount = ref(10)
const categories = ref(['professional', 'project', 'behavioral', 'gap'])
const avoidHistory = ref(true)
const drafts = reactive({})

// 所有筛选只查询当前登录账号的资源；分类名称只用于展示，不改写模型题目。
const CATEGORY_LABELS = {
  professional: '专业能力',
  project: '项目深挖',
  behavioral: '行为面试',
  gap: '岗位匹配与短板',
  reverse: '反问面试官',
}
// 说明每类问题通常覆盖的能力，避免用户只看到选项名称却不清楚侧重差异。
const CATEGORY_DESCRIPTIONS = {
  professional: '技术、专业知识与岗位基础能力',
  project: '项目决策、个人贡献与结果复盘',
  behavioral: '沟通协作、冲突处理与行为案例',
  gap: '岗位要求、经验短板与补足思路',
  reverse: '适合向面试官提出的岗位问题',
}
const PRACTICE_LABELS = { todo: '待练习', practiced: '已练习', mastered: '已掌握' }
const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value, label, description: CATEGORY_DESCRIPTIONS[value],
}))
const resumeOptions = computed(() => (resumeStore.resumeList || []).map((resume) => ({
  value: String(resume.id), label: resume.title || `简历 #${resume.id}`,
})))
const selectedQuestionCount = computed(() => selectedSet.value?.questions?.length || 0)
const displayedJob = computed(() => activeJob.value || focusedJob.value)
const generationProgress = computed(() => displayedJob.value?.total_count
  ? Math.min(100, Math.round((displayedJob.value.generated_count / displayedJob.value.total_count) * 100))
  : 0)
const generationStages = [
  { key: 'preparing', label: '准备信息' },
  { key: 'connecting', label: '连接模型' },
  { key: 'model', label: '模型处理中' },
  { key: 'validating', label: '整理题目' },
  { key: 'saving', label: '保存题库' },
]
const jobStageIndex = computed(() => {
  const stage = displayedJob.value?.stage
  if (stage === 'completed') return generationStages.length
  if (stage === 'failed') return -1
  if (['quota_check', 'preparing'].includes(stage)) return 0
  if (stage === 'connecting') return 1
  if (['model', 'generating'].includes(stage)) return 2
  if (stage === 'validating') return 3
  if (stage === 'saving') return 4
  return 0
})
const startButtonLabel = computed(() => isActiveJob(activeJob.value) ? '查看生成进度' : '生成专属面试题')

function isActiveJob(job) {
  return ['queued', 'running'].includes(job?.status)
}

// 任务详情路由只接受正整数 ID；阻止空闲响应或不完整记录开启无效轮询。
function isValidJobId(jobId) {
  return /^[1-9]\d*$/.test(String(jobId ?? '').trim())
}

function generationJobTitle(job) {
  if (job?.status === 'completed') return '题目已生成并保存'
  if (job?.status === 'failed') return '本次生成未完成'
  return job?.status_message || '正在后台生成面试题'
}

function generationJobStageLabel(job) {
  if (job?.status === 'queued') return '排队中，后台即将开始处理'
  if (job?.status === 'completed') return '生成完成'
  if (job?.status === 'failed') return job?.error_message || '任务已停止，可检查已生成题目后重新发起'
  return job?.status_message || '后台正在处理'
}

// 普通安全上下文优先生成 UUID；局域网 HTTP 等非安全上下文使用随机值加时间戳作幂等键。
function createRequestKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  // UUID 只作请求幂等键，不用于身份认证；该兼容分支覆盖局域网 HTTP 非安全上下文。
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16)
    return (token === 'x' ? random : (random & 3) | 8).toString(16)
  })
}

function setStartContext(resumeId = '') {
  if (isActiveJob(activeJob.value)) {
    focusedJob.value = activeJob.value
    message.info('当前已有一套题目在后台生成，可先查看进度')
    return
  }
  selectedResumeId.value = resumeId ? String(resumeId) : null
  selectedGoalId.value = null
  selectedJobId.value = null
  targetPosition.value = ''
  jdText.value = ''
  generationError.value = ''
  generationRequestKey.value = createRequestKey()
  generationOpen.value = true
}

function applyGoal() {
  const goal = goals.value.find((item) => String(item.id) === String(selectedGoalId.value))
  if (goal) targetPosition.value = goal.job_direction || goal.name || targetPosition.value
}

function applyJob() {
  const job = jobs.value.find((item) => String(item.id) === String(selectedJobId.value))
  if (job) {
    targetPosition.value = job.title || targetPosition.value
    jdText.value = job.jd_text || ''
    selectedGoalId.value = job.career_goal_id ? String(job.career_goal_id) : null
  }
}

async function loadSets() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await listInterviewQuestionSets({
      page: page.value, size: 10, keyword: keyword.value.trim(), status: statusFilter.value && statusFilter.value !== 'ALL' ? statusFilter.value : undefined,
    })
    sets.value = result.items || []
    total.value = result.total || 0
  } catch {
    sets.value = []
    total.value = 0
    loadError.value = '题库暂时无法加载，请检查连接后重试。'
  } finally {
    loading.value = false
  }
}

// 页面重新打开时读取本人最近任务；只有活动任务会持续轮询，失败任务仍保留查看入口。
async function loadRecentJobs() {
  try {
    const result = await listInterviewQuestionJobs({ limit: 10 })
    recentJobs.value = result.items || []
  } catch {
    recentJobs.value = []
  }
}

async function showJobProgress(jobId) {
  if (!isValidJobId(jobId)) return
  try {
    const job = await getInterviewQuestionJob(jobId)
    focusedJob.value = job
    if (isActiveJob(job)) {
      activeJob.value = job
      startJobPolling(job.id)
    }
  } catch {
    message.error('生成任务暂时无法读取，请刷新后重试。')
  }
}

async function pollGenerationJob(jobId) {
  if (!isValidJobId(jobId)) {
    stopJobPolling()
    activeJob.value = null
    if (!isValidJobId(focusedJob.value?.id)) focusedJob.value = null
    return
  }
  if (jobPollBusy) return
  jobPollBusy = true
  try {
    // 固定读取当前展示的任务，避免另一个新任务覆盖这张进度卡片。
    const job = await getInterviewQuestionJob(jobId)
    focusedJob.value = job
    activeJob.value = isActiveJob(job) ? job : null
    if (job.status === 'completed') {
      await loadSets()
      await loadRecentJobs()
      if (lastCompletedNoticeId !== String(job.id)) {
        lastCompletedNoticeId = String(job.id)
        message.success('专属面试题已生成，可在题库中开始练习')
      }
      stopJobPolling()
    } else if (job.status === 'failed') {
      await loadRecentJobs()
      stopJobPolling()
    } else if (String(job.id) !== String(jobId)) {
      startJobPolling(job.id)
    }
  } catch {
    // 网络短暂中断时保留上次任务状态，下一轮继续查询，不发起新的模型请求。
    if (focusedJob.value) focusedJob.value = { ...focusedJob.value, status_message: '连接暂时中断，正在重新查询任务进度' }
  } finally {
    jobPollBusy = false
  }
}

function startJobPolling(jobId) {
  stopJobPolling()
  if (!isValidJobId(jobId)) return
  jobPollTimer = window.setInterval(() => pollGenerationJob(jobId), 2000)
}

function stopJobPolling() {
  if (jobPollTimer) window.clearInterval(jobPollTimer)
  jobPollTimer = null
}

async function restoreGenerationJobs() {
  await loadRecentJobs()
  try {
    const job = await getActiveInterviewQuestionJob()
    activeJob.value = job || null
    if (job) {
      focusedJob.value = job
      startJobPolling(job.id)
    }
  } catch {
    activeJob.value = null
  }
}

async function openSet(setId) {
  try {
    const result = await getInterviewQuestionSet(setId)
    selectedSet.value = result
    for (const question of result.questions || []) {
      drafts[question.id] = {
        status: question.status || 'todo',
        answer_draft: question.answer_draft || '',
        reflection: question.reflection || '',
      }
      delete reviewHistory[question.id]
      delete reviewHistoryLoaded[question.id]
      reviewExpanded[question.id] = false
    }
    detailOpen.value = true
  } catch {
    message.error('这套面试题暂时无法打开，请刷新题库后重试。')
  }
}

async function generateSet() {
  if (!selectedResumeId.value) {
    message.warning('请先选择一份自己的简历')
    return
  }
  if (!targetPosition.value.trim()) {
    message.warning('请填写目标岗位')
    return
  }
  generating.value = true
  generationError.value = ''
  if (!generationRequestKey.value) generationRequestKey.value = createRequestKey()
  try {
    const response = await generateInterviewQuestions({
      resume_id: Number(selectedResumeId.value),
      career_goal_id: selectedGoalId.value ? Number(selectedGoalId.value) : undefined,
      saved_job_id: selectedJobId.value ? Number(selectedJobId.value) : undefined,
      target_position: targetPosition.value.trim(),
      jd_text: jdText.value.trim(),
      question_count: Number(questionCount.value),
      categories: categories.value,
      avoid_history: avoidHistory.value,
      request_key: generationRequestKey.value,
    })
    // 网络恢复后同一幂等键可能已对应完成套题，直接打开结果而不要求重新生成。
    if (response?.id && Array.isArray(response.questions)) {
      generationOpen.value = false
      page.value = 1
      await loadSets()
      await openSet(response.id)
      return
    }
    const jobId = response?.job_id || response?.id
    if (!jobId) throw new Error('任务已提交，但未收到任务编号，请刷新题库查看状态。')
    activeJob.value = { ...response, id: jobId, status: response.status || 'queued' }
    focusedJob.value = activeJob.value
    generationOpen.value = false
    await Promise.all([showJobProgress(jobId), loadRecentJobs()])
    startJobPolling(jobId)
    message.success('生成任务已提交，可离开页面；题目会在后台继续生成')
  } catch (error) {
    // 服务端返回活动任务 ID 时直接恢复其进度，避免重复提交模型调用。
    const activeJobId = error?.response?.data?.active_job_id || error?.response?.data?.data?.active_job_id
    if (activeJobId) {
      generationOpen.value = false
      await showJobProgress(activeJobId)
      return
    }
    generationError.value = error?.response?.data?.detail || error?.message || '生成任务提交失败，请检查简历、额度或模型配置后重试。'
    message.error(generationError.value)
  } finally {
    generating.value = false
  }
}

// 点评只读取服务端基于当前问题与简历快照得到的结果，回答原文仍由用户决定是否保存。
async function reviewAnswer(question) {
  const draft = drafts[question.id]
  const answer = String(draft?.answer_draft || '').trim()
  if (!answer) {
    message.warning('先填写你的回答，再让 AI 点评')
    return
  }
  reviewLoadingQuestion.value = String(question.id)
  try {
    const review = await createInterviewAnswerReview(selectedSet.value.id, question.id, answer)
    if (!reviewHistory[question.id]) reviewHistory[question.id] = []
    reviewHistory[question.id].unshift(review)
    delete reviewHistoryLoaded[question.id]
    reviewExpanded[question.id] = false
    question.answer_draft = answer
    question.status = 'practiced'
    drafts[question.id].status = 'practiced'
    message.success('回答点评已生成并保存')
  } catch (error) {
    // 点评接口失败前会把本次版本标记为 failed；刷新已展开的历史，避免界面长期停留在“处理中”。
    delete reviewHistoryLoaded[question.id]
    if (reviewExpanded[question.id]) {
      try {
        const result = await listInterviewAnswerReviews(selectedSet.value.id, question.id)
        reviewHistory[question.id] = result.items || []
        reviewHistoryLoaded[question.id] = true
      } catch {
        // 历史刷新失败不覆盖本次点评错误，用户仍可手动重新展开或刷新页面。
      }
    }
    message.error(getErrorMessage(error, 'AI 点评服务暂时无法连接，请稍后重试。'))
  } finally {
    reviewLoadingQuestion.value = ''
  }
}

// 每次点评保留回答快照，展开历史时按问题单独加载，避免一次打开题目就拉取全部历史正文。
async function toggleReviewHistory(question) {
  const questionId = String(question.id)
  reviewExpanded[questionId] = !reviewExpanded[questionId]
  if (!reviewExpanded[questionId] || reviewHistoryLoaded[question.id]) return
  reviewLoadingQuestion.value = `history-${questionId}`
  try {
    const result = await listInterviewAnswerReviews(selectedSet.value.id, question.id)
    reviewHistory[question.id] = result.items || []
    reviewHistoryLoaded[question.id] = true
  } catch (error) {
    reviewExpanded[questionId] = false
    message.error(error?.response?.data?.detail || '点评历史暂时无法加载，请重试。')
  } finally {
    reviewLoadingQuestion.value = ''
  }
}

function assessmentLabel(value) {
  return ({ strong: '回答扎实', partial: '基本覆盖', needs_revision: '建议修改', insufficient_evidence: '信息不足' })[value] || '点评结果'
}

function ratingLabel(value) {
  return ({ coverage: '问题覆盖度', evidence: '事实与证据', structure: '表达结构', clarity: '清晰度' })[value] || value
}

function reviewRubric(review) {
  const rubric = review?.review_result?.rubric || {}
  return Object.entries(rubric).map(([key, value]) => ({ label: ratingLabel(key), value }))
}

async function savePractice(question) {
  const draft = drafts[question.id]
  if (!draft) return
  savingQuestion.value = String(question.id)
  try {
    const result = await updateInterviewPractice(selectedSet.value.id, question.id, draft)
    Object.assign(draft, result)
    question.status = result.status
    question.answer_draft = result.answer_draft
    question.reflection = result.reflection
    await loadSets()
    message.success('练习记录已保存')
  } catch (error) {
    message.error(error?.response?.data?.detail || '练习记录保存失败，请重试。')
  } finally {
    savingQuestion.value = ''
  }
}

async function removeSet(setId) {
  try {
    await deleteInterviewQuestionSet(setId)
    if (selectedSet.value?.id === setId) detailOpen.value = false
    message.success('套题已删除')
    await loadSets()
  } catch (error) {
    message.error(error?.response?.data?.detail || '删除失败，请重试。')
  }
}

function searchSets() {
  page.value = 1
  loadSets()
}

function onPageChange(nextPage) {
  page.value = nextPage
  loadSets()
}

function practicePercent(record) {
  return record.question_count_actual
    ? Math.round((record.practiced_count / record.question_count_actual) * 100)
    : 0
}

watch([statusFilter], searchSets)

onMounted(async () => {
  await Promise.all([
    loadSets(),
    restoreGenerationJobs(),
    getCareerGoals().then((result) => { goals.value = result.goals || [] }).catch(() => {}),
    getExtensionJobs().then((result) => { jobs.value = result.jobs || [] }).catch(() => {}),
  ])
  if (props.autoGenerate) {
    // 先保留入口简历，再清除一次性 query，避免用户返回题库时重复弹出生成窗。
    setStartContext(props.initialResumeId)
    router.replace({ path: '/user', query: { tab: 'interview-bank' } })
  }
})

onBeforeUnmount(stopJobPolling)
</script>

<template>
  <div class="interview-bank">
    <div class="interview-bank__toolbar">
      <div class="interview-bank__filters">
        <a-input-search v-model:value="keyword" allow-clear placeholder="搜索目标岗位" @search="searchSets" />
        <a-select v-model:value="statusFilter" allow-clear placeholder="全部练习状态" @change="searchSets">
          <a-select-option value="ALL">全部练习状态</a-select-option>
          <a-select-option value="todo">待练习</a-select-option>
          <a-select-option value="practicing">练习中</a-select-option>
          <a-select-option value="mastered">已掌握</a-select-option>
        </a-select>
      </div>
      <button type="button" class="btn-primary min-h-11" @click="setStartContext()">{{ startButtonLabel }}</button>
    </div>

    <!-- 持久化任务离开页面后仍继续运行，进度卡展示可安全公开的阶段和已生成题目。 -->
    <section v-if="displayedJob" class="interview-job-card" aria-live="polite">
      <div class="interview-job-card__header">
        <div class="interview-job-card__heading">
          <span class="interview-job-card__pulse" :class="`is-${displayedJob.status}`"></span>
          <div><strong>{{ generationJobTitle(displayedJob) }}</strong><small>{{ displayedJob.target_position || '面试题生成任务' }} · 任务 #{{ displayedJob.id }}</small></div>
        </div>
        <span class="interview-job-card__state" :class="`is-${displayedJob.status}`">{{ displayedJob.status === 'queued' ? '排队中' : displayedJob.status === 'running' ? '生成中' : displayedJob.status === 'completed' ? '已完成' : '未完成' }}</span>
      </div>
      <p class="interview-job-card__message">{{ generationJobStageLabel(displayedJob) }}</p>
      <ol v-if="displayedJob.status !== 'failed'" class="generation-live__stages" aria-label="题目生成进度">
        <li v-for="(stage, index) in generationStages" :key="stage.key" :class="{ 'is-complete': index < jobStageIndex, 'is-active': index === jobStageIndex }">
          <span>{{ index < jobStageIndex ? '✓' : index + 1 }}</span><b>{{ stage.label }}</b>
        </li>
      </ol>
      <div v-if="displayedJob.total_count" class="interview-job-card__progress">
        <a-progress :percent="generationProgress" :status="displayedJob.status === 'failed' ? 'exception' : undefined" />
        <span>{{ displayedJob.generated_count || 0 }} / {{ displayedJob.total_count }} 道已生成</span>
      </div>
      <div v-if="displayedJob.questions?.length" class="interview-job-card__questions">
        <article v-for="(question, index) in displayedJob.questions" :key="question.id || index" class="generation-live__question">
          <div class="generation-live__question-top"><span class="generation-live__number">{{ String(index + 1).padStart(2, '0') }}</span><b>{{ question.question }}</b><span class="generation-live__category">{{ CATEGORY_LABELS[question.category] || '综合题' }}</span></div>
          <p v-if="question.evaluation_focus"><strong>考察点</strong>{{ question.evaluation_focus }}</p>
          <p v-if="question.resume_evidence"><strong>简历关联</strong>{{ question.resume_evidence }}</p>
        </article>
      </div>
      <div class="interview-job-card__actions">
        <button v-if="displayedJob.status === 'completed'" class="btn-primary-sm" @click="openSet(displayedJob.set_id)">开始练习</button>
        <button v-else-if="isActiveJob(displayedJob)" class="btn-ghost-sm" :disabled="jobPollBusy" @click="pollGenerationJob(displayedJob.id)">刷新状态</button>
        <button class="btn-ghost-sm" @click="focusedJob = null">收起进度</button>
      </div>
    </section>

    <section v-if="recentJobs.some((job) => String(job.id) !== String(displayedJob?.id))" class="interview-job-history">
      <div class="interview-job-history__heading"><strong>最近生成记录</strong><span>任务状态会保留，点开可查看已生成的题目</span></div>
      <div class="interview-job-history__list">
        <button v-for="job in recentJobs.filter((item) => String(item.id) !== String(displayedJob?.id)).slice(0, 5)" :key="job.id" type="button" class="interview-job-history__item" @click="showJobProgress(job.id)">
          <span><b>{{ job.target_position || `面试题任务 #${job.id}` }}</b><small>{{ formatDateTime(job.create_time) }} · {{ job.generated_count || 0 }}/{{ job.total_count }} 道</small></span>
          <i :class="`is-${job.status}`">{{ job.status === 'queued' ? '排队中' : job.status === 'running' ? '生成中' : job.status === 'completed' ? '已完成' : '未完成' }}</i>
        </button>
      </div>
    </section>

    <!-- 列表失败时保留可见错误和明确的重试按钮。 -->
    <div v-if="loadError" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger" role="alert">
      <span>{{ loadError }}</span>
      <button type="button" class="btn-ghost-sm" :disabled="loading" @click="loadSets">重试</button>
    </div>

    <a-spin :spinning="loading">
      <div v-if="sets.length" class="interview-bank__grid">
        <article v-for="item in sets" :key="item.id" class="interview-set-card">
          <div class="interview-set-card__top">
            <span class="interview-set-card__icon" aria-hidden="true">AI</span>
            <span class="interview-set-card__status">{{ PRACTICE_LABELS[item.practice_status] || '待练习' }}</span>
          </div>
          <h3>{{ item.target_position || '综合岗位' }}</h3>
          <p>{{ item.question_count_actual || item.question_count }} 道题 · {{ formatDateTime(item.create_time) }}</p>
          <div class="interview-set-card__progress">
            <a-progress :percent="practicePercent(item)" size="small" />
            <small>{{ item.practiced_count || 0 }} / {{ item.question_count_actual || item.question_count }} 已练习</small>
          </div>
          <div class="interview-set-card__actions">
            <button class="btn-primary-sm flex-1" @click="openSet(item.id)">继续练习</button>
            <a-popconfirm title="确定删除这套题目和练习记录？" @confirm="removeSet(item.id)">
              <button class="btn-ghost-sm text-danger">删除</button>
            </a-popconfirm>
          </div>
        </article>
      </div>
      <a-empty v-else-if="!loading && !loadError" :description="isActiveJob(activeJob) ? '你的题目正在后台生成，可以先离开页面，稍后回来查看进度。' : '还没有面试题，选择一份简历和目标岗位开始准备。'">
        <button class="btn-primary min-h-11" @click="setStartContext()">{{ isActiveJob(activeJob) ? '查看生成进度' : '生成第一套题目' }}</button>
      </a-empty>
    </a-spin>

    <div v-if="total > 10" class="mt-5 flex justify-center">
      <a-pagination :current="page" :page-size="10" :total="total" @change="onPageChange" />
    </div>

    <a-modal
      v-model:open="generationOpen"
      :width="'min(920px, calc(100vw - 32px))'"
      wrap-class-name="interview-generation-modal"
      :body-style="{ maxHeight: 'min(72vh, 680px)', overflowY: 'auto' }"
      :confirm-loading="generating"
      :closable="!generating"
      :mask-closable="!generating"
      :cancel-button-props="{ disabled: generating }"
      ok-text="生成题目"
      cancel-text="取消"
      @ok="generateSet"
    >
      <template #title>
        <div class="generation-modal-title">
          <strong>生成专属面试题</strong>
          <span>结合简历经历和目标岗位，生成可练习、可复盘的问题</span>
        </div>
      </template>
      <div class="generation-form">
        <label><span class="generation-form__label">关联简历 <i class="generation-form__required">必填</i></span><a-select v-model:value="selectedResumeId" :disabled="generating" class="w-full" placeholder="请选择用于生成题目的简历" :options="resumeOptions" /></label>
        <label v-if="goals.length"><span class="generation-form__label">求职目标 <i class="generation-form__optional">可选</i></span><a-select v-model:value="selectedGoalId" :disabled="generating" allow-clear class="w-full" placeholder="选择已有求职目标" @change="applyGoal"><a-select-option v-for="goal in goals.filter((item) => item.status === 'active')" :key="goal.id" :value="String(goal.id)">{{ goal.name }}</a-select-option></a-select></label>
        <label v-if="jobs.length"><span class="generation-form__label">收藏岗位 <i class="generation-form__optional">可选</i></span><a-select v-model:value="selectedJobId" :disabled="generating" allow-clear class="w-full" placeholder="选择岗位并自动带入 JD" @change="applyJob"><a-select-option v-for="job in jobs" :key="job.id" :value="String(job.id)">{{ job.title }}<template v-if="job.company"> · {{ job.company }}</template></a-select-option></a-select></label>
        <label><span class="generation-form__label">目标岗位 <i class="generation-form__required">必填</i></span><a-input v-model:value="targetPosition" :disabled="generating" maxlength="160" placeholder="填写岗位名称，例如：高级前端工程师" /></label>
        <label class="generation-form__jd"><span class="generation-form__label">岗位描述 <i class="generation-form__optional">可选</i></span><a-textarea v-model:value="jdText" :disabled="generating" :rows="3" :maxlength="12000" placeholder="粘贴岗位 JD；不填时会根据岗位名称和简历生成" /><small class="generation-form__jd-count">{{ jdText.length }} / 12000</small></label>
        <label><span class="generation-form__label">题目数量 <i class="generation-form__required">必填</i></span><a-select v-model:value="questionCount" :disabled="generating" class="w-full" placeholder="请选择题目数量"><a-select-option :value="10">10 道</a-select-option><a-select-option :value="20">20 道</a-select-option><a-select-option :value="30">30 道</a-select-option></a-select></label>
        <!-- 用整卡可点击的开关标注历史去重选项，并支持键盘聚焦与读屏状态。 -->
        <button type="button" class="generation-avoid-option" role="switch" :aria-checked="avoidHistory" :disabled="generating" @click="avoidHistory = !avoidHistory">
          <span class="generation-avoid-option__switch" aria-hidden="true"><i /></span>
          <span class="generation-avoid-option__copy"><strong>尽量避开历史题目</strong><small>生成时参考你以前的题目，尽量换角度提问</small></span>
        </button>
        <fieldset class="generation-form__categories">
          <legend>题目侧重</legend>
          <div class="generation-form__categories-heading"><span>选择希望重点练习的方向，不选时按综合岗位能力生成</span><b>已选 {{ categories.length }} / {{ categoryOptions.length }}</b></div>
          <a-checkbox-group v-model:value="categories" :disabled="generating" class="generation-form__category-grid">
            <a-checkbox v-for="option in categoryOptions" :key="option.value" :value="option.value" class="generation-category-option">
              <span><strong>{{ option.label }}</strong><small>{{ option.description }}</small></span>
            </a-checkbox>
          </a-checkbox-group>
        </fieldset>
        <p class="generation-form__note">系统会结合简历真实经历与目标岗位生成题目。按实际 AI 用量计费，历史去重会尽量换角度，但无法保证完全不重复。</p>
        <p v-if="generationError" class="generation-form__error" role="alert">{{ generationError }}</p>
      </div>
    </a-modal>

    <a-drawer v-model:open="detailOpen" placement="right" :width="760" title="面试练习">
      <template v-if="selectedSet">
        <div class="interview-detail-heading">
          <div><span>目标岗位</span><h2>{{ selectedSet.target_position }}</h2></div>
          <button class="btn-ghost-sm" @click="setStartContext(selectedSet.resume_id)">再生成一套</button>
        </div>
        <p class="interview-detail-context">{{ selectedSet.question_count }} 道专属题 · {{ formatDateTime(selectedSet.create_time) }}</p>
        <article v-for="(question, index) in selectedSet.questions" :key="question.id" class="interview-question-card">
          <div class="interview-question-card__title">
            <b>{{ String(index + 1).padStart(2, '0') }}. {{ question.question }}</b>
            <span>{{ CATEGORY_LABELS[question.category] || '综合题' }}</span>
          </div>
          <p><strong>考察点：</strong>{{ question.evaluation_focus }}</p>
          <p v-if="question.resume_evidence"><strong>简历关联：</strong>{{ question.resume_evidence }}</p>
          <p v-if="question.answer_guidance"><strong>回答提示：</strong>{{ question.answer_guidance }}</p>
          <label>练习状态<a-select v-model:value="drafts[question.id].status" class="w-full"><a-select-option value="todo">待练习</a-select-option><a-select-option value="practiced">已练习</a-select-option><a-select-option value="mastered">已掌握</a-select-option></a-select></label>
          <label>我的回答<a-textarea v-model:value="drafts[question.id].answer_draft" :rows="4" :maxlength="20000" show-count placeholder="记录你自己的真实回答，稍后可以继续修改" /></label>
          <label>面试复盘<a-textarea v-model:value="drafts[question.id].reflection" :rows="2" :maxlength="8000" placeholder="记录需要补充的证据或下次改进点" /></label>
          <div class="interview-question-card__actions">
            <button class="btn-primary-sm min-h-10" :disabled="savingQuestion === String(question.id)" @click="savePractice(question)">{{ savingQuestion === String(question.id) ? '保存中…' : '保存练习记录' }}</button>
            <button class="btn-ghost-sm min-h-10" :disabled="reviewLoadingQuestion === String(question.id) || !drafts[question.id].answer_draft.trim()" @click="reviewAnswer(question)">{{ reviewLoadingQuestion === String(question.id) ? 'AI 点评中…' : 'AI 点评我的回答' }}</button>
            <button class="btn-ghost-sm min-h-10" :disabled="reviewLoadingQuestion === `history-${question.id}`" @click="toggleReviewHistory(question)">{{ reviewExpanded[question.id] ? '收起点评历史' : '查看点评历史' }}</button>
          </div>
          <section v-if="reviewHistory[question.id]?.[0]?.review_result" class="answer-review-card">
            <div class="answer-review-card__heading"><strong>{{ assessmentLabel(reviewHistory[question.id][0].review_result.assessment) }}</strong><span>第 {{ reviewHistory[question.id][0].review_version }} 次点评</span></div>
            <p>{{ reviewHistory[question.id][0].review_result.summary }}</p>
            <div v-if="reviewRubric(reviewHistory[question.id][0]).length" class="answer-review-card__rubric">
              <span v-for="item in reviewRubric(reviewHistory[question.id][0])" :key="item.label"><b>{{ item.label }}</b><i>{{ item.value }}/5</i></span>
            </div>
            <template v-for="[key, title] in [['strengths', '回答亮点'], ['gaps', '需要补充'], ['unsupported_claims', '缺少依据的表述'], ['suggestions', '改进建议']]" :key="key">
              <div v-if="reviewHistory[question.id][0].review_result[key]?.length" class="answer-review-card__list">
                <b>{{ title }}</b><ul><li v-for="(item, itemIndex) in reviewHistory[question.id][0].review_result[key]" :key="itemIndex">{{ item }}</li></ul>
              </div>
            </template>
            <small>AI 点评是练习建议，不代表对经历真实性或答案正确性的最终判定。</small>
          </section>
          <section v-if="reviewExpanded[question.id]" class="answer-review-history" aria-live="polite">
            <div v-if="reviewLoadingQuestion === `history-${question.id}`" class="answer-review-history__loading"><a-spin size="small" />正在读取点评历史</div>
            <template v-else>
              <p v-if="!reviewHistory[question.id]?.length" class="answer-review-history__empty">还没有点评记录。</p>
              <article v-for="review in reviewHistory[question.id] || []" :key="review.id" class="answer-review-history__item">
                <div><strong>第 {{ review.review_version }} 次点评</strong><time>{{ formatDateTime(review.create_time) }}</time><span>{{ review.review_status === 'completed' ? assessmentLabel(review.review_result?.assessment) : review.review_status === 'pending' ? '处理中' : '点评失败' }}</span></div>
                <p><b>本次回答快照</b>{{ review.answer_snapshot }}</p>
                <p v-if="review.review_result?.summary">{{ review.review_result.summary }}</p>
                <p v-else-if="review.error_message" class="answer-review-history__error">{{ review.error_message }}</p>
              </article>
            </template>
          </section>
        </article>
        <p v-if="selectedQuestionCount" class="interview-detail-footer">{{ selectedQuestionCount }} 道题 · 练习状态和回答仅保存在你的账号中</p>
      </template>
    </a-drawer>
  </div>
</template>

<style scoped>
/* 题库采用轻量卡片层级，桌面端并列浏览，窄屏时将筛选、按钮和详情自然堆叠。 */
.interview-bank{--interview-edge:color-mix(in srgb,var(--color-line) 78%,transparent);display:grid;gap:18px}
.interview-bank__toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px;border:1px solid var(--interview-edge);border-radius:20px;background:linear-gradient(135deg,var(--color-surface),color-mix(in srgb,var(--color-brand-lighter) 35%,var(--color-surface)));box-shadow:0 8px 24px rgba(35,28,76,.045)}
.interview-bank__filters{display:flex;align-items:center;gap:10px;width:min(100%,560px)}
.interview-bank__filters>*{min-width:0;flex:1}
.interview-bank__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px}
.interview-set-card,.interview-question-card{border:1px solid var(--interview-edge);border-radius:18px;background:var(--color-surface);padding:20px;box-shadow:0 8px 24px rgba(35,28,76,.045);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.interview-set-card:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--color-brand) 30%,var(--color-line));box-shadow:0 14px 30px rgba(35,28,76,.09)}
.interview-set-card__top,.interview-set-card__actions,.interview-question-card__title{display:flex;align-items:center;justify-content:space-between;gap:12px}
.interview-set-card__icon{display:grid;width:42px;height:42px;place-items:center;border-radius:14px;background:linear-gradient(145deg,var(--color-brand),var(--color-brand-dark));color:#fff;font-size:13px;font-weight:800;box-shadow:0 6px 14px color-mix(in srgb,var(--color-brand) 25%,transparent)}
.interview-set-card__status{display:inline-flex;align-items:center;min-height:28px;padding:4px 10px;border:1px solid color-mix(in srgb,var(--color-brand) 14%,transparent);border-radius:999px;background:var(--color-brand-lighter);color:var(--color-brand-dark);font-size:12px;font-weight:600}
.interview-set-card h3{overflow:hidden;margin:16px 0 6px;color:var(--color-ink);font-size:18px;font-weight:700;line-height:1.45;text-overflow:ellipsis;white-space:nowrap}
.interview-set-card>p,.interview-detail-context,.interview-detail-footer{margin:0;color:var(--color-muted);font-size:12px;line-height:1.6}
.interview-set-card__progress{margin:18px 0 16px;padding:12px;border-radius:12px;background:color-mix(in srgb,var(--color-brand-lighter) 32%,var(--color-surface))}
.interview-set-card__progress small{display:block;margin-top:5px;color:var(--color-muted);font-size:12px}
.interview-set-card__actions{justify-content:flex-start}
.generation-modal-title{display:grid;gap:3px}.generation-modal-title strong{color:var(--color-ink);font-size:18px;font-weight:750}.generation-modal-title span{color:var(--color-muted);font-size:12px;font-weight:400;line-height:1.5}
.generation-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:14px 18px}
.generation-form>label,.interview-question-card>label{display:grid;gap:7px;color:var(--color-ink-secondary);font-size:13px;font-weight:600}
.generation-form__label{display:flex;align-items:center;gap:7px;min-height:20px}
.generation-form__required,.generation-form__optional{border-radius:999px;padding:2px 7px;font-size:10px;font-style:normal;font-weight:500;line-height:1.3}
.generation-form__required{background:color-mix(in srgb,var(--color-danger) 9%,var(--color-surface));color:var(--color-danger)}
.generation-form__optional{background:color-mix(in srgb,var(--color-brand-lighter) 55%,var(--color-surface));color:var(--color-muted)}
.generation-form :deep(.ant-input),.generation-form :deep(.ant-select-selector){min-height:42px;border-radius:11px!important}
.generation-form :deep(.ant-select-selection-item){line-height:40px!important}
.generation-form__jd,.generation-form__categories,.generation-form__note,.generation-form__error{grid-column:1/-1}
.generation-form__jd :deep(textarea.ant-input){min-height:92px;max-height:150px;resize:vertical}
/* 将岗位描述字数放在文本框下方的正常文档流中，避免 Ant 计数器覆盖相邻字段。 */
.generation-form__jd-count{justify-self:end;margin-top:-3px;color:var(--color-muted);font-size:11px;font-weight:500;line-height:1.4;font-variant-numeric:tabular-nums}
.generation-form fieldset{display:grid;gap:10px;min-width:0;margin:0;border:1px solid var(--interview-edge);border-radius:14px;padding:14px}
.generation-form legend{padding:0 6px;color:var(--color-ink-secondary);font-size:12px;font-weight:650}
.generation-form__categories-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--color-muted);font-size:11px;line-height:1.5}
.generation-form__categories-heading>b{flex:0 0 auto;border-radius:999px;background:var(--color-brand-lighter);padding:4px 9px;color:var(--color-brand-dark);font-size:10px;font-weight:650;white-space:nowrap}
.generation-form__category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.generation-form__category-grid :deep(.generation-category-option){display:flex;align-items:flex-start;gap:9px;min-width:0;min-height:70px;margin:0;border:1px solid var(--interview-edge);border-radius:12px;background:var(--color-surface);padding:11px;color:var(--color-ink-secondary);white-space:normal;transition:border-color .16s ease,background .16s ease,box-shadow .16s ease}
.generation-form__category-grid :deep(.generation-category-option:hover){border-color:color-mix(in srgb,var(--color-brand) 36%,var(--color-line));background:color-mix(in srgb,var(--color-brand-lighter) 20%,var(--color-surface))}
.generation-form__category-grid :deep(.generation-category-option.ant-checkbox-wrapper-checked){border-color:color-mix(in srgb,var(--color-brand) 48%,var(--color-line));background:color-mix(in srgb,var(--color-brand-lighter) 58%,var(--color-surface));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--color-brand) 8%,transparent);color:var(--color-brand-dark)}
.generation-form__category-grid :deep(.ant-checkbox){top:2px;flex:0 0 auto}
.generation-form__category-grid :deep(.ant-checkbox+span){display:grid;gap:3px;min-width:0;padding:0}
.generation-form__category-grid :deep(.ant-checkbox+span strong){color:var(--color-ink);font-size:12px;font-weight:650;line-height:1.4}
.generation-form__category-grid :deep(.ant-checkbox+span small){color:var(--color-muted);font-size:10px;font-weight:400;line-height:1.45;overflow-wrap:anywhere}
/* 开关卡片扩大触控目标，避免只有复选框小区域可点击。 */
.generation-avoid-option{display:flex;align-items:center;gap:10px;min-width:0;min-height:42px;border:1px solid var(--interview-edge);border-radius:11px;background:color-mix(in srgb,var(--color-brand-lighter) 22%,var(--color-surface));padding:10px 12px;text-align:left;cursor:pointer;transition:border-color .16s ease,background .16s ease}
.generation-avoid-option:hover,.generation-avoid-option[aria-checked=true]{border-color:color-mix(in srgb,var(--color-brand) 42%,var(--color-line));background:color-mix(in srgb,var(--color-brand-lighter) 48%,var(--color-surface))}
.generation-avoid-option:focus-visible{outline:2px solid var(--color-brand);outline-offset:2px}
.generation-avoid-option:disabled{cursor:not-allowed;opacity:.65}
.generation-avoid-option__switch{display:flex;flex:0 0 30px;align-items:center;width:30px;height:18px;border-radius:999px;background:var(--color-line);padding:2px;transition:background .16s ease}
.generation-avoid-option[aria-checked=true] .generation-avoid-option__switch{background:var(--color-brand)}
.generation-avoid-option__switch i{width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0002;transition:transform .16s ease}
.generation-avoid-option[aria-checked=true] .generation-avoid-option__switch i{transform:translateX(12px)}
.generation-avoid-option__copy{display:grid;gap:3px;min-width:0}
.generation-avoid-option strong{color:var(--color-ink-secondary);font-size:12px;line-height:1.35}
.generation-avoid-option small{color:var(--color-muted);font-size:10px;font-weight:400;line-height:1.4}
.generation-form__note{margin:0;border-radius:11px;background:color-mix(in srgb,var(--color-brand-lighter) 32%,var(--color-surface));padding:10px 12px;color:var(--color-muted);font-size:11px;line-height:1.6}
.generation-live{grid-row:1;display:grid;gap:10px;min-width:0;border:1px solid color-mix(in srgb,var(--color-brand) 22%,var(--color-line));border-radius:15px;background:linear-gradient(145deg,color-mix(in srgb,var(--color-brand-lighter) 35%,var(--color-surface)),var(--color-surface) 65%);padding:13px}.generation-live__heading{display:flex;align-items:center;gap:10px;min-width:0;color:var(--color-brand-dark);font-size:13px}.generation-live__status{display:grid;gap:3px;min-width:0}.generation-live__status strong{overflow-wrap:anywhere}.generation-live__status small{color:var(--color-muted);font-size:11px;font-weight:400}.generation-live__count{flex:0 0 auto;margin-left:auto;border:1px solid color-mix(in srgb,var(--color-brand) 16%,transparent);border-radius:999px;background:var(--color-surface);padding:5px 10px;color:var(--color-brand-dark);font-size:12px;font-variant-numeric:tabular-nums}.generation-live__count i{margin:0 4px;color:var(--color-muted);font-style:normal}.generation-live__list{display:grid;gap:8px;max-height:min(34vh,320px);overflow:auto;overscroll-behavior:contain;padding:1px 4px 2px 1px;scrollbar-gutter:stable}.generation-live__question{display:grid;gap:8px;border:1px solid var(--interview-edge);border-radius:12px;background:var(--color-surface);padding:12px;box-shadow:0 2px 8px rgba(35,28,76,.035)}.generation-live__question-top{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:start;gap:9px}.generation-live__number{display:grid;width:26px;height:26px;place-items:center;border-radius:8px;background:var(--color-brand-lighter);color:var(--color-brand-dark);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.generation-live__question b{color:var(--color-ink);font-size:13px;line-height:1.65;overflow-wrap:anywhere}.generation-live__category{border-radius:999px;background:color-mix(in srgb,var(--color-brand-lighter) 64%,var(--color-surface));padding:4px 8px;color:var(--color-brand-dark);font-size:10px;line-height:1.4;white-space:nowrap}.generation-live__question p{display:flex;gap:7px;margin:0;color:var(--color-ink-secondary);font-size:12px;line-height:1.65;overflow-wrap:anywhere}.generation-live__question p strong{flex:0 0 auto;color:var(--color-muted);font-weight:500}.generation-live__pending{display:flex;align-items:center;gap:8px;padding:6px 4px;color:var(--color-muted);font-size:12px}.generation-live__pending span{width:6px;height:6px;border-radius:50%;background:var(--color-brand);box-shadow:0 0 0 4px color-mix(in srgb,var(--color-brand) 12%,transparent);animation:interview-pulse 1.3s ease-in-out infinite}.generation-live__error{margin:0;border-radius:10px;background:color-mix(in srgb,var(--color-danger) 8%,var(--color-surface));padding:10px;color:var(--color-danger);font-size:12px;line-height:1.65;overflow-wrap:anywhere}
.generation-live__stages{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:0;padding:0;list-style:none}
.generation-live__stages li{display:flex;align-items:center;gap:6px;min-width:0;color:var(--color-muted);font-size:10px;line-height:1.35}
.generation-live__stages li>span{display:grid;width:21px;height:21px;flex:0 0 21px;place-items:center;border:1px solid var(--interview-edge);border-radius:50%;background:var(--color-surface);font-size:10px;font-weight:700}
.generation-live__stages li b{overflow:hidden;font-weight:500;text-overflow:ellipsis;white-space:nowrap}
.generation-live__stages li.is-active{color:var(--color-brand-dark)}
.generation-live__stages li.is-active>span{border-color:var(--color-brand);background:var(--color-brand);color:#fff;box-shadow:0 0 0 3px color-mix(in srgb,var(--color-brand) 12%,transparent)}
.generation-live__stages li.is-complete{color:var(--color-success,var(--color-brand-dark))}
.generation-live__stages li.is-complete>span{border-color:color-mix(in srgb,var(--color-brand) 30%,var(--color-line));background:var(--color-brand-lighter);color:var(--color-brand-dark)}
@keyframes interview-pulse{50%{opacity:.4;transform:scale(.82)}}
.interview-detail-heading{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px;border:1px solid var(--interview-edge);border-radius:16px;background:linear-gradient(135deg,var(--color-surface),color-mix(in srgb,var(--color-brand-lighter) 38%,var(--color-surface)))}
.interview-detail-heading span{color:var(--color-muted);font-size:12px}
.interview-detail-heading h2{margin:4px 0 0;color:var(--color-ink);font-size:24px;font-weight:700;line-height:1.35}
.interview-detail-context{margin:12px 2px 18px}
.interview-question-card{display:grid;gap:14px;margin:12px 0;padding:18px}
.interview-question-card__title{align-items:flex-start}
.interview-question-card__title b{color:var(--color-ink);font-size:15px;line-height:1.7}
.interview-question-card__title span{flex:0 0 auto;border-radius:999px;background:var(--color-brand-lighter);padding:4px 9px;color:var(--color-brand-dark);font-size:12px;font-weight:600}
.interview-question-card p{margin:0;color:var(--color-ink-secondary);font-size:13px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere}
.interview-question-card>label{padding-top:4px}
.interview-detail-footer{margin-top:20px;text-align:center}
.interview-job-card,.interview-job-history{display:grid;gap:12px;min-width:0;border:1px solid var(--interview-edge);border-radius:18px;background:var(--color-surface);padding:18px;box-shadow:0 8px 24px rgba(35,28,76,.045)}
.interview-job-card{border-color:color-mix(in srgb,var(--color-brand) 22%,var(--color-line));background:linear-gradient(145deg,color-mix(in srgb,var(--color-brand-lighter) 30%,var(--color-surface)),var(--color-surface) 60%)}
.interview-job-card__header,.interview-job-card__heading,.interview-job-card__progress,.interview-job-card__actions,.interview-job-history__heading,.interview-job-history__item,.interview-job-history__item>span,.answer-review-card__heading,.answer-review-card__rubric,.answer-review-history__item>div{display:flex;align-items:center;justify-content:space-between;gap:12px}
.interview-job-card__heading{justify-content:flex-start;min-width:0}.interview-job-card__heading>div{display:grid;gap:3px;min-width:0}.interview-job-card__heading strong{color:var(--color-ink);font-size:15px}.interview-job-card__heading small,.interview-job-history__heading span{color:var(--color-muted);font-size:11px;overflow-wrap:anywhere}.interview-job-card__pulse{width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:var(--color-brand);box-shadow:0 0 0 4px color-mix(in srgb,var(--color-brand) 13%,transparent)}.interview-job-card__pulse.is-running{animation:interview-pulse 1.3s ease-in-out infinite}.interview-job-card__pulse.is-failed{background:var(--color-danger);box-shadow:0 0 0 4px color-mix(in srgb,var(--color-danger) 12%,transparent)}.interview-job-card__pulse.is-completed{background:var(--color-success,var(--color-brand-dark));box-shadow:0 0 0 4px color-mix(in srgb,var(--color-brand) 12%,transparent)}.interview-job-card__state,.interview-job-history__item i{flex:0 0 auto;border-radius:999px;background:var(--color-brand-lighter);padding:5px 10px;color:var(--color-brand-dark);font-size:11px;font-style:normal;font-weight:650}.interview-job-card__state.is-failed,.interview-job-history__item i.is-failed{background:color-mix(in srgb,var(--color-danger) 9%,var(--color-surface));color:var(--color-danger)}.interview-job-card__message{margin:0;color:var(--color-ink-secondary);font-size:13px;line-height:1.65;overflow-wrap:anywhere}.interview-job-card__progress{gap:14px}.interview-job-card__progress :deep(.ant-progress){max-width:520px;flex:1}.interview-job-card__progress>span{flex:0 0 auto;color:var(--color-muted);font-size:12px;font-variant-numeric:tabular-nums}.interview-job-card__questions{display:grid;gap:8px;max-height:360px;overflow:auto;overscroll-behavior:contain}.interview-job-card__actions{justify-content:flex-end}.interview-job-history__heading{justify-content:flex-start;flex-wrap:wrap}.interview-job-history__heading strong{color:var(--color-ink);font-size:13px}.interview-job-history__list{display:grid;gap:6px}.interview-job-history__item{width:100%;border:1px solid var(--interview-edge);border-radius:11px;background:var(--color-surface);padding:9px 12px;text-align:left;cursor:pointer}.interview-job-history__item:hover{border-color:color-mix(in srgb,var(--color-brand) 35%,var(--color-line));background:color-mix(in srgb,var(--color-brand-lighter) 18%,var(--color-surface))}.interview-job-history__item>span{align-items:flex-start;flex-direction:column;gap:3px;min-width:0}.interview-job-history__item b{color:var(--color-ink-secondary);font-size:12px}.interview-job-history__item small{color:var(--color-muted);font-size:10px}.interview-question-card__actions{display:flex;flex-wrap:wrap;gap:8px}.answer-review-card,.answer-review-history{display:grid;gap:10px;border:1px solid color-mix(in srgb,var(--color-brand) 23%,var(--color-line));border-radius:13px;background:color-mix(in srgb,var(--color-brand-lighter) 23%,var(--color-surface));padding:13px}.answer-review-card__heading{justify-content:flex-start}.answer-review-card__heading strong{border-radius:999px;background:var(--color-brand-lighter);padding:5px 9px;color:var(--color-brand-dark);font-size:12px}.answer-review-card__heading span,.answer-review-card>small{color:var(--color-muted);font-size:11px}.answer-review-card>p,.answer-review-history__item p{margin:0;color:var(--color-ink-secondary);font-size:12px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}.answer-review-card__rubric{justify-content:flex-start;flex-wrap:wrap}.answer-review-card__rubric span{display:flex;align-items:center;gap:6px;border:1px solid var(--interview-edge);border-radius:999px;background:var(--color-surface);padding:5px 8px;font-size:10px}.answer-review-card__rubric b{color:var(--color-muted);font-weight:500}.answer-review-card__rubric i{color:var(--color-brand-dark);font-style:normal;font-weight:700}.answer-review-card__list{display:grid;gap:3px;color:var(--color-ink-secondary);font-size:11px;line-height:1.6}.answer-review-card__list> b{color:var(--color-ink);font-size:12px}.answer-review-card__list ul{display:grid;gap:3px;margin:0;padding-left:18px}.answer-review-card>small{line-height:1.5}.answer-review-history{border-color:var(--interview-edge);background:color-mix(in srgb,var(--color-brand-lighter) 12%,var(--color-surface))}.answer-review-history__loading{display:flex;align-items:center;gap:8px;color:var(--color-muted);font-size:12px}.answer-review-history__empty{margin:0;color:var(--color-muted);font-size:12px}.answer-review-history__item{display:grid;gap:7px;border-bottom:1px solid var(--interview-edge);padding:9px 0}.answer-review-history__item:last-child{border-bottom:0}.answer-review-history__item>div{justify-content:flex-start;flex-wrap:wrap}.answer-review-history__item strong{color:var(--color-ink);font-size:12px}.answer-review-history__item time,.answer-review-history__item span{color:var(--color-muted);font-size:10px}.answer-review-history__item p>b{display:block;margin-bottom:3px;color:var(--color-muted);font-size:10px}.answer-review-history__error{color:var(--color-danger)!important}.generation-form__error{grid-column:1/-1;margin:0;border:1px solid color-mix(in srgb,var(--color-danger) 20%,transparent);border-radius:10px;background:color-mix(in srgb,var(--color-danger) 7%,var(--color-surface));padding:10px 12px;color:var(--color-danger);font-size:12px;line-height:1.6;overflow-wrap:anywhere}
@media(max-width:640px){.interview-bank{gap:14px}.interview-bank__toolbar{align-items:stretch;flex-direction:column;padding:14px;border-radius:16px}.interview-bank__filters{width:100%;align-items:stretch;flex-direction:column}.interview-bank__toolbar>.btn-primary{width:100%}.interview-bank__grid{grid-template-columns:1fr;gap:12px}.interview-set-card{padding:16px}.interview-set-card h3{font-size:17px}.interview-detail-heading{align-items:stretch;flex-direction:column;padding:14px}.interview-detail-heading h2{font-size:20px}.interview-detail-heading>.btn-ghost-sm{width:100%}.interview-question-card{gap:12px;margin:10px 0;padding:14px}.interview-question-card__title{flex-direction:column}.interview-question-card__title span{align-self:flex-start}.interview-job-card,.interview-job-history{padding:14px}.interview-job-card__header{align-items:flex-start}.interview-job-card__heading strong{font-size:13px}.interview-job-card__progress{align-items:flex-start;flex-direction:column;gap:4px}.interview-job-card__progress :deep(.ant-progress){width:100%;max-width:none}.interview-job-card__actions{justify-content:stretch}.interview-job-card__actions button{flex:1}.interview-job-history__heading{align-items:flex-start;flex-direction:column;gap:3px}.interview-job-history__item{padding:9px}.interview-question-card__actions{display:grid;grid-template-columns:1fr}.interview-question-card__actions button{width:100%}.answer-review-card,.answer-review-history{padding:11px}.generation-modal-title strong{font-size:16px}.generation-modal-title span{max-width:56vw}.generation-form{grid-template-columns:1fr;gap:12px}.generation-form__jd,.generation-form__categories,.generation-form__avoid,.generation-form__note,.generation-form__error{grid-column:1}.generation-form__error{grid-row:auto}.generation-live__stages{grid-template-columns:1fr;gap:5px}.generation-live__stages li{font-size:11px}.generation-live__list{max-height:28vh}.generation-live__question{padding:10px}.generation-live__question-top{grid-template-columns:26px minmax(0,1fr);gap:7px}.generation-live__category{grid-column:2;justify-self:start}.generation-live__count{padding:4px 8px;font-size:11px}.generation-live__status small{max-width:38vw;line-height:1.4}}
/* 题型卡片在平板保持双列，窄手机单列，避免说明文字挤压复选框。 */
@media(max-width:760px){.generation-form__category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:420px){.generation-form__category-grid{grid-template-columns:1fr}.generation-form__categories-heading{align-items:flex-start;flex-direction:column;gap:6px}.generation-avoid-option{align-items:flex-start}}
@media(prefers-reduced-motion:reduce){.interview-set-card{transition:none}.interview-set-card:hover{transform:none}.generation-live__pending span{animation:none}.generation-form__category-grid :deep(.generation-category-option){transition:none}}
</style>
