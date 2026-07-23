<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminWallets, adjustUserBalance, getWalletSummary } from '@/api/admin'
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
// 普通管理员通过「充值记录」审核入账，不在此页手动分配额度
const isNormalAdmin = computed(() => userStore.role === 'ADMIN')

// 当前管理员额度摘要
const walletSummary = ref({ my_balance: 0, total_paid_amount: 0 })

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
const adjustLoading = ref(false)
const adjustForm = reactive({
  userId: '',
  nickname: '',
  targetRole: 'USER',
  amount: null,
  paidAmount: null,
  remark: '',
})

// 我的可用额度
const myBalance = computed(() => walletSummary.value.my_balance || 0)

// 超管对普通用户/管理员可扣减（负数）
const canDeduct = computed(() => isSuperAdmin.value && ['USER', 'ADMIN'].includes(adjustForm.targetRole))

// 弹窗标题
const adjustModalTitle = computed(() => {
  if (isNormalAdmin.value) {
    return `分配额度 - ${adjustForm.nickname}`
  }
  return canDeduct.value && Number(adjustForm.amount) < 0
    ? `回收额度 - ${adjustForm.nickname}`
    : `分配额度 - ${adjustForm.nickname}`
})

// 金额输入说明
const amountHint = computed(() => {
  if (canDeduct.value) {
    return '调整金额（正数分配，负数回收；回收后退回您的余额）'
  }
  return '分配金额（正数，必填）'
})

/** 拉取当前管理员额度摘要 */
async function loadWalletSummary() {
  try {
    const res = await getWalletSummary()
    if (res.success && res.data) {
      walletSummary.value = res.data
    }
  } catch {
    // 错误提示由拦截器处理
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

/** 操作按钮文案 */
function getActionLabel(record) {
  if (isSuperAdmin.value) {
    return '调整额度'
  }
  return '分配额度'
}

function openAdjust(record) {
  adjustForm.userId = record.user_id
  adjustForm.nickname = record.nickname
  adjustForm.targetRole = record.role || 'USER'
  adjustForm.amount = null
  adjustForm.paidAmount = null
  adjustForm.remark = ''
  adjustModalOpen.value = true
}

const emit = defineEmits(['quota-changed'])

/** 提交额度调整 */
async function submitAdjust() {
  const amount = Number(adjustForm.amount)
  const paidAmount = Number(adjustForm.paidAmount)
  const remark = String(adjustForm.remark || '').trim()

  if (!adjustForm.amount && adjustForm.amount !== 0) {
    message.warning('请输入调整金额')
    return
  }
  if (!amount || Number.isNaN(amount)) {
    message.warning('调整金额无效')
    return
  }
  if (adjustForm.paidAmount === null || adjustForm.paidAmount === '' || Number.isNaN(paidAmount) || paidAmount < 0) {
    message.warning('请输入实付金额（>=0）')
    return
  }
  if (!remark) {
    message.warning('请输入备注')
    return
  }
  // 分配时校验自身可用额度
  if (amount > 0 && amount > myBalance.value) {
    message.warning(`可用额度不足（剩余 ¥${myBalance.value.toFixed(2)}）`)
    return
  }
  if (isNormalAdmin.value && amount < 0) {
    message.warning('管理员仅可分配额度，不可扣减')
    return
  }

  adjustLoading.value = true
  try {
    await adjustUserBalance(adjustForm.userId, {
      amount,
      paid_amount: paidAmount,
      remark,
    })
    message.success(amount < 0 ? '额度已回收' : '额度已分配')
    adjustModalOpen.value = false
    await Promise.all([loadWallets(), loadWalletSummary()])
    userStore.triggerDashboardRefresh()
    emit('quota-changed')
  } catch {
    // 错误提示由 request 拦截器统一处理
  } finally {
    adjustLoading.value = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadWallets()
}

onMounted(async () => {
  await Promise.all([loadWallets(), loadWalletSummary()])
})
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p class="text-sm text-muted">我的可用额度</p>
          <p class="mt-2 text-2xl font-semibold text-emerald-600">¥{{ Number(walletSummary.my_balance).toFixed(2) }}</p>
        </div>
        <div>
          <p class="text-sm text-muted">实付金额合计</p>
          <p class="mt-2 text-2xl font-semibold text-ink">¥{{ Number(walletSummary.total_paid_amount).toFixed(2) }}</p>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <a-input :value="query.keyword" placeholder="搜索邮箱/昵称" class="input-field"
          @update:value="query.keyword = $event" />
        <div>
          <button class="btn-primary" @click="loadWallets">查询用户</button>
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
            <!-- 仅超管可在此页手动调整额度；普通管理员改走充值记录审核 -->
            <button
              v-if="isSuperAdmin"
              class="btn-primary-sm"
              @click="openAdjust(record)"
            >
              {{ getActionLabel(record) }}
            </button>
            <span v-else class="text-xs text-muted">请通过充值记录入账</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="adjustModalOpen" :title="adjustModalTitle" ok-text="确认"
      :confirm-loading="adjustLoading" @ok="submitAdjust">
      <div class="py-2 space-y-4">
        <div class="px-3 py-2 text-sm rounded-lg bg-canvas text-muted">
          当前可用额度 ¥{{ myBalance.toFixed(2) }}
          <span v-if="canDeduct">；回收后将退回您的余额</span>
          <span v-else>；分配后将同步扣减您的余额</span>
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">{{ amountHint }} <span class="text-danger">*</span></p>
          <a-input-number
            v-model:value="adjustForm.amount"
            :min="canDeduct ? undefined : 0.01"
            :max="canDeduct ? undefined : myBalance"
            :step="1"
            class="w-full input-field"
            placeholder="如：10 "
          />
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">实付金额（用户实际支付金额） <span class="text-danger">*</span></p>
          <a-input-number
            v-model:value="adjustForm.paidAmount"
            :min="0"
            :step="0.01"
            class="w-full input-field"
            placeholder="如：9.9"
          />
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">备注 <span class="text-danger">*</span></p>
          <a-input v-model:value="adjustForm.remark" placeholder="如：活动赠送" class="input-field" />
        </div>
      </div>
    </a-modal>
  </div>
</template>
