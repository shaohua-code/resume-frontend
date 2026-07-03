<script setup>
/**
 * 精选模板轮播 - 使用真实模板组件 + 固定演示数据
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import TemplateMiniPreview from './TemplateMiniPreview.vue'
import { DEMO_RESUME, FEATURED_TEMPLATE_IDS } from '../utils/demoResume'
import { TEMPLATE_LIST } from '@/constants/templateRegistry'

const router = useRouter()

// 首页轮播展示的模板列表
const featuredTemplates = computed(() =>
  FEATURED_TEMPLATE_IDS
    .map((id) => TEMPLATE_LIST.find((t) => t.id === id))
    .filter(Boolean),
)

function goGenerate() {
  router.push('/generate')
}

function goAllTemplates() {
  router.push('/templates')
}
</script>

<template>
  <section class="page-container">
    <div class="mb-6 flex flex-col items-center justify-between gap-3 sm:mb-8 sm:flex-row">
      <div class="text-center sm:text-left">
        <h2 class="section-title">精选模板预览</h2>
        <p class="section-subtitle mt-1">20 套专业模板，张三校招简历实时渲染预览</p>
      </div>
      <button class="link-text shrink-0" @click="goAllTemplates">
        查看全部模板 →
      </button>
    </div>

    <a-carousel autoplay arrows class="template-carousel">
      <template #prevArrow>
        <div class="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-brand-dark shadow-card sm:-left-4 sm:h-10 sm:w-10">
          <LeftOutlined />
        </div>
      </template>
      <template #nextArrow>
        <div class="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-brand-dark shadow-card sm:-right-4 sm:h-10 sm:w-10">
          <RightOutlined />
        </div>
      </template>

      <div
        v-for="tpl in featuredTemplates"
        :key="tpl.id"
        class="flex cursor-pointer flex-col items-center px-2 pb-4"
        @click="goGenerate"
      >
        <TemplateMiniPreview :template-id="tpl.id" :resume="DEMO_RESUME" />
      </div>
    </a-carousel>
  </section>
</template>

<style scoped>
:deep(.template-carousel .slick-slide) {
  @apply flex justify-center;
}

:deep(.template-carousel .slick-dots li button) {
  @apply bg-brand/30;
}

:deep(.template-carousel .slick-dots li.slick-active button) {
  @apply bg-brand-dark;
}
</style>
