<script setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  getInviteLinks,
  createInviteLink,
  updateInviteLink,
  deleteInviteLink,
} from '@/api/admin'
import { formatDateTime } from '@/utils/date'

const emit = defineEmits(['close'])

const loading = ref(false)
const links = ref([])
// 各操作按钮的独立 loading 状态（防止重复点击）
const createLoading = ref(false)
const toggleLoadingMap = ref({})
const deleteLoadingMap = ref({})

const columns = [
  { title: '邀请码', dataIndex: 'code', key: 'code', width: 200 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '已用次数', dataIndex: 'used_count', key: 'used_count', width: 100 },
  { title: '过期时间', dataIndex: 'expire_time', key: 'expire_time', width: 180 },
  { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '操作', key: 'action', width: 220 },
]

/** 构造邀请链接完整 URL */
function buildInviteUrl(code) {
  const origin = window.location.origin
  return `${origin}/register?invite=${code}`
}

/** 复制邀请链接到剪贴板 */
async function copyLink(code) {
  const url = buildInviteUrl(code)
  try {
    await navigator.clipboard.writeText(url)
    message.success('邀请链接已复制')
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = url
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    message.success('邀请链接已复制')
  }
}

/** 加载邀请链接列表 */
async function loadLinks() {
  loading.value = true
  try {
    const res = await getInviteLinks()
    links.value = res.items || []
  } finally {
    loading.value = false
  }
}

/** 生成新邀请链接 */
async function handleCreate() {
  if (createLoading.value) return
  createLoading.value = true
  try {
    await createInviteLink()
    message.success('邀请链接已生成')
    await loadLinks()
  } finally {
    createLoading.value = false
  }
}

/** 切换邀请链接启用/禁用状态 */
async function toggleStatus(record) {
  if (toggleLoadingMap.value[record.id]) return
  toggleLoadingMap.value[record.id] = true
  try {
    const newStatus = record.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    await updateInviteLink(record.id, { status: newStatus })
    message.success(newStatus === 'ACTIVE' ? '已启用' : '已禁用')
    await loadLinks()
  } finally {
    toggleLoadingMap.value[record.id] = false
  }
}

/** 删除邀请链接 */
async function handleDelete(record) {
  if (deleteLoadingMap.value[record.id]) return
  deleteLoadingMap.value[record.id] = true
  try {
    await deleteInviteLink(record.id)
    message.success('邀请链接已删除')
    await loadLinks()
  } finally {
    deleteLoadingMap.value[record.id] = false
  }
}

onMounted(loadLinks)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted">生成邀请链接，用户通过链接注册后自动归属到您名下</p>
      <button class="btn-primary-sm" :disabled="createLoading" @click="handleCreate">
        {{ createLoading ? '生成中...' : '生成新链接' }}
      </button>
    </div>

    <a-table
      :columns="columns"
      :data-source="links"
      :loading="loading"
      :pagination="false"
      :scroll="{ x: 'max-content' }"
      row-key="id"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'code'">
          <span class="font-mono text-sm text-ink">{{ record.code }}</span>
        </template>
        <template v-if="column.key === 'status'">
          <span :class="record.status === 'ACTIVE' ? 'badge-success' : 'tag-soft'">
            {{ record.status === 'ACTIVE' ? '启用' : '禁用' }}
          </span>
        </template>
        <template v-if="column.key === 'expire_time'">
          {{ record.expire_time ? formatDateTime(record.expire_time) : '永久' }}
        </template>
        <template v-if="column.key === 'create_time'">
          {{ formatDateTime(record.create_time) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <button class="btn-primary-sm" @click="copyLink(record.code)">复制链接</button>
            <button class="btn-ghost-sm" :disabled="toggleLoadingMap[record.id]" @click="toggleStatus(record)">
              {{ toggleLoadingMap[record.id] ? '处理中...' : (record.status === 'ACTIVE' ? '禁用' : '启用') }}
            </button>
            <button class="btn-ghost-sm" :disabled="deleteLoadingMap[record.id]" @click="handleDelete(record)">
              {{ deleteLoadingMap[record.id] ? '删除中...' : '删除' }}
            </button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
