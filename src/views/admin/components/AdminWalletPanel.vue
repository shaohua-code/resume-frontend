<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminWallets, adjustUserBalance } from '@/api/admin'
import { getRoleLabel, getStatusLabel } from '@/constants/roles'
import { useUserStore } from '@/stores/user'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import { formatDateTime } from '@/utils/date'

const userStore = useUserStore()
const loading = ref(false)
const wallets = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '' })

// 仅超级管理员可扣减额度
const canDeduct = computed(() => userStore.role === 'SUPER_ADMIN')

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
  amount: 10,
  remark: '',
})

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

function openAdjust(record) {
  adjustForm.userId = record.user_id
  adjustForm.nickname = record.nickname
  adjustForm.amount = 10
  adjustForm.remark = ''
  adjustModalOpen.value = true
}

async function submitAdjust() {
  if (!adjustForm.amount) {
    message.warning('请输入调整金额')
    return
  }
  await adjustUserBalance(adjustForm.userId, {
    amount: Number(adjustForm.amount),
    remark: adjustForm.remark,
  })
  message.success('额度已调整')
  adjustModalOpen.value = false
  await loadWallets()
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadWallets()
}

onMounted(loadWallets)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <a-input :value="query.keyword" placeholder="搜索邮箱/昵称" class="input-field" @update:value="query.keyword = $event" />
        <button class="btn-primary" @click="loadWallets">查询用户</button>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table
        :columns="columns"
        :data-source="wallets"
        :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }"
        row-key="user_id"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'profile'">
            <AdminUserInfoCell
              :user-id="record.user_id"
              :nickname="record.nickname"
              :email="record.email"
            />
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
            <span :class="record.status === 'ACTIVE' ? 'badge-success' : 'tag-soft'">{{ getStatusLabel(record.status) }}</span>
          </template>
          <template v-if="column.key === 'update_time'">
            {{ formatDateTime(record.update_time) }}
          </template>
          <template v-if="column.key === 'action'">
            <button class="btn-primary-sm" @click="openAdjust(record)">调整额度</button>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="adjustModalOpen"
      :title="`调整额度 - ${adjustForm.nickname}`"
      ok-text="确认调整"
      @ok="submitAdjust"
    >
      <div class="space-y-4 py-2">
        <div>
          <p class="mb-2 text-sm text-muted">调整金额（正数增加，负数扣减{{ canDeduct ? '' : '，管理员仅可增加' }}）</p>
          <a-input-number
            v-model:value="adjustForm.amount"
            :min="canDeduct ? undefined : 0.01"
            :step="1"
            class="w-full input-field"
          />
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">备注</p>
          <a-input v-model:value="adjustForm.remark" placeholder="如：活动赠送" class="input-field" />
        </div>
      </div>
    </a-modal>
  </div>
</template>
