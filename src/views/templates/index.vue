<script setup>
/**
 * 全部模板预览页 - 模板网格 + 弹窗完整简历预览
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import GradientButton from '@/components/GradientButton.vue'
import LazyRender from '@/components/LazyRender.vue'
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
// 保留用户当前检索词只用于本页筛选，不发送到行为分析事件。
const searchTerm = ref('')
// 弹窗内预览缩放比，按容器宽度自适应
const modalPreviewScale = ref(1)

const A4_WIDTH = 794
const categories = computed(() => ['全部', ...new Set(TEMPLATE_LIST.map((item) => item.category || '通用'))])
// 用途分类与名称/场景搜索共同筛选，模板集合仍以统一注册表为唯一来源。
const filteredTemplates = computed(() => (
  TEMPLATE_LIST.filter((item) => {
    const categoryMatches = activeCategory.value === '全部' || (item.category || '通用') === activeCategory.value
    const keyword = searchTerm.value.trim().toLocaleLowerCase()
    const textMatches = !keyword || `${item.name} ${item.category || ''} ${item.desc || ''}`.toLocaleLowerCase().includes(keyword)
    return categoryMatches && textMatches
  })
))
const previewTemplate = computed(() => TEMPLATE_LIST.find((item) => item.id === previewId.value))
const cardPreviewScale = computed(() => (isNarrowScreen.value ? 0.235 : 0.27))
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
      eyebrow="模板库 · 按行业与场景浏览"
      title="全部简历模板"
      subtitle="先按求职场景找到合适版式，再带入创作页整理真实经历并继续编辑。"
    />

    <section class="page-container">
      <!-- 先用真实场景与简短检索缩小选择范围，再进入完整模板预览。 -->
      <div class="template-search-panel">
        <div>
          <span class="section-kicker">找到你的风格</span>
          <h2>让专业经历，拥有合适的第一印象</h2>
          <p>挑选版式后再整理内容；所有信息都由你确认，后续也可以继续修改。</p>
        </div>
        <label class="template-search-field">
          <span>搜名称或行业</span>
          <input v-model="searchTerm" type="search" placeholder="输入名称、行业或使用场景" />
        </label>
      </div>
      <!-- 窄屏横向滚动分类保持 44px 触控高度，避免密集标签误触。 -->
      <div class="template-filter-row">
        <div class="template-categories">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-all"
          :class="activeCategory === category
            ? 'border-brand-dark bg-brand-dark text-white shadow-soft'
            : 'border-line bg-surface/80 text-ink-secondary hover:border-brand/40 hover:text-brand-dark'"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
        </div>
        <p class="template-result-count" aria-live="polite">找到 <strong>{{ filteredTemplates.length }}</strong> 套模板</p>
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
            class="template-gallery-card group w-full overflow-hidden rounded-card border border-line/80 bg-surface text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            :style="{ '--template-gradient': tpl.color }"
            :aria-label="`预览${tpl.name}模板`"
            @click="openPreview(tpl.id)"
          >
            <div class="template-preview-stage flex min-h-[354px] items-start justify-center overflow-hidden px-3 pt-6">
              <!-- 仅在卡片接近视口时加载真实模板，50 套模板不会同时触发组件请求和 A4 渲染。 -->
              <LazyRender min-height="320px" root-margin="360px 0px" class="w-full">
                <div class="flex w-full justify-center">
                  <TemplateMiniPreview
                    :template-id="tpl.id"
                    :resume="getDemoResume(tpl.id)"
                    :scale="cardPreviewScale"
                    preview-mode="page"
                    :show-label="false"
                  />
                </div>
              </LazyRender>
            </div>
            <div class="relative border-t border-line/50 bg-surface px-4 py-4">
              <div class="mb-2 flex items-center justify-between gap-3">
                <h2 class="truncate text-base font-semibold text-ink">{{ tpl.name }}</h2>
                <span class="shrink-0 rounded-full bg-brand-lighter/70 px-2.5 py-1 text-[11px] font-medium text-brand-dark">
                  {{ tpl.category || '通用' }}
                </span>
              </div>
              <p class="min-h-10 text-sm leading-5 text-ink-secondary">{{ tpl.desc }}</p>
              <span class="template-card-action mt-3 inline-flex items-center text-xs font-semibold text-brand-dark">
                查看完整预览 <span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </button>
        </a-col>
      </a-row>

      <div v-if="!filteredTemplates.length" class="template-empty-state">
        <strong>没有找到匹配的模板</strong>
        <span>试试更短的关键词，或恢复“全部”分类。</span>
        <button type="button" @click="searchTerm = ''; activeCategory = '全部'">查看全部模板</button>
      </div>

      <!-- 无匹配模板时只保留恢复筛选入口，避免 CTA 暗示已选中模板。 -->
      <div v-if="filteredTemplates.length" class="flex justify-center mt-10">
        <GradientButton class="inline-flex h-11 min-h-11 items-center justify-center" @click="goGenerate">使用模板开始生成</GradientButton>
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
/* 目录像作品集陈列，让每张 A4 纸从柔和衬底里浮出来。 */
.template-preview-stage {
  position: relative;
  background:
    radial-gradient(ellipse at 50% 22%, color-mix(in srgb, var(--color-accent-lighter) 56%, transparent), transparent 55%),
    linear-gradient(145deg, color-mix(in srgb, var(--color-brand-lighter) 42%, var(--color-surface)), color-mix(in srgb, var(--color-canvas) 74%, var(--color-surface)));
}

.template-preview-stage::after {
  position: absolute;
  right: -36px;
  bottom: -74px;
  width: 150px;
  height: 150px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 11%, transparent);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.template-gallery-card:hover .template-preview-stage {
  background:
    radial-gradient(ellipse at 50% 22%, color-mix(in srgb, var(--color-accent-lighter) 72%, transparent), transparent 58%),
    linear-gradient(145deg, color-mix(in srgb, var(--color-brand-lighter) 62%, var(--color-surface)), color-mix(in srgb, var(--color-canvas) 70%, var(--color-surface)));
}

.template-modal-preview {
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}

/* 搜索和分类合并为轻量控制区，避免标题下再出现一张抢空间的大面板。 */
.template-search-panel {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
  margin: 0 0 23px;
}

.template-search-panel h2 { margin: 5px 0 4px; color: var(--color-ink); font-size: 21px; font-weight: 800; letter-spacing: -.025em; }
.template-search-panel p { margin: 0; color: var(--color-ink-secondary); font-size: 13px; line-height: 1.6; }
.template-search-field { display: grid; width: min(330px, 100%); flex: 0 0 auto; gap: 7px; color: var(--color-ink-secondary); font-size: 11px; font-weight: 700; }
.template-search-field input { min-height: 46px; padding: 0 16px; border: 1px solid var(--color-line); border-radius: 14px; background: var(--color-surface); color: var(--color-ink); box-shadow: 0 3px 12px rgb(40 35 70 / .035); outline-color: var(--color-brand); }
.template-filter-row { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:16px; }
.template-categories { display:flex; min-width:0; gap:7px; overflow-x:auto; padding:2px 0 8px; scrollbar-width:none; }
.template-categories::-webkit-scrollbar { display:none; }
.template-categories button { border-radius:999px; background:var(--color-surface); transition:transform .18s ease, box-shadow .18s ease; }
.template-categories button[class*="bg-brand-dark"] { border-color:var(--color-brand-dark); background:var(--color-brand-dark); color:#fff; box-shadow:var(--shadow-soft); }
.template-categories button[class*="bg-surface"] { background:var(--color-surface); color:var(--color-ink-secondary); }
.template-categories button:hover { transform:translateY(-1px); }
.template-result-count { flex:0 0 auto; margin:0; color:var(--color-ink-secondary); font-size:12px; }
.template-result-count strong { color:var(--color-ink); font-size:14px; }
.template-gallery-card { border-radius:18px !important; }
.template-card-action { color:var(--color-brand-dark); }
.template-empty-state { display: grid; justify-items: center; gap: 9px; padding: 52px 16px; border: 1px dashed var(--color-line); border-radius: 18px; color: var(--color-ink-secondary); text-align: center; }
.template-empty-state strong { color: var(--color-ink); }
.template-empty-state button { min-height: 44px; margin-top: 6px; padding: 0 15px; border: 1px solid var(--color-brand); border-radius: 999px; color: var(--color-brand-dark); font-weight: 700; }

@media (max-width: 640px) {
  .template-search-panel { align-items: stretch; flex-direction: column; gap: 13px; margin: 0 0 16px; }
  .template-search-panel h2 { font-size: 18px; }
  .template-search-field { width: 100%; }
  .template-filter-row { align-items: flex-start; flex-direction: column; gap:4px; }
  .template-categories { width:100%; }
  .template-preview-stage { min-height: 320px; }
}
</style>
