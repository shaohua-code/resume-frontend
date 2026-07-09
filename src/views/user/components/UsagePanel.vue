<!--
  用量明细面板 - 余额卡片 + 流水列表
-->
<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <a-card class="card-base" :bordered="false">
        <p class="text-sm text-muted">账户余额</p>
        <p class="mt-2 text-3xl font-bold text-brand-dark">¥{{ balanceText }}</p>
        <p class="mt-2 text-xs text-muted">AI 功能按次扣费，余额不足时请先联系管理员充值</p>
      </a-card>
      <a-card class="card-base" :bordered="false">
        <p class="text-sm text-muted">累计消费</p>
        <p class="mt-2 text-3xl font-bold text-ink">¥{{ consumedText }}</p>
        <p class="mt-2 text-xs text-muted">包含所有 AI 调用产生的费用</p>
      </a-card>
    </div>

    <a-card class="card-base" :bordered="false">
      <template #title>
        <span class="text-base font-semibold text-ink">额度变动记录</span>
      </template>
      <a-table
        :data-source="walletStore.ledgerList"
        :columns="columns"
        :loading="walletStore.loading"
        :pagination="{ current: page, pageSize: size, total: walletStore.ledgerTotal }"
        row-key="id"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <span class="tag-soft">{{ getLedgerTypeLabel(record.type) }}</span>
          </template>
          <template v-if="column.key === 'amount'">
            <span :class="record.amount >= 0 ? 'text-emerald-600' : 'text-danger'" class="font-medium">
              {{ record.amount >= 0 ? '+' : '' }}¥{{ Number(record.amount).toFixed(4) }}
            </span>
          </template>
          <template v-if="column.key === 'balance_after'">
            ¥{{ Number(record.balance_after).toFixed(2) }}
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { formatDateTime } from '@/utils/date'

const walletStore = useWalletStore()
const page = ref(1)
const size = ref(10)

const columns = [
  { title: '类型', dataIndex: 'type', key: 'type', width: 140 },
  { title: '变动金额', dataIndex: 'amount', key: 'amount', width: 140 },
  { title: '变动后余额', dataIndex: 'balance_after', key: 'balance_after', width: 140 },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
]

// 流水类型中文映射
const LEDGER_TYPE_MAP = {
  REGISTER_GIFT: '注册赠送',
  ADMIN_GRANT: '管理员充值',
  ADMIN_DEDUCT: '管理员扣减',
  AI_CONSUME: 'AI 消费',
  REFUND: '退款',
}

const balanceText = computed(() => walletStore.balance.toFixed(2))
const consumedText = computed(() => walletStore.totalConsumed.toFixed(2))

function getLedgerTypeLabel(type) {
  return LEDGER_TYPE_MAP[type] || type
}

async function loadData() {
  await walletStore.fetchBalance()
  await walletStore.fetchLedger(page.value, size.value)
}

async function handleTableChange(pagination) {
  page.value = pagination.current
  size.value = pagination.pageSize
  await walletStore.fetchLedger(page.value, size.value)
}

onMounted(loadData)
</script>
