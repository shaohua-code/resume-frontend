<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getAdminLedgers, getAdminUsers } from '@/api/admin'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import { formatDateTime } from '@/utils/date'
import { getLedgerTypeLabel, getLedgerTypeOptions, hasPaidAmount } from '@/constants/roles'
import { replaceAiTaskLabels } from '@/constants/aiTasks'

const loading = ref(false)
const ledgers = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, user_id: '', type: '' })

// 用户下拉选项（用于用户筛选）
const userOptions = ref([])

const columns = [
  { title: '用户信息', key: 'user', width: 200 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 130 },
  { title: '变动金额', dataIndex: 'amount', key: 'amount', width: 140 },
  { title: '变动后余额', dataIndex: 'balance_after', key: 'balance_after', width: 140 },
  { title: '实付金额', dataIndex: 'paid_amount', key: 'paid_amount', width: 120 },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
]

// 获取流水类型筛选选项
const typeOptions = getLedgerTypeOptions()

/** 加载消费记录列表 */
async function loadLedgers() {
  loading.value = true
  try {
    const res = await getAdminLedgers({ ...query })
    ledgers.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

/** 加载用户下拉选项（用于筛选） */
async function loadUserOptions() {
  try {
    const res = await getAdminUsers({ page: 1, size: 100 })
    userOptions.value = (res.items || []).map((item) => ({
      value: item.user_id,
      label: item.nickname || item.email || item.user_id,
    }))
  } catch {
    // 加载失败忽略
  }
}

function formatAmount(amount) {
  const value = Number(amount || 0)
  return `${value >= 0 ? '+' : ''}¥${value.toFixed(4)}`
}

function formatPaidAmount(record) {
  if (!hasPaidAmount(record.type)) return '-'
  const value = Number(record.paid_amount || 0)
  return value > 0 ? `¥${value.toFixed(2)}` : '-'
}

/** AI 消费流水中的任务标识统一转换为中文，管理端与用户端保持一致。 */
function formatRemark(record) {
  if (!record.remark) return '-'
  return record.type === 'AI_CONSUME'
    ? replaceAiTaskLabels(record.remark)
    : record.remark
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadLedgers()
}

onMounted(() => {
  loadUserOptions()
  loadLedgers()
})
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <!-- 用户筛选下拉 -->
        <a-select
          :value="query.user_id"
          allow-clear
          show-search
          placeholder="选择用户"
          class="input-field w-full"
          :options="userOptions"
          :filter-option="(input, option) => option.label.toLowerCase().includes(input.toLowerCase())"
          @update:value="query.user_id = $event"
        />
        <!-- 类型筛选下拉 -->
        <a-select
          :value="query.type"
          allow-clear
          placeholder="选择流水类型"
          class="input-field w-full"
          @update:value="query.type = $event"
        >
          <a-select-option v-for="option in typeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
        <div class="md:col-span-2">
          <button class="btn-primary" @click="loadLedgers">查询记录</button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table
        :columns="columns"
        :data-source="ledgers"
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
          <template v-if="column.key === 'type'">
            <span class="tag-soft">{{ getLedgerTypeLabel(record.type) }}</span>
          </template>
          <template v-if="column.key === 'amount'">
            <span :class="record.amount >= 0 ? 'text-emerald-600' : 'text-danger'" class="font-medium">
              {{ formatAmount(record.amount) }}
            </span>
          </template>
          <template v-if="column.key === 'balance_after'">
            ¥{{ Number(record.balance_after).toFixed(2) }}
          </template>
          <template v-if="column.key === 'paid_amount'">
            <span class="text-sm text-ink">{{ formatPaidAmount(record) }}</span>
          </template>
          <template v-if="column.key === 'remark'">
            <span class="text-sm text-ink">{{ formatRemark(record) }}</span>
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
