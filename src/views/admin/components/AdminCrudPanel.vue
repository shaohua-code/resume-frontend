<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { aiModelApi, announcementApi } from '@/api/admin'
import AdminCrudModal from './AdminCrudModal.vue'
import { formatDateTime } from '@/utils/date'
import { getAiModelTypeLabel } from '@/constants/aiTasks'

const props = defineProps({
  type: {
    type: String,
    default: 'announcements',
  },
})

const loading = ref(false)
const items = ref([])
const modalOpen = ref(false)
const modalId = ref(null)
const modalForm = ref({})
const modelKeyword = ref('')
const activeModelType = ref('all')
const rateModalOpen = ref(false)
const rateMultiplier = ref(1)
const rateSubmitting = ref(false)

const modelTypeTabs = [
  { key: 'text', label: '文本模型' },
  { key: 'audio', label: '语音模型' },
  { key: 'vision', label: '视觉模型' },
  { key: 'omni', label: '全模态模型' },
  { key: 'embedding', label: '向量模型' },
]

const crudConfig = {
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
      provider: 'deepseek',
      model_type: 'text',
      api_url: '',
      api_key_env: 'DEEPSEEK_API_KEY',
      input_price_per_million: 0,
      cached_input_price_per_million: 0,
      output_price_per_million: 0,
      thinking_enabled: null,
      enabled: true,
    }),
    columns: [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '模型Key', dataIndex: 'model_key', key: 'model_key' },
      { title: '供应商', dataIndex: 'provider', key: 'provider', width: 120 },
      { title: '模型类型', dataIndex: 'model_type', key: 'model_type', width: 120 },
      { title: '输入单价', dataIndex: 'input_price_per_million', key: 'input_price_per_million', width: 110 },
      { title: '缓存输入', dataIndex: 'cached_input_price_per_million', key: 'cached_input_price_per_million', width: 110 },
      { title: '输出单价', dataIndex: 'output_price_per_million', key: 'output_price_per_million', width: 110 },
      { title: '深度思考', dataIndex: 'thinking_enabled', key: 'thinking_enabled', width: 110 },
      { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 100 },
      { title: '操作', key: 'action', width: 150 },
    ],
  },
}

const currentConfig = computed(() => crudConfig[props.type] || crudConfig.announcements)
const modalTitle = computed(() => `${modalId.value ? '编辑' : '新增'}${currentConfig.value.title}`)
const displayItems = computed(() => {
  if (props.type !== 'models') return items.value
  const keyword = modelKeyword.value.trim().toLowerCase()
  return items.value.filter((item) => {
    const matchesKeyword = !keyword
      || String(item.name || '').toLowerCase().includes(keyword)
      || String(item.model_key || '').toLowerCase().includes(keyword)
    const matchesType = activeModelType.value === 'all' || item.model_type === activeModelType.value
    return matchesKeyword && matchesType
  })
})

async function loadItems() {
  loading.value = true
  try {
    const params = props.type === 'models'
      ? { name: modelKeyword.value.trim(), model_type: activeModelType.value }
      : {}
    const res = await currentConfig.value.api.list(params)
    items.value = res.items || []
  } finally {
    loading.value = false
  }
}

function resetModelFilters() {
  modelKeyword.value = ''
  activeModelType.value = 'all'
  loadItems()
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

async function submitRateAdjustment() {
  const multiplier = Number(rateMultiplier.value)
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    message.warning('请输入大于 0 的倍率')
    return
  }
  rateSubmitting.value = true
  try {
    await aiModelApi.adjustRate(multiplier)
    message.success(`已按 ${multiplier} 倍调整所有模型单价`)
    rateModalOpen.value = false
    rateMultiplier.value = 1
    await loadItems()
  } finally {
    rateSubmitting.value = false
  }
}

onMounted(loadItems)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="rounded-card shadow-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-base font-semibold text-ink">{{ currentConfig.title }}</p>
          <p class="mt-1 text-xs text-muted">{{ type === 'models' ? '维护模型类型、供应商、调用入口与 Token 单价' : '统一维护后台基础资源配置' }}</p>
        </div>
        <a-space>
          <button v-if="type === 'models'" class="btn-ghost" @click="rateModalOpen = true">一键倍率调整</button>
          <button class="btn-primary" @click="openModal()">{{ currentConfig.addText }}</button>
        </a-space>
      </div>
    </a-card>
    <a-card v-if="type === 'models'" :bordered="false" class="rounded-card shadow-card">
      <div class="space-y-4">
        <a-segmented
          v-model:value="activeModelType"
          :options="[{ label: '全部', value: 'all' }, ...modelTypeTabs.map((item) => ({ label: item.label, value: item.key }))]"
          @change="loadItems"
        />
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <a-input
            v-model:value="modelKeyword"
            allow-clear
            class="input-field md:max-w-sm"
            placeholder="输入模型名称或 Key 查询"
            @press-enter="loadItems"
          />
          <a-space>
            <button class="btn-primary" @click="loadItems">查询</button>
            <button class="btn-ghost" @click="resetModelFilters">重置</button>
          </a-space>
        </div>
      </div>
    </a-card>
    <a-card :bordered="false" class="rounded-card shadow-card">
      <a-table
        :columns="currentConfig.columns"
        :data-source="displayItems"
        :loading="loading"
        :scroll="{ x: 'max-content' }"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <span :class="record.enabled ? 'badge-success' : 'tag-soft'">{{ record.enabled ? '启用' : '停用' }}</span>
          </template>
          <template v-if="column.key === 'input_price_per_million'">
            <span class="text-sm text-muted">¥{{ record.input_price_per_million ?? 0 }}/M</span>
          </template>
          <template v-if="column.key === 'cached_input_price_per_million'">
            <span class="text-sm text-muted">¥{{ record.cached_input_price_per_million ?? 0 }}/M</span>
          </template>
          <template v-if="column.key === 'model_type'">
            <span :class="record.model_type === 'vision' ? 'badge-success' : 'tag-soft'">
              {{ getAiModelTypeLabel(record.model_type) }}
            </span>
          </template>
          <template v-if="column.key === 'output_price_per_million'">
            <span class="text-sm text-muted">¥{{ record.output_price_per_million ?? 0 }}/M</span>
          </template>
          <template v-if="column.key === 'thinking_enabled'">
            <span :class="record.thinking_enabled ? 'badge-success' : 'tag-soft'">
              {{ record.thinking_enabled === null || record.thinking_enabled === undefined ? '默认' : (record.thinking_enabled ? '开启' : '关闭') }}
            </span>
          </template>
          <template v-if="column.key === 'update_time'">
            {{ formatDateTime(record.update_time) }}
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

    <a-modal
      v-model:open="rateModalOpen"
      title="一键倍率调整"
      ok-text="确定调整"
      cancel-text="取消"
      :confirm-loading="rateSubmitting"
      @ok="submitRateAdjustment"
    >
      <a-form layout="vertical">
        <a-form-item label="倍率">
          <a-input-number
            v-model:value="rateMultiplier"
            :min="0.0001"
            :step="0.1"
            class="input-field w-full"
            placeholder="例如 1.2 表示所有单价上调 20%"
          />
        </a-form-item>
      </a-form>
      <p class="text-xs text-muted">确定后会同时调整所有模型的输入、缓存输入和输出单价。</p>
    </a-modal>

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
