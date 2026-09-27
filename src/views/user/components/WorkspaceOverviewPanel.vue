<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getOnboardingState, getWorkspaceSummary, updateOnboardingState } from '@/api/workspace'
import { emitProductEvent } from '@/utils/productEvents'

const router = useRouter()
const summary = ref(null)
const onboarding = ref({ version: 1, completed_steps: [], dismissed: false })
const loading = ref(true)
const failed = ref(false)
const savingGuide = ref(false)

const guideSteps = [
  { id: 'goal', label: '设定求职目标', path: '/user?tab=career-goals' },
  { id: 'resume', label: '创建或完善简历', path: '/generate' },
  { id: 'job', label: '保存并跟进岗位', path: '/user?tab=saved-jobs' },
]
const completedSteps = computed(() => {
  const fromUser = new Set(onboarding.value.completed_steps || [])
  if (summary.value?.primary_goal) fromUser.add('goal')
  if (summary.value?.resume_count > 0) fromUser.add('resume')
  if (summary.value?.job_count > 0) fromUser.add('job')
  return fromUser
})
const showGuide = computed(() => !onboarding.value.dismissed && completedSteps.value.size < guideSteps.length)

async function load() {
  loading.value = true
  failed.value = false
  const [summaryResult, guideResult] = await Promise.allSettled([
    getWorkspaceSummary(),
    getOnboardingState(),
  ])
  if (summaryResult.status === 'fulfilled') summary.value = summaryResult.value
  else failed.value = true
  if (guideResult.status === 'fulfilled') onboarding.value = guideResult.value
  if (summaryResult.status === 'fulfilled' && guideResult.status === 'fulfilled') {
    const actualSteps = []
    if (summary.value?.primary_goal) actualSteps.push('goal')
    if (summary.value?.resume_count > 0) actualSteps.push('resume')
    if (summary.value?.job_count > 0) actualSteps.push('job')
    const storedSteps = [...(onboarding.value.completed_steps || [])].sort()
    if (actualSteps.slice().sort().join(',') !== storedSteps.join(',')) {
      void updateOnboardingState({ completed_steps: actualSteps })
        .then((state) => { onboarding.value = state })
        .catch(() => {})
    }
  }
  loading.value = false
}

async function completeStep(stepId) {
  if (completedSteps.value.has(stepId)) return
  savingGuide.value = true
  try {
    const next = [...completedSteps.value, stepId]
    onboarding.value = await updateOnboardingState({ version: 1, completed_steps: next })
  } finally {
    savingGuide.value = false
  }
}

async function dismissGuide() {
  savingGuide.value = true
  try {
    onboarding.value = await updateOnboardingState({ dismissed: true })
  } finally {
    savingGuide.value = false
  }
}

function openNextAction() {
  const action = summary.value?.next_action
  if (!action?.path) return
  void emitProductEvent('workspace_action_opened', { action_type: action.type, source_surface: 'workspace' })
  router.push(action.path)
}

function openActivity(activity) {
  if (activity.resource_type === 'resume') {
    router.push(`/editor/${activity.id}`)
    return
  }
  void emitProductEvent('workspace_action_opened', { action_type: 'review_job', source_surface: 'workspace' })
  router.push('/user?tab=saved-jobs')
}

function openGuideStep(step) {
  const actionType = { goal: 'create_goal', resume: 'create_resume', job: 'review_job' }[step.id]
  void emitProductEvent('workspace_action_opened', { action_type: actionType, source_surface: 'workspace' })
  router.push(step.path)
}

onMounted(load)
</script>

<template>
  <section class="workspace-overview">
    <div v-if="loading" class="overview-loading" aria-live="polite">正在整理你的求职进度…</div>
    <div v-else-if="failed" class="overview-error" role="alert">
      <span>暂时无法加载工作台数据，你的简历和岗位没有受到影响。</span>
      <a-button @click="load">重试</a-button>
    </div>
    <template v-else-if="summary">
      <article class="next-action-card">
        <div class="next-action-copy">
          <span class="overview-kicker">继续你的求职准备</span>
          <h2>{{ summary.next_action?.label || '查看求职进度' }}</h2>
          <p v-if="summary.primary_goal">
            当前目标：{{ summary.primary_goal.name }}<span v-if="summary.primary_goal.target_city"> · {{ summary.primary_goal.target_city }}</span>
          </p>
          <p v-else>从目标、简历或岗位开始，进度会在这里汇总。</p>
        </div>
        <a-button type="primary" size="large" @click="openNextAction">{{ summary.next_action?.label || '查看求职进度' }}</a-button>
      </article>

      <div class="overview-metrics" aria-label="求职进度摘要">
        <article><span>我的简历</span><strong>{{ summary.resume_count }}</strong><small>份可继续编辑</small></article>
        <article><span>进行中的岗位</span><strong>{{ summary.in_progress_job_count }}</strong><small>准备、投递或面试中</small></article>
        <article><span>已收藏岗位</span><strong>{{ summary.job_count }}</strong><small>已关联 {{ summary.active_goal_count }} 个进行中目标</small></article>
        <article><span>待处理计划</span><strong>{{ summary.due_action_count }}</strong><small>按你设置的下一步日期</small></article>
      </div>

      <article v-if="showGuide" class="onboarding-card">
        <div class="onboarding-heading">
          <div><span class="overview-kicker">轻量开始</span><h3>把求职准备串成一个流程</h3></div>
          <a-button type="text" :loading="savingGuide" @click="dismissGuide">稍后再说</a-button>
        </div>
        <div class="onboarding-steps">
          <button
            v-for="step in guideSteps"
            :key="step.id"
            type="button"
            class="onboarding-step"
            :class="{ 'is-complete': completedSteps.has(step.id) }"
            :disabled="savingGuide || completedSteps.has(step.id)"
            @click="openGuideStep(step)"
          >
            <span class="step-indicator">{{ completedSteps.has(step.id) ? '✓' : '○' }}</span>
            <span>{{ step.label }}</span>
            <span v-if="!completedSteps.has(step.id)" class="step-arrow">›</span>
          </button>
        </div>
      </article>

      <article v-if="summary.recent_resume" class="recent-resume-card">
        <div><span class="overview-kicker">最近编辑</span><h3>{{ summary.recent_resume.title }}</h3></div>
        <a-button @click="router.push(`/editor/${summary.recent_resume.id}`)">继续编辑</a-button>
      </article>

      <article v-if="summary.recent_activity?.length" class="recent-activity-card">
        <div class="activity-heading"><span class="overview-kicker">最近更新</span><span>简历与岗位</span></div>
        <button v-for="activity in summary.recent_activity" :key="`${activity.resource_type}-${activity.id}`" type="button" class="activity-row" @click="openActivity(activity)">
          <span class="activity-type">{{ activity.resource_type === 'resume' ? '简历' : '岗位' }}</span>
          <strong>{{ activity.display_title }}</strong>
          <small>{{ activity.detail || '继续完善与跟进' }}</small>
          <span aria-hidden="true">›</span>
        </button>
      </article>
    </template>
  </section>
</template>

<style scoped>
.workspace-overview { display: grid; gap: 18px; }
.next-action-card,.onboarding-card,.recent-resume-card,.overview-metrics article { border: 1px solid var(--color-line); border-radius: 18px; background: var(--color-surface); }
.next-action-card { position:relative; display:flex; align-items:center; justify-content:space-between; gap:20px; overflow:hidden; padding:26px 28px; border-color:transparent; background:var(--gradient-hero); box-shadow:var(--shadow-float); }
.next-action-card::after { position:absolute; right:6%; top:-94px; width:250px; height:250px; border:1px solid rgb(255 255 255 / .16); border-radius:50%; content:''; pointer-events:none; }
.overview-kicker { color:var(--color-brand); font-size:11px; font-weight:800; letter-spacing:.08em; }
.next-action-card .overview-kicker { color:rgb(255 255 255 / .72); }
.next-action-card h2 { margin:7px 0 4px; color:#fff; font-size:26px; font-weight:800; letter-spacing:-.03em; }
.next-action-card p { margin:0; color:rgb(255 255 255 / .76); }
.next-action-card :deep(.ant-btn-primary) { z-index:1; height:44px; padding-inline:21px; border:0; border-radius:12px; background:#fff; box-shadow:0 6px 20px rgb(26 19 60 / .18); color:var(--color-brand-dark); font-weight:700; }
.next-action-card :deep(.ant-btn-primary:hover) { background:var(--color-brand-lighter); color:var(--color-brand-dark); }
.overview-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
.overview-metrics article { display:grid; gap:7px; padding:17px; border-color:transparent; background:color-mix(in srgb,var(--color-brand-lighter) 38%,var(--color-surface)); color:var(--color-ink-secondary); font-size:12px; }
.overview-metrics article:nth-child(2n) { background:color-mix(in srgb,var(--color-accent-lighter) 48%,var(--color-surface)); }
.overview-metrics strong { color:var(--color-brand-dark); font-size:29px; line-height:1; letter-spacing:-.04em; }
.overview-metrics small { color:var(--color-ink-secondary); line-height:1.45; }
.onboarding-card { padding:20px; }
.onboarding-heading,.recent-resume-card { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.onboarding-heading h3 { margin:5px 0 0; color:var(--color-ink); font-size:18px; font-weight:800; }
.onboarding-steps { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:16px; }
.onboarding-step { display:flex; align-items:center; gap:8px; min-height:48px; padding:10px 12px; border:1px solid var(--color-line); border-radius:12px; background:var(--color-surface-soft); color:var(--color-ink); text-align:left; }
.onboarding-step:not(:disabled) { cursor:pointer; }
.onboarding-step.is-complete { color:var(--color-success); }
.step-indicator { font-weight:800; }
.step-arrow { margin-left:auto; color:var(--color-brand); font-size:20px; }
.recent-resume-card { padding:18px 20px; }
.recent-resume-card h3 { margin-top:5px; color:var(--color-ink); font-weight:700; }
.overview-loading,.overview-error { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:100px; padding:20px; border-radius:16px; background:var(--color-surface); color:var(--color-ink-secondary); }
.recent-activity-card { padding:18px 20px; border:1px solid var(--color-line); border-radius:18px; background:var(--color-surface); }
.activity-heading { display:flex; justify-content:space-between; margin-bottom:8px; color:var(--color-ink-secondary); font-size:12px; }
.activity-row { display:grid; grid-template-columns:64px minmax(0,1fr) minmax(80px,auto) 18px; align-items:center; gap:10px; width:100%; min-height:48px; padding:8px 0; border-top:1px solid var(--color-line); background:transparent; color:var(--color-ink); text-align:left; }
.activity-row strong { overflow:hidden; font-size:13px; text-overflow:ellipsis; white-space:nowrap; }
.activity-row small { overflow:hidden; color:var(--color-ink-secondary); text-overflow:ellipsis; white-space:nowrap; }
.activity-type { color:var(--color-brand); font-size:11px; font-weight:700; }
.activity-row > span:last-child { color:var(--color-brand); font-size:20px; }
@media(max-width:800px) { .overview-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); } .onboarding-steps { grid-template-columns:1fr; } }
@media(max-width:600px) { .workspace-overview { gap:12px; } .next-action-card { align-items:stretch; flex-direction:column; padding:21px; } .next-action-card h2 { font-size:22px; } .next-action-card :deep(.ant-btn-primary) { width:100%; } .overview-metrics { gap:8px; } .overview-metrics article { padding:13px; } .onboarding-card { padding:16px; } .onboarding-heading { align-items:flex-start; } .recent-resume-card,.recent-activity-card { padding:15px; } .activity-row { grid-template-columns:46px minmax(0,1fr) 18px; gap:7px; } .activity-row small { display:none; } }
</style>
