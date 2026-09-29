<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getAdminAiCalls } from '@/api/admin'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import AdminFilterCard from './AdminFilterCard.vue'
import { formatDateTime } from '@/utils/date'
// 导入全局 AI 任务类型常量
import { getAiTaskLabel, getAiTaskOptions } from '@/constants/aiTasks'

const route = useRoute()
const loading = ref(false)
const aiCalls = ref([])
const total = ref(0)
const loadError = ref('')
// 同一查询对象承载页面筛选与跨页面传入的用户定位条件。
const query = reactive({
  page: 1,
  size: 10,
  task_type: '',
  success: '',
  keyword: '',
  user_id: '',
  create_time_from: '',
  create_time_to: '',
})
const dateRange = ref(null)

const columns = [
  { title: '用户信息', key: 'user', width: 200 },
  { title: '任务类型', dataIndex: 'task_type', key: 'task_type', width: 150 },
  { title: '模型', dataIndex: 'model', key: 'model', width: 160 },
  { title: 'Token', dataIndex: 'total_tokens', key: 'total_tokens', width: 100 },
  { title: '费用', dataIndex: 'cost', key: 'cost', width: 120 },
  { title: '结果', dataIndex: 'success', key: 'success', width: 100 },
  { title: '错误信息', dataIndex: 'error_message', key: 'error_message' },
  { title: '调用时间', dataIndex: 'create_time', key: 'create_time', width: 190 },
]

// 当前页 token 与费用合计
const pageSummary = computed(() => {
  return aiCalls.value.reduce(
    (acc, item) => {
      acc.totalTokens += Number(item.total_tokens) || 0
      acc.totalCost += Number(item.cost) || 0
      return acc
    },
    { totalTokens: 0, totalCost: 0 },
  )
})

// 获取任务类型筛选选项（用于下拉框）
const taskTypeOptions = getAiTaskOptions()

function formatModel(model) {
  return model?.trim() ? model : '-'
}

function formatCost(cost, success) {
  const value = Number(cost) || 0
  if (!value && !success) return '-'
  return `¥${value.toFixed(6)}`
}

function formatTokenTooltip(record) {
  const prompt = Number(record.prompt_tokens) || 0
  const completion = Number(record.completion_tokens) || 0
  return `输入 ${prompt} / 输出 ${completion}`
}

// 统计时间筛选使用本地自然日，后端统一以左闭右开 ISO 区间查询。
function updateDateRange(dates) {
  dateRange.value = dates?.[0] && dates?.[1] ? dates : null
  query.create_time_from = dates?.[0] ? dates[0].startOf('day').toISOString() : ''
  query.create_time_to = dates?.[1] ? dates[1].add(1, 'day').startOf('day').toISOString() : ''
}

function searchRecords() {
  query.page = 1
  loadAiCalls()
}

function resetFilters() {
  query.page = 1
  query.task_type = ''
  query.success = ''
  query.keyword = ''
  query.user_id = String(route.query.user_id || '')
  query.create_time_from = ''
  query.create_time_to = ''
  dateRange.value = null
  loadAiCalls()
}

async function loadAiCalls() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getAdminAiCalls(query)
    aiCalls.value = res.items || []
    total.value = res.total || 0
  } catch {
    aiCalls.value = []
    total.value = 0
    loadError.value = 'AI 调用记录加载失败，请检查连接后重试。'
  } finally {
    loading.value = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadAiCalls()
}

onMounted(() => {
  // 支持从账号页带用户 ID 进入 AI 调用审计。
  query.user_id = String(route.query.user_id || '')
  loadAiCalls()
})
</script>

<template>
  <div class="space-y-4">
    <AdminFilterCard title="筛选 AI 调用" description="按用户、任务结果与调用时间定位审计记录">
      <!-- 统一提供用户、任务、调用结果和日期筛选；输入后显式提交以减少重复请求。 -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.2fr)_minmax(160px,1fr)_minmax(140px,0.8fr)_minmax(260px,1.2fr)_max-content]">
        <a-input
          v-model:value="query.keyword"
          allow-clear
          class="input-field"
          placeholder="搜索用户邮箱或昵称"
          @press-enter="searchRecords"
        />
        <!-- 使用下拉选择框代替文本输入，显示任务类型中文名称 -->
        <a-select
          v-model:value="query.task_type"
          allow-clear
          placeholder="选择任务类型"
          class="input-field w-full"
        >
          <a-select-option v-for="option in taskTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
        <a-select v-model:value="query.success" allow-clear placeholder="调用结果" class="input-field w-full">
          <a-select-option value="true">成功</a-select-option>
          <a-select-option value="false">失败</a-select-option>
        </a-select>
        <a-range-picker
          :value="dateRange"
          class="input-field w-full"
          :placeholder="['开始日期', '结束日期']"
          @change="updateDateRange"
        />
        <div class="flex gap-2">
          <button class="btn-primary min-h-11 flex-1 whitespace-nowrap" @click="searchRecords">查询</button>
          <button class="btn-ghost min-h-11 flex-1 whitespace-nowrap" @click="resetFilters">重置</button>
        </div>
      </div>
      <template #context>
        <span v-if="query.user_id">当前限定为指定用户的 AI 调用记录</span>
      </template>
    </AdminFilterCard>
    <a-card :bordered="false" class="card-base">
      <div v-if="loadError" class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger" role="alert">
        <span>{{ loadError }}</span>
        <button class="btn-ghost-sm" :disabled="loading" @click="loadAiCalls">重试</button>
      </div>
      <div class="mb-3 flex flex-wrap gap-4 text-sm text-muted">
        <span>本页 Token 合计：<span class="font-medium text-ink">{{ pageSummary.totalTokens }}</span></span>
        <span>本页费用合计：<span class="font-medium text-ink">¥{{ pageSummary.totalCost.toFixed(6) }}</span></span>
      </div>
      <a-table
        :columns="columns"
        :data-source="aiCalls"
        :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }"
        :scroll="{ x: 'max-content' }"
        row-key="id"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <AdminUserInfoCell
              :user-id="record.user_id"
              :nickname="record.user?.nickname"
              :email="record.user?.email"
            />
          </template>
          <!-- 任务类型列：显示中文名称 -->
          <template v-if="column.key === 'task_type'">
            <span class="text-sm text-ink">{{ getAiTaskLabel(record.task_type) }}</span>
          </template>
          <template v-if="column.key === 'model'">
            <span class="text-sm text-ink">{{ formatModel(record.model) }}</span>
          </template>
          <template v-if="column.key === 'total_tokens'">
            <a-tooltip v-if="record.total_tokens" :title="formatTokenTooltip(record)">
              <span class="cursor-help text-sm text-ink">{{ record.total_tokens }}</span>
            </a-tooltip>
            <span v-else class="text-sm text-muted">-</span>
          </template>
          <template v-if="column.key === 'cost'">
            <span class="text-sm text-ink">{{ formatCost(record.cost, record.success) }}</span>
          </template>
          <template v-if="column.key === 'success'">
            <span :class="record.success ? 'badge-success' : 'tag-soft'">{{ record.success ? '成功' : '失败' }}</span>
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
