<script setup>
/**
 * 系统公告卡片
 * 用卡片列表展示最新公告（标题/时间/状态），替代传统表格。
 */
import { computed } from 'vue'
import { Megaphone } from 'lucide-vue-next'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  announcements: {
    type: Array,
    default: () => [],
  },
})

// 格式化为本地时间字符串
function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

const hasData = computed(() => props.announcements.length > 0)
</script>

<template>
  <div class="card-base">
    <h3 class="mb-4 text-base font-semibold text-ink">系统公告</h3>

    <EmptyState v-if="!hasData" text="暂无公告" />

    <ul v-else class="flex flex-col gap-3">
      <li
        v-for="item in announcements"
        :key="item.id"
        class="flex items-center gap-3 rounded-2xl border border-line p-4 transition-colors hover:bg-cream"
      >
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lighter text-brand-dark">
          <Megaphone class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-ink">{{ item.title }}</p>
          <p class="mt-0.5 text-xs text-muted">{{ formatTime(item.create_time) }}</p>
        </div>
        <span :class="item.enabled ? 'badge-success' : 'tag-soft'">
          {{ item.enabled ? '已发布' : '已下线' }}
        </span>
      </li>
    </ul>
  </div>
</template>
