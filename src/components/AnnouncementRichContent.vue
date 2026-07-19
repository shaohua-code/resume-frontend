<script setup>
/**
 * 公告富文本展示：统一消毒渲染，供弹窗预览与管理端预览复用
 */
import { computed } from 'vue'
import { renderAnnouncementHtml } from '@/utils/announcementContent'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const htmlContent = computed(() => renderAnnouncementHtml(props.content))
</script>

<template>
  <div
    class="announcement-rich-content max-w-none text-sm leading-6 text-ink"
    v-html="htmlContent"
  />
</template>

<style scoped>
.announcement-rich-content :deep(h1),
.announcement-rich-content :deep(h2),
.announcement-rich-content :deep(h3) {
  margin: 0.85em 0 0.4em;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
}
.announcement-rich-content :deep(h1) { font-size: 1.25rem; }
.announcement-rich-content :deep(h2) { font-size: 1.1rem; }
.announcement-rich-content :deep(h3) { font-size: 1rem; }
.announcement-rich-content :deep(p) {
  margin: 0.5em 0;
}
.announcement-rich-content :deep(ul),
.announcement-rich-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.35em;
}
.announcement-rich-content :deep(li) {
  margin: 0.2em 0;
}
.announcement-rich-content :deep(a) {
  color: #0891b2;
  text-decoration: underline;
}
.announcement-rich-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
.announcement-rich-content :deep(strong) {
  font-weight: 700;
}
</style>
