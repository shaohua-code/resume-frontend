<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { getAdminFeedbacks, getAdminFeedbackDetail } from '@/api/admin'
import { resolveUploadUrl } from '@/api/upload'
import { useUserStore } from '@/stores/user'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import AdminFilterCard from './AdminFilterCard.vue'
import { formatDateTime } from '@/utils/date'

// 配置 markdown-it：禁止解析 HTML 标签（防止 XSS）
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const feedbacks = ref([])
const total = ref(0)
const loadError = ref('')
// 反馈列表可从用户账号深链进入，也支持本页用户和日期筛选。
const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  user_id: '',
  create_time_from: '',
  create_time_to: '',
})
const dateRange = ref(null)

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

// 用户名关键词和日期范围通过同一分页查询提交，使用本地自然日边界。
function updateDateRange(dates) {
  dateRange.value = dates?.[0] && dates?.[1] ? dates : null
  query.create_time_from = dates?.[0] ? dates[0].startOf('day').toISOString() : ''
  query.create_time_to = dates?.[1] ? dates[1].add(1, 'day').startOf('day').toISOString() : ''
}

function searchFeedbacks() {
  query.page = 1
  loadFeedbacks()
}

function resetFilters() {
  query.page = 1
  query.keyword = ''
  query.user_id = String(route.query.user_id || '')
  query.create_time_from = ''
  query.create_time_to = ''
  dateRange.value = null
  loadFeedbacks()
}

// 清除从账号页传来的用户范围时同步清理 URL，避免后续重置再次套用旧条件。
function clearUserFilter() {
  query.user_id = ''
  const { user_id, ...remainingQuery } = route.query
  router.replace({ path: route.path, query: remainingQuery })
  searchFeedbacks()
}

async function loadFeedbacks() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getAdminFeedbacks(query)
    feedbacks.value = res.items || []
    total.value = res.total || 0
  } catch {
    feedbacks.value = []
    total.value = 0
    loadError.value = '用户反馈加载失败，请检查连接后重试。'
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
  // 通知跳转可直接定位反馈详情；用户账号跳转则保留用户筛选。
  query.user_id = String(route.query.user_id || '')
  loadFeedbacks()
  if (route.query.id) openDetail({ id: route.query.id })
})
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-ink">用户反馈</h2>
          <p class="text-sm text-muted">
            {{ isSuperAdmin ? '可查看全部用户反馈' : '仅展示您名下归属用户的反馈' }}，内容以 Markdown 形式预览
          </p>
        </div>
        <button class="btn-primary" @click="loadFeedbacks">刷新列表</button>
      </div>
    </a-card>
    <!-- 反馈无处理状态字段，以用户和提交时间定位。 -->
    <AdminFilterCard title="筛选反馈" description="按用户邮箱、昵称或提交日期缩小反馈范围">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(260px,1fr)_max-content]">
        <a-input
          v-model:value="query.keyword"
          allow-clear
          class="input-field"
          placeholder="搜索用户邮箱或昵称"
          @press-enter="searchFeedbacks"
        />
        <a-range-picker
          :value="dateRange"
          class="input-field w-full"
          :placeholder="['提交开始日期', '提交结束日期']"
          @change="updateDateRange"
        />
        <div class="flex gap-2">
          <button class="btn-primary min-h-11 flex-1 whitespace-nowrap" @click="searchFeedbacks">查询</button>
          <button class="btn-ghost min-h-11 flex-1 whitespace-nowrap" @click="resetFilters">重置</button>
        </div>
      </div>
      <template #context>
        <span v-if="query.user_id">当前限定为指定用户反馈</span>
        <button v-if="query.user_id" class="link-text min-h-11 px-2" @click="clearUserFilter">清除用户限定</button>
        <span v-if="route.query.id">已从通知定位到指定反馈</span>
      </template>
    </AdminFilterCard>

    <a-card :bordered="false" class="card-base">
      <div v-if="loadError" class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger" role="alert">
        <span>{{ loadError }}</span>
        <button class="btn-ghost-sm" :disabled="loading" @click="loadFeedbacks">重试</button>
      </div>
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
