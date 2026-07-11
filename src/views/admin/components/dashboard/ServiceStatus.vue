<script setup>
/**
 * 系统运行状态
 * 将后端返回的 system_status 映射为服务卡片，绿点表示在线；响应时间为示意展示。
 */
import { computed } from 'vue'
import { Server, Database, Bot, HardDrive } from 'lucide-vue-next'

const props = defineProps({
  status: {
    type: Object,
    default: () => ({}),
  },
})

// 服务名映射：底层 key 对应真实健康状态，展示更贴近产品的服务名
const services = computed(() => [
  { name: 'API 服务', vendor: 'Render', key: 'api', icon: Server, latency: '36ms' },
  { name: '数据库', vendor: 'PostgreSQL', key: 'db', icon: Database, latency: '18ms' },
  { name: 'AI 服务', vendor: 'DeepSeek', key: 'ai', icon: Bot, latency: '120ms' },
  { name: '存储服务', vendor: 'Storage', key: 'storage', icon: HardDrive, latency: '24ms' },
].map((item) => ({
  ...item,
  ok: (props.status[item.key] || 'ok') === 'ok',
})))
</script>

<template>
  <div class="card-base">
    <h3 class="mb-4 text-base font-semibold text-ink">系统运行状态</h3>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="item in services"
        :key="item.key"
        class="flex items-center justify-between rounded-2xl border border-line p-4"
      >
        <div class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl"
            :class="item.ok ? 'bg-mint text-emerald-700' : 'bg-red-50 text-danger'"
          >
            <component :is="item.icon" class="h-5 w-5" />
          </span>
          <div>
            <p class="text-sm font-medium text-ink">{{ item.name }}</p>
            <p class="text-xs text-muted">{{ item.vendor }} · {{ item.latency }}</p>
          </div>
        </div>
        <span class="flex items-center gap-1.5 text-xs">
          <span class="h-2 w-2 rounded-full" :class="item.ok ? 'bg-success' : 'bg-danger'" />
          <span :class="item.ok ? 'text-success' : 'text-danger'">{{ item.ok ? 'Online' : 'Down' }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
