<script setup>
/**
 * 首页 - Hero + 使用流程 + 功能卡 + 模板预览 + 信任背书
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
      title="AI简历助手"
      subtitle="零基础写简历，快速收获专业求职简历"
      :stats="HOME_STATS"
    >
      <template #actions>
        <HeroActions
          :is-logged-in="userStore.isLoggedIn"
          @start="navTo('/generate')"
        />
      </template>
    </PageHero>

    <section class="w-full max-w-5xl px-4 py-6 mx-auto sm:px-6 sm:py-8 lg:px-8">
      <div class="mb-4 text-center">
        <h2 class="section-title">使用流程</h2>
        <p class="mt-1 section-subtitle">四步完成专业简历</p>
      </div>
      <GlassCard>
        <a-steps :current="0" class="flow-steps" direction="vertical" responsive>
          <a-step title="选择方式" description="上传 PDF 或表单填写" />
          <a-step title="AI 生成优化" description="AI 自动生成或优化简历" />
          <a-step title="在线编辑" description="20 套模板自由调整" />
          <a-step title="导出投递" description="PDF / Word 一键导出" />
        </a-steps>
      </GlassCard>
    </section>

    <section class="py-6 page-container sm:py-8">
      <div class="mb-4 text-center sm:mb-6">
        <h2 class="section-title">核心功能</h2>
        <p class="mt-1 section-subtitle">从生成到优化，全流程 AI 辅助</p>
      </div>
      <FeatureGrid :features="HOME_FEATURES" @click="handleFeatureClick" />
    </section>

    <TemplatePreview />

    <TrustOfferWall />
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
