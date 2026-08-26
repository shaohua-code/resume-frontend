<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { getAdminFeedbacks, getAdminFeedbackDetail } from '@/api/admin'
import { resolveUploadUrl } from '@/api/upload'
import { useUserStore } from '@/stores/user'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import { formatDateTime } from '@/utils/date'

// 配置 markdown-it：禁止解析 HTML 标签（防止 XSS）
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const feedbacks = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10 })

const detailOpen = ref(false)
const detailLoading = ref(false)
const detail = ref(null)
const isSuperAdmin = computed(() => userStore.role === 'SUPER_ADMIN')

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户', key: 'user', width: 220 },
  { title: '提交时间', dataIndex: 'create_time', key: 'create_time', width: 190 },
  { title: '操作', key: 'action', width: 100 },
]

// Markdown 预览 HTML（图片 URL 补全 + XSS 消毒）
const previewHtml = computed(() => {
  if (!detail.value?.content_md) return ''
  let html = md.render(detail.value.content_md)
  html = html.replace(/src="(\/uploads\/[^"]+)"/g, (_, path) => `src="${resolveUploadUrl(path)}"`)
  // 使用 DOMPurify 消毒 HTML，防止存储型 XSS 攻击
  return DOMPurify.sanitize(html)
})

async function loadFeedbacks() {
  loading.value = true
  try {
    const res = await getAdminFeedbacks(query)
    feedbacks.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

async function openDetail(record) {
  detailOpen.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const res = await getAdminFeedbackDetail(record.id)
    detail.value = res.data || res
  } finally {
    detailLoading.value = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadFeedbacks()
}

// 铃铛跳转带 id 时打开对应反馈详情
watch(
  () => route.query.id,
  (id) => {
    if (id) openDetail({ id })
  },
)

onMounted(() => {
  loadFeedbacks()
  if (route.query.id) openDetail({ id: route.query.id })
})
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-ink">用户反馈</h2>
          <p class="text-sm text-muted">
            {{ isSuperAdmin ? '可查看全部用户反馈' : '仅展示您名下归属用户的反馈' }}，内容以 Markdown 形式预览
          </p>
        </div>
        <button class="btn-primary" @click="loadFeedbacks">刷新列表</button>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table
        :columns="columns"
        :data-source="feedbacks"
        :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }"
        :scroll="{ x: 'max-content' }"
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
          <template v-if="column.key === 'action'">
            <button class="link-text" @click="openDetail(record)">查看</button>
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="detailOpen"
      title="反馈详情"
      width="720px"
      :footer="null"
      destroy-on-close
    >
      <a-spin :spinning="detailLoading">
        <div v-if="detail" class="space-y-4">
          <div class="flex flex-wrap gap-4 text-sm text-muted">
            <span>ID：{{ detail.id }}</span>
            <span>提交时间：{{ formatDateTime(detail.create_time) }}</span>
          </div>
          <div
            class="prose prose-sm max-w-none rounded-card border border-line bg-surface p-4 text-ink feedback-md-preview"
            v-html="previewHtml"
          />
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<style scoped>
.feedback-md-preview :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0;
}
.feedback-md-preview :deep(p) {
  margin-bottom: 0.75em;
}
.feedback-md-preview :deep(ul),
.feedback-md-preview :deep(ol) {
  padding-left: 1.25em;
  margin-bottom: 0.75em;
}
</style>
