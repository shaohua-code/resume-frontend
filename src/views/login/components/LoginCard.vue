<script setup>
/**
 * 登录卡片容器 - 磨砂玻璃外壳
 * H5 移动端优化：安全区域适配、触摸友好、视觉层次增强
 */
import GlassCard from '@/components/GlassCard.vue'
</script>

<template>
  <!-- 外层容器：添加安全区域适配和触摸优化 -->
  <div
    class="login-card-wrapper relative flex min-h-screen items-center justify-center overflow-hidden overflow-y-auto p-4 sm:p-6"
    style="background: var(--gradient-hero)"
    :style="{
      paddingTop: 'calc(1rem + env(safe-area-inset-top, 0))',
      paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0))',
    }"
  >
    <!-- 背景装饰光效 -->
    <div class="pointer-events-none absolute left-5 top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl sm:left-10 sm:top-20 sm:h-72 sm:w-72" />
    <div class="pointer-events-none absolute bottom-10 right-5 h-64 w-64 rounded-full bg-white/15 blur-3xl sm:bottom-20 sm:right-10 sm:h-96 sm:w-96" />

    <!-- 卡片主体：移动端优化宽度和内边距 -->
    <GlassCard glow class="relative w-full max-w-[420px] animate-scale-in max-sm:max-w-[100%]">
      <!-- Logo 和标题区：移动端缩小尺寸 -->
      <div class="mb-5 text-center sm:mb-6">
        <img src="/vite.svg" alt="Logo" class="mx-auto mb-2.5 h-10 w-10 sm:mb-3 sm:h-12 sm:w-12" />
        <h2 class="mb-0.5 text-xl font-bold text-ink sm:mb-1 sm:text-2xl">AI 简历助手</h2>
        <p class="text-xs text-ink-secondary sm:text-sm">专业简历，让求职更简单</p>
      </div>

      <!-- 表单内容插槽 -->
      <slot />

      <!-- 底部链接区域 -->
      <div v-if="$slots.footer" class="mt-4 text-center text-xs text-ink-secondary sm:text-sm">
        <slot name="footer" />
      </div>
    </GlassCard>
  </div>
</template>

<style scoped>
/* 移动端触摸优化 */
.login-card-wrapper {
  /* iOS 平滑滚动 */
  -webkit-overflow-scrolling: touch;
  /* 防止橡皮筋效果 */
  overscroll-behavior: contain;
  /* 触摸反馈 */
  -webkit-tap-highlight-color: transparent;
}

/* 小屏幕下确保卡片不贴边 */
@media (max-width: 480px) {
  .login-card-wrapper {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
