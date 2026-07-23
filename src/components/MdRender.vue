<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

// 创建 markdown-it 实例，配置 HTML 解析与换行
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})

const props = defineProps({
  // Markdown 源文本
  content: {
    type: String,
    default: '',
  },
})

// 将 Markdown 转为 HTML（v-html 使用）
const renderedHtml = computed(() => {
  if (!props.content) return ''
  return md.render(props.content)
})
</script>

<template>
  <div class="md-render" v-html="renderedHtml" />
</template>

<style scoped>
/* Markdown 渲染容器样式 */
.md-render :deep(p) {
  @apply mb-2 leading-6;
}
.md-render :deep(ul),
.md-render :deep(ol) {
  @apply my-1 pl-5;
}
.md-render :deep(li) {
  @apply my-0.5 leading-5;
}
.md-render :deep(strong) {
  @apply font-semibold text-ink;
}
.md-render :deep(h1),
.md-render :deep(h2),
.md-render :deep(h3) {
  @apply mt-3 mb-1 font-bold text-ink;
}
.md-render :deep(code) {
  @apply rounded bg-canvas px-1 py-0.5 text-xs font-mono text-ink-secondary;
}
</style>
