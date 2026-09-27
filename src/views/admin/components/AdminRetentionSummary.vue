<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getAdminRetentionSummary } from '@/api/admin'

const days = ref(30)
const data = ref(null)
const loading = ref(false)
const error = ref('')
const cards = computed(() => [
  { label: '活跃用户', value: data.value?.active_users, hint: `近 ${days.value} 天有记录行为的登录用户` },
  { label: '注册完成', value: data.value?.signups, hint: `简历保存 ${data.value?.resume_savers ?? 0} 人 · 岗位收藏 ${data.value?.job_savers ?? 0} 人` },
  { label: '首页到注册', value: formatRate(data.value?.cta_to_signup_rate), hint: `${data.value?.converted_sessions ?? 0} / ${data.value?.cta_sessions ?? 0} 个 CTA 会话` },
  { label: 'D7 有效留存', value: formatRate(data.value?.d7_retention_rate), hint: data.value?.d7_cohort_size ? `${data.value.d7_retained} / ${data.value.d7_cohort_size} 个成熟激活用户` : '成熟队列样本不足' },
  { label: '岗位推进', value: data.value?.users_advancing_jobs, hint: '近期至少更新过一次求职阶段的用户' },
  { label: '充值申请', value: data.value?.recharge_submissions, hint: '用户提交凭证的申请数' },
  { label: '充值入账', value: data.value?.recharge_credits, hint: '管理员审核完成的入账数' },
  { label: '页面访问', value: data.value?.page_views, hint: '仅作为漏斗背景，不代表有效留存' },
])

function formatRate(rate) {
  if (rate == null) return '样本不足'
  return `${(rate * 100).toFixed(1)}%`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await getAdminRetentionSummary(days.value)
    data.value = response?.data || response
  } catch {
    // 留存依赖单独的统计接口；失败时说明影响范围，不推测用户是否执行过数据库升级。
    error.value = '暂时无法读取留存数据，其他统计不受影响。请稍后重试。'
  } finally {
    loading.value = false
  }
}

watch(days, load)
onMounted(load)
</script>

<template>
  <section class="retention-section" aria-labelledby="retention-heading">
    <div class="retention-heading">
      <div>
        <h2 id="retention-heading">产品留存与关键漏斗</h2>
        <p>登录用户级聚合；留存按有效行动计算，不把单纯访问当成回访。</p>
      </div>
      <a-select v-model:value="days" :options="[{ value: 7, label: '近 7 天' }, { value: 30, label: '近 30 天' }, { value: 90, label: '近 90 天' }]" :disabled="loading" />
    </div>
    <div v-if="error" class="retention-error" role="alert">
      <span>{{ error }}</span>
      <a-button size="small" :loading="loading" @click="load">重试</a-button>
    </div>
    <div v-else-if="loading && !data" class="retention-loading" role="status">正在加载留存数据…</div>
    <div v-else-if="data" class="retention-grid" :aria-busy="loading">
      <article v-for="card in cards" :key="card.label" class="retention-card">
        <span>{{ card.label }}</span>
        <strong>{{ loading ? '…' : (card.value ?? 0) }}</strong>
        <small>{{ card.hint }}</small>
      </article>
    </div>
    <p class="retention-note">D7 仅统计已有完整 7 天观察窗口的激活用户；CTA 到注册按同一匿名会话关联。样本不足时不展示百分比。</p>
  </section>
</template>

<style scoped>
.retention-section { display:grid; gap:14px; margin-top:22px; }
.retention-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; }
.retention-heading h2 { margin:0; color:var(--color-ink); font-size:18px; font-weight:800; }
.retention-heading p,.retention-note { margin:5px 0 0; color:var(--color-ink-secondary); font-size:12px; line-height:1.6; }
.retention-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.retention-card { display:grid; gap:7px; min-width:0; padding:16px; border:1px solid var(--color-line); border-radius:16px; background:var(--color-surface); }
.retention-card span { color:var(--color-ink-secondary); font-size:12px; }
.retention-card strong { color:var(--color-ink); font-size:24px; line-height:1.15; overflow-wrap:anywhere; }
.retention-card small { color:var(--color-ink-secondary); font-size:11px; line-height:1.45; }
.retention-error,.retention-loading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0; padding:12px; border-radius:12px; background:var(--color-brand-lighter); color:var(--color-ink-secondary); font-size:12px; }
.retention-error :deep(.ant-btn) { min-height:36px; }
@media(max-width:800px) { .retention-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:560px) { .retention-heading { align-items:stretch; flex-direction:column; } .retention-heading :deep(.ant-select) { width:100%; } .retention-grid { gap:8px; } .retention-card { padding:12px; } .retention-card strong { font-size:20px; } }
</style>
