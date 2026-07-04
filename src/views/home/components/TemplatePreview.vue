<script setup>
/**
 * 精选模板轮播 - centerMode 三列透视 + 放大中心预览
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import TemplateMiniPreview from './TemplateMiniPreview.vue'
import { DEMO_RESUME, FEATURED_TEMPLATE_IDS } from '../utils/demoResume'
import { TEMPLATE_LIST } from '@/constants/templateRegistry'

const router = useRouter()
const carouselRef = ref(null)

const featuredTemplates = computed(() =>
  FEATURED_TEMPLATE_IDS
    .map((id) => TEMPLATE_LIST.find((t) => t.id === id))
    .filter(Boolean),
)

// 桌面三列 centerMode，移动端单列
const carouselSettings = {
  centerMode: true,
  slidesToShow: 3,
  infinite: true,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        centerMode: false,
        slidesToShow: 1,
      },
    },
  ],
}

function goGenerate() {
  router.push('/generate?mode=form')
}

function goAllTemplates() {
  router.push('/templates')
}
</script>

<template>
  <section class="page-container">
    <div class="flex flex-col items-center justify-between gap-3 mb-6 sm:mb-8 sm:flex-row">
      <div class="text-center sm:text-left">
        <h2 class="section-title">精选模板预览</h2>
        <p class="mt-1 section-subtitle">20 套专业模板，张三校招简历实时渲染预览</p>
      </div>
      <button class="link-text shrink-0" @click="goAllTemplates">
        查看全部模板 →
      </button>
    </div>

    <a-carousel
      ref="carouselRef"
      autoplay
      arrows
      v-bind="carouselSettings"
      class="template-carousel"
    >
      <template #prevArrow>
        <div class="absolute z-20 flex items-center justify-center w-8 h-8 -translate-y-1/2 rounded-full cursor-pointer -left-2 top-1/2 bg-white/90 text-brand-dark shadow-card sm:-left-4 sm:h-10 sm:w-10">
          <LeftOutlined />
        </div>
      </template>
      <template #nextArrow>
        <div class="absolute z-20 flex items-center justify-center w-8 h-8 -translate-y-1/2 rounded-full cursor-pointer -right-2 top-1/2 bg-white/90 text-brand-dark shadow-card sm:-right-4 sm:h-10 sm:w-10">
          <RightOutlined />
        </div>
      </template>

      <div
        v-for="tpl in featuredTemplates"
        :key="tpl.id"
        class="flex flex-col items-center px-2 pt-2 pb-4 cursor-pointer template-slide"
        @click="goGenerate"
      >
        <TemplateMiniPreview
          :template-id="tpl.id"
          :resume="DEMO_RESUME"
          :scale="0.45"
          :show-label="false"
        />
        <p class="mt-2 text-sm font-medium text-center text-ink">{{ tpl.name }}</p>
      </div>
    </a-carousel>
  </section>
</template>

<style scoped>
:deep(.template-carousel .slick-slide) {
  @apply flex justify-center transition-all duration-300 ease-out;
}

:deep(.template-carousel .slick-slide .template-slide) {
  @apply opacity-50 transition-all duration-300 ease-out;
  transform: scale(0.75) translateY(8px);
}

:deep(.template-carousel .slick-slide.slick-center .template-slide) {
  @apply z-10 opacity-100;
  transform: scale(1) translateY(0);
}

:deep(.template-carousel .slick-dots) {
  @apply -bottom-2;
}

:deep(.template-carousel .slick-dots li button) {
  @apply bg-brand/30;
}

:deep(.template-carousel .slick-dots li.slick-active button) {
  @apply bg-brand-dark;
}

@media (max-width: 767px) {
  :deep(.template-carousel .slick-slide .template-slide) {
    @apply scale-100 opacity-100;
    transform: translateY(0);
  }
}
</style>
