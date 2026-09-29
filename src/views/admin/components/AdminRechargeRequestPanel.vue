<script setup>
/**
 * 充值记录管理 - 列表、邮件预览、审核入账、超管删除
 */
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import DOMPurify from 'dompurify'
import { useRoute, useRouter } from 'vue-router'
import {
  getAdminRechargeRequests,
  getAdminRechargeRequestDetail,
  previewRechargeEmail,
  approveRechargeRequest,
  deleteRechargeRequest,
} from '@/api/admin'
import { resolveUploadUrl } from '@/api/upload'
import { useUserStore } from '@/stores/user'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import AdminFilterCard from './AdminFilterCard.vue'
import { formatDateTime } from '@/utils/date'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const isSuperAdmin = computed(() => userStore.role === 'SUPER_ADMIN')
// 跨页按钮与路由权限同源，只提供当前账号确实可以访问的目标页。
const canViewUsers = computed(() => userStore.hasPermission('admin:manage_users'))
const canViewLedgers = computed(() => userStore.hasPermission('admin:view_ledgers'))

const loading = ref(false)
const records = ref([])
const total = ref(0)
// 初始聚焦待审核队列；深链用户范围与日期边界会随查询参数一起发送。
const query = reactive({
  page: 1,
  size: 10,
  status: 'PENDING',
  keyword: '',
  user_id: '',
  create_time_from: '',
  create_time_to: '',
})
const dateRange = ref(null)

// 超管额外展示归属管理员列
const columns = computed(() => {
  const baseColumns = [
    { title: '用户', key: 'user', width: 200 },
  ]
  if (isSuperAdmin.value) {
    baseColumns.push({ title: '归属管理员', key: 'admin', width: 200 })
  }
  baseColumns.push(
    { title: '实付金额', dataIndex: 'paid_amount', key: 'paid_amount', width: 120 },
    { title: '充值金额', dataIndex: 'grant_amount', key: 'grant_amount', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
    { title: '提交时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
    { title: '操作', key: 'action', width: 300 },
  )
  return baseColumns
})

// 邮件预览弹窗
const previewOpen = ref(false)
const previewLoading = ref(false)
const previewHtml = ref('')
const previewSubject = ref('')

// 审核弹窗
const approveOpen = ref(false)
const approveLoading = ref(false)
const approveDetailLoading = ref(false)
const userConfirmPreviewLoading = ref(false)
const approveForm = reactive({
  id: null,
  paidAmount: 0,
  proofUrl: '',
  grantAmount: null,
  userNickname: '',
})
const userConfirmHtml = ref('')

// 删除按钮 loading 映射，防止重复提交
const deleteLoadingMap = reactive({})

// 用户确认邮件预览 debounce 定时器
let grantPreviewTimer = null
const GRANT_PREVIEW_DEBOUNCE_MS = 300
// 打开弹窗初始化期间跳过 grantAmount 监听，避免误清空默认预览
const skipGrantWatch = ref(false)

/** 状态标签：待审核 / 已入账 */
function getStatusLabel(status) {
  return status === 'APPROVED' ? '已入账' : '待审核'
}

// 日期选择按本地自然日转成 ISO 边界，后端以左闭右开区间查询。
function updateDateRange(dates) {
  dateRange.value = dates?.[0] && dates?.[1] ? dates : null
  query.create_time_from = dates?.[0] ? dates[0].startOf('day').toISOString() : ''
  query.create_time_to = dates?.[1] ? dates[1].add(1, 'day').startOf('day').toISOString() : ''
}

function searchRecords() {
  query.page = 1
  loadRecords()
}

function resetFilters() {
  query.page = 1
  query.keyword = ''
  query.user_id = String(route.query.user_id || '')
  query.status = query.user_id ? 'ALL' : 'PENDING'
  query.create_time_from = ''
  query.create_time_to = ''
  dateRange.value = null
  loadRecords()
}

// 清除深链用户条件时同步更新地址栏，避免重置后重新套回旧用户范围。
function clearUserFilter() {
  query.user_id = ''
  const { user_id, ...remainingQuery } = route.query
  router.replace({ path: route.path, query: remainingQuery })
  searchRecords()
}

// 通过现有菜单权限打开关联账号，不在行内暴露越权入口。
function openUser(record) {
  router.push({ path: '/admin/users', query: { user_id: record.user_id } })
}

// 充值申请保存了准确流水主键，跳转后可直接核对本次入账记录。
function openLedger(record) {
  router.push({
    path: '/admin/ledgers',
    query: { ledger_id: String(record.ledger_id), user_id: record.user_id },
  })
}

/** 加载充值记录列表 */
async function loadRecords() {
  loading.value = true
  try {
    // UI 使用具名“全部状态”选项，提交给接口时将 ALL 转成无状态过滤条件。
    const res = await getAdminRechargeRequests({ ...query, status: query.status === 'ALL' ? '' : query.status })
    records.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

/** 打开邮件预览（管理员通知模板） */
async function openPreview(record) {
  previewOpen.value = true
  previewLoading.value = true
  previewHtml.value = ''
  previewSubject.value = ''
  try {
    const res = await previewRechargeEmail(record.id, 'admin_notify')
    previewSubject.value = res.data?.subject || '邮件预览'
    // 使用 DOMPurify 消毒 HTML，防止存储型 XSS 攻击
    previewHtml.value = DOMPurify.sanitize(res.data?.html || '')
  } catch {
    message.error('预览加载失败')
  } finally {
    previewLoading.value = false
  }
}

/**
 * 加载用户确认邮件预览
 * @param {number|string} id 充值记录 ID
 * @param {number} grantAmount 实际充值金额（覆盖预览变量）
 */
async function loadUserConfirmPreview(id, grantAmount) {
  userConfirmPreviewLoading.value = true
  try {
    const res = await previewRechargeEmail(id, 'user_confirm', { grant_amount: grantAmount })
    // 使用 DOMPurify 消毒 HTML，防止存储型 XSS 攻击
    userConfirmHtml.value = DOMPurify.sanitize(res.data?.html || '')
  } catch {
    userConfirmHtml.value = ''
  } finally {
    userConfirmPreviewLoading.value = false
  }
}

/** 打开待充值审核弹窗 */
async function openApprove(record) {
  skipGrantWatch.value = true
  approveForm.id = record.id
  approveForm.grantAmount = null
  approveForm.paidAmount = Number(record.paid_amount || 0)
  approveForm.proofUrl = ''
  approveForm.userNickname = record.user?.nickname || record.user?.email || ''
  userConfirmHtml.value = ''
  approveOpen.value = true

  approveDetailLoading.value = true
  try {
    const res = await getAdminRechargeRequestDetail(record.id)
    approveForm.paidAmount = Number(res.data?.paid_amount || 0)
    approveForm.proofUrl = res.data?.proof_url || ''
    approveForm.userNickname = res.data?.user?.nickname || res.data?.user?.email || ''
    // 打开弹窗时用实付金额作为默认预览基准
    if (approveForm.paidAmount > 0) {
      await loadUserConfirmPreview(record.id, approveForm.paidAmount)
    }
  } catch {
    message.error('加载详情失败')
  } finally {
    approveDetailLoading.value = false
    skipGrantWatch.value = false
  }
}

/** 提交审核入账 */
async function submitApprove() {
  const grantAmount = Number(approveForm.grantAmount)
  if (!grantAmount || Number.isNaN(grantAmount) || grantAmount <= 0) {
    message.warning('请输入大于 0 的实际充值金额')
    return
  }

  approveLoading.value = true
  try {
    await approveRechargeRequest(approveForm.id, { grant_amount: grantAmount })
    message.success('充值已入账')
    approveOpen.value = false
    await loadRecords()
    userStore.triggerDashboardRefresh()
  } catch {
    // 错误提示由 request 拦截器统一处理
  } finally {
    approveLoading.value = false
  }
}

/** 超管删除待充值记录 */
async function handleDelete(record) {
  if (deleteLoadingMap[record.id]) return
  deleteLoadingMap[record.id] = true
  try {
    await deleteRechargeRequest(record.id)
    message.success('充值记录已删除')
    await loadRecords()
  } catch {
    // 错误提示由 request 拦截器统一处理
  } finally {
    deleteLoadingMap[record.id] = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadRecords()
}

// 监听实际充值金额，debounce 联动用户确认邮件预览
watch(
  () => approveForm.grantAmount,
  (grantAmount) => {
    if (skipGrantWatch.value || !approveOpen.value || !approveForm.id) return

    if (grantPreviewTimer) {
      clearTimeout(grantPreviewTimer)
      grantPreviewTimer = null
    }

    const amount = Number(grantAmount)
    // 未输入或为 0 时清空预览，提示用户先输入金额
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      userConfirmHtml.value = ''
      return
    }

    grantPreviewTimer = setTimeout(() => {
      loadUserConfirmPreview(approveForm.id, amount)
    }, GRANT_PREVIEW_DEBOUNCE_MS)
  },
)

onMounted(() => {
  // 普通入口默认聚焦待审核队列；从用户账号深链进入时显示该用户全部申请。
  query.user_id = String(route.query.user_id || '')
  if (query.user_id) query.status = 'ALL'
  loadRecords()
})

onUnmounted(() => {
  if (grantPreviewTimer) {
    clearTimeout(grantPreviewTimer)
  }
})
</script>

<template>
  <div class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-ink sm:text-xl">充值审核</h2>
      <p class="mt-1 text-sm text-muted">优先处理待审核申请；入账后可沿流水与用户账号继续核对</p>
    </div>

    <AdminFilterCard title="筛选充值申请" description="按审核状态、用户或提交日期查找充值记录">
      <!-- 将状态、用户和提交日期集中到同一查询栏，筛选结果仍遵循后端归属权限。 -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(150px,0.8fr)_minmax(220px,1.4fr)_minmax(260px,1.2fr)_max-content]">
        <a-select v-model:value="query.status" class="input-field w-full" aria-label="充值申请状态" placeholder="选择申请状态">
          <a-select-option value="PENDING">待审核</a-select-option>
          <a-select-option value="APPROVED">已入账</a-select-option>
          <a-select-option value="ALL">全部状态</a-select-option>
        </a-select>
        <a-input
          v-model:value="query.keyword"
          allow-clear
          class="input-field"
          placeholder="搜索用户邮箱或昵称"
          @press-enter="searchRecords"
        />
        <a-range-picker
          :value="dateRange"
          class="input-field w-full"
          :placeholder="['提交开始日期', '提交结束日期']"
          @change="updateDateRange"
        />
        <div class="flex gap-2">
          <button class="btn-primary min-h-11 flex-1 whitespace-nowrap" @click="searchRecords">查询</button>
          <button class="btn-ghost min-h-11 flex-1 whitespace-nowrap" @click="resetFilters">重置</button>
        </div>
      </div>
      <template #context>
        <span v-if="query.user_id">当前限定为指定用户申请</span>
        <button v-if="query.user_id" class="link-text min-h-11 px-2" @click="clearUserFilter">清除用户限定</button>
      </template>
    </AdminFilterCard>

    <a-card :bordered="false" class="card-base">
      <a-table
        :columns="columns"
        :data-source="records"
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
          <!-- 超管可见：归属管理员账号与邮箱 -->
          <template v-if="column.key === 'admin'">
            <AdminUserInfoCell
              :user-id="record.admin_id"
              :nickname="record.admin?.nickname"
              :email="record.admin?.email"
            />
          </template>
          <template v-if="column.key === 'paid_amount'">
            <span class="font-semibold text-ink">¥{{ Number(record.paid_amount).toFixed(2) }}</span>
          </template>
          <template v-if="column.key === 'grant_amount'">
            <span v-if="record.grant_amount != null" class="font-semibold text-emerald-600">
              ¥{{ Number(record.grant_amount).toFixed(2) }}
            </span>
            <span v-else class="text-muted">-</span>
          </template>
          <template v-if="column.key === 'status'">
            <!-- 已完成置灰，待充值保留可点击态 -->
            <span
              :class="record.status === 'APPROVED'
                ? 'badge-success'
                : 'tag-soft'"
            >
              {{ getStatusLabel(record.status) }}
            </span>
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap gap-2">
              <button class="btn-ghost-sm" @click="openPreview(record)">预览</button>
              <button
                v-if="canViewUsers"
                class="btn-ghost-sm"
                @click="openUser(record)"
              >
                查看用户
              </button>
              <!-- 已入账申请通过保存的流水主键直达对应账户流水。 -->
              <button
                v-if="record.status === 'APPROVED' && record.ledger_id && canViewLedgers"
                class="btn-ghost-sm"
                @click="openLedger(record)"
              >
                查看流水
              </button>
              <!-- 审核入口只对仍待处理的申请显示。 -->
              <button
                v-if="record.status === 'PENDING'"
                class="btn-primary-sm"
                @click="openApprove(record)"
              >
                审核入账
              </button>
              <!-- 超管可删除待审核记录 -->
              <a-popconfirm
                v-if="isSuperAdmin && record.status === 'PENDING'"
                title="确定删除该待充值记录？"
                @confirm="handleDelete(record)"
              >
                <button
                  class="btn-ghost-sm text-danger"
                  :disabled="deleteLoadingMap[record.id]"
                >
                  删除
                </button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 邮件预览弹窗 -->
    <a-modal
      v-model:open="previewOpen"
      :title="previewSubject || '邮件预览'"
      :footer="null"
      width="720px"
      centered
    >
      <a-spin :spinning="previewLoading">
        <div
          v-if="previewHtml"
          class="max-h-[70vh] overflow-auto rounded-card border border-line/60 bg-surface p-4"
          v-html="previewHtml"
        />
        <div v-else class="py-8 text-center text-sm text-muted">暂无预览内容</div>
      </a-spin>
    </a-modal>

    <!-- 待充值审核弹窗（内容居中） -->
    <a-modal
      v-model:open="approveOpen"
      title="审核充值入账"
      ok-text="确认入账"
      :confirm-loading="approveLoading"
      width="720px"
      centered
      @ok="submitApprove"
    >
      <a-spin :spinning="approveDetailLoading">
        <div class="flex flex-col items-center space-y-4 py-2 text-center">
          <div>
            <p class="mb-2 text-sm text-muted">用户</p>
            <p class="text-sm font-medium text-ink">{{ approveForm.userNickname || '—' }}</p>
          </div>
          <div>
            <p class="mb-2 text-sm text-muted">实付金额（只读）</p>
            <p class="text-lg font-semibold text-ink">¥{{ approveForm.paidAmount.toFixed(2) }}</p>
          </div>
          <div class="w-full">
            <p class="mb-2 text-sm text-muted">支付凭证</p>
            <div
              v-if="approveForm.proofUrl"
              class="mx-auto flex max-w-[240px] items-center justify-center overflow-hidden rounded-card border border-line/60 bg-canvas/50 p-2"
            >
              <img
                :src="resolveUploadUrl(approveForm.proofUrl)"
                alt="支付凭证"
                class="w-full object-contain"
              />
            </div>
            <p v-else class="text-sm text-muted">无凭证</p>
          </div>
          <div class="w-full max-w-xs">
            <p class="mb-2 text-sm text-muted">实际充值 <span class="text-danger">*</span></p>
            <a-input-number
              v-model:value="approveForm.grantAmount"
              :min="0.01"
              :step="0.01"
              class="input-field w-full max-w-xs"
              placeholder="请输入实际充值金额"
            />
          </div>

          <!-- 所有管理员可见：用户确认邮件预览（随实际充值金额联动） -->
          <div class="w-full rounded-card border border-line/60 bg-canvas/30 p-3 text-left">
            <p class="mb-2 text-center text-sm font-medium text-ink">用户确认邮件预览</p>
            <a-spin :spinning="userConfirmPreviewLoading">
              <div
                v-if="userConfirmHtml"
                class="max-h-48 overflow-auto rounded-card border border-line/60 bg-surface p-3"
                v-html="userConfirmHtml"
              />
              <p v-else class="text-center text-sm text-muted">请输入实际充值金额后预览</p>
            </a-spin>
          </div>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>
