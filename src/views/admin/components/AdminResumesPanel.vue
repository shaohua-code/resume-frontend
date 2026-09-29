<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { getAdminResumeDetail, getAdminResumes, getAdminUsers } from '@/api/admin'
import ResumePreview from '@/views/editor/components/ResumePreview.vue'
import { useResumeExportPrint } from '@/composables/useResumeExportPrint'
import { getTemplateName } from '@/constants/templateNames'
import { DEFAULT_MODULES, extractEditorSettings } from '@/constants/editorSettings'
import { normalizeResumeFields } from '@/constants/resumeFieldSchema'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/date'
import AdminUserInfoCell from './AdminUserInfoCell.vue'

const userStore = useUserStore()
const loading = ref(false)
const resumes = ref([])
const total = ref(0)
const detailOpen = ref(false)
const resumeDetail = ref(null)
const resumePreviewRef = ref(null)
const exporting = ref(false)
const userOptions = ref([])
const userLoading = ref(false)
const userLoadError = ref('')
let userSearchTimer = null
let userSearchVersion = 0
const query = reactive({ page: 1, size: 10, user_id: '' })
// 普通管理员仅能看到归属用户简历
const isSuperAdmin = computed(() => userStore.role === 'SUPER_ADMIN')
const previewTemplateName = computed(() => getTemplateName(resumeDetail.value?.template_id))
const parsedResume = computed(() => {
  const raw = resumeDetail.value?.resume_json
  if (typeof raw === 'string') {
    try {
      return normalizeResumeFields(JSON.parse(raw || '{}'))
    } catch {
      return {}
    }
  }
  return normalizeResumeFields(raw || {})
})
const exportTemplateId = computed(() => Number(resumeDetail.value?.template_id) || 56)
const exportSettings = computed(() => extractEditorSettings(parsedResume.value, exportTemplateId.value))
const exportModules = computed(() => exportSettings.value.modules?.length
  ? exportSettings.value.modules
  : DEFAULT_MODULES)

// 管理端复用编辑器的 A4 分页打印器；详情接口已先校验管理员的数据归属权限。
const { handleExportPDF } = useResumeExportPrint({
  getPrintContent: () => resumePreviewRef.value?.getPrintContent?.(),
  onStart: () => { exporting.value = true },
  onEnd: () => { exporting.value = false },
})

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '用户信息', key: 'user', width: 200 },
  { title: '评分', dataIndex: 'score', key: 'score', width: 90 },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 190 },
  { title: '操作', key: 'action', width: 100 },
]

async function loadResumes() {
  loading.value = true
  try {
    const res = await getAdminResumes(query)
    resumes.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

// 用户选项复用管理端用户接口，其结果仍受当前管理员归属范围限制。
async function searchUsers(keyword = '') {
  if (userSearchTimer) clearTimeout(userSearchTimer)
  const currentVersion = ++userSearchVersion
  userLoadError.value = ''
  userSearchTimer = setTimeout(async () => {
    userLoading.value = true
    try {
      const term = keyword.trim()
      const looksLikeUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term)
      const res = await getAdminUsers({
        page: 1,
        size: 100,
        role: 'USER',
        ...(looksLikeUserId ? { user_id: term } : { keyword: term }),
      })
      if (currentVersion !== userSearchVersion) return
      const results = (res.items || []).map((user) => ({
        value: user.user_id,
        label: [user.nickname, user.email].filter(Boolean).join(' · ') || user.user_id,
      }))
      const selectedOption = userOptions.value.find((option) => option.value === query.user_id)
      userOptions.value = selectedOption && !results.some((option) => option.value === selectedOption.value)
        ? [selectedOption, ...results]
        : results
    } catch {
      if (currentVersion === userSearchVersion) {
        userOptions.value = []
        userLoadError.value = '用户列表加载失败，请重试搜索。'
      }
    } finally {
      if (currentVersion === userSearchVersion) userLoading.value = false
    }
  }, keyword ? 250 : 0)
}

function applyUserFilter() {
  query.page = 1
  loadResumes()
}

function clearUserFilter() {
  query.user_id = ''
  applyUserFilter()
}

/** 拉取详情并用用户所选模板做只读预览 */
async function showResumeDetail(record) {
  const res = await getAdminResumeDetail(record.id)
  resumeDetail.value = res.data
  detailOpen.value = true
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadResumes()
}

onMounted(() => {
  searchUsers()
  loadResumes()
})

onUnmounted(() => {
  if (userSearchTimer) clearTimeout(userSearchTimer)
})
</script>

<template>
  <div class="space-y-4">
    <a-card v-if="!isSuperAdmin" :bordered="false" class="card-base">
      <p class="text-sm text-muted">仅展示您名下归属用户的简历，超级管理员可查看全部简历。</p>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(260px,420px)_minmax(220px,360px)_max-content]">
        <label class="block text-xs font-medium text-muted">
          筛选用户
          <a-select
            v-model:value="query.user_id"
            show-search
            allow-clear
            :filter-option="false"
            :options="userOptions"
            :loading="userLoading"
            aria-label="按用户昵称、邮箱或用户 ID 筛选简历"
            placeholder="搜索昵称或邮箱，也可粘贴完整用户 ID"
            class="input-field mt-1.5 w-full"
            @search="searchUsers"
            @dropdown-visible-change="(open) => open && !userOptions.length && searchUsers()"
            @change="applyUserFilter"
          />
        </label>
        <label class="block text-xs font-medium text-muted">
          简历名称
          <a-input
            v-model:value="query.keyword"
            allow-clear
            aria-label="按简历名称筛选"
            placeholder="输入简历名称"
            class="input-field mt-1.5 w-full"
            @press-enter="applyUserFilter"
          />
        </label>
        <div class="flex gap-2">
          <button class="btn-primary min-h-10" @click="applyUserFilter">查询简历</button>
          <button class="btn-ghost min-h-10" @click="clearUserFilter">清除筛选</button>
        </div>
      </div>
      <p v-if="userLoadError" class="mt-2 text-xs text-danger" role="alert">{{ userLoadError }}</p>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table
        :columns="columns"
        :data-source="resumes"
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
            <button class="btn-primary-sm" @click="showResumeDetail(record)">查看</button>
          </template>
          <template v-if="column.key === 'update_time'">
            {{ formatDateTime(record.update_time) }}
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      :open="detailOpen"
      title="简历预览"
      width="min(96vw, 1000px)"
      :footer="null"
      destroy-on-close
      @update:open="detailOpen = $event"
    >
      <div v-if="resumeDetail" class="space-y-3">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span>标题：{{ resumeDetail.title || '-' }}</span>
          <span>评分：{{ resumeDetail.score ?? '-' }}</span>
          <!-- 历史记录缺少模板号时用当前应用默认值进行只读预览。 -->
          <span>模板：{{ previewTemplateName }}（ID {{ resumeDetail.template_id || 56 }}）</span>
        </div>
        <div class="max-h-[60vh] overflow-auto rounded-xl border border-line/60 bg-canvas/50">
          <ResumePreview
            ref="resumePreviewRef"
            :resume="parsedResume"
            :template-id="exportTemplateId"
            :spacing="exportSettings.spacing"
            :font-size="exportSettings.fontSize"
            :font-family="exportSettings.fontFamily"
            :label-color="exportSettings.labelColor"
            :basic-content-color="exportSettings.basicContentColor"
            :name-color="exportSettings.nameColor"
            :content-color="exportSettings.contentColor"
            :skin-theme="exportSettings.skinTheme"
            :visible-modules="exportModules"
            edit-panel-collapsed
          />
        </div>
        <div class="flex justify-end">
          <button class="btn-primary" :disabled="exporting" @click="handleExportPDF">
            {{ exporting ? '正在准备 PDF…' : '下载 PDF' }}
          </button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
