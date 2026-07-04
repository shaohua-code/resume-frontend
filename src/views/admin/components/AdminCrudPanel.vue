<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { aiModelApi, announcementApi, membershipPlanApi } from '@/api/admin'
import AdminCrudModal from './AdminCrudModal.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'plans',
  },
})

const loading = ref(false)
const items = ref([])
const modalOpen = ref(false)
const modalId = ref(null)
const modalForm = ref({})

const crudConfig = {
  plans: {
    title: '会员套餐',
    addText: '新增套餐',
    api: membershipPlanApi,
    defaultForm: () => ({ name: '', price: 0, duration_days: 30, description: '', enabled: true }),
    columns: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '价格', dataIndex: 'price', key: 'price', width: 100 },
      { title: '天数', dataIndex: 'duration_days', key: 'duration_days', width: 100 },
      { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 100 },
      { title: '操作', key: 'action', width: 150 },
    ],
  },
  announcements: {
    title: '公告',
    addText: '新增公告',
    api: announcementApi,
    defaultForm: () => ({ title: '', content: '', enabled: true }),
    columns: [
      { title: '标题', dataIndex: 'title', key: 'title' },
      { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 100 },
      { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 190 },
      { title: '操作', key: 'action', width: 150 },
    ],
  },
  models: {
    title: 'AI模型',
    addText: '新增模型',
    api: aiModelApi,
    defaultForm: () => ({
      name: '',
      model_key: '',
      task_type: 'all',
      input_price_per_million: 0,
      output_price_per_million: 0,
      vip_only: false,
      enabled: true,
    }),
    columns: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '模型Key', dataIndex: 'model_key', key: 'model_key' },
      { title: '任务类型', dataIndex: 'task_type', key: 'task_type', width: 140 },
      { title: '输入单价', dataIndex: 'input_price_per_million', key: 'input_price_per_million', width: 110 },
      { title: '输出单价', dataIndex: 'output_price_per_million', key: 'output_price_per_million', width: 110 },
      { title: 'VIP专属', dataIndex: 'vip_only', key: 'vip_only', width: 110 },
      { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 100 },
      { title: '操作', key: 'action', width: 150 },
    ],
  },
}

const currentConfig = computed(() => crudConfig[props.type] || crudConfig.plans)
const modalTitle = computed(() => `${modalId.value ? '编辑' : '新增'}${currentConfig.value.title}`)

async function loadItems() {
  loading.value = true
  try {
    const res = await currentConfig.value.api.list()
    items.value = res.items || []
  } finally {
    loading.value = false
  }
}

function openModal(record = null) {
  modalId.value = record?.id || null
  modalForm.value = record ? { ...record } : currentConfig.value.defaultForm()
  modalOpen.value = true
}

async function submitModal() {
  if (modalId.value) {
    await currentConfig.value.api.update(modalId.value, modalForm.value)
  } else {
    await currentConfig.value.api.create(modalForm.value)
  }
  modalOpen.value = false
  message.success('保存成功')
  await loadItems()
}

async function removeItem(id) {
  await currentConfig.value.api.remove(id)
  message.success('删除成功')
  await loadItems()
}

onMounted(loadItems)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="rounded-card shadow-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-base font-semibold text-ink">{{ currentConfig.title }}</p>
          <p class="mt-1 text-xs text-muted">统一维护后台基础资源配置</p>
        </div>
        <button class="btn-primary" @click="openModal()">{{ currentConfig.addText }}</button>
      </div>
    </a-card>
    <a-card :bordered="false" class="rounded-card shadow-card">
      <a-table
        :columns="currentConfig.columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <span :class="record.enabled ? 'badge-success' : 'tag-soft'">{{ record.enabled ? '启用' : '停用' }}</span>
          </template>
          <template v-if="column.key === 'vip_only'">
            <span :class="record.vip_only ? 'badge' : 'tag-soft'">{{ record.vip_only ? 'VIP' : '通用' }}</span>
          </template>
          <template v-if="column.key === 'input_price_per_million'">
            <span class="text-sm text-muted">¥{{ record.input_price_per_million ?? 0 }}/M</span>
          </template>
          <template v-if="column.key === 'output_price_per_million'">
            <span class="text-sm text-muted">¥{{ record.output_price_per_million ?? 0 }}/M</span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <button class="link-text text-sm" @click="openModal(record)">编辑</button>
              <a-popconfirm title="确定删除？" @confirm="removeItem(record.id)">
                <button class="text-sm font-medium text-danger transition-colors hover:text-red-500">删除</button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <AdminCrudModal
      v-model="modalOpen"
      :form="modalForm"
      :type="type"
      :title="modalTitle"
      @update:form="modalForm = $event"
      @submit="submitModal"
    />
  </div>
</template>
