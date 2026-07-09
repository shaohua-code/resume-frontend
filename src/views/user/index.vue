<!--
  用户中心页 - 个人信息 + Tab（我的简历 / 用量明细）
-->
<template>
  <div class="page-container animate-fade-in">
    <h2 class="mb-6 section-title">用户中心</h2>

    <a-card class="mb-4 card-base" :bordered="false">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <a-avatar :size="64" class="text-lg font-bold text-white shrink-0 bg-brand-dark">
          {{ userStore.userInfo.nickname?.[0] || 'U' }}
        </a-avatar>
        <div class="flex-1 min-w-0">
          <a-descriptions :column="{ xs: 1, sm: 2 }" size="small">
            <a-descriptions-item label="昵称">{{ userStore.userInfo.nickname }}</a-descriptions-item>
            <a-descriptions-item label="邮箱">{{ userStore.userInfo.email }}</a-descriptions-item>
            <a-descriptions-item label="角色">
              <span class="badge">{{ getRoleLabel(userStore.role) }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <span :class="userStore.userInfo.status === 'BANNED' ? 'bg-red-50 text-red-600' : 'bg-mint text-emerald-700'" class="inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium">
                {{ getStatusLabel(userStore.userInfo.status) }}
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="账户余额" :span="2">
              <span class="text-lg font-bold text-brand-dark">{{ balanceText }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <GradientButton ghost size="small" class="!border-danger/30 !text-danger hover:!bg-red-50" @click="handleLogout">退出登录</GradientButton>
        </div>
      </div>
    </a-card>

    <a-tabs v-model:activeKey="activeTab" class="user-center-tabs">
      <a-tab-pane key="resumes" tab="我的简历">
        <a-card class="card-base" :bordered="false">
          <template #title>
            <span class="text-base font-semibold text-ink">我的简历</span>
          </template>
          <template #extra>
            <div class="flex items-center gap-2">
              <a-popconfirm
                v-if="selectedRowKeys.length"
                title="确定批量删除选中的简历？"
                @confirm="handleBatchDelete"
              >
                <button class="inline-flex h-9 items-center gap-1 rounded-button border border-danger/30 px-3 text-sm font-medium text-danger transition-colors hover:bg-red-50">
                  <DeleteOutlined /> 批量删除 ({{ selectedRowKeys.length }})
                </button>
              </a-popconfirm>
              <GradientButton size="small" class="!h-9 !min-w-[100px]" @click="handleCreate">
                <PlusOutlined /> 新建简历
              </GradientButton>
            </div>
          </template>
          <a-table
            :data-source="resumeStore.resumeList"
            :columns="columns"
            :pagination="{ pageSize: 10, total: resumeStore.resumeTotal }"
            :scroll="{ x: 'max-content' }"
            :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
            row-key="id"
            :loading="loading"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'score'">
                <a-progress :percent="record.score" size="small" :stroke-color="getScoreColor(record.score)" />
              </template>
              <template v-if="column.key === 'update_time'">
                {{ formatDateTime(record.update_time) }}
              </template>
              <template v-if="column.key === 'template_id'">
                <span class="tag-soft">{{ getTemplateName(record.template_id) }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <div class="flex items-center gap-2">
                  <button class="link-text" @click="$router.push(`/editor/${record.id}`)">编辑</button>
                  <a-popconfirm title="确定删除？" @confirm="handleDelete(record.id)">
                    <button class="text-sm font-medium transition-colors text-danger hover:text-red-500">删除</button>
                  </a-popconfirm>
                </div>
              </template>
            </template>
            <template #emptyText>
              <div class="py-12 empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-title">还没有简历</div>
                <div class="empty-desc">点击右上角新建简历，开启你的 AI 简历之旅</div>
                <GradientButton class="inline-flex h-10 min-w-[160px] items-center justify-center gap-2" @click="$router.push('/generate')">
                  <PlusOutlined /> 新建简历
                </GradientButton>
              </div>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="usage" tab="用量明细">
        <UsagePanel />
      </a-tab-pane>
    </a-tabs>

    <a-modal
      v-model:open="overLimitVisible"
      title="简历数量超限提醒"
      ok-text="继续生成（替换最后一份）"
      cancel-text="取消"
      @ok="confirmOverLimit"
    >
      <div class="py-2 text-sm leading-relaxed text-ink-secondary">
        每人最多生成 <span class="font-semibold text-danger">5</span> 份简历，继续生成将
        <span class="font-semibold text-danger">替换最后一份简历</span>，简历将无法找回。
        <br /><br />
        是否继续操作？
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { useResumeStore } from '@/stores/resume'
import { getRoleLabel, getStatusLabel, formatBalanceText } from '@/constants/roles'
import { getTemplateName } from '@/constants/templateNames'
import THEME from '@/constants/theme'
import GradientButton from '@/components/GradientButton.vue'
import UsagePanel from './components/UsagePanel.vue'
import { formatDateTime } from '@/utils/date'

const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const resumeStore = useResumeStore()
const loading = ref(false)
const activeTab = ref('resumes')
const balanceText = computed(() => formatBalanceText(walletStore.balance))

const selectedRowKeys = ref([])
function onSelectChange(keys) {
  selectedRowKeys.value = keys
}

const overLimitVisible = ref(false)

const columns = [
  { title: '简历标题', dataIndex: 'title', key: 'title' },
  { title: '模板', dataIndex: 'template_id', key: 'template_id', width: 120 },
  { title: '评分', dataIndex: 'score', key: 'score', width: 150 },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 180 },
  { title: '操作', key: 'action', width: 140 },
]

function getScoreColor(score) {
  if (score >= 80) return THEME.chart.success
  if (score >= 60) return THEME.chart.warning
  return THEME.chart.danger
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    resumeStore.fetchResumeList(),
    resumeStore.fetchResumeCount(),
    walletStore.fetchBalance(),
  ])
  loading.value = false
})

async function handleTableChange(pagination) {
  loading.value = true
  await resumeStore.fetchResumeList(pagination.current, pagination.pageSize)
  loading.value = false
}

async function handleDelete(id) {
  await resumeStore.removeResume(id)
}

async function handleBatchDelete() {
  await resumeStore.batchRemoveResume(selectedRowKeys.value)
  selectedRowKeys.value = []
}

async function handleCreate() {
  await resumeStore.fetchResumeCount()
  if (resumeStore.resumeTotal >= resumeStore.resumeMaxCount) {
    overLimitVisible.value = true
    return
  }
  router.push('/generate')
}

function confirmOverLimit() {
  overLimitVisible.value = false
  router.push('/generate')
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>
