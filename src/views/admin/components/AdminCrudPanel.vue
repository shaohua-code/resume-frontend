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
    defaultForm: () => ({ name: '', model_key: '', task_type: 'all', vip_only: false, enabled: true }),
    columns: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '模型Key', dataIndex: 'model_key', key: 'model_key' },
      { title: '任务类型', dataIndex: 'task_type', key: 'task_type', width: 140 },
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
    <a-card :bordered="false" class="rounded-[28px] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-base font-semibold text-slate-950">{{ currentConfig.title }}</p>
          <p class="mt-1 text-xs text-slate-400">统一维护后台基础资源配置</p>
        </div>
        <a-button type="primary" @click="openModal()">{{ currentConfig.addText }}</a-button>
      </div>
    </a-card>
    <a-card :bordered="false" class="rounded-[28px] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <a-table
        :columns="currentConfig.columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <a-tag :color="record.enabled ? 'green' : 'red'">{{ record.enabled ? '启用' : '停用' }}</a-tag>
          </template>
          <template v-if="column.key === 'vip_only'">
            <a-tag :color="record.vip_only ? 'gold' : 'blue'">{{ record.vip_only ? 'VIP' : '通用' }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openModal(record)">编辑</a-button>
              <a-popconfirm title="确定删除？" @confirm="removeItem(record.id)">
                <a-button type="link" danger size="small">删除</a-button>
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
