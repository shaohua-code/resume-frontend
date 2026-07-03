<script setup>
/**
 * 全局页脚 - 品牌信息 + 链接 + 版权
 */
const footerLinks = [
  { label: '关于我们', href: '#' },
  { label: '用户协议', href: '#' },
  { label: '隐私政策', href: '#' },
]
</script>

<template>
  <footer class="relative z-10 border-t border-line/60 bg-white/50 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
      <div class="flex items-center gap-2">
        <img src="/vite.svg" alt="AI简历助手" class="h-6 w-6" />
        <span class="text-sm font-semibold text-ink">AI 简历助手</span>
      </div>
      <nav class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <a
          v-for="link in footerLinks"
          :key="link.label"
          :href="link.href"
          class="text-xs text-ink-secondary transition-colors hover:text-brand-dark sm:text-sm"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
    <div class="border-t border-line/40 py-4 text-center">
      <p class="text-xs text-muted">© {{ new Date().getFullYear() }} AI 简历助手. All rights reserved.</p>
    </div>
  </footer>
</template>
