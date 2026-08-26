<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getAdminResumeDetail, getAdminResumes } from '@/api/admin'
import ResumeTemplatePreviewPane from '@/components/ResumeTemplatePreviewPane.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { getTemplateName } from '@/constants/templateNames'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/date'
import AdminUserInfoCell from './AdminUserInfoCell.vue'

const userStore = useUserStore()
const loading = ref(false)
const resumes = ref([])
const total = ref(0)
const detailOpen = ref(false)
const resumeDetail = ref(null)
const query = reactive({ page: 1, size: 10, user_id: '' })
// 管理端弹窗在小屏缩小 A4 缩放，避免横向撑破视口
const isMobile = useMediaQuery('(max-width: 639px)')

// 普通管理员仅能看到归属用户简历
const isSuperAdmin = computed(() => userStore.role === 'SUPER_ADMIN')
const previewScale = computed(() => (isMobile.value ? 0.38 : 0.55))
const previewTemplateName = computed(() => getTemplateName(resumeDetail.value?.template_id))

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

onMounted(loadResumes)
</script>

<template>
  <div class="space-y-4">
    <a-card v-if="!isSuperAdmin" :bordered="false" class="card-base">
      <p class="text-sm text-muted">仅展示您名下归属用户的简历，超级管理员可查看全部简历。</p>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <div class="flex flex-col gap-3 sm:flex-row">
        <a-input :value="query.user_id" placeholder="按用户ID筛选" class="input-field w-full sm:w-80" @update:value="query.user_id = $event" />
        <button class="btn-primary" @click="loadResumes">查询简历</button>
      </div>
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
      :width="isMobile ? '96vw' : 900"
      :footer="null"
      destroy-on-close
      @update:open="detailOpen = $event"
    >
      <div v-if="resumeDetail" class="space-y-3">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span>标题：{{ resumeDetail.title || '-' }}</span>
          <span>评分：{{ resumeDetail.score ?? '-' }}</span>
          <span>模板：{{ previewTemplateName }}（ID {{ resumeDetail.template_id || 1 }}）</span>
        </div>
        <ResumeTemplatePreviewPane
          :resume="resumeDetail.resume_json"
          :template-id="resumeDetail.template_id || 1"
          :scale="previewScale"
          max-height="60vh"
          scrollable
          fullscreen-title="简历预览"
        />
      </div>
    </a-modal>
  </div>
</template>
