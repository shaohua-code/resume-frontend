<script setup>
/**
 * 首页 - Hero + 6 功能卡 + 使用流程（一屏布局）
 */
import { useRouter } from 'vue-router'
import { RocketOutlined, UserOutlined, CloudUploadOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import PageHero from '@/components/PageHero.vue'
import GlassCard from '@/components/GlassCard.vue'
import GradientButton from '@/components/GradientButton.vue'
import FeatureGrid from './components/FeatureGrid.vue'
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
  <div class="flex min-h-[calc(100vh-4rem)] flex-col animate-fade-in">
    <PageHero
      compact
      title="AI简历助手 · 校园版"
      subtitle="不会写简历？10分钟拥有一份专业校招简历"
      :stats="HOME_STATS"
    >
      <template #actions>
        <GradientButton ghost class="!border-white/50 !bg-white/15 !text-white hover:!bg-white/25" @click="navTo('/generate')">
          <RocketOutlined />
          {{ userStore.isLoggedIn ? '开始生成简历' : '立即开始' }}
        </GradientButton>
        <button
          class="btn-ghost-sm !border-white/50 !bg-white/15 !text-white hover:!bg-white/25"
          @click="navTo('/upload-optimize')"
        >
          <CloudUploadOutlined /> 上传 PDF 优化
        </button>
        <button
          v-if="!userStore.isLoggedIn"
          class="btn-ghost-sm !border-white/50 !bg-white/15 !text-white hover:!bg-white/25"
          @click="router.push('/login')"
        >
          登录账号
        </button>
        <button
          v-else
          class="btn-ghost-sm !border-white/50 !bg-white/15 !text-white hover:!bg-white/25"
          @click="router.push('/user')"
        >
          <UserOutlined /> 我的简历
        </button>
      </template>
    </PageHero>

    <section class="page-container shrink-0 py-4 sm:py-5">
      <div class="mb-4 text-center sm:mb-5">
        <h2 class="section-title">核心功能</h2>
        <p class="section-subtitle mt-1">从生成到优化，全流程 AI 辅助</p>
      </div>
      <FeatureGrid :features="HOME_FEATURES" @click="handleFeatureClick" />
    </section>

    <section class="mx-auto w-full max-w-5xl shrink-0 px-4 pb-4 sm:px-6 sm:pb-5 lg:px-8">
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
