<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { getAdminUsers, resetAdminUserPassword, updateAdminUser, claimUserByEmail } from '@/api/admin'
import { getRoleLabel, getStatusLabel } from '@/constants/roles'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import AdminInviteLinkPanel from './AdminInviteLinkPanel.vue'
import { formatDateTime } from '@/utils/date'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  mode: {
    type: String,
    default: 'users',
  },
})

// 获取当前登录用户信息，用于判断是否为超级管理员
const userStore = useUserStore()
const isSuperAdmin = computed(() => userStore.role === 'SUPER_ADMIN')

const loading = ref(false)
const users = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '', role: '', status: '' })

// 邮箱认领弹窗状态
const claimModalOpen = ref(false)
const claimForm = reactive({ email: '' })
const claimLoading = ref(false)
// 保存用户信息时的 loading（防止重复点击）
const saveLoadingMap = ref({})

// 邀请链接抽屉状态
const inviteDrawerOpen = ref(false)

// 根据模式动态生成列配置
const columns = computed(() => {
  const baseColumns = [
    { title: '用户信息', key: 'profile' },
    // 管理员账号模式下显示管理人数列
    ...(props.mode === 'admins' ? [{ title: '管理人数', dataIndex: 'managed_count', key: 'managed_count', width: 120, align: 'center' }] : []),
    { title: '角色', dataIndex: 'role', key: 'role', width: 170 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 130 },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 190 },
    { title: '操作', key: 'action', width: 240 },
  ]
  return baseColumns
})

/**
 * 角色选项列表
 * - 管理员账号页面（mode=admins）：显示 SUPER_ADMIN 和 ADMIN
 * - 用户账号页面（mode=users）：
 *   - 超级管理员可以将用户提升为 ADMIN 或 USER（不能提升为 SUPER_ADMIN）
 *   - 普通管理员只能管理 USER 角色
 */
const roleOptions = computed(() => {
  if (props.mode === 'admins') {
    return ['SUPER_ADMIN', 'ADMIN']
  }
  // 超级管理员在用户列表中可以将用户提升为管理员（但不能提升为超级管理员）
  if (isSuperAdmin.value) {
    return ['ADMIN', 'USER']
  }
  // 普通管理员只能管理普通用户
  return ['USER']
})

const visibleUsers = computed(() => {
  return users.value.filter((item) => roleOptions.value.includes(item.role))
})

async function loadUsers() {
  loading.value = true
  try {
    const res = await getAdminUsers({ ...query })
    users.value = res.items || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

/**
 * 保存用户信息（包括角色修改）
 * 当将普通用户提升为管理员时，弹出二次确认框防止误操作
 */
async function saveUser(record) {
  // 防止重复点击：同一用户正在保存时忽略
  if (saveLoadingMap.value[record.user_id]) return

  // 检查是否正在将用户提升为管理员角色
  const isPromotingToAdmin = record.role === 'ADMIN' || record.role === 'SUPER_ADMIN'

  // 如果是提升操作，需要二次确认
  if (isPromotingToAdmin) {
    const roleLabel = getRoleLabel(record.role)
    const confirmed = await new Promise((resolve) => {
      Modal.confirm({
        title: '确认提升用户权限',
        content: `确定要将该用户提升为「${roleLabel}」吗？该用户将获得相应的管理权限。`,
        okText: '确认提升',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })

    if (!confirmed) return
  }

  saveLoadingMap.value[record.user_id] = true
  try {
    await updateAdminUser(record.user_id, {
      role: record.role,
      status: record.status,
      nickname: record.nickname,
    })

    const actionText = isPromotingToAdmin ? '用户权限已提升' : '用户信息已保存'
    message.success(actionText)
    await loadUsers()
  } finally {
    saveLoadingMap.value[record.user_id] = false
  }
}

async function resetPassword(record) {
  await resetAdminUserPassword(record.user_id)
  message.success('重置链接已生成')
}

/** 打开邮箱认领弹窗 */
function openClaimModal() {
  claimForm.email = ''
  claimModalOpen.value = true
}

/** 提交邮箱认领 */
async function submitClaim() {
  const email = claimForm.email.trim()
  if (!email) {
    message.warning('请输入邮箱')
    return
  }
  claimLoading.value = true
  try {
    await claimUserByEmail(email)
    message.success('认领成功')
    claimModalOpen.value = false
    await loadUsers()
  } finally {
    claimLoading.value = false
  }
}

function handleTableChange(pagination) {
  query.page = pagination.current
  query.size = pagination.pageSize
  loadUsers()
}

watch(() => props.mode, () => {
  query.role = ''
  query.page = 1
  loadUsers()
})

onMounted(loadUsers)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <a-input :value="query.keyword" placeholder="搜索邮箱/昵称" class="input-field h-[32px]"
          @update:value="query.keyword = $event" />
        <a-select :value="query.role" allow-clear placeholder="角色筛选" class="input-field w-full"
          @update:value="query.role = $event">
          <a-select-option v-for="role in roleOptions" :key="role" :value="role">{{ getRoleLabel(role)
            }}</a-select-option>
        </a-select>
        <a-select :value="query.status" allow-clear placeholder="状态筛选" class="input-field w-full"
          @update:value="query.status = $event">
          <a-select-option value="ACTIVE">正常</a-select-option>
          <a-select-option value="BANNED">已封禁</a-select-option>
        </a-select>
        <div class="flex gap-2">
          <button class="btn-primary h-[32px]" @click="loadUsers">查询用户</button>
          <!-- 用户管理模式下显示添加用户和邀请链接入口 -->
          <template v-if="mode === 'users'">
            <button class="btn-ghost h-[32px]" @click="openClaimModal">添加用户</button>
            <button class="btn-ghost h-[32px]" @click="inviteDrawerOpen = true">邀请链接</button>
          </template>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table :columns="columns" :data-source="visibleUsers" :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }" :scroll="{ x: 'max-content' }"
        row-key="user_id" size="small" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'profile'">
            <AdminUserInfoCell :user-id="record.user_id" :nickname="record.nickname" :email="record.email" />
          </template>
          <!-- 管理人数列：仅在管理员模式下显示 -->
          <template v-if="column.key === 'managed_count'">
            <span class="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700">
              {{ record.managed_count || 0 }} 人
            </span>
          </template>
          <template v-if="column.key === 'role'">
            <a-select :value="record.role" class="input-field w-36" @update:value="record.role = $event">
              <a-select-option v-for="role in roleOptions" :key="role" :value="role">{{ getRoleLabel(role)
                }}</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'status'">
            <a-select :value="record.status" class="input-field mt-2 w-28" @update:value="record.status = $event">
              <a-select-option value="ACTIVE">正常</a-select-option>
              <a-select-option value="BANNED">封禁</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <span class="badge">{{ getRoleLabel(record.role) }}</span>
              <button class="btn-primary-sm" :disabled="saveLoadingMap[record.user_id]" @click="saveUser(record)">
                {{ saveLoadingMap[record.user_id] ? '保存中...' : '保存' }}
              </button>
              <button class="btn-ghost-sm" @click="resetPassword(record)">重置密码</button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 邮箱认领用户弹窗 -->
    <a-modal v-model:open="claimModalOpen" title="添加用户（邮箱认领）" ok-text="认领" :confirm-loading="claimLoading"
      @ok="submitClaim">
      <div class="space-y-3 py-2">
        <p class="text-sm text-muted">输入已注册的普通用户邮箱，认领后该用户将归属到您名下</p>
        <a-input v-model:value="claimForm.email" placeholder="请输入用户邮箱" class="input-field" />
      </div>
    </a-modal>

    <!-- 邀请链接管理抽屉 -->
    <a-drawer v-model:open="inviteDrawerOpen" title="邀请链接管理" placement="right" :width="680">
      <AdminInviteLinkPanel />
    </a-drawer>
  </div>
</template>
