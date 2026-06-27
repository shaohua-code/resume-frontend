<!--
  用户中心页
  显示个人信息、我的简历列表、导出记录
-->
<template>
  <div class="page-container">
    <h2 class="section-title">用户中心</h2>

    <!-- 个人信息卡片 -->
    <a-card class="user-card">
      <div class="user-info">
        <a-avatar :size="64" style="background: #1677ff">{{ userStore.userInfo.nickname?.[0] || 'U' }}</a-avatar>
        <div class="user-detail">
          <h3>{{ userStore.userInfo.nickname }}</h3>
          <p>{{ userStore.userInfo.email }}</p>
          <div style="margin-top: 8px">
            <a-tag :color="getRoleColor(userStore.role)">{{ getRoleLabel(userStore.role) }}</a-tag>
            <a-tag :color="userStore.userInfo.status === 'BANNED' ? 'red' : 'green'">{{ getStatusLabel(userStore.userInfo.status) }}</a-tag>
          </div>
          <p style="margin-top: 8px">{{ vipStatusText }}</p>
        </div>
        <a-button v-if="userStore.role === 'USER'" type="primary" @click="$router.push('/user')">升级VIP</a-button>
        <a-button danger @click="handleLogout">退出登录</a-button>
      </div>
    </a-card>

    <!-- 我的简历 -->
    <a-card title="我的简历" style="margin-top: 16px" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="$router.push('/generate')">
          <PlusOutlined /> 新建简历
        </a-button>
      </template>
      <a-table :dataSource="resumeStore.resumeList" :columns="columns" :pagination="{ pageSize: 10, total: resumeStore.resumeTotal }" row-key="id" :loading="loading" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'score'">
            <a-progress :percent="record.score" :size="'small'" :stroke-color="record.score >= 80 ? '#52c41a' : record.score >= 60 ? '#faad14' : '#ff4d4f'" />
          </template>
          <template v-if="column.key === 'template_id'">
            {{ getTemplateName(record.template_id) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="$router.push(`/editor/${record.id}`)">编辑</a-button>
            <a-popconfirm title="确定删除？" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useResumeStore } from '@/stores/resume'
import { getRoleColor, getRoleLabel, getStatusLabel, getVipStatusText } from '@/constants/roles'

const router = useRouter()
const userStore = useUserStore()
const resumeStore = useResumeStore()
const loading = ref(false)
const vipStatusText = computed(() => getVipStatusText(userStore.userInfo))

import { getTemplateName } from '@/constants/templateNames'
const columns = [
  { title: '简历标题', dataIndex: 'title', key: 'title' },
  { title: '模板', dataIndex: 'template_id', key: 'template_id', width: 120 },
  { title: '评分', dataIndex: 'score', key: 'score', width: 150 },
  { title: '更新时间', dataIndex: 'update_time', key: 'update_time', width: 180 },
  { title: '操作', key: 'action', width: 140 },
]

onMounted(async () => {
  loading.value = true
  await resumeStore.fetchResumeList()
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

function handleLogout() {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.user-card {
  border-radius: 8px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-detail {
  flex: 1;
}
.user-detail h3 {
  font-size: 18px;
  margin-bottom: 4px;
}
.user-detail p {
  color: #666;
}
</style>
