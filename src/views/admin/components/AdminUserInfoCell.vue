<script setup>
/**
 * 管理后台用户信息单元格 - ID + 昵称 + 邮箱
 */
defineProps({
  userId: {
    type: [String, Number],
    default: '',
  },
  nickname: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div>
    <p class="font-medium text-ink">{{ nickname || email || '未知用户' }}</p>
    <p class="mt-1 text-xs text-muted">ID {{ userId || '—' }} · {{ email || '—' }}</p>
  </div>
</template>
