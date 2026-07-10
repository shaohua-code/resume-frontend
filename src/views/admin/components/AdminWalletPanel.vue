<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminWallets, adjustUserBalance, getQuotaPoolSummary } from '@/api/admin'
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

// 额度池摘要信息
const quotaPool = ref({ total_quota: 0, allocated_quota: 0, available: 0, total_paid_amount: 0 })

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
// 分配弹窗提交中状态（防止重复点击）
const adjustLoading = ref(false)
const adjustForm = reactive({
  userId: '',
  nickname: '',
  targetRole: 'USER',
  amount: 10,
  paidAmount: 0,
  remark: '',
})

// 剩余可分配额度
const availableQuota = computed(() => quotaPool.value.available || 0)

// 弹窗标题：区分超管给管理员分配额度池 / 管理员向用户划拨
const adjustModalTitle = computed(() => {
  if (isSuperAdmin.value && adjustForm.targetRole === 'ADMIN') {
    return `分配额度池 - ${adjustForm.nickname}`
  }
  if (isNormalAdmin.value) {
    return `划拨额度 - ${adjustForm.nickname}`
  }
  return `分配额度 - ${adjustForm.nickname}`
})

/** 拉取额度池摘要 */
async function loadQuotaPool() {
  try {
    const res = await getQuotaPoolSummary()
    if (res.success && res.data) {
      quotaPool.value = res.data
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

/** 根据角色与目标用户决定操作按钮文案 */
function getActionLabel(record) {
  if (isSuperAdmin.value && record.role === 'ADMIN') {
    return '分配额度池'
  }
  return '分配额度'
}

function openAdjust(record) {
  adjustForm.userId = record.user_id
  adjustForm.nickname = record.nickname
  adjustForm.targetRole = record.role || 'USER'
  adjustForm.amount = 10
  adjustForm.paidAmount = 0
  adjustForm.remark = ''
  adjustModalOpen.value = true
}

// 定义事件：分配成功后通知父组件刷新统计页数据
const emit = defineEmits(['quota-changed'])

/** 提交额度分配 */
async function submitAdjust() {
  const amount = Number(adjustForm.amount)
  const paidAmount = Number(adjustForm.paidAmount)

  // 校验分配金额
  if (!amount || amount <= 0) {
    message.warning('请输入分配金额（正数）')
    return
  }
  // 校验实付金额（必填）
  if (Number.isNaN(paidAmount) || paidAmount < 0) {
    message.warning('请输入实付金额（>=0）')
    return
  }
  // 校验可分配额度
  if (amount > availableQuota.value) {
    message.warning(`可分配额度不足（剩余 ¥${availableQuota.value.toFixed(2)}）`)
    return
  }
  adjustLoading.value = true
  try {
    await adjustUserBalance(adjustForm.userId, {
      amount,
      paid_amount: paidAmount,
      remark: adjustForm.remark,
    })
    message.success('额度已分配')
    adjustModalOpen.value = false
    await Promise.all([loadWallets(), loadQuotaPool()])
    // 通过 store 通知 admin/stats 页面刷新额度池数据
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
  await Promise.all([loadWallets(), loadQuotaPool()])
})
</script>

<template>
  <div class="space-y-4">
    <!-- 额度池摘要卡片 -->
    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <p class="text-sm text-muted">{{ isSuperAdmin ? '总额度池' : '我的额度池' }}</p>
          <p class="mt-2 text-2xl font-semibold text-brand-dark">¥{{ Number(quotaPool.total_quota).toFixed(2) }}</p>
        </div>
        <div>
          <p class="text-sm text-muted">已分配</p>
          <p class="mt-2 text-2xl font-semibold text-ink">¥{{ Number(quotaPool.allocated_quota).toFixed(2) }}</p>
        </div>
        <div>
          <p class="text-sm text-muted">剩余可分配</p>
          <p class="mt-2 text-2xl font-semibold text-emerald-600">¥{{ Number(quotaPool.available).toFixed(2) }}</p>
        </div>
        <div>
          <p class="text-sm text-muted">实付金额合计</p>
          <p class="mt-2 text-2xl font-semibold text-ink">¥{{ Number(quotaPool.total_paid_amount).toFixed(2) }}</p>
        </div>
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
            <!-- 管理员显示已分配额度 -->
            <span v-if="record.allocated_quota !== null && record.allocated_quota !== undefined"
              class="ml-2 text-xs text-muted">
              (已分配 ¥{{ Number(record.allocated_quota).toFixed(2) }})
            </span>
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

    <!-- 分配额度弹窗 -->
    <a-modal v-model:open="adjustModalOpen" :title="adjustModalTitle" ok-text="确认分配"
      :confirm-loading="adjustLoading" @ok="submitAdjust">
      <div class="space-y-4 py-2">
        <div class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-muted">
          当前剩余可分配额度 ¥{{ availableQuota.toFixed(2) }}，分配后将同步扣减
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">分配金额（正数）</p>
          <a-input-number v-model:value="adjustForm.amount" :min="0.01" :max="availableQuota" :step="1"
            class="w-full input-field" />
        </div>
        <!-- 实付金额（必填） -->
        <div>
          <p class="mb-2 text-sm text-muted">实付金额（必填，用户实际支付金额）</p>
          <a-input-number v-model:value="adjustForm.paidAmount" :min="0" :step="0.01"
            class="w-full input-field" placeholder="如：9.9" />
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">备注</p>
          <a-input v-model:value="adjustForm.remark" placeholder="如：活动赠送" class="input-field" />
        </div>
      </div>
    </a-modal>
  </div>
</template>
