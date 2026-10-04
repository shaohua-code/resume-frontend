<!-- 管理端只读题库；ADMIN 的归属范围由后端再次校验，SUPER_ADMIN 可查看全站。 -->
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import AdminFilterCard from './AdminFilterCard.vue'
import { formatDateTime } from '@/utils/date'
import { getAdminInterviewQuestionSet, listAdminInterviewQuestionSets } from '@/api/interviewQuestions'

const userStore = useUserStore()
const loading = ref(false)
const loadError = ref('')
const rows = ref([])
const total = ref(0)
const detailOpen = ref(false)
const detailLoading = ref(false)
const detail = ref(null)
const query = reactive({ page: 1, size: 10, keyword: '', user_keyword: '', status: '' })
const columns = [
  { title: '用户', key: 'user', width: 210 },
  { title: '目标岗位', dataIndex: 'target_position', key: 'target_position', width: 190 },
  { title: '题目数', dataIndex: 'question_count_actual', key: 'question_count_actual', width: 90 },
  { title: '练习进度', key: 'progress', width: 130 },
  { title: '生成时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '操作', key: 'action', width: 90 },
]

async function loadSets() {
  loading.value = true
  loadError.value = ''
  try {
    // 空筛选不发给服务端，避免可选筛选项的空字符串触发校验失败。
    const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ''))
    const result = await listAdminInterviewQuestionSets(params)
    rows.value = result.items || []
    total.value = result.total || 0
  } catch {
    rows.value = []
    loadError.value = '题库记录加载失败，请重试。'
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  loadSets()
}

function reset() {
  Object.assign(query, { page: 1, size: 10, keyword: '', user_keyword: '', status: '' })
  loadSets()
}

async function openDetail(record) {
  detailOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await getAdminInterviewQuestionSet(record.id)
  } catch (error) {
    detailOpen.value = false
    message.error(error?.response?.data?.detail || '无权查看该题库，或记录已删除。')
  } finally {
    detailLoading.value = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadSets()
}

onMounted(loadSets)
</script>

<template>
  <div class="interview-admin">
    <AdminFilterCard title="面试题库" :description="userStore.role === 'SUPER_ADMIN' ? '只读查看全站用户生成的面试题' : '只读查看你名下用户生成的面试题'">
      <div class="interview-admin__filters grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(160px,0.8fr)_max-content]">
        <a-input v-model:value="query.keyword" allow-clear placeholder="搜索目标岗位" @press-enter="search" />
        <a-input v-model:value="query.user_keyword" allow-clear placeholder="搜索用户邮箱或昵称" @press-enter="search" />
        <a-select v-model:value="query.status" allow-clear placeholder="生成状态">
          <a-select-option value="todo">待练习</a-select-option>
          <a-select-option value="practicing">练习中</a-select-option>
          <a-select-option value="mastered">已掌握</a-select-option>
        </a-select>
        <div class="flex gap-2"><button class="btn-primary min-h-11 flex-1" @click="search">查询</button><button class="btn-ghost min-h-11 flex-1" @click="reset">重置</button></div>
      </div>
    </AdminFilterCard>
    <a-card :bordered="false" class="card-base interview-admin__table-card">
      <div v-if="loadError" class="mb-3 flex justify-between rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger" role="alert"><span>{{ loadError }}</span><button class="btn-ghost-sm" @click="loadSets">重试</button></div>
      <a-table :columns="columns" :data-source="rows" :loading="loading" :pagination="{ current: query.page, pageSize: query.size, total }" :scroll="{ x: 'max-content' }" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'"><AdminUserInfoCell :user-id="record.user_id" :nickname="record.user?.nickname" :email="record.user?.email" /></template>
          <template v-else-if="column.key === 'progress'"><span>{{ record.practiced_count || 0 }} / {{ record.question_count_actual || 0 }}</span></template>
          <template v-else-if="column.key === 'create_time'"><span>{{ formatDateTime(record.create_time) }}</span></template>
          <template v-else-if="column.key === 'action'"><button class="link-text" @click="openDetail(record)">查看题目</button></template>
        </template>
      </a-table>
    </a-card>
    <a-drawer v-model:open="detailOpen" placement="right" :width="'min(100vw, 760px)'" title="面试题库详情">
      <a-spin :spinning="detailLoading">
        <template v-if="detail">
          <p class="mb-4 text-sm text-muted">{{ detail.target_position }} · {{ formatDateTime(detail.create_time) }} · {{ detail.questions?.length || 0 }} 道题</p>
          <article v-for="(question, index) in detail.questions" :key="question.id" class="interview-admin__question mb-3 rounded-card border border-line/60 bg-surface p-4">
            <b>{{ index + 1 }}. {{ question.question }}</b>
            <p class="mt-2 text-sm text-muted">考察点：{{ question.evaluation_focus || '—' }}</p>
            <p v-if="question.resume_evidence" class="mt-1 text-sm text-muted">简历关联：{{ question.resume_evidence }}</p>
            <p v-if="question.answer_guidance" class="mt-1 text-sm text-muted">回答提示：{{ question.answer_guidance }}</p>
          </article>
          <p class="mt-4 text-xs text-muted">管理员视图不展示用户的练习答案与复盘内容。</p>
        </template>
      </a-spin>
    </a-drawer>
  </div>
</template>

<style scoped>
/* 后台题库采用清晰的筛选、列表、详情层级，窄屏保持可读与可操作。 */
.interview-admin{display:grid;gap:18px}
.interview-admin__filters{align-items:end}
.interview-admin__table-card{border:1px solid color-mix(in srgb,var(--color-line) 78%,transparent);border-radius:18px;box-shadow:0 8px 24px rgba(35,28,76,.045)}
.interview-admin__question{border-radius:16px;background:linear-gradient(135deg,var(--color-surface),color-mix(in srgb,var(--color-brand-lighter) 24%,var(--color-surface)));padding:18px;line-height:1.7;overflow-wrap:anywhere}
.interview-admin__question b{color:var(--color-ink);font-size:14px;line-height:1.7}
.interview-admin__question p{margin-top:8px;color:var(--color-muted);line-height:1.7}
@media(max-width:640px){.interview-admin{gap:14px}.interview-admin__filters{grid-template-columns:minmax(0,1fr)}.interview-admin__table-card{overflow:hidden;border-radius:14px}.interview-admin__question{padding:14px}}
</style>
