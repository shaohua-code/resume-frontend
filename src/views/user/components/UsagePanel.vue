<!--
  用量明细面板 - 余额卡片 + 流水列表
  移动端采用卡片列表，桌面端保留表格
-->
<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <a-card class="card-base" :bordered="false">
        <p class="text-sm text-muted">账户余额</p>
        <p class="mt-2 text-3xl font-bold text-danger">¥{{ balanceText }}</p>
        <p class="mt-2 text-xs text-muted">AI 功能按次扣费，余额不足时请先联系管理员充值</p>
      </a-card>
      <a-card class="card-base" :bordered="false">
        <p class="text-sm text-muted">累计消费</p>
        <p class="mt-2 text-3xl font-bold text-ink">¥{{ consumedText }}</p>
        <p class="mt-2 text-xs text-muted">包含所有 AI 调用产生的费用</p>
      </a-card>
    </div>

    <a-card class="card-base px-0" :bordered="false">
      <template #title>
        <span class="text-base font-semibold text-ink">额度变动记录</span>
      </template>

      <!-- 移动端：流水卡片列表 -->
      <div v-if="isMobile" class="space-y-3">
        <div
          v-for="record in walletStore.ledgerList"
          :key="record.id"
          class="rounded-card border border-line/60 bg-surface p-4 shadow-card"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="tag-soft">{{ getLedgerTypeLabel(record.type) }}</span>
            <span
              :class="record.amount >= 0 ? 'text-emerald-600' : 'text-danger'"
              class="text-base font-semibold"
            >
              {{ record.amount >= 0 ? '+' : '' }}¥{{ Number(record.amount).toFixed(4) }}
            </span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm text-ink-secondary">
            <span>余额 ¥{{ Number(record.balance_after).toFixed(2) }}</span>
            <span class="text-xs text-muted">{{ formatDateTime(record.create_time) }}</span>
          </div>
          <p v-if="formatRemark(record.remark, record.type) !== '-'" class="mt-2 text-sm text-ink">
            {{ formatRemark(record.remark, record.type) }}
          </p>
        </div>

        <div v-if="walletStore.loading" class="py-6 text-center text-sm text-muted">加载中...</div>
        <div v-else-if="!walletStore.ledgerList.length" class="py-6 text-center text-sm text-muted">暂无流水记录</div>

        <div v-if="walletStore.ledgerTotal > size" class="flex justify-center pt-2">
          <a-pagination
            :current="page"
            :page-size="size"
            :total="walletStore.ledgerTotal"
            size="small"
            @change="handleMobilePageChange"
          />
        </div>
      </div>

      <!-- 桌面端：流水表格 -->
      <a-table
        v-else
        :data-source="walletStore.ledgerList"
        :columns="columns"
        :loading="walletStore.loading"
        :pagination="{ current: page, pageSize: size, total: walletStore.ledgerTotal }"
        row-key="id"
        :scroll="{ x: 'max-content' }"
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
          <!-- 备注列：显示格式化后的备注（任务类型显示中文） -->
          <template v-if="column.key === 'remark'">
            <span class="text-sm text-ink">{{ formatRemark(record.remark, record.type) }}</span>
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
import { replaceAiTaskLabels } from '@/constants/aiTasks'
import { useMediaQuery } from '@/composables/useMediaQuery'

const walletStore = useWalletStore()
const isMobile = useMediaQuery()
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
  ADMIN_TRANSFER_OUT: '额度划拨',
  AI_CONSUME: 'AI 消费',
  REFUND: '退款',
}

const balanceText = computed(() => walletStore.balance.toFixed(2))
const consumedText = computed(() => walletStore.totalConsumed.toFixed(2))

function getLedgerTypeLabel(type) {
  return LEDGER_TYPE_MAP[type] || type
}

/**
 * 格式化备注字段，将任务类型英文标识替换为中文
 * @param {string} remark - 原始备注内容（如 "AI消费 - project_optimize"）
 * @param {string} type - 流水类型（如 "AI_CONSUME"）
 * @returns {string} 格式化后的备注（如 "AI消费 - 项目经历优化"）
 */
function formatRemark(remark, type) {
  if (!remark) return '-'

  // AI 消费备注统一按任务映射表替换，自动覆盖识别任务及后续新增任务。
  if (type === 'AI_CONSUME') {
    return replaceAiTaskLabels(remark)
  }

  return remark
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

/** 移动端分页切换 */
async function handleMobilePageChange(nextPage) {
  page.value = nextPage
  await walletStore.fetchLedger(page.value, size.value)
}

onMounted(loadData)
</script>
