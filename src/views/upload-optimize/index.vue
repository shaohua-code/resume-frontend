<!--
  旧路由兼容：重定向到 /generate?mode=upload
-->
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace({ path: '/generate', query: { mode: 'upload' } })
})
</script>

<template>
  <div class="flex min-h-[calc(100vh-64px)] items-center justify-center">
    <a-spin size="large" />
  </div>
</template>
