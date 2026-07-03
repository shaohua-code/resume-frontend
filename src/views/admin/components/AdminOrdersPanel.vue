<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminOrders, updateAdminOrder } from '@/api/admin'
import AdminUserInfoCell from './AdminUserInfoCell.vue'

const loading = ref(false)
const orders = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, status: '' })

const columns = [
  { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
  { title: '用户信息', key: 'user', width: 200 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 150 },
  { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 190 },
  { title: '操作', key: 'action', width: 100 },
]

async function loadOrders() {
  loading.value = true
  try {
    const res = await getAdminOrders(query)
    orders.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function saveOrder(record) {
  await updateAdminOrder(record.id, { status: record.status, pay_time: record.pay_time })
  message.success('订单状态已保存')
  await loadOrders()
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadOrders()
}

onMounted(loadOrders)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="flex flex-col gap-3 sm:flex-row">
        <a-select :value="query.status" allow-clear placeholder="订单状态" class="input-field w-full sm:w-52" @update:value="query.status = $event">
          <a-select-option value="PENDING">待支付</a-select-option>
          <a-select-option value="PAID">已支付</a-select-option>
          <a-select-option value="CANCELLED">已取消</a-select-option>
          <a-select-option value="REFUNDED">已退款</a-select-option>
        </a-select>
        <button class="btn-primary" @click="loadOrders">查询订单</button>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table
        :columns="columns"
        :data-source="orders"
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
          <template v-if="column.key === 'status'">
            <a-select :value="record.status" class="input-field w-32" @update:value="record.status = $event">
              <a-select-option value="PENDING">待支付</a-select-option>
              <a-select-option value="PAID">已支付</a-select-option>
              <a-select-option value="CANCELLED">已取消</a-select-option>
              <a-select-option value="REFUNDED">已退款</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'action'">
            <button class="btn-primary-sm" @click="saveOrder(record)">保存</button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
