<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getAdminAiCalls } from '@/api/admin'
import AdminUserInfoCell from './AdminUserInfoCell.vue'

const loading = ref(false)
const aiCalls = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, task_type: '' })

const columns = [
  { title: '用户信息', key: 'user', width: 200 },
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
    <a-card :bordered="false" class="card-base">
      <div class="flex flex-col gap-3 sm:flex-row">
        <a-input :value="query.task_type" placeholder="任务类型，如 resume_generate" class="input-field w-full sm:w-72" @update:value="query.task_type = $event" />
        <button class="btn-primary" @click="loadAiCalls">查询记录</button>
      </div>
    </a-card>
    <a-card :bordered="false" class="card-base">
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
          <template v-if="column.key === 'success'">
            <span :class="record.success ? 'badge-success' : 'tag-soft'">{{ record.success ? '成功' : '失败' }}</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
