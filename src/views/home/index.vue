<script setup>
/**
 * 首页 - Hero + 功能卡 + 模板预览 + 信任背书 + 使用流程
 */
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import PageHero from '@/components/PageHero.vue'
import GlassCard from '@/components/GlassCard.vue'
import HeroActions from './components/HeroActions.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import TemplatePreview from './components/TemplatePreview.vue'
import TrustOfferWall from './components/TrustOfferWall.vue'
import { HOME_FEATURES, HOME_STATS } from './utils/features'
import { createHomeNavigator } from './utils/navigate'

const router = useRouter()
const userStore = useUserStore()
const navTo = createHomeNavigator(router, userStore)

function handleFeatureClick(item) {
  navTo(item.path)
}
</script>

<template>
  <div class="animate-fade-in">
    <PageHero
      compact
      title="AI简历助手 · 校园版"
      subtitle="不会写简历？10分钟拥有一份专业校招简历"
      :stats="HOME_STATS"
    >
      <template #actions>
        <HeroActions
          :is-logged-in="userStore.isLoggedIn"
          @start="navTo('/generate')"
          @upload="navTo('/upload-optimize')"
        />
      </template>
    </PageHero>

    <section class="page-container py-6 sm:py-8">
      <div class="mb-4 text-center sm:mb-6">
        <h2 class="section-title">核心功能</h2>
        <p class="section-subtitle mt-1">从生成到优化，全流程 AI 辅助</p>
      </div>
      <FeatureGrid :features="HOME_FEATURES" @click="handleFeatureClick" />
    </section>

    <TemplatePreview />

    <TrustOfferWall />

    <section class="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
      <div class="mb-4 text-center">
        <h2 class="section-title">使用流程</h2>
        <p class="section-subtitle mt-1">四步完成专业简历</p>
      </div>
      <GlassCard>
        <a-steps :current="0" class="flow-steps" direction="vertical" responsive>
          <a-step title="填写信息" description="输入基本信息和项目经历" />
          <a-step title="AI 生成" description="AI 自动生成专业简历" />
          <a-step title="编辑修改" description="在线编辑和优化内容" />
          <a-step title="导出 PDF" description="一键导出投递简历" />
        </a-steps>
      </GlassCard>
    </section>
  </div>
</template>

<style scoped>
:deep(.flow-steps .ant-steps-item-process .ant-steps-item-icon) {
  @apply border-brand-dark bg-brand-dark;
}

:deep(.flow-steps .ant-steps-item-finish .ant-steps-item-icon) {
  @apply border-brand-dark text-brand-dark;
}

:deep(.flow-steps .ant-steps-item-finish .ant-steps-item-tail::after) {
  @apply bg-brand;
}

:deep(.flow-steps .ant-steps-item-title) {
  @apply text-sm font-medium text-ink;
}

:deep(.flow-steps .ant-steps-item-description) {
  @apply text-xs text-muted;
}

@media (min-width: 768px) {
  :deep(.flow-steps) {
    flex-direction: row !important;
  }
}
</style>
