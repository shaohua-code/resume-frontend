<script setup>
/**
 * 管理端顶栏消息铃铛
 * 未读数按当前登录管理员隔离；点开列表后可跳转对应反馈
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from 'lucide-vue-next'
import {
  getAdminNotifications,
  getAdminNotificationUnreadCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '@/api/admin'
import { formatDateTime } from '@/utils/date'
import { getErrorMessage } from '@/utils/errorMessage'
import { message } from 'ant-design-vue'

const router = useRouter()
const inboxOpen = ref(false)
const loading = ref(false)
const unreadCount = ref(0)
const items = ref([])

/** 进入后台时拉取未读数，供角标展示 */
async function loadUnreadCount() {
  try {
    const res = await getAdminNotificationUnreadCount()
    unreadCount.value = res.data?.unread_count || 0
  } catch {
    unreadCount.value = 0
  }
}

async function loadInbox() {
  loading.value = true
  try {
    const res = await getAdminNotifications({ page: 1, size: 20 })
    items.value = res.items || []
  } catch (err) {
    items.value = []
    message.error(getErrorMessage(err))
  } finally {
    loading.value = false
  }
}

/** 展开下拉时刷新列表和未读数 */
async function handleOpenChange(open) {
  inboxOpen.value = open
  if (open) {
    await loadInbox()
    await loadUnreadCount()
  }
}

async function handleReadAll() {
  try {
    await markAllAdminNotificationsRead()
    items.value = items.value.map((item) => ({
      ...item,
      read_at: item.read_at || new Date().toISOString(),
    }))
    unreadCount.value = 0
  } catch (err) {
    message.error(getErrorMessage(err))
  }
}

/** 点开一条：先标已读，再跳到反馈详情 */
async function handleOpenItem(item) {
  try {
    if (!item.read_at) {
      await markAdminNotificationRead(item.id)
      item.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch {
    // 已读失败仍允许跳转查看反馈
  }
  inboxOpen.value = false
  if (item.source_type === 'USER_FEEDBACK' && item.source_id) {
    router.push({ path: '/admin/feedbacks', query: { id: String(item.source_id) } })
  }
}

onMounted(loadUnreadCount)
</script>

<template>
  <a-dropdown
    :open="inboxOpen"
    trigger="click"
    placement="bottomRight"
    @update:open="handleOpenChange"
  >
    <a-badge :count="unreadCount" size="small" class="inline-flex">
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-brand-lighter hover:text-brand-dark"
        aria-label="消息"
      >
        <Bell class="w-4 h-4" />
      </button>
    </a-badge>
    <template #overlay>
      <div class="w-[min(100vw-24px,360px)] overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
        <div class="flex items-center justify-between gap-2 border-b border-line/60 px-3 py-2">
          <p class="text-sm font-semibold text-ink">消息</p>
          <button
            type="button"
            class="text-xs text-brand-dark hover:underline"
            @click.stop="handleReadAll"
          >
            全部已读
          </button>
        </div>
        <div class="max-h-80 overflow-y-auto">
          <p v-if="loading" class="px-3 py-6 text-center text-sm text-muted">加载中...</p>
          <p v-else-if="!items.length" class="px-3 py-6 text-center text-sm text-muted">暂无消息</p>
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="flex w-full flex-col gap-1 border-b border-line/40 px-3 py-2.5 text-left last:border-b-0 hover:bg-brand-lighter/40"
            @click="handleOpenItem(item)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-ink">{{ item.title || '用户反馈' }}</span>
              <span
                v-if="!item.read_at"
                class="h-2 w-2 shrink-0 rounded-full bg-danger"
              />
            </div>
            <p class="text-xs text-muted">
              {{ item.user?.nickname || item.user?.email || '用户' }} · {{ formatDateTime(item.create_time) }}
            </p>
            <p class="line-clamp-2 text-xs text-ink">{{ item.summary }}</p>
          </button>
        </div>
      </div>
    </template>
  </a-dropdown>
</template>
