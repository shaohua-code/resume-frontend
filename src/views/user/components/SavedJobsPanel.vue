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
  getExtensionJob,
  getExtensionJobs,
} from '@/api/extensionJobs'
import { formatDateTime } from '@/utils/date'

const jobs = ref([])
const loading = ref(false)
const status = ref('all')
const loadError = ref('')
const detailOpen = ref(false)
const detailLoading = ref(false)
const analysisLoading = ref(false)
const deleting = ref(false)
const selectedJob = ref(null)

const statusMeta = {
  saved: { label: '\u5df2\u6536\u85cf', color: 'blue' },
  ready: { label: '\u5df2\u5206\u6790', color: 'green' },
  applied: { label: '\u5df2\u6295\u9012', color: 'purple' },
  archived: { label: '\u5df2\u5f52\u6863', color: 'default' },
}

const filters = [
  { label: '\u5168\u90e8', value: 'all' },
  { label: '\u5df2\u5206\u6790', value: 'ready' },
  { label: '\u5df2\u6536\u85cf', value: 'saved' },
]

const visibleJobs = computed(() => status.value === 'all'
  ? jobs.value
  : jobs.value.filter((job) => job.status === status.value))

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
    const data = await getExtensionJobs()
    jobs.value = data.jobs || []
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
  try {
    const data = await getExtensionJob(job.id)
    selectedJob.value = data.job || job
  } catch (error) {
    message.error(error?.message || '暂时无法加载岗位详情')
  } finally {
    detailLoading.value = false
  }
}

function replaceJob(updatedJob) {
  jobs.value = jobs.value.map((job) => job.id === updatedJob.id ? updatedJob : job)
  selectedJob.value = updatedJob
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
      <a-segmented v-model:value="status" :options="filters" size="small" />
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
              <a-tag :color="statusMeta[job.status]?.color">{{ statusMeta[job.status]?.label || '已收藏' }}</a-tag>
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
      <a-empty v-else description="还没有收藏的岗位">
        <template #description>
          <div class="saved-jobs-empty">
            <b>还没有收藏的岗位</b>
            <span>在招聘页面打开 AI 简历 Agent，即可识别、分析并保存。</span>
          </div>
        </template>
      </a-empty>
    </a-spin>

    <a-modal v-model:open="detailOpen" title="岗位详情" :footer="null" width="680px">
      <a-spin :spinning="detailLoading">
        <section v-if="selectedJob" class="saved-job-detail">
          <a-alert v-if="needsRefresh(selectedJob)" class="saved-job-detail__warning" type="warning" show-icon message="该岗位由旧版插件保存，返回原招聘页重新识别后会自动补全字段。" />
          <div class="saved-job-detail__heading">
            <div><h2>{{ selectedJob.title }}</h2><p>{{ selectedJob.company || '暂未识别公司' }}</p></div>
            <span class="saved-job-status" :data-status="selectedJob.status || 'saved'">
              <CheckCircleOutlined />{{ statusMeta[selectedJob.status]?.label || '已收藏' }}
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
