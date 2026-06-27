<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminUsers, resetAdminUserPassword, updateAdminUser } from '@/api/admin'
import { getRoleColor, getRoleLabel, getStatusLabel } from '@/constants/roles'

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
    <a-card :bordered="false" class="rounded-[28px] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <a-input :value="query.keyword" placeholder="搜索邮箱/昵称" @update:value="query.keyword = $event" />
        <a-select :value="query.role" allow-clear placeholder="角色筛选" @update:value="query.role = $event">
          <a-select-option v-for="role in roleOptions" :key="role" :value="role">{{ getRoleLabel(role) }}</a-select-option>
        </a-select>
        <a-select :value="query.status" allow-clear placeholder="状态筛选" @update:value="query.status = $event">
          <a-select-option value="ACTIVE">正常</a-select-option>
          <a-select-option value="BANNED">已封禁</a-select-option>
        </a-select>
        <a-button type="primary" @click="loadUsers">查询用户</a-button>
      </div>
    </a-card>

    <a-card :bordered="false" class="rounded-[28px] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
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
            <div>
              <p class="font-medium text-slate-900">{{ record.nickname || '未设置昵称' }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ record.email }}</p>
            </div>
          </template>
          <template v-if="column.key === 'role'">
            <a-select :value="record.role" class="w-36" @update:value="record.role = $event">
              <a-select-option v-for="role in roleOptions" :key="role" :value="role">{{ getRoleLabel(role) }}</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'ACTIVE' ? 'green' : 'red'">{{ getStatusLabel(record.status) }}</a-tag>
            <a-select :value="record.status" class="mt-2 w-28" @update:value="record.status = $event">
              <a-select-option value="ACTIVE">正常</a-select-option>
              <a-select-option value="BANNED">封禁</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key === 'vip_expire_time'">
            <a-date-picker :value="record.vip_expire_time" show-time value-format="YYYY-MM-DDTHH:mm:ssZ" class="w-48" @update:value="record.vip_expire_time = $event" />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-tag :color="getRoleColor(record.role)">{{ getRoleLabel(record.role) }}</a-tag>
              <a-button type="link" size="small" @click="saveUser(record)">保存</a-button>
              <a-button type="link" size="small" @click="resetPassword(record)">重置密码</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
