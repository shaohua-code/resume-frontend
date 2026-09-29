<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAdminLedgers, getAdminUsers } from '@/api/admin'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import { formatDateTime } from '@/utils/date'
import { getLedgerTypeLabel, getLedgerTypeOptions, hasPaidAmount } from '@/constants/roles'
import { replaceAiTaskLabels } from '@/constants/aiTasks'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const canViewRechargeRequests = computed(() => userStore.hasPermission('admin:view_recharge_requests'))
const loading = ref(false)
const ledgers = ref([])
const total = ref(0)
// 支持流水页常规筛选，也接收充值审核传入的具体流水与用户定位。
const query = reactive({ page: 1, size: 10, user_id: '', ledger_id: '', type: '' })

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

// 从精确充值流水返回该用户的充值申请，保留来源筛选。
function openRechargeRequests() {
  router.push({ path: '/admin/recharge-requests', query: { user_id: query.user_id } })
}

// 清除深链条件时同步移除地址栏参数，避免重置后又恢复旧定位。
function clearLedgerTarget() {
  query.ledger_id = ''
  query.user_id = ''
  const { ledger_id, user_id, ...remainingQuery } = route.query
  router.replace({ path: route.path, query: remainingQuery })
  loadLedgers()
}

onMounted(() => {
  // 识别充值审核传入的流水 ID 与用户 ID，避免在流水表中手动翻找。
  query.ledger_id = String(route.query.ledger_id || '')
  query.user_id = String(route.query.user_id || '')
  loadUserOptions()
  loadLedgers()
})
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div v-if="query.ledger_id || query.user_id" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-lighter px-4 py-3 text-sm text-brand-dark">
        <span v-if="query.ledger_id">当前仅显示充值申请关联的流水 #{{ query.ledger_id }}</span>
        <span v-else>当前按指定用户筛选账户流水</span>
        <div class="flex flex-wrap gap-3">
          <button v-if="query.user_id && canViewRechargeRequests" class="link-text" @click="openRechargeRequests">查看该用户充值申请</button>
          <button class="link-text" @click="clearLedgerTarget">清除定位</button>
        </div>
      </div>
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
