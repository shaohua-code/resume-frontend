<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminWallets, adjustUserBalance } from '@/api/admin'
import { getWalletBalance } from '@/api/wallet'
import { getRoleLabel, getStatusLabel } from '@/constants/roles'
import { useUserStore } from '@/stores/user'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import { formatDateTime } from '@/utils/date'

const userStore = useUserStore()
const loading = ref(false)
const wallets = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '' })

// 当前登录角色
const isSuperAdmin = computed(() => userStore.role === 'SUPER_ADMIN')
const isNormalAdmin = computed(() => userStore.role === 'ADMIN')
// 仅超级管理员可扣减额度
const canDeduct = computed(() => isSuperAdmin.value)
// 管理员自身可分配额度池
const myBalance = ref(0)

const columns = [
  { title: '用户信息', key: 'profile' },
  { title: '角色', dataIndex: 'role', key: 'role', width: 120 },
  { title: '余额', dataIndex: 'balance', key: 'balance', width: 120 },
  { title: '累计消费', dataIndex: 'total_consumed', key: 'total_consumed', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 180 },
  { title: '操作', key: 'action', width: 200 },
]

const adjustModalOpen = ref(false)
const adjustForm = reactive({
  userId: '',
  nickname: '',
  targetRole: 'USER',
  amount: 10,
  remark: '',
})

// 管理员划拨时，单次最大金额不超过自身可分配额度
const maxAdjustAmount = computed(() => {
  if (isNormalAdmin.value) {
    return myBalance.value > 0 ? myBalance.value : 0.01
  }
  return undefined
})

// 弹窗标题：区分超管给管理员分配额度池 / 管理员向用户划拨
const adjustModalTitle = computed(() => {
  if (isSuperAdmin.value && adjustForm.targetRole === 'ADMIN') {
    return `分配额度池 - ${adjustForm.nickname}`
  }
  if (isNormalAdmin.value) {
    return `划拨额度 - ${adjustForm.nickname}`
  }
  return `调整额度 - ${adjustForm.nickname}`
})

// 金额输入区说明文案
const amountHint = computed(() => {
  if (isNormalAdmin.value) {
    return `从您的可分配额度中划拨（当前可分配 ¥${myBalance.value.toFixed(2)}）`
  }
  if (isSuperAdmin.value && adjustForm.targetRole === 'ADMIN') {
    return '为管理员增加可分配额度池（正数增加，负数扣减）'
  }
  return `调整金额（正数增加，负数扣减${canDeduct.value ? '' : '，管理员仅可增加' }）`
})

/** 拉取管理员自身可分配额度 */
async function loadMyBalance() {
  if (!isNormalAdmin.value) {
    return
  }
  const res = await getWalletBalance()
  if (res.success && res.data) {
    myBalance.value = Number(res.data.balance || 0)
  }
}

async function loadWallets() {
  loading.value = true
  try {
    const res = await getAdminWallets({ ...query })
    wallets.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

/** 根据角色与目标用户决定操作按钮文案 */
function getActionLabel(record) {
  if (isSuperAdmin.value && record.role === 'ADMIN') {
    return '分配额度池'
  }
  if (isNormalAdmin.value) {
    return '划拨额度'
  }
  return '调整额度'
}

function openAdjust(record) {
  adjustForm.userId = record.user_id
  adjustForm.nickname = record.nickname
  adjustForm.targetRole = record.role || 'USER'
  adjustForm.amount = isNormalAdmin.value ? Math.min(10, myBalance.value || 10) : 10
  adjustForm.remark = ''
  adjustModalOpen.value = true
}

async function submitAdjust() {
  const amount = Number(adjustForm.amount)
  if (!amount) {
    message.warning('请输入调整金额')
    return
  }
  // 管理员划拨前校验自身额度是否充足
  if (isNormalAdmin.value && amount > 0 && amount > myBalance.value) {
    message.warning(`可分配额度不足（当前 ¥${myBalance.value.toFixed(2)}）`)
    return
  }
  try {
    await adjustUserBalance(adjustForm.userId, {
      amount,
      remark: adjustForm.remark,
    })
    message.success(isNormalAdmin.value ? '额度已划拨' : '额度已调整')
    adjustModalOpen.value = false
    await Promise.all([loadWallets(), loadMyBalance()])
  } catch {
    // 错误提示由 request 拦截器统一处理
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadWallets()
}

onMounted(async () => {
  await Promise.all([loadWallets(), loadMyBalance()])
})
</script>

<template>
  <div class="space-y-4">
    <!-- 管理员展示自身可分配额度 -->
    <a-card v-if="isNormalAdmin" :bordered="false" class="card-base">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-muted">我的可分配额度</p>
          <p class="text-2xl font-semibold text-brand-dark">¥{{ myBalance.toFixed(2) }}</p>
        </div>
        <p class="text-sm text-muted">向用户划拨额度时，将从此处扣减</p>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <a-input :value="query.keyword" placeholder="搜索邮箱/昵称" class="h-[32px] input-field"
          @update:value="query.keyword = $event" />
        <div>
          <button class="btn-primary h-[32px]" @click="loadWallets">查询用户</button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table :columns="columns" :data-source="wallets" :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }" :scroll="{ x: 'max-content' }"
        row-key="user_id" size="small" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'profile'">
            <AdminUserInfoCell :user-id="record.user_id" :nickname="record.nickname" :email="record.email" />
          </template>
          <template v-if="column.key === 'role'">
            <span class="badge">{{ getRoleLabel(record.role) }}</span>
          </template>
          <template v-if="column.key === 'balance'">
            <span class="font-semibold text-brand-dark">¥{{ Number(record.balance).toFixed(2) }}</span>
          </template>
          <template v-if="column.key === 'total_consumed'">
            ¥{{ Number(record.total_consumed).toFixed(2) }}
          </template>
          <template v-if="column.key === 'status'">
            <span :class="record.status === 'ACTIVE' ? 'badge-success' : 'tag-soft'">{{ getStatusLabel(record.status)
            }}</span>
          </template>
          <template v-if="column.key === 'update_time'">
            {{ formatDateTime(record.update_time) }}
          </template>
          <template v-if="column.key === 'action'">
            <button class="btn-primary-sm" @click="openAdjust(record)">{{ getActionLabel(record) }}</button>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="adjustModalOpen" :title="adjustModalTitle" ok-text="确认" @ok="submitAdjust">
      <div class="space-y-4 py-2">
        <div v-if="isNormalAdmin" class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-muted">
          划拨后您的可分配额度将同步减少
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">{{ amountHint }}</p>
          <a-input-number v-model:value="adjustForm.amount"
            :min="canDeduct ? undefined : 0.01"
            :max="isNormalAdmin ? maxAdjustAmount : undefined"
            :step="1"
            class="w-full input-field" />
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">备注</p>
          <a-input v-model:value="adjustForm.remark" placeholder="如：活动赠送" class="input-field" />
        </div>
      </div>
    </a-modal>
  </div>
</template>
