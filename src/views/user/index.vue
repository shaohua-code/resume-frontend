<!--
  用户工作台
  账户概览 + 可扩展侧边导航（简历 / 用量 / 后续模型与提示词配置）
-->
<template>
  <div class="page-container user-center-page animate-fade-in">
    <section class="workspace-hero">
      <div class="workspace-hero-copy">
        <span class="workspace-eyebrow">ACCOUNT WORKSPACE</span>
        <h1>用户中心</h1>
        <p>集中管理你的简历、账户用量与个性化 AI 配置。</p>
      </div>
      <GradientButton class="workspace-create-button" @click="handleCreate">
        <PlusOutlined /> 新建简历
      </GradientButton>
      <span class="hero-orbit hero-orbit-one" aria-hidden="true"></span>
      <span class="hero-orbit hero-orbit-two" aria-hidden="true"></span>
    </section>

    <section class="account-overview">
      <div class="account-identity">
        <a-avatar :size="72" class="account-avatar">
          {{ accountInitial }}
        </a-avatar>
        <div class="account-copy">
          <div class="account-name-row">
            <h2>{{ accountName }}</h2>
            <span class="role-pill">{{ getRoleLabel(userStore.role) }}</span>
          </div>
          <p>{{ userStore.userInfo.email || '暂未绑定邮箱' }}</p>
          <span
            class="account-status"
            :class="userStore.userInfo.status === 'BANNED' ? 'account-status--danger' : 'account-status--active'"
          >
            <i></i>{{ getStatusLabel(userStore.userInfo.status) }}
          </span>
        </div>
      </div>

      <div class="account-metrics">
        <div class="metric-card metric-card--balance">
          <span>账户余额</span>
          <strong>{{ balanceText }}</strong>
          <button type="button" @click="rechargeOpen = true">立即充值</button>
        </div>
        <div class="metric-card">
          <span>简历数量</span>
          <strong>{{ resumeLimitText }}</strong>
          <small>当前账户可管理数量</small>
        </div>
      </div>

    
    </section>

    <div class="workspace-layout">
      <aside class="workspace-sidebar">
        <div v-for="group in workspaceGroups" :key="group.label" class="workspace-nav-group">
          <p class="workspace-nav-label">{{ group.label }}</p>
          <div class="workspace-nav-list">
            <button
              v-for="item in group.items"
              :key="item.key"
              type="button"
              class="workspace-nav-item"
              :class="{
                'workspace-nav-item--active': activeTab === item.key,
                'workspace-nav-item--disabled': item.disabled,
              }"
              :disabled="item.disabled"
              @click="!item.disabled && (activeTab = item.key)"
            >
              <span class="workspace-nav-icon"><component :is="item.icon" /></span>
              <span class="workspace-nav-copy">
                <b>{{ item.label }}</b>
                <small>{{ item.description }}</small>
              </span>
              <span v-if="item.badge" class="workspace-nav-badge">{{ item.badge }}</span>
            </button>
          </div>
        </div>

        <!-- 配置中心有任一 Tab 开放时才展示侧栏说明 -->
        <div v-if="hasConfigCenter" class="workspace-sidebar-note">
          <span><ThunderboltOutlined /></span>
          <div>
            <b>个性化 AI 配置</b>
            <p>可按任务选择模型或自定义业务提示词，输出格式仍由系统锁定。</p>
          </div>
        </div>
      </aside>

      <main class="workspace-main">
        <header class="workspace-content-header">
          <div>
            <span>{{ activeMeta.eyebrow }}</span>
            <h2>{{ activeMeta.label }}</h2>
            <p>{{ activeMeta.longDescription }}</p>
          </div>
          <div v-if="activeTab === 'resumes'" class="workspace-header-actions">
            <a-popconfirm
              v-if="selectedRowKeys.length"
              title="确定批量删除选中的简历？"
              @confirm="handleBatchDelete"
            >
              <button class="btn-ghost-sm border-danger/30 text-danger hover:bg-red-50">
                <DeleteOutlined /> 批量删除 ({{ selectedRowKeys.length }})
              </button>
            </a-popconfirm>
            <GradientButton size="small" @click="handleCreate">
              <PlusOutlined /> 新建简历
            </GradientButton>
          </div>
        </header>

        <section v-if="activeTab === 'resumes'" class="workspace-content-body">
          <a-card class="workspace-panel" :bordered="false">
            <div v-if="isMobile && !loading && !resumeStore.resumeList.length" class="py-12 empty-state">
              <div class="empty-visual" aria-hidden="true"><FileTextOutlined /></div>
              <div class="empty-title">创建你的第一份简历</div>
              <div class="empty-desc">从模板开始，使用 AI 快速整理经历与内容。</div>
              <GradientButton class="mt-5" @click="handleCreate">
                <PlusOutlined /> 新建简历
              </GradientButton>
            </div>

            <ResumeCardList
              v-else-if="isMobile"
              v-model:selected-keys="selectedRowKeys"
              :list="resumeStore.resumeList"
              :loading="loading"
              :get-template-name="getTemplateName"
              @delete="handleDelete"
            />

            <a-table
              v-else
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
                <template v-if="column.key === 'title'">
                  <div class="resume-title-cell">
                    <span><FileTextOutlined /></span>
                    <div>
                      <b>{{ record.title }}</b>
                      <small>ID {{ record.id }}</small>
                    </div>
                  </div>
                </template>
                <template v-else-if="column.key === 'score'">
                  <a-progress :percent="record.score || 0" size="small" :stroke-color="getScoreColor(record.score || 0)" />
                </template>
                <template v-else-if="column.key === 'update_time'">
                  <span class="table-secondary-text">{{ formatDateTime(record.update_time) }}</span>
                </template>
                <template v-else-if="column.key === 'template_id'">
                  <span class="tag-soft">{{ getTemplateName(record.template_id) }}</span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <div class="flex items-center gap-3">
                    <button class="link-text" @click="router.push(`/editor/${record.id}`)">编辑</button>
                    <a-popconfirm title="确定删除？" @confirm="handleDelete(record.id)">
                      <button class="text-sm font-medium transition-colors text-danger hover:text-red-500">删除</button>
                    </a-popconfirm>
                  </div>
                </template>
              </template>
              <template #emptyText>
                <div class="py-12 empty-state">
                  <div class="empty-visual" aria-hidden="true"><FileTextOutlined /></div>
                  <div class="empty-title">创建你的第一份简历</div>
                  <div class="empty-desc">从模板开始，使用 AI 快速整理经历与内容。</div>
                  <GradientButton class="mt-5" @click="handleCreate">
                    <PlusOutlined /> 新建简历
                  </GradientButton>
                </div>
              </template>
            </a-table>

            <div v-if="isMobile && resumeStore.resumeTotal > 10" class="flex justify-center mt-5">
              <a-pagination
                :current="mobilePage"
                :page-size="10"
                :total="resumeStore.resumeTotal"
                size="small"
                @change="handleMobilePageChange"
              />
            </div>
          </a-card>
        </section>

        <section v-else-if="activeTab === 'usage'" class="workspace-content-body">
          <UsagePanel />
        </section>
        <section v-else-if="activeTab === 'models'" class="workspace-content-body">
          <UserTaskModelsPanel />
        </section>
        <section v-else-if="activeTab === 'prompts'" class="workspace-content-body">
          <UserTaskPromptsPanel />
        </section>
      </main>
    </div>

    <RechargeModal v-model:open="rechargeOpen" />

    <a-modal
      v-model:open="overLimitVisible"
      title="简历数量超限提醒"
      ok-text="继续生成（替换最后一份）"
      cancel-text="取消"
      :width="isMobile ? '95vw' : 520"
      @ok="confirmOverLimit"
    >
      <div class="py-2 text-sm leading-relaxed text-ink-secondary">
        每人最多生成 <span class="font-semibold text-danger">5</span> 份简历，继续生成将
        <span class="font-semibold text-danger">替换最后一份简历</span>，简历将无法找回。
        <br><br>
        是否继续操作？
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  WalletOutlined,
  RobotOutlined,
  FormOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { useResumeStore } from '@/stores/resume'
import { getRoleLabel, getStatusLabel, formatBalanceText } from '@/constants/roles'
import { getTemplateName } from '@/constants/templateNames'
import THEME from '@/constants/theme'
import GradientButton from '@/components/GradientButton.vue'
import UsagePanel from './components/UsagePanel.vue'
import UserTaskModelsPanel from './components/UserTaskModelsPanel.vue'
import UserTaskPromptsPanel from './components/UserTaskPromptsPanel.vue'
import ResumeCardList from './components/ResumeCardList.vue'
import RechargeModal from './components/RechargeModal.vue'
import { formatDateTime } from '@/utils/date'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { getUserTaskModels, getUserTaskPrompts } from '@/api/userAi'

const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const resumeStore = useResumeStore()
const isMobile = useMediaQuery()
const loading = ref(false)
const activeTab = ref('resumes')
const mobilePage = ref(1)
const rechargeOpen = ref(false)
const selectedRowKeys = ref([])
const overLimitVisible = ref(false)
// 管理员开关：关闭时侧栏不展示对应 Tab
const modelCustomizationEnabled = ref(false)
const promptCustomizationEnabled = ref(false)

const workspaceGroups = computed(() => {
  const groups = [
    {
      label: '工作台',
      items: [
        {
          key: 'resumes',
          label: '我的简历',
          description: '创建、编辑与管理',
          longDescription: '集中管理简历版本、模板、评分与最近更新时间。',
          eyebrow: 'RESUME LIBRARY',
          icon: FileTextOutlined,
        },
        {
          key: 'usage',
          label: '用量明细',
          description: '余额与消费记录',
          longDescription: '查看账户余额、累计消费和每一次额度变动记录。',
          eyebrow: 'USAGE & BILLING',
          icon: WalletOutlined,
        },
      ],
    },
  ]
  // 仅展示管理员已开放的配置入口
  const configItems = []
  if (modelCustomizationEnabled.value) {
    configItems.push({
      key: 'models',
      label: '模型配置',
      description: '按任务选择模型',
      longDescription: '为每个 AI 任务选择平台已启用的模型。',
      eyebrow: 'MODEL SETTINGS',
      icon: RobotOutlined,
    })
  }
  if (promptCustomizationEnabled.value) {
    configItems.push({
      key: 'prompts',
      label: '提示词配置',
      description: '业务指令自定义',
      longDescription: '自定义各 AI 功能的业务提示词（输出格式不可改）。',
      eyebrow: 'PROMPT LIBRARY',
      icon: FormOutlined,
    })
  }
  if (configItems.length) {
    groups.push({ label: '配置中心', items: configItems })
  }
  return groups
})

const allWorkspaceItems = computed(() => workspaceGroups.value.flatMap((group) => group.items))
const hasConfigCenter = computed(() => modelCustomizationEnabled.value || promptCustomizationEnabled.value)
const activeMeta = computed(() => allWorkspaceItems.value.find((item) => item.key === activeTab.value) || allWorkspaceItems.value[0])
const accountName = computed(() => userStore.userInfo.nickname || '用户')
const accountInitial = computed(() => accountName.value.trim().charAt(0).toUpperCase() || 'U')
const balanceText = computed(() => formatBalanceText(walletStore.balance))
const resumeLimitText = computed(() => `${resumeStore.resumeTotal || 0} / ${resumeStore.resumeMaxCount || 5}`)

const columns = [
  { title: '简历标题', dataIndex: 'title', key: 'title', minWidth: 220 },
  { title: '模板', dataIndex: 'template_id', key: 'template_id', width: 130 },
  { title: '评分', dataIndex: 'score', key: 'score', width: 150 },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 180 },
  { title: '操作', key: 'action', width: 130 },
]

function onSelectChange(keys) {
  selectedRowKeys.value = keys
}

function getScoreColor(score) {
  if (score >= 80) return THEME.chart.success
  if (score >= 60) return THEME.chart.warning
  return THEME.chart.danger
}

/** 拉取管理员是否开放用户自定义模型 / 提示词 */
async function loadCustomizationFlags() {
  const [modelsRes, promptsRes] = await Promise.allSettled([
    getUserTaskModels(),
    getUserTaskPrompts(),
  ])
  if (modelsRes.status === 'fulfilled') {
    modelCustomizationEnabled.value = Boolean(modelsRes.value?.customization_enabled)
  }
  if (promptsRes.status === 'fulfilled') {
    promptCustomizationEnabled.value = Boolean(promptsRes.value?.customization_enabled)
  }
}

// 当前 Tab 被关闭时回退到「我的简历」
watch(
  [modelCustomizationEnabled, promptCustomizationEnabled, activeTab],
  () => {
    const visibleKeys = allWorkspaceItems.value.map((item) => item.key)
    if (!visibleKeys.includes(activeTab.value)) {
      activeTab.value = 'resumes'
    }
  },
)

onMounted(async () => {
  loading.value = true
  await Promise.all([
    resumeStore.fetchResumeList(),
    resumeStore.fetchResumeCount(),
    walletStore.fetchBalance(),
    loadCustomizationFlags(),
  ])
  loading.value = false
})

async function handleTableChange(pagination) {
  loading.value = true
  mobilePage.value = pagination.current
  await resumeStore.fetchResumeList(pagination.current, pagination.pageSize)
  loading.value = false
}

async function handleMobilePageChange(page) {
  loading.value = true
  mobilePage.value = page
  await resumeStore.fetchResumeList(page, 10)
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

<style scoped>
.user-center-page {
  max-width: 1440px;
  padding-top: 28px;
}

.workspace-hero {
  position: relative;
  display: flex;
  min-height: 205px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;
  padding: 42px 44px 72px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 24px;
  background:
    linear-gradient(125deg, rgba(15, 23, 42, .98), rgba(20, 46, 67, .96) 58%, rgba(38, 35, 78, .95));
  box-shadow: 0 24px 70px rgba(15, 23, 42, .16);
  color: white;
}

.workspace-hero-copy {
  position: relative;
  z-index: 2;
}

.workspace-eyebrow {
  display: inline-flex;
  margin-bottom: 12px;
  color: #67e8f9;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .22em;
}

.workspace-hero h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -.03em;
}

.workspace-hero p {
  margin: 12px 0 0;
  color: rgba(226, 232, 240, .76);
  font-size: 15px;
}

.workspace-create-button {
  position: relative;
  z-index: 2;
  min-width: 124px;
}

.hero-orbit {
  position: absolute;
  border: 1px solid rgba(103, 232, 249, .18);
  border-radius: 50%;
  pointer-events: none;
}

.hero-orbit-one {
  top: -120px;
  right: -42px;
  width: 320px;
  height: 320px;
  box-shadow: inset 0 0 70px rgba(168, 85, 247, .09);
}

.hero-orbit-two {
  right: 185px;
  bottom: -120px;
  width: 230px;
  height: 230px;
  border-color: rgba(168, 85, 247, .2);
}

.account-overview {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: minmax(260px, 1.15fr) minmax(350px, 1fr) auto;
  align-items: center;
  gap: 28px;
  margin: -42px 24px 24px;
  padding: 22px 24px;
  border: 1px solid rgba(226, 232, 240, .82);
  border-radius: 20px;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 18px 46px rgba(15, 23, 42, .11);
  backdrop-filter: blur(18px);
}

.account-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 16px;
}

.account-avatar {
  flex: 0 0 auto;
  border: 4px solid white;
  background: linear-gradient(135deg, #0e7490, #4f46e5 55%, #a855f7);
  box-shadow: 0 8px 24px rgba(79, 70, 229, .22);
  color: white;
  font-size: 24px;
  font-weight: 800;
}

.account-copy {
  min-width: 0;
}

.account-name-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.account-name-row h2 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #172033;
  font-size: 20px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-pill {
  flex: 0 0 auto;
  padding: 3px 8px;
  border: 1px solid #bae6fd;
  border-radius: 999px;
  background: #ecfeff;
  color: #0e7490;
  font-size: 11px;
  font-weight: 700;
}

.account-copy > p {
  max-width: 280px;
  margin: 5px 0 8px;
  overflow: hidden;
  color: #64748b;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}

.account-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.account-status--active { color: #047857; }
.account-status--active i { background: #10b981; box-shadow: 0 0 0 4px #d1fae5; }
.account-status--danger { color: #dc2626; }
.account-status--danger i { background: #ef4444; box-shadow: 0 0 0 4px #fee2e2; }

.account-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric-card {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #f8fafc;
}

.metric-card > span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.metric-card strong {
  display: block;
  margin-top: 2px;
  color: #172033;
  font-size: 20px;
  line-height: 1.3;
}

.metric-card small {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card button {
  margin-top: 2px;
  border: 0;
  background: transparent;
  color: #0e7490;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
}

.metric-card--balance {
  border-color: #bae6fd;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
}

.logout-button {
  display: inline-flex;
  min-width: 46px;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fff;
  color: #dc2626;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: .2s ease;
}

.logout-button:hover {
  border-color: #fca5a5;
  background: #fef2f2;
}

.workspace-layout {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  align-items: start;
  gap: 22px;
}

.workspace-sidebar {
  position: sticky;
  top: 88px;
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, .8);
  border-radius: 18px;
  background: rgba(255, 255, 255, .82);
  box-shadow: 0 10px 30px rgba(15, 23, 42, .05);
  backdrop-filter: blur(14px);
}

.workspace-nav-group + .workspace-nav-group {
  margin-top: 22px;
}

.workspace-nav-label {
  margin: 0 8px 8px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .14em;
}

.workspace-nav-list {
  display: grid;
  gap: 6px;
}

.workspace-nav-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 58px;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  text-align: left;
  transition: .2s ease;
}

.workspace-nav-item:hover:not(:disabled) {
  border-color: #cffafe;
  background: #f0fdff;
  color: #0e7490;
}

.workspace-nav-item--active {
  border-color: #bae6fd;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
  color: #0f6175;
  box-shadow: inset 3px 0 0 #06b6d4;
}

.workspace-nav-item--disabled {
  cursor: default;
  opacity: .62;
}

.workspace-nav-icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 17px;
}

.workspace-nav-copy {
  min-width: 0;
}

.workspace-nav-copy b,
.workspace-nav-copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-nav-copy b {
  font-size: 13px;
  font-weight: 800;
}

.workspace-nav-copy small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 10px;
}

.workspace-nav-badge {
  padding: 2px 6px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
}

.workspace-sidebar-note {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding: 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.workspace-sidebar-note > span {
  color: #7c3aed;
  font-size: 16px;
}

.workspace-sidebar-note b {
  color: #475569;
  font-size: 11px;
}

.workspace-sidebar-note p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.55;
}

.workspace-main {
  min-width: 0;
}

.workspace-content-header {
  display: flex;
  min-height: 102px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
  padding: 20px 24px;
  border: 1px solid rgba(226, 232, 240, .8);
  border-radius: 18px;
  background: rgba(255, 255, 255, .84);
  box-shadow: 0 10px 30px rgba(15, 23, 42, .05);
  backdrop-filter: blur(14px);
}

.workspace-content-header span {
  color: #0891b2;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .16em;
}

.workspace-content-header h2 {
  margin: 4px 0 0;
  color: #172033;
  font-size: 22px;
  font-weight: 800;
}

.workspace-content-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
}

.workspace-header-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 9px;
}

.workspace-content-body {
  min-width: 0;
}

.workspace-panel {
  border: 1px solid rgba(226, 232, 240, .8);
  border-radius: 18px;
  background: rgba(255, 255, 255, .9);
  box-shadow: 0 12px 34px rgba(15, 23, 42, .055);
}

.workspace-panel :deep(.ant-card-body) {
  padding: 12px 18px 18px;
}

.workspace-panel :deep(.ant-table) {
  background: transparent;
}

.workspace-panel :deep(.ant-table-thead > tr > th) {
  border-bottom-color: #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.workspace-panel :deep(.ant-table-tbody > tr > td) {
  border-bottom-color: #edf2f7;
}

.resume-title-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.resume-title-cell > span {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
  color: #0891b2;
}

.resume-title-cell > div {
  min-width: 0;
}

.resume-title-cell b,
.resume-title-cell small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-title-cell b {
  max-width: 240px;
  color: #1e293b;
  font-size: 13px;
}

.resume-title-cell small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 10px;
}

.table-secondary-text {
  color: #64748b;
  font-size: 12px;
}

.empty-visual {
  display: inline-flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 1px solid #bae6fd;
  border-radius: 18px;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
  color: #0891b2;
  font-size: 28px;
}

@media (max-width: 1100px) {
  .account-overview {
    grid-template-columns: minmax(250px, 1fr) minmax(320px, .9fr);
  }

  .logout-button {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  .logout-button span {
    display: none;
  }
}

@media (max-width: 860px) {
  .workspace-hero {
    min-height: 188px;
    padding: 32px 28px 66px;
  }

  .account-overview {
    grid-template-columns: 1fr;
    gap: 18px;
    margin-right: 14px;
    margin-left: 14px;
    padding: 20px;
  }

  .account-metrics {
    padding-right: 52px;
  }

  .workspace-layout {
    grid-template-columns: 1fr;
  }

  .workspace-sidebar {
    position: static;
    padding: 12px;
  }

  .workspace-nav-group + .workspace-nav-group {
    margin-top: 12px;
  }

  .workspace-nav-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace-sidebar-note {
    display: none;
  }
}

@media (max-width: 640px) {
  .user-center-page {
    padding-top: 14px;
  }

  .workspace-hero {
    min-height: 170px;
    align-items: flex-start;
    padding: 25px 20px 62px;
    border-radius: 18px;
  }

  .workspace-hero p {
    max-width: 235px;
    font-size: 13px;
    line-height: 1.6;
  }

  .workspace-create-button {
    display: none;
  }

  .account-overview {
    margin-top: -36px;
    padding: 17px;
    border-radius: 16px;
  }

  .account-avatar {
    width: 60px !important;
    height: 60px !important;
    min-width: 60px;
    line-height: 52px !important;
  }

  .account-name-row {
    padding-right: 42px;
  }

  .account-name-row h2 {
    font-size: 18px;
  }

  .account-metrics {
    gap: 8px;
    padding-right: 0;
  }

  .metric-card {
    padding: 10px 11px;
  }

  .metric-card strong {
    font-size: 17px;
  }

  .workspace-layout {
    gap: 14px;
  }

  .workspace-sidebar {
    margin: 0 -4px;
    border-radius: 15px;
  }

  .workspace-nav-label,
  .workspace-nav-copy small,
  .workspace-nav-badge {
    display: none;
  }

  .workspace-nav-list {
    gap: 6px;
  }

  .workspace-nav-item {
    grid-template-columns: 34px minmax(0, 1fr);
    min-height: 50px;
    padding: 7px 8px;
  }

  .workspace-nav-icon {
    width: 34px;
    height: 34px;
  }

  .workspace-content-header {
    display: block;
    min-height: 0;
    padding: 17px;
    border-radius: 15px;
  }

  .workspace-content-header h2 {
    font-size: 19px;
  }

  .workspace-content-header p {
    line-height: 1.55;
  }

  .workspace-header-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 14px;
  }

  .workspace-header-actions > :deep(*) {
    width: 100%;
  }

  .workspace-panel {
    border-radius: 15px;
  }

  .workspace-panel :deep(.ant-card-body) {
    padding: 12px;
  }
}
</style>
