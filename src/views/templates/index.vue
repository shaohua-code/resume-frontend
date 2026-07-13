<script setup>
/**
 * 全部模板预览页 - 20 套模板网格 + 弹窗完整简历预览
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import GradientButton from '@/components/GradientButton.vue'
import TemplateMiniPreview from '@/views/home/components/TemplateMiniPreview.vue'
import { getDemoResume } from '@/views/home/utils/demoResume'
import { TEMPLATE_LIST } from '@/constants/templateRegistry'
import { useResumeStore } from '@/stores/resume'
import { useMediaQuery } from '@/composables/useMediaQuery'

const router = useRouter()
const resumeStore = useResumeStore()
const isNarrowScreen = useMediaQuery('(max-width: 640px)')
const previewId = ref(null)
const modalPreviewRef = ref(null)
const activeCategory = ref('全部')
// 弹窗内预览缩放比，按容器宽度自适应
const modalPreviewScale = ref(1)

const A4_WIDTH = 794
const categories = computed(() => ['全部', ...new Set(TEMPLATE_LIST.map((item) => item.category || '通用'))])
const filteredTemplates = computed(() => (
  activeCategory.value === '全部'
    ? TEMPLATE_LIST
    : TEMPLATE_LIST.filter((item) => (item.category || '通用') === activeCategory.value)
))
const previewTemplate = computed(() => TEMPLATE_LIST.find((item) => item.id === previewId.value))
const cardPreviewScale = computed(() => (isNarrowScreen.value ? 0.26 : 0.22))
const modalWidth = computed(() => (isNarrowScreen.value ? 'calc(100vw - 24px)' : 900))

function openPreview(id) {
  previewId.value = id
}

function closePreview() {
  previewId.value = null
}

function goGenerate() {
  // 若用户正在预览某套模板，带入生成页与流式预览
  if (previewId.value) {
    resumeStore.currentTemplateId = previewId.value
    router.push({ path: '/generate', query: { template_id: previewId.value } })
    return
  }
  router.push('/generate')
}

// 根据弹窗内容区宽度计算预览缩放，避免 A4 溢出
function updateModalPreviewScale() {
  if (!modalPreviewRef.value) return
  const maxWidth = modalPreviewRef.value.clientWidth - 20
  modalPreviewScale.value = Math.min(1, maxWidth / A4_WIDTH)
}

watch(previewId, async (id) => {
  if (!id) return
  await nextTick()
  updateModalPreviewScale()
})

onMounted(() => {
  window.addEventListener('resize', updateModalPreviewScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateModalPreviewScale)
})
</script>

<template>
  <div class="pb-16 animate-fade-in">
    <PageHero
      compact
      title="全部简历模板"
      subtitle="覆盖通用、职场与行业场景，选择更匹配岗位气质的版式"
    />

    <section class="-mt-4 page-container">
      <div class="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:justify-center sm:overflow-visible">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-all"
          :class="activeCategory === category
            ? 'border-brand-dark bg-brand-dark text-white shadow-soft'
            : 'border-line bg-white/80 text-ink-secondary hover:border-brand/40 hover:text-brand-dark'"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <a-row :gutter="[{ xs: 14, sm: 20, lg: 24 }, { xs: 16, sm: 20, lg: 24 }]">
        <a-col
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <button
            type="button"
            class="template-gallery-card group w-full overflow-hidden rounded-[20px] border border-line/60 bg-white/90 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            :style="{ '--template-gradient': tpl.color }"
            :aria-label="`预览${tpl.name}模板`"
            @click="openPreview(tpl.id)"
          >
            <div class="template-preview-stage flex min-h-[318px] items-start justify-center overflow-hidden px-3 pt-5">
              <TemplateMiniPreview
                :template-id="tpl.id"
                :resume="getDemoResume(tpl.id)"
                :scale="cardPreviewScale"
                preview-mode="page"
                :show-label="false"
              />
            </div>
            <div class="relative border-t border-line/50 bg-white px-4 py-4">
              <div class="mb-2 flex items-center justify-between gap-3">
                <h2 class="truncate text-base font-semibold text-ink">{{ tpl.name }}</h2>
                <span class="shrink-0 rounded-full bg-brand-lighter/70 px-2.5 py-1 text-[11px] font-medium text-brand-dark">
                  {{ tpl.category || '通用' }}
                </span>
              </div>
              <p class="min-h-10 text-sm leading-5 text-ink-secondary">{{ tpl.desc }}</p>
              <span class="mt-3 inline-flex items-center text-xs font-semibold text-brand-dark">
                查看完整预览 <span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </button>
        </a-col>
      </a-row>

      <div class="flex justify-center mt-10">
        <GradientButton class="inline-flex items-center justify-center h-9" @click="goGenerate">使用模板开始生成</GradientButton>
      </div>
    </section>

    <a-modal
      :open="previewId !== null"
      :title="previewTemplate?.name || '模板预览'"
      :width="modalWidth"
      :footer="null"
      class="modal-fresh"
      @cancel="closePreview"
    >
      <div v-if="previewId" class="flex min-h-0 flex-col items-center py-1">
        <!-- 可滚动区域展示完整简历 -->
        <div
          ref="modalPreviewRef"
          class="template-modal-preview flex max-h-[65dvh] w-full justify-center overflow-y-auto rounded-card border border-line/50 bg-cream/50 px-2 py-4"
        >
          <TemplateMiniPreview
            :template-id="previewId"
            :resume="getDemoResume(previewId)"
            :scale="modalPreviewScale"
            preview-mode="full"
            :show-label="false"
          />
        </div>
        <div class="mt-3 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="btn-ghost" @click="closePreview">继续浏览</button>
          <GradientButton class="min-w-[140px]" @click="goGenerate">使用此模板生成</GradientButton>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.template-preview-stage {
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.7), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.92)),
    var(--template-gradient);
}

.template-gallery-card:hover .template-preview-stage {
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.82), transparent 32%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.74), rgba(248, 250, 252, 0.88)),
    var(--template-gradient);
}

.template-modal-preview {
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}

@media (max-width: 640px) {
  .template-preview-stage {
    min-height: 324px;
  }
}
</style>
