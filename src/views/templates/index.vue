<script setup>
/**
 * 全部模板预览页 - 20 套模板网格 + 弹窗大图预览
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import GlassCard from '@/components/GlassCard.vue'
import GradientButton from '@/components/GradientButton.vue'
import TemplateMiniPreview from '@/views/home/components/TemplateMiniPreview.vue'
import { DEMO_RESUME } from '@/views/home/utils/demoResume'
import { TEMPLATE_LIST } from '@/constants/templateRegistry'

const router = useRouter()
const previewId = ref(null)

function openPreview(id) {
  previewId.value = id
}

function closePreview() {
  previewId.value = null
}

function goGenerate() {
  router.push('/generate')
}
</script>

<template>
  <div class="pb-16 animate-fade-in">
    <PageHero
      compact
      title="全部简历模板"
      subtitle="20 款校招专用简历模板，搭载示范样例，即时预览效果"
    />

    <section class="-mt-4 page-container">
      <a-row :gutter="[24, 24]">
        <a-col
          v-for="tpl in TEMPLATE_LIST"
          :key="tpl.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <GlassCard
            class="flex flex-col items-center transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-card-hover"
            @click="openPreview(tpl.id)"
          >
            <TemplateMiniPreview :template-id="tpl.id" :resume="DEMO_RESUME" :scale="0.22" />
            <p class="mt-2 text-xs text-center text-muted">{{ tpl.desc }}</p>
          </GlassCard>
        </a-col>
      </a-row>

      <div class="flex justify-center mt-10">
        <GradientButton class="inline-flex items-center justify-center h-9" @click="goGenerate">使用模板开始生成</GradientButton>
      </div>
    </section>

    <a-modal
      :open="previewId !== null"
      :title="TEMPLATE_LIST.find((t) => t.id === previewId)?.name || '模板预览'"
      width="90%"
      :footer="null"
      class="modal-fresh"
      @cancel="closePreview"
    >
      <div v-if="previewId" class="flex flex-col items-center py-4">
        <TemplateMiniPreview :template-id="previewId" :resume="DEMO_RESUME" :scale="0.45" />
        <GradientButton class="!h-9 !min-w-[100px] mt-[10px]" @click="goGenerate">使用此模板生成</GradientButton>
      </div>
    </a-modal>
  </div>
</template>
