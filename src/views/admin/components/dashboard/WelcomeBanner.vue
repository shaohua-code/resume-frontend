<script setup>
/**
 * 欢迎横幅
 * 蓝紫渐变背景，左侧问候语与今日数据文案，右侧机器人插画浮动动效，并提供时间筛选。
 */
import { computed } from 'vue'
import { Bot } from 'lucide-vue-next'

const activeRange = defineModel({ type: String, default: '年度' })

const props = defineProps({
  nickname: {
    type: String,
    default: '管理员',
  },
  todayNewUsers: {
    type: Number,
    default: 0,
  },
})

const timeRanges = [
  { label: '今日', value: '今日' },
  { label: '昨日', value: '昨日' },
  { label: '7日', value: '7日' },
  { label: '30日', value: '30日' },
  { label: '年度', value: '年度' },
]

// 根据当前小时给出问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
</script>

<template>
  <div
    class="relative flex min-h-[180px] items-center overflow-hidden rounded-banner p-7 text-white shadow-lift"
    style="background: linear-gradient(135deg, #4f8ef7, #6d5bff)"
  >
    <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
    <div class="absolute -bottom-16 right-40 h-44 w-44 rounded-full bg-white/5" />

    <div class="relative z-10 flex-1">
      <h2 class="text-2xl font-semibold">👋 {{ greeting }}，{{ nickname }}</h2>
      <p class="mt-3 text-sm text-blue-50">欢迎回来！今天共有 {{ todayNewUsers }} 位用户生成了 AI 简历。</p>
      <p class="mt-1 text-sm text-blue-50">继续保持，让更多用户拿到 Offer 🚀</p>
      <a-segmented
        :value="activeRange"
        :options="timeRanges"
        class="mt-5"
        @change="activeRange = $event"
      />
    </div>

    <div class="relative z-10 hidden md:block">
      <div class="flex h-28 w-28 animate-float items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
        <Bot class="h-16 w-16 text-white" />
      </div>
    </div>
  </div>
</template>
