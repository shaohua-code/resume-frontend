<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getAdminAiCalls } from '@/api/admin'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import { formatDateTime } from '@/utils/date'
// 导入全局 AI 任务类型常量
import { getAiTaskLabel, getAiTaskOptions } from '@/constants/aiTasks'

const loading = ref(false)
const aiCalls = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, task_type: '' })

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

async function loadAiCalls() {
  loading.value = true
  try {
    const res = await getAdminAiCalls(query)
    aiCalls.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadAiCalls()
}

onMounted(loadAiCalls)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="flex flex-col gap-3 sm:flex-row">
        <!-- 使用下拉选择框代替文本输入，显示任务类型中文名称 -->
        <a-select
          :value="query.task_type"
          allow-clear
          placeholder="选择任务类型"
          class="input-field w-full sm:w-72"
          @change="query.task_type = $event"
        >
          <a-select-option v-for="option in taskTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
        <button class="btn-primary" @click="loadAiCalls">查询记录</button>
      </div>
    </a-card>
    <a-card :bordered="false" class="card-base">
      <div class="mb-3 flex flex-wrap gap-4 text-sm text-muted">
        <span>本页 Token 合计：<span class="font-medium text-ink">{{ pageSummary.totalTokens }}</span></span>
        <span>本页费用合计：<span class="font-medium text-ink">¥{{ pageSummary.totalCost.toFixed(6) }}</span></span>
      </div>
      <a-table
        :columns="columns"
        :data-source="aiCalls"
        :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }"
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
