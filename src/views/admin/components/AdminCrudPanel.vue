<script setup>
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { aiModelApi, announcementApi } from '@/api/admin'
import AdminCrudModal from './AdminCrudModal.vue'
import { formatDateTime } from '@/utils/date'
import { getAiModelTypeLabel } from '@/constants/aiTasks'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { toEditorHtml } from '@/utils/announcementContent'

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

// 与项目统一的 lg 断点保持一致，小屏改用卡片列表以避免管理表格横向撑宽页面。
const isMobile = useMediaQuery()
const rateModalWidth = computed(() => (isMobile.value ? 'calc(100vw - 24px)' : 520))

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
    defaultForm: () => ({
      title: '',
      content: '',
      version_label: '',
      start_at: null,
      end_at: null,
      enabled: true,
    }),
    columns: [
      { title: '标题', dataIndex: 'title', key: 'title' },
      { title: '版本', dataIndex: 'version_label', key: 'version_label', width: 100 },
      { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 80 },
      { title: '开始', dataIndex: 'start_at', key: 'start_at', width: 170 },
      { title: '结束', dataIndex: 'end_at', key: 'end_at', width: 170 },
      { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 170 },
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
      { title: '官方基准价', key: 'official_prices', width: 170 },
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
  if (record && props.type === 'models') {
    modalForm.value = {
      ...record,
      input_price_per_million: record.official_input_price_per_million ?? record.input_price_per_million,
      cached_input_price_per_million: record.official_cached_input_price_per_million ?? record.cached_input_price_per_million,
      output_price_per_million: record.official_output_price_per_million ?? record.output_price_per_million,
    }
  } else if (record && props.type === 'announcements') {
    // 旧 Markdown 公告转为 HTML，便于 Quill 所见即所得编辑
    modalForm.value = {
      ...record,
      content: toEditorHtml(record.content),
    }
  } else {
    modalForm.value = record ? { ...record } : currentConfig.value.defaultForm()
  }
  modalOpen.value = true
}

async function submitModal() {
  // 富文本空内容常为 <p><br></p>，需剥标签后再校验
  if (props.type === 'announcements') {
    const plain = String(modalForm.value.content || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
    if (!String(modalForm.value.title || '').trim()) {
      message.warning('请填写公告标题')
      return
    }
    if (!plain) {
      message.warning('请填写公告内容')
      return
    }
  }
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
    message.success(`已按官方基准价的 ${multiplier} 倍重算所有模型单价`)
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
      <!-- 小屏标题与操作按钮纵向排列，确保两个管理动作都保留足够触控区域。 -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0">
          <p class="text-base font-semibold text-ink">{{ currentConfig.title }}</p>
          <p class="mt-1 text-xs text-muted">
            {{ type === 'models' ? '维护模型类型、供应商、调用入口与 Token 单价' : '公告支持富文本编辑与实时预览，用户端弹窗同步渲染' }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:justify-end">
          <button v-if="type === 'models'" class="btn-ghost min-h-11" @click="rateModalOpen = true">一键倍率调整</button>
          <button class="btn-primary min-h-11" @click="openModal()">{{ currentConfig.addText }}</button>
        </div>
      </div>
    </a-card>
    <a-card v-if="type === 'models'" :bordered="false" class="rounded-card shadow-card">
      <div class="space-y-4">
        <!-- 分类栏只在自身区域横向滚动，不把页面宽度扩展到视口之外。 -->
        <div class="-mx-1 overflow-x-auto px-1 pb-1">
          <a-segmented
            v-model:value="activeModelType"
            class="min-w-max"
            :options="[{ label: '全部', value: 'all' }, ...modelTypeTabs.map((item) => ({ label: item.label, value: item.key }))]"
            @change="loadItems"
          />
        </div>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <a-input
            v-model:value="modelKeyword"
            allow-clear
            class="input-field lg:max-w-sm"
            placeholder="输入模型名称或 Key 查询"
            @press-enter="loadItems"
          />
          <div class="grid grid-cols-2 gap-3 lg:flex">
            <button class="btn-primary min-h-11" @click="loadItems">查询</button>
            <button class="btn-ghost min-h-11" @click="resetModelFilters">重置</button>
          </div>
        </div>
      </div>
    </a-card>
    <a-card :bordered="false" class="rounded-card shadow-card">
      <!-- 移动端用纵向信息卡片完整呈现字段与操作，桌面端继续保留高密度表格。 -->
      <a-spin v-if="isMobile" :spinning="loading">
        <a-empty v-if="!loading && displayItems.length === 0" description="暂无数据" />
        <div v-else class="space-y-3">
          <article
            v-for="record in displayItems"
            :key="record.id"
            class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="break-words text-sm font-semibold text-ink">
                  {{ type === 'models' ? (record.name || '未命名模型') : (record.title || '未命名公告') }}
                </p>
                <p v-if="type === 'models'" class="mt-1 break-all text-xs text-muted">{{ record.model_key || '-' }}</p>
                <p v-else class="mt-1 text-xs text-muted">更新于 {{ formatDateTime(record.update_time) }}</p>
              </div>
              <span :class="record.enabled ? 'badge-success' : 'tag-soft'">{{ record.enabled ? '启用' : '停用' }}</span>
            </div>

            <dl v-if="type === 'models'" class="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
              <div>
                <dt class="text-xs text-muted">供应商</dt>
                <dd class="mt-1 break-words text-ink">{{ record.provider || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">模型类型</dt>
                <dd class="mt-1 text-ink">{{ getAiModelTypeLabel(record.model_type) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">输入 / 缓存输入</dt>
                <dd class="mt-1 text-ink">¥{{ record.input_price_per_million ?? 0 }} / ¥{{ record.cached_input_price_per_million ?? 0 }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted">输出单价</dt>
                <dd class="mt-1 text-ink">¥{{ record.output_price_per_million ?? 0 }}/M</dd>
              </div>
              <div class="col-span-2">
                <dt class="text-xs text-muted">官方基准价（输入 / 缓存 / 输出）</dt>
                <dd class="mt-1 break-words text-ink">
                  ¥{{ record.official_input_price_per_million ?? record.input_price_per_million ?? 0 }} /
                  {{ record.official_cached_input_price_per_million ?? record.cached_input_price_per_million ?? 0 }} /
                  {{ record.official_output_price_per_million ?? record.output_price_per_million ?? 0 }}
                </dd>
              </div>
              <div class="col-span-2">
                <dt class="text-xs text-muted">深度思考</dt>
                <dd class="mt-1 text-ink">
                  {{ record.thinking_enabled === null || record.thinking_enabled === undefined ? '默认' : (record.thinking_enabled ? '开启' : '关闭') }}
                </dd>
              </div>
            </dl>

            <div class="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <button class="btn-ghost min-h-11" @click="openModal(record)">编辑</button>
              <a-popconfirm title="确定删除？" @confirm="removeItem(record.id)">
                <button class="min-h-11 w-full rounded-lg border border-red-100 text-sm font-medium text-danger transition-colors hover:bg-red-50">删除</button>
              </a-popconfirm>
            </div>
          </article>
        </div>
      </a-spin>
      <a-table
        v-else
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
          <template v-if="column.key === 'official_prices'">
            <a-tooltip title="输入 / 缓存输入 / 输出，单位：元/百万 token">
              <span class="text-xs text-muted">
                ¥{{ record.official_input_price_per_million ?? record.input_price_per_million ?? 0 }} /
                {{ record.official_cached_input_price_per_million ?? record.cached_input_price_per_million ?? 0 }} /
                {{ record.official_output_price_per_million ?? record.output_price_per_million ?? 0 }}
              </span>
            </a-tooltip>
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
      :width="rateModalWidth"
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
            placeholder="例如 2 表示官方基准价的 2 倍"
          />
        </a-form-item>
      </a-form>
      <p class="text-xs text-muted">每次都按官方基准价 × 本次倍率重新计算，不会在当前价格上重复叠加。</p>
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
