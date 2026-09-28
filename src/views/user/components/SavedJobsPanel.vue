<script setup>
/**
 * 我的收藏面板：展示由浏览器 Agent 识别并保存的岗位。
 */
import { computed, onMounted, ref } from 'vue'
import {
  BookOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  LinkOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  analyzeExtensionJob,
  deleteExtensionJob,
  getExtensionJobProgressHistory,
  getExtensionJob,
  getExtensionJobs,
  updateExtensionJobProgress,
} from '@/api/extensionJobs'
import { formatDateTime } from '@/utils/date'
import { getCareerGoals } from '@/api/user'

const jobs = ref([])
const careerGoals = ref([])
const loading = ref(false)
const applicationStageFilter = ref('all')
const loadError = ref('')
const detailOpen = ref(false)
const detailLoading = ref(false)
const analysisLoading = ref(false)
const deleting = ref(false)
const progressSaving = ref(false)
const historyLoading = ref(false)
const progressHistory = ref([])
// 详情弹窗独立维护进度草稿，取消关闭或保存失败时不污染岗位卡片数据。
const progressDraft = ref({ application_stage: 'saved', applied_at: '', next_action_at: '', progress_note: '', career_goal_id: null })
const selectedJob = ref(null)

// 求职阶段与扩展 status 分离，避免“AI 已分析”被误当成“用户已投递”。
const applicationStageMeta = {
  saved: { label: '\u5df2\u6536\u85cf', color: 'blue' },
  preparing: { label: '\u51c6\u5907\u4e2d', color: 'cyan' },
  applied: { label: '\u5df2\u6295\u9012', color: 'purple' },
  interviewing: { label: '\u9762\u8bd5\u4e2d', color: 'orange' },
  offer: { label: '\u5df2\u5f55\u7528', color: 'green' },
  rejected: { label: '\u672a\u901a\u8fc7', color: 'red' },
  withdrawn: { label: '\u5df2\u64a4\u56de', color: 'default' },
  archived: { label: '\u5df2\u5f52\u6863', color: 'default' },
}

// 阶段选项和筛选器共用同一组文案，防止出现界面可选但后端不接受的状态。
const applicationStageOptions = Object.entries(applicationStageMeta).map(([value, item]) => ({ value, label: item.label }))

// 下拉筛选覆盖全部求职阶段，避免窄屏横向铺开多个阶段按钮。
const filters = [
  { label: '\u5168\u90e8\u9636\u6bb5', value: 'all' },
  ...Object.entries(applicationStageMeta).map(([value, item]) => ({ value, label: item.label })),
]

const visibleJobs = computed(() => applicationStageFilter.value === 'all'
  ? jobs.value
  : jobs.value.filter((job) => (job.application_stage || 'saved') === applicationStageFilter.value))

// 兼容扩展历史结果与后端标准字段，保证旧收藏也能看到完整分析。
function stringList(...values) {
  const source = values.find((value) => Array.isArray(value) && value.length) || []
  return source.map((item) => String(item || '').trim()).filter(Boolean)
}

function analysisOf(job) {
  const result = job?.match_result || {}
  return {
    advantages: stringList(result.match_advantages, result.advantages, result.strengths),
    gaps: stringList(result.position_gaps, result.gaps, result.missing_skills),
    suggestions: stringList(result.suggestions, result.recommendations, result.advice),
    experienceGap: String(result.experience_gap || '').trim(),
  }
}

const selectedAnalysis = computed(() => analysisOf(selectedJob.value))
const hasSelectedAnalysis = computed(() => {
  const result = selectedAnalysis.value
  return Boolean(
    scoreOf(selectedJob.value)
    || result.advantages.length
    || result.gaps.length
    || result.suggestions.length
    || result.experienceGap,
  )
})

function scoreOf(job) {
  const value = Number(job?.match_result?.score ?? job?.match_result?.match_score ?? 0)
  return Number.isFinite(value) && value > 0 ? Math.min(100, Math.round(value)) : null
}

function skillsOf(job) {
  return Array.isArray(job?.skills) ? job.skills.filter(Boolean) : []
}

function needsRefresh(job) {
  return !job?.company || !job?.source_platform || (!job?.location && !job?.address)
}

async function loadJobs() {
  loading.value = true
  loadError.value = ''
  try {
    const [data, goalsData] = await Promise.all([getExtensionJobs(), getCareerGoals().catch(() => ({ goals: [] }))])
    jobs.value = data.jobs || []
    careerGoals.value = goalsData.goals || []
  } catch (error) {
    jobs.value = []
    loadError.value = error?.message || '\u6682\u65f6\u65e0\u6cd5\u52a0\u8f7d\u6536\u85cf\u5c97\u4f4d'
  } finally {
    loading.value = false
  }
}

function openSource(url) {
  if (!url) return message.warning('该收藏没有可返回的原招聘页地址')
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function openDetail(job) {
  detailOpen.value = true
  detailLoading.value = true
  selectedJob.value = job
  progressHistory.value = []
  try {
    const data = await getExtensionJob(job.id)
    selectedJob.value = data.job || job
    syncProgressDraft(selectedJob.value)
    await loadProgressHistory(selectedJob.value.id)
  } catch (error) {
    message.error(error?.message || '暂时无法加载岗位详情')
  } finally {
    detailLoading.value = false
  }
}

function goalName(goalId) {
  return careerGoals.value.find((goal) => String(goal.id) === String(goalId))?.name || ''
}

// 数据库 DATE 可能被驱动序列化为 ISO 字符串，日期输入统一使用 YYYY-MM-DD。
function dateInputValue(value) {
  return value ? String(value).slice(0, 10) : ''
}

// 旧岗位缺少新增字段时用“已收藏”作中性默认值，不推断投递事实。
function syncProgressDraft(job) {
  progressDraft.value = {
    application_stage: job?.application_stage || 'saved',
    applied_at: dateInputValue(job?.applied_at),
    next_action_at: dateInputValue(job?.next_action_at),
    progress_note: job?.progress_note || '',
    career_goal_id: job?.career_goal_id || null,
  }
}

// 阶段历史单独加载，避免岗位详情接口随时间线增长而变大。
async function loadProgressHistory(jobId) {
  historyLoading.value = true
  try {
    const data = await getExtensionJobProgressHistory(jobId)
    progressHistory.value = data.history || []
  } catch {
    progressHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

function replaceJob(updatedJob) {
  jobs.value = jobs.value.map((job) => job.id === updatedJob.id ? updatedJob : job)
  selectedJob.value = updatedJob
}

// 阶段、日期和备注由一次服务端事务保存；失败时保留草稿供用户重试。
async function saveProgress() {
  if (!selectedJob.value?.id) return
  progressSaving.value = true
  try {
    const data = await updateExtensionJobProgress(selectedJob.value.id, progressDraft.value)
    if (data.job) replaceJob(data.job)
    await loadProgressHistory(selectedJob.value.id)
    message.success('\u6c42\u804c\u8fdb\u5ea6\u5df2\u4fdd\u5b58')
  } catch {
    // 全局请求层负责展示统一错误；页面保留编辑内容。
  } finally {
    progressSaving.value = false
  }
}

async function analyzeCurrentJob() {
  if (!selectedJob.value?.id) return
  analysisLoading.value = true
  try {
    const data = await analyzeExtensionJob(selectedJob.value.id)
    if (data.job) replaceJob(data.job)
    message.success('岗位分析完成，结果已保存')
  } catch (error) {
    // request 已用 a-message 展示统一错误；这里吞掉拒绝，避免 Vue 产生未处理事件警告。
  } finally {
    analysisLoading.value = false
  }
}

async function removeCurrentJob() {
  if (!selectedJob.value?.id) return
  deleting.value = true
  try {
    const removedId = selectedJob.value.id
    await deleteExtensionJob(removedId)
    jobs.value = jobs.value.filter((job) => job.id !== removedId)
    detailOpen.value = false
    selectedJob.value = null
    message.success('已取消收藏')
  } catch (error) {
    // 删除失败由全局请求层提示，页面保留当前岗位与弹窗状态。
  } finally {
    deleting.value = false
  }
}

onMounted(loadJobs)
</script>

<template>
  <section class="saved-jobs-panel">
    <div class="saved-jobs-toolbar">
      <a-select v-model:value="applicationStageFilter" class="saved-jobs-stage-filter" :options="filters" />
      <a-button type="text" size="small" :loading="loading" @click="loadJobs">
        <ReloadOutlined />刷新
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <a-alert
        v-if="loadError"
        class="saved-jobs-alert"
        type="warning"
        show-icon
        :message="loadError"
      />
      <div v-if="visibleJobs.length" class="saved-jobs-grid">
        <article v-for="job in visibleJobs" :key="job.id" class="saved-job-card" role="button" tabindex="0" @click="openDetail(job)" @keydown.enter="openDetail(job)">
          <div class="saved-job-card__top">
            <span class="saved-job-card__icon"><BookOutlined /></span>
            <div class="saved-job-card__tags">
              <a-tag v-if="needsRefresh(job)" color="orange">待重新识别</a-tag>
              <a-tag :color="applicationStageMeta[job.application_stage || 'saved']?.color">{{ applicationStageMeta[job.application_stage || 'saved']?.label || '已收藏' }}</a-tag>
            </div>
          </div>
          <h3>{{ job.title }}</h3>
          <p class="saved-job-card__company">{{ job.company || '暂未识别公司' }}</p>
          <div v-if="job.source_platform" class="saved-job-card__source"><GlobalOutlined />{{ job.source_platform }}</div>
          <div class="saved-job-card__meta">
            <span v-if="job.location"><EnvironmentOutlined />{{ job.location }}</span>
            <span v-if="job.salary">{{ job.salary }}</span>
          </div>
          <p v-if="job.address" class="saved-job-card__address">{{ job.address }}</p>
          <p v-if="job.next_action_at" class="saved-job-card__next-action">下一步：{{ dateInputValue(job.next_action_at) }}</p>
          <p v-if="goalName(job.career_goal_id)" class="saved-job-card__goal">目标：{{ goalName(job.career_goal_id) }}</p>
          <div v-if="skillsOf(job).length" class="saved-job-skills">
            <a-tag v-for="skill in skillsOf(job).slice(0, 5)" :key="skill">{{ skill }}</a-tag>
          </div>
          <div class="saved-job-card__footer">
            <div v-if="scoreOf(job)" class="saved-job-score">
              <ThunderboltOutlined /> 匹配 {{ scoreOf(job) }}
            </div>
            <span v-else>{{ formatDateTime(job.update_time) }}</span>
            <a-button type="link" size="small" @click.stop="openSource(job.source_url)">
              查看岗位 <LinkOutlined />
            </a-button>
          </div>
        </article>
      </div>
      <!-- 阶段筛选无结果时解释当前筛选为空，不误导用户以为岗位已被删除。 -->
      <a-empty v-else :description="applicationStageFilter === 'all' ? '还没有收藏的岗位' : '当前阶段没有岗位'">
        <template #description>
          <div class="saved-jobs-empty">
            <b>{{ applicationStageFilter === 'all' ? '还没有收藏的岗位' : '当前阶段没有岗位' }}</b>
            <span v-if="applicationStageFilter === 'all'">在招聘页面打开 AI 简历 Agent，即可识别、分析并保存。</span>
            <span v-else>选择其他阶段查看岗位，或在招聘页面继续收藏新岗位。</span>
          </div>
        </template>
      </a-empty>
    </a-spin>

    <a-modal v-model:open="detailOpen" title="岗位详情" :footer="null" width="680px" wrap-class-name="saved-job-detail-modal">
      <a-spin :spinning="detailLoading">
        <section v-if="selectedJob" class="saved-job-detail">
          <a-alert v-if="needsRefresh(selectedJob)" class="saved-job-detail__warning" type="warning" show-icon message="该岗位由旧版插件保存，返回原招聘页重新识别后会自动补全字段。" />
          <div class="saved-job-detail__heading">
            <div><h2>{{ selectedJob.title }}</h2><p>{{ selectedJob.company || '暂未识别公司' }}</p></div>
            <span class="saved-job-status" :data-status="progressDraft.application_stage">
              <CheckCircleOutlined />{{ applicationStageMeta[progressDraft.application_stage]?.label || '已收藏' }}
            </span>
          </div>
          <div class="saved-job-detail__meta">
            <span v-if="selectedJob.source_platform"><GlobalOutlined />{{ selectedJob.source_platform }}</span>
            <span v-if="selectedJob.source_original">转载来源：{{ selectedJob.source_original }}</span>
            <span v-if="selectedJob.location"><EnvironmentOutlined />{{ selectedJob.location }}</span>
            <span v-if="selectedJob.salary">{{ selectedJob.salary }}</span>
            <span v-if="scoreOf(selectedJob)"><ThunderboltOutlined /> 匹配 {{ scoreOf(selectedJob) }}</span>
          </div>
          <div v-if="selectedJob.address" class="saved-job-detail__address"><EnvironmentOutlined />{{ selectedJob.address }}</div>
          <!-- 求职进度由用户明确维护，与扩展的岗位分析状态分开呈现。 -->
          <div class="saved-job-detail__block saved-job-progress">
            <b>求职进度</b>
            <label>当前阶段<a-select v-model:value="progressDraft.application_stage" :options="applicationStageOptions" /></label>
            <label>所属求职目标<a-select v-model:value="progressDraft.career_goal_id" allow-clear placeholder="暂不关联" :options="careerGoals.filter((goal) => goal.status === 'active').map((goal) => ({ value: goal.id, label: goal.name }))" /></label>
            <div class="saved-job-progress__dates">
              <label>投递日期<input v-model="progressDraft.applied_at" type="date" /></label>
              <label>下一步日期<input v-model="progressDraft.next_action_at" type="date" /></label>
            </div>
            <label>
              进度备注
              <div class="saved-job-progress__note">
                <a-textarea v-model:value="progressDraft.progress_note" :maxlength="1000" :rows="3" placeholder="记录投递渠道、面试反馈或下一步准备事项" />
                <span>{{ (progressDraft.progress_note || '').length }} / 1000</span>
              </div>
            </label>
            <a-button type="primary" :loading="progressSaving" @click="saveProgress">保存求职进度</a-button>
            <div class="saved-job-progress__history">
              <b>阶段变化</b>
              <a-spin :spinning="historyLoading">
                <ol v-if="progressHistory.length">
                  <li v-for="item in progressHistory" :key="item.id">
                    <span>{{ applicationStageMeta[item.from_stage]?.label || item.from_stage }} → {{ applicationStageMeta[item.to_stage]?.label || item.to_stage }}</span>
                    <small>{{ formatDateTime(item.create_time) }}</small>
                    <p v-if="item.note">{{ item.note }}</p>
                  </li>
                </ol>
                <span v-else class="saved-job-progress__empty">阶段更新后会显示在这里</span>
              </a-spin>
            </div>
          </div>
          <div v-if="skillsOf(selectedJob).length" class="saved-job-detail__block">
            <b>岗位技能</b>
            <div class="saved-job-skills"><a-tag v-for="skill in skillsOf(selectedJob)" :key="skill">{{ skill }}</a-tag></div>
          </div>
          <div class="saved-job-detail__block"><b>岗位描述</b><p>{{ selectedJob.jd_text || '该岗位保存时未能获取完整描述。' }}</p></div>
          <div class="saved-job-detail__analysis">
            <div class="saved-job-detail__analysis-heading">
              <div>
                <span>AI 岗位分析</span>
                <b v-if="scoreOf(selectedJob)">{{ scoreOf(selectedJob) }}<small>/100</small></b>
                <p>{{ hasSelectedAnalysis ? '依据当前岗位与关联简历生成，结果已保存。' : '尚未分析，点击下方按钮获得匹配证据与行动建议。' }}</p>
              </div>
              <RadarChartOutlined />
            </div>
            <template v-if="hasSelectedAnalysis">
              <div v-if="selectedAnalysis.advantages.length" class="saved-job-insight saved-job-insight--positive">
                <b><CheckCircleOutlined />匹配优势</b>
                <p v-for="item in selectedAnalysis.advantages" :key="item">{{ item }}</p>
              </div>
              <div v-if="selectedAnalysis.gaps.length || selectedAnalysis.experienceGap" class="saved-job-insight saved-job-insight--warning">
                <b><WarningOutlined />关键缺口</b>
                <p v-if="selectedAnalysis.experienceGap">{{ selectedAnalysis.experienceGap }}</p>
                <p v-for="item in selectedAnalysis.gaps" :key="item">{{ item }}</p>
              </div>
              <div v-if="selectedAnalysis.suggestions.length" class="saved-job-insight saved-job-insight--advice">
                <b><BulbOutlined />下一步建议</b>
                <p v-for="item in selectedAnalysis.suggestions" :key="item">{{ item }}</p>
              </div>
            </template>
          </div>
          <div class="saved-job-detail__actions">
            <a-button type="primary" :loading="analysisLoading" @click="analyzeCurrentJob">
              <RadarChartOutlined />{{ hasSelectedAnalysis ? '重新分析岗位' : '分析这个岗位' }}
            </a-button>
            <a-button @click="openSource(selectedJob.source_url)">查看原招聘页 <LinkOutlined /></a-button>
            <a-popconfirm
              title="确定取消收藏这个岗位吗？"
              description="取消后会从“我的收藏”中移除，原招聘网站不受影响。"
              ok-text="取消收藏"
              cancel-text="保留"
              placement="topRight"
              @confirm="removeCurrentJob"
            >
              <a-button danger :loading="deleting"><DeleteOutlined />取消收藏</a-button>
            </a-popconfirm>
          </div>
        </section>
      </a-spin>
    </a-modal>
  </section>
</template>

<style scoped>
.saved-jobs-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.saved-jobs-alert{margin-bottom:14px}.saved-jobs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.saved-job-card{min-height:220px;border:1px solid var(--color-line);border-radius:8px;background:var(--color-surface);padding:17px;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}.saved-job-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-soft)}.saved-job-card__top,.saved-job-card__footer,.saved-job-card__meta{display:flex;align-items:center}.saved-job-card__top{justify-content:space-between}.saved-job-card__tags{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px}.saved-job-card__tags :deep(.ant-tag){margin-inline-end:0}.saved-job-card__icon{display:grid;flex:0 0 auto;place-items:center;width:32px;height:32px;border-radius:8px;background:var(--color-brand-lighter);color:var(--color-brand-dark)}h3{margin:15px 0 5px;font-size:16px;line-height:1.35;color:var(--color-ink)}.saved-job-card__company{margin:0;color:var(--color-ink-secondary);font-size:13px}.saved-job-card__source{display:flex;align-items:center;gap:5px;margin-top:8px;color:var(--color-brand-dark);font-size:12px}.saved-job-card__meta{flex-wrap:wrap;gap:10px;margin-top:11px;color:var(--color-muted);font-size:12px}.saved-job-card__meta span,.saved-job-detail__meta span{display:inline-flex;align-items:center;gap:4px}.saved-job-card__address{margin:8px 0 0;color:var(--color-muted);font-size:12px;line-height:1.45}.saved-job-skills{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}.saved-job-skills :deep(.ant-tag){margin-inline-end:0}.saved-job-card__footer{justify-content:space-between;gap:8px;margin-top:17px;padding-top:12px;border-top:1px solid var(--color-line);color:var(--color-muted);font-size:12px}.saved-job-score{color:var(--color-brand-dark);font-weight:700}.saved-jobs-empty{display:grid;gap:7px;max-width:300px;margin:26px auto;color:var(--color-ink-secondary);font-size:13px;line-height:1.6}.saved-jobs-empty b{color:var(--color-ink);font-size:15px}.saved-job-detail__warning{margin-bottom:16px}.saved-job-detail__heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.saved-job-detail h2{margin:0;font-size:19px}.saved-job-detail__heading p{margin:7px 0 0;color:var(--color-ink-secondary)}.saved-job-detail__meta{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0;color:var(--color-muted);font-size:13px}.saved-job-detail__address{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;border-radius:7px;background:var(--color-brand-lighter);color:var(--color-ink-secondary);font-size:13px;line-height:1.5}.saved-job-detail__block{margin-top:18px;padding-top:16px;border-top:1px solid var(--color-line)}.saved-job-detail__block b{color:var(--color-ink)}.saved-job-detail__block p{max-height:46vh;overflow:auto;white-space:pre-wrap;color:var(--color-ink-secondary);line-height:1.75}

/* 详情只保留一个纵向滚动容器，完整 JD 与分析内容不会再被内层截断。 */
.saved-job-detail{max-height:calc(100vh - 190px);overflow-y:auto;padding-right:7px}.saved-job-detail::-webkit-scrollbar{width:6px}.saved-job-detail::-webkit-scrollbar-thumb{border-radius:3px;background:#ccb8ad}.saved-job-detail__block p{max-height:none;overflow:visible}

/* 收藏状态与 AI 分析保持稳定尺寸，避免 Ant Tag 被标题区拉伸。 */
.saved-job-status{display:inline-flex;flex:0 0 auto;align-items:center;gap:6px;min-height:30px;padding:4px 10px;border:1px solid #b7dfd3;border-radius:6px;background:#eef8f4;color:#14745f;font-size:13px;font-weight:600;line-height:20px;white-space:nowrap}.saved-job-status[data-status="saved"]{border-color:#c7d8ec;background:#f1f6fb;color:#42698e}.saved-job-status[data-status="applied"]{border-color:#d9cbea;background:#f8f2fb;color:#76588f}.saved-job-detail__analysis{display:grid;gap:12px;margin-top:20px;padding:16px;border:1px solid var(--color-line);border-radius:8px;background:#fbfdfc}.saved-job-detail__analysis-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.saved-job-detail__analysis-heading>div>span{display:block;color:var(--color-brand-dark);font-size:14px;font-weight:700}.saved-job-detail__analysis-heading b{display:block;margin-top:5px;color:var(--color-ink);font-size:28px;line-height:1}.saved-job-detail__analysis-heading b small{font-size:12px;font-weight:500;color:var(--color-muted)}.saved-job-detail__analysis-heading p{margin:7px 0 0;color:var(--color-muted);font-size:12px}.saved-job-detail__analysis-heading>span{color:var(--color-brand);font-size:24px}.saved-job-insight{padding:12px 13px;border-left:3px solid var(--color-brand);background:#f3f8f6}.saved-job-insight--warning{border-left-color:#d28c2d;background:#fff8ec}.saved-job-insight--advice{border-left-color:#7085b5;background:#f4f6fb}.saved-job-insight b{display:flex;align-items:center;gap:6px;margin-bottom:7px;color:var(--color-ink);font-size:13px}.saved-job-insight p{margin:4px 0;color:var(--color-ink-secondary);font-size:13px;line-height:1.6}.saved-job-detail__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.saved-job-detail__actions :deep(.ant-btn){min-height:38px}.saved-job-detail__actions :deep(.ant-popconfirm-buttons){white-space:nowrap}@media(max-width:720px){.saved-jobs-grid{grid-template-columns:1fr}.saved-job-detail__heading{align-items:flex-start}.saved-job-detail__actions{display:grid}.saved-job-detail__actions :deep(.ant-btn){width:100%}}
</style>

<style scoped>
/* 求职进度表单以系统色彩令牌显示日期、备注和阶段历史，并在窄屏保持单列可操作。 */
.saved-job-card__next-action{margin:7px 0 0;color:var(--color-brand-dark);font-size:12px;font-weight:600}
.saved-job-card__goal{margin:6px 0 0;color:var(--color-brand);font-size:12px;font-weight:600}
.saved-jobs-stage-filter{width:180px}
/* 求职筛选保留 Ant 控件行高，只把选中值和占位内容放到控件水平中心。 */
.saved-jobs-stage-filter :deep(.ant-select-selector){align-items:center}
.saved-jobs-stage-filter :deep(.ant-select-selection-item),.saved-jobs-stage-filter :deep(.ant-select-selection-placeholder){flex:1;min-width:0;padding-inline:24px!important;text-align:center}
.saved-job-progress{display:grid;gap:12px}
.saved-job-progress label{display:grid;min-width:0;gap:6px;color:var(--color-ink-secondary);font-size:13px}
.saved-job-progress :deep(.ant-select){width:100%;min-width:0}
.saved-job-progress :deep(.ant-select-selector){align-items:center}
.saved-job-progress :deep(.ant-select-selection-item),.saved-job-progress :deep(.ant-select-selection-placeholder){flex:1;min-width:0;padding-inline:24px!important;text-align:center}
.saved-job-progress input{display:block;width:100%;min-width:0;min-height:44px;box-sizing:border-box;padding:8px 10px;border:1px solid var(--color-line);border-radius:8px;background:var(--color-surface);color:var(--color-ink);font-size:16px}
.saved-job-progress__dates{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.saved-job-progress__note{position:relative;min-width:0;padding-bottom:20px}
.saved-job-progress__note :deep(.ant-input){width:100%;min-height:112px;box-sizing:border-box;padding-bottom:8px}
.saved-job-progress__note>span{position:absolute;right:2px;bottom:0;color:var(--color-muted);font-size:12px;line-height:16px;pointer-events:none}
:global(.saved-job-detail-modal .ant-modal){max-width:calc(100vw - 24px)}
.saved-job-progress__history{display:grid;gap:8px;padding-top:12px;border-top:1px solid var(--color-line)}
.saved-job-progress__history ol{display:grid;gap:10px;margin:0;padding-left:20px}
.saved-job-progress__history li{color:var(--color-ink-secondary);font-size:13px}
.saved-job-progress__history li small{display:block;color:var(--color-muted)}
.saved-job-progress__history li p{margin:3px 0;white-space:pre-wrap}
.saved-job-progress__empty{color:var(--color-muted);font-size:12px}
@media(max-width:640px){
  .saved-jobs-stage-filter{width:160px}
  .saved-job-progress__dates{grid-template-columns:minmax(0,1fr)}
  :global(.saved-job-detail-modal .ant-modal){width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px);margin:12px auto}
  :global(.saved-job-detail-modal .ant-modal-body){max-height:none;overflow:visible;padding:16px;overscroll-behavior:auto}
  .saved-job-detail{max-height:calc(100dvh - 180px);padding-right:3px}
  .saved-job-detail__heading{flex-direction:column;gap:10px}
  .saved-job-detail h2{font-size:18px;line-height:1.45;overflow-wrap:anywhere}
  .saved-job-detail__meta{gap:9px;margin:12px 0}
}
</style>
