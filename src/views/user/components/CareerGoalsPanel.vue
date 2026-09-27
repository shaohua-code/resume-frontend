<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { AimOutlined, PlusOutlined, StarFilled } from '@ant-design/icons-vue'
import { createCareerGoal, deleteCareerGoal, getCareerGoals, updateCareerGoal } from '@/api/user'

const goals = ref([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', job_direction: '', target_city: '', career_stage: '', salary_expectation: '' })
const activeGoals = computed(() => goals.value.filter((item) => item.status === 'active'))

async function loadGoals() {
  loading.value = true
  try {
    const data = await getCareerGoals()
    goals.value = data.goals || []
  } catch {
    goals.value = []
  } finally { loading.value = false }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', job_direction: '', target_city: '', career_stage: '', salary_expectation: '' })
  modalOpen.value = true
}

function openEdit(goal) {
  editingId.value = goal.id
  Object.assign(form, {
    name: goal.name || '', job_direction: goal.job_direction || '', target_city: goal.target_city || '',
    career_stage: goal.career_stage || '', salary_expectation: goal.salary_expectation || '',
  })
  modalOpen.value = true
}

async function saveGoal() {
  if (!form.name.trim()) return message.warning('请填写目标名称')
  saving.value = true
  try {
    if (editingId.value) await updateCareerGoal(editingId.value, { ...form })
    else await createCareerGoal({ ...form, is_primary: goals.value.length === 0 })
    modalOpen.value = false
    await loadGoals()
    message.success(editingId.value ? '目标已更新' : '目标已创建')
  } catch { /* 请求层负责显示错误，并保留表单供重试。 */ }
  finally { saving.value = false }
}

async function makePrimary(goal) {
  try { await updateCareerGoal(goal.id, { is_primary: true }); await loadGoals(); message.success('已切换当前目标') }
  catch { /* 请求层负责显示错误。 */ }
}

async function setStatus(goal, status) {
  try { await updateCareerGoal(goal.id, { status, ...(status !== 'active' && goal.is_primary ? { is_primary: false } : {}) }); await loadGoals() }
  catch { /* 请求层负责显示错误。 */ }
}

async function removeGoal(goal) {
  try { await deleteCareerGoal(goal.id); await loadGoals(); message.success('目标已删除，关联岗位会保留') }
  catch { /* 请求层负责显示错误。 */ }
}

function confirmRemoveGoal(goal) {
  Modal.confirm({
    title: '删除这个求职目标？',
    content: '目标会从关联岗位中解除，但岗位记录和简历会保留。',
    okText: '删除目标',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => removeGoal(goal),
  })
}

onMounted(loadGoals)
</script>

<template>
  <section class="career-goals">
    <header class="career-goals__header">
      <!-- 用户中心外层已经展示当前栏目标题；这里保留目标数量与说明，避免重复标题占用移动端首屏。 -->
      <div class="career-goals__intro"><span>目标概览 · {{ goals.length }} 个方向</span><p>把岗位进度归入求职方向，回来时知道下一步继续推进什么。</p></div>
      <a-button type="primary" @click="openCreate"><PlusOutlined />新建目标</a-button>
    </header>
    <a-spin :spinning="loading">
      <a-empty v-if="!goals.length" description="还没有求职目标">
        <template #description><span>先写下目标岗位和城市，之后可把收藏岗位归入目标。</span></template>
        <a-button type="primary" @click="openCreate">创建第一个目标</a-button>
      </a-empty>
      <div v-else class="career-goals__grid">
        <article v-for="goal in goals" :key="goal.id" class="career-goal-card" :class="{ 'career-goal-card--primary': goal.is_primary }">
          <div class="career-goal-card__identity">
            <div class="career-goal-card__top"><span class="career-goal-card__icon"><AimOutlined /></span><a-tag :color="goal.status === 'active' ? 'green' : goal.status === 'paused' ? 'orange' : 'default'">{{ goal.status === 'active' ? '进行中' : goal.status === 'paused' ? '已暂停' : '已完成' }}</a-tag></div>
            <h4>{{ goal.name }}</h4>
            <p>{{ [goal.job_direction, goal.target_city, goal.career_stage].filter(Boolean).join(' · ') || '补充方向和城市，让目标更清晰' }}</p>
          </div>
          <div class="career-goal-card__counts" aria-label="目标关联岗位统计">
            <span class="career-goal-card__metric"><b>{{ goal.job_count || 0 }}</b><span>个关联岗位</span></span>
            <span class="career-goal-card__metric"><b>{{ goal.in_progress_count || 0 }}</b><span>个进行中</span></span>
          </div>
          <div class="career-goal-card__actions">
            <a-button v-if="!goal.is_primary && goal.status === 'active'" type="link" size="small" @click="makePrimary(goal)"><StarFilled />设为当前</a-button>
            <span v-else-if="goal.is_primary" class="career-goal-card__primary"><StarFilled />当前目标</span>
            <a-button type="link" size="small" @click="openEdit(goal)">编辑</a-button>
            <a-dropdown>
              <a-button type="link" size="small">更多</a-button>
              <template #overlay><a-menu>
                <a-menu-item v-if="goal.status !== 'paused'" @click="setStatus(goal, 'paused')">暂停目标</a-menu-item>
                <a-menu-item v-if="goal.status !== 'active'" @click="setStatus(goal, 'active')">继续目标</a-menu-item>
                <a-menu-item v-if="goal.status !== 'completed'" @click="setStatus(goal, 'completed')">标记完成</a-menu-item>
                <a-menu-item danger @click="confirmRemoveGoal(goal)">删除目标</a-menu-item>
              </a-menu></template>
            </a-dropdown>
          </div>
        </article>
      </div>
      <p v-if="activeGoals.length" class="career-goals__tip">建议只把当前正在推进的方向设为主目标；暂停或完成目标不会删除简历和岗位。</p>
    </a-spin>
    <a-modal v-model:open="modalOpen" :title="editingId ? '编辑求职目标' : '新建求职目标'" ok-text="保存目标" cancel-text="取消" :confirm-loading="saving" @ok="saveGoal">
      <a-form layout="vertical" class="career-goal-form">
        <a-form-item label="目标名称" required><a-input v-model:value="form.name" :maxlength="80" placeholder="例如：寻找上海的产品经理岗位" /></a-form-item>
        <a-form-item label="岗位方向"><a-input v-model:value="form.job_direction" :maxlength="120" placeholder="产品经理、前端开发……" /></a-form-item>
        <div class="career-goal-form__row"><a-form-item label="目标城市"><a-input v-model:value="form.target_city" :maxlength="120" placeholder="上海、杭州……" /></a-form-item><a-form-item label="求职阶段"><a-input v-model:value="form.career_stage" :maxlength="40" placeholder="校招、社招、转岗……" /></a-form-item></div>
        <a-form-item label="期望薪资（选填）"><a-input v-model:value="form.salary_expectation" :maxlength="80" placeholder="例如：20-30K" /></a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<style scoped>
.career-goals { display: grid; gap: 22px; }
.career-goals__header { display:flex; justify-content:space-between; align-items:center; gap:18px; }
.career-goals__intro { min-width:0; }
.career-goals__intro span { color:var(--color-brand); font-size:11px; font-weight:800; letter-spacing:.08em; }
.career-goals__header p,.career-goals__tip { margin:0; color:var(--color-ink-secondary); font-size:13px; }
/* auto-fit 折叠没有内容的轨道，让单个目标也能使用宽屏空间；多个目标保持宽卡片双列布局。 */
.career-goals__grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,580px),1fr)); gap:14px; }
.career-goal-card { display:grid; grid-template-columns:minmax(0,1fr) minmax(190px,240px) minmax(185px,auto); grid-template-areas:'identity counts actions'; align-items:center; gap:18px; min-width:0; padding:20px 22px; border:1px solid var(--color-line); border-radius:18px; background:var(--color-surface); }
.career-goal-card--primary { border-color:rgb(var(--color-brand-rgb) / .5); box-shadow:0 8px 24px rgb(var(--color-brand-rgb) / .08); }
.career-goal-card__identity { grid-area:identity; min-width:0; }
.career-goal-card__top,.career-goal-card__actions { display:flex; align-items:center; gap:8px; }
.career-goal-card__top { justify-content:space-between; }
.career-goal-card__icon { display:grid; place-items:center; width:36px; height:36px; border-radius:12px; background:var(--color-brand-lighter); color:var(--color-brand); }
.career-goal-card h4 { margin:15px 0 5px; color:var(--color-ink); font-size:17px; font-weight:800; }
.career-goal-card__identity p { min-height:20px; margin:0; color:var(--color-ink-secondary); font-size:12px; overflow-wrap:anywhere; }
.career-goal-card__counts { grid-area:counts; display:grid; grid-template-columns:1fr 1fr; gap:12px; color:var(--color-ink-secondary); font-size:11px; }
.career-goal-card__metric { display:grid; gap:2px; }
.career-goal-card__metric b { color:var(--color-ink); font-size:20px; line-height:1.2; }
.career-goal-card__actions { grid-area:actions; justify-content:flex-end; flex-wrap:wrap; min-width:0; }
.career-goal-card__actions :deep(.ant-btn-link) { min-height:44px; padding-inline:7px; }
.career-goal-card__primary { margin-right:auto; color:var(--color-brand); font-size:12px; white-space:nowrap; }
.career-goals__tip { padding:12px 14px; border-radius:12px; background:var(--color-brand-lighter); }
.career-goal-form__row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
/* 平板与手机将卡片改为纵向信息层级，并让操作按钮占满易触达区域。 */
@media(max-width:900px) {
  .career-goal-card { grid-template-columns:minmax(0,1fr) auto; grid-template-areas:'identity identity' 'counts actions'; gap:14px 10px; padding:17px; }
  .career-goal-card__counts { grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
}
@media(max-width:600px) {
  .career-goals { gap:16px; }
  .career-goals__header { align-items:stretch; flex-direction:column; gap:12px; }
  .career-goals__header .ant-btn { width:100%; min-height:44px; }
  .career-goals__grid { grid-template-columns:minmax(0,1fr); gap:12px; }
  .career-goal-card { grid-template-columns:minmax(0,1fr); grid-template-areas:'identity' 'counts' 'actions'; gap:14px; padding:15px; }
  .career-goal-card__counts { padding-top:12px; border-top:1px solid var(--color-line); }
  .career-goal-card__actions { justify-content:space-between; padding-top:8px; border-top:1px solid var(--color-line); }
  .career-goal-card__actions :deep(.ant-btn-link) { padding-inline:5px; }
  .career-goal-card__primary { margin-right:auto; }
  .career-goals__tip { padding:11px 12px; line-height:1.6; }
  .career-goal-form__row { grid-template-columns:1fr; gap:0; }
}
</style>
