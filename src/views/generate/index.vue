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
  <div class="min-h-[calc(100vh-64px)] animate-fade-in pb-16">
    <PageHero
      compact
      title="AI 智能生成简历"
      subtitle="PDF、Word 或文字可辅助识别，也可以直接填写表单后生成"
    />
    <!-- 移动端收紧左右边距，避免识别区两侧空白过大 -->
    <div class="relative z-10 mx-auto -mt-6 max-w-6xl px-2 sm:px-4 lg:px-6">
      <FormPanel />
    </div>
  </div>
</template>
