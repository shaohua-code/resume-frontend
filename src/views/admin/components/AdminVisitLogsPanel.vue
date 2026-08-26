<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminVisits } from '@/api/admin'
import { formatVisitSource } from '@/constants/visitPlatforms'
import { formatDateTime } from '@/utils/date'

const router = useRouter()
const loading = ref(false)
const visits = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '' })

const columns = [
  { title: '访问时间', dataIndex: 'visit_time', key: 'visit_time', width: 180 },
  { title: '用户邮箱', dataIndex: 'user_email', key: 'user_email', width: 180 },
  { title: 'IP', dataIndex: 'ip_address', key: 'ip_address', width: 130 },
  { title: '省份', dataIndex: 'province', key: 'province', width: 140 },
  { title: '城市', dataIndex: 'city', key: 'city', width: 120 },
  { title: '浏览器', dataIndex: 'browser', key: 'browser', width: 120 },
  { title: '系统', dataIndex: 'os', key: 'os', width: 120 },
  { title: '设备类型', dataIndex: 'device_type', key: 'device_type', width: 90 },
  { title: '设备品牌', dataIndex: 'device_brand', key: 'device_brand', width: 90 },
  { title: '来源', dataIndex: 'visit_source', key: 'visit_source', width: 120 },
  { title: '进入路径', dataIndex: 'landing_path', key: 'landing_path', width: 120 },
  { title: '停留时长', dataIndex: 'duration_seconds', key: 'duration_seconds', width: 100 },
]

/** 格式化停留时长 */
function formatDuration(seconds) {
  const value = Number(seconds) || 0
  if (value < 60) return `${value}秒`
  const minutes = Math.floor(value / 60)
  const rest = value % 60
  return rest ? `${minutes}分${rest}秒` : `${minutes}分`
}

async function loadVisits() {
  loading.value = true
  try {
    const res = await getAdminVisits({ ...query })
    visits.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadVisits()
}

onMounted(loadVisits)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-ink">访客记录</h2>
          <p class="text-sm text-muted">仅超级管理员可见，保留近 30 天数据。微信等 App 内打开请用分享链接记录来源。</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="btn-primary" type="button" @click="router.push('/admin/share-links')">分享链接</button>
          <button class="btn-primary" type="button" @click="loadVisits">刷新</button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row">
        <a-input
          :value="query.keyword"
          placeholder="搜索邮箱或 IP"
          class="input-field w-full sm:w-80"
          @update:value="query.keyword = $event"
        />
        <button class="btn-primary" type="button" @click="loadVisits">查询</button>
      </div>

      <a-table
        :columns="columns"
        :data-source="visits"
        :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }"
        :scroll="{ x: 'max-content' }"
        row-key="id"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'visit_time'">
            {{ formatDateTime(record.visit_time) }}
          </template>
          <template v-if="column.key === 'user_email'">
            {{ record.user_email || '-' }}
          </template>
          <template v-if="column.key === 'province'">
            {{ record.province || '未知' }}
          </template>
          <template v-if="column.key === 'city'">
            {{ record.city || '未知' }}
          </template>
          <template v-if="column.key === 'device_brand'">
            {{ record.device_brand || '-' }}
          </template>
          <template v-if="column.key === 'visit_source'">
            {{ formatVisitSource(record.visit_source) }}
          </template>
          <template v-if="column.key === 'duration_seconds'">
            {{ formatDuration(record.duration_seconds) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
