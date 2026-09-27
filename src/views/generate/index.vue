<!-- 统一生成页：两种辅助识别方式共享下方唯一表单。 -->
<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import { clampTemplateId } from '@/constants/templateRegistry'
import { useResumeStore } from '@/stores/resume'
import FormPanel from './components/FormPanel.vue'

const route = useRoute()
const resumeStore = useResumeStore()

onMounted(() => {
  // 从模板中心进入时继续使用用户已选模板。
  if (route.query.template_id) {
    resumeStore.currentTemplateId = clampTemplateId(Number(route.query.template_id))
  }
})
</script>

<template>
  <div class="generate-page min-h-[calc(100vh-64px)] animate-fade-in pb-16">
    <PageHero
      compact
      eyebrow="简历工作室 · AI 辅助整理"
      title="把真实经历，变成一份好简历"
      subtitle="先整理真实材料，再逐项核对；AI 帮你梳理表达，最终内容由你决定。"
    />
    <!-- 标题和工作区共享页面宽度；桌面端由表单旁的实时准备卡补充状态。 -->
    <div class="relative z-10 mx-auto mt-2 max-w-[1500px] px-[18px] sm:px-6 xl:px-0">
      <FormPanel />
    </div>
  </div>
</template>

<style scoped>
/* 创作页与下方双栏工作区保持同一左边界，减少窄标题列带来的漂浮感。 */
.generate-page :deep(.page-hero__inner) {
  width: min(100%, 1500px);
}
</style>
