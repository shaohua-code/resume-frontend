<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getAdminAiCalls } from '@/api/admin'

const loading = ref(false)
const aiCalls = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, task_type: '' })

const columns = [
  { title: '用户ID', dataIndex: 'user_id', key: 'user_id' },
  { title: '任务类型', dataIndex: 'task_type', key: 'task_type', width: 150 },
  { title: '模型', dataIndex: 'model', key: 'model', width: 180 },
  { title: '结果', dataIndex: 'success', key: 'success', width: 100 },
  { title: '错误信息', dataIndex: 'error_message', key: 'error_message' },
  { title: '调用时间', dataIndex: 'create_time', key: 'create_time', width: 190 },
]

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
    <a-card :bordered="false" class="rounded-[28px] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div class="flex flex-col gap-3 sm:flex-row">
        <a-input :value="query.task_type" placeholder="任务类型，如 resume_generate" class="w-full sm:w-72" @update:value="query.task_type = $event" />
        <a-button type="primary" @click="loadAiCalls">查询记录</a-button>
      </div>
    </a-card>
    <a-card :bordered="false" class="rounded-[28px] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
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
          <template v-if="column.key === 'success'">
            <a-tag :color="record.success ? 'green' : 'red'">{{ record.success ? '成功' : '失败' }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
