<script setup>
/**
 * 空状态
 * 暂无数据时展示 Lucide 插画与提示文案，可选“立即创建”按钮。
 */
import { Inbox } from 'lucide-vue-next'

defineProps({
  text: {
    type: String,
    default: '暂无数据',
  },
  actionText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
    <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-lighter text-brand-dark">
      <Inbox class="h-8 w-8" />
    </span>
    <p class="text-sm text-muted">{{ text }}</p>
    <button v-if="actionText" class="btn-primary mt-2" @click="emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>
