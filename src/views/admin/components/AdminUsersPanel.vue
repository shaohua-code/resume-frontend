<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminUsers, resetAdminUserPassword, updateAdminUser } from '@/api/admin'
import { getRoleLabel, getStatusLabel } from '@/constants/roles'
import AdminUserInfoCell from './AdminUserInfoCell.vue'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  mode: {
    type: String,
    default: 'users',
  },
})

const loading = ref(false)
const users = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '', role: '', status: '' })

const columns = [
  { title: '用户信息', key: 'profile' },
  { title: '角色', dataIndex: 'role', key: 'role', width: 170 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 130 },
  { title: 'VIP到期', dataIndex: 'vip_expire_time', key: 'vip_expire_time', width: 220 },
  { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 190 },
  { title: '操作', key: 'action', width: 220 },
]

const roleOptions = computed(() => {
  if (props.mode === 'admins') {
    return ['SUPER_ADMIN', 'ADMIN']
  }
  return ['USER', 'VIP']
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

async function saveUser(record) {
  await updateAdminUser(record.user_id, {
    role: record.role,
    status: record.status,
    vip_expire_time: record.vip_expire_time,
    nickname: record.nickname,
  })
  message.success('用户信息已保存')
  await loadUsers()
}

async function resetPassword(record) {
  await resetAdminUserPassword(record.user_id)
  message.success('重置链接已生成')
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
        <a-input :value="query.keyword" placeholder="搜索邮箱/昵称" class="input-field" @update:value="query.keyword = $event" />
        <a-select :value="query.role" allow-clear placeholder="角色筛选" class="input-field w-full" @update:value="query.role = $event">
          <a-select-option v-for="role in roleOptions" :key="role" :value="role">{{ getRoleLabel(role) }}</a-select-option>
        </a-select>
        <a-select :value="query.status" allow-clear placeholder="状态筛选" class="input-field w-full" @update:value="query.status = $event">
          <a-select-option value="ACTIVE">正常</a-select-option>
          <a-select-option value="BANNED">已封禁</a-select-option>
        </a-select>
        <button class="btn-primary" @click="loadUsers">查询用户</button>
      </div>
    </a-card>

    <a-card :bordered="false" class="card-base">
      <a-table
        :columns="columns"
        :data-source="visibleUsers"
        :loading="loading"
        :pagination="{ current: query.page, pageSize: query.size, total }"
        row-key="user_id"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'profile'">
            <AdminUserInfoCell
              :user-id="record.user_id"
              :nickname="record.nickname"
              :email="record.email"
            />
          </template>
          <template v-if="column.key === 'role'">
            <a-select :value="record.role" class="input-field w-36" @update:value="record.role = $event">
              <a-select-option v-for="role in roleOptions" :key="role" :value="role">{{ getRoleLabel(role) }}</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'status'">
            <span :class="record.status === 'ACTIVE' ? 'badge-success' : 'tag-soft'">{{ getStatusLabel(record.status) }}</span>
            <a-select :value="record.status" class="input-field mt-2 w-28" @update:value="record.status = $event">
              <a-select-option value="ACTIVE">正常</a-select-option>
              <a-select-option value="BANNED">封禁</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'vip_expire_time'">
            <a-date-picker :value="record.vip_expire_time" show-time value-format="YYYY-MM-DDTHH:mm:ssZ" class="input-field w-48" @update:value="record.vip_expire_time = $event" />
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDateTime(record.create_time) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <span class="badge">{{ getRoleLabel(record.role) }}</span>
              <button class="btn-primary-sm" @click="saveUser(record)">保存</button>
              <button class="btn-ghost-sm" @click="resetPassword(record)">重置密码</button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
