<!--
  编辑器顶部固定工具栏 - 磨砂玻璃 + 小屏折叠菜单
-->
<template>
  <header class="glass fixed left-0 right-0 top-0 z-[100] h-[56px] shadow-glass lg:h-[70px]">
    <div class="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5">
      <!-- 模板入口同时说明可更换动作和当前款式，让用户能直接识别这是模板选择器。 -->
      <div class="flex items-center gap-1 shrink-0 sm:gap-2">
        <button class="px-2 text-xs btn-ghost sm:px-3" @click="router.push('/user')">
          <LeftOutlined /> <span class="hidden sm:inline">返回</span>
        </button>
        <button
          type="button"
          class="inline-flex h-10 min-w-0 max-w-[148px] items-center gap-1.5 rounded-xl border border-brand/20 bg-brand-lighter/60 px-2 text-left text-brand-dark shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-lighter sm:max-w-none sm:gap-2 sm:px-2.5"
          :aria-label="`编辑简历样式，当前使用${currentTemplateName}`"
          title="模板、配色与排版"
          @click="emit('appearance')"
        >
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-brand shadow-sm">
            <AppstoreOutlined />
          </span>
          <span class="min-w-0 flex-1 leading-tight">
            <span class="block text-[9px] font-medium tracking-wide text-muted">模板与样式</span>
            <span class="block truncate text-[11px] font-semibold text-brand-dark sm:text-xs">{{ currentTemplateName }}</span>
          </span>
          <DownOutlined class="shrink-0 text-[10px] text-muted" />
        </button>
      </div>

      <!-- 桌面端：右侧操作 -->
      <div class="items-center hidden gap-2 shrink-0 lg:flex">
        <button class="px-3 text-xs btn-ghost" @click="emit('match')"><AimOutlined /> JD匹配</button>
        <button class="px-3 text-xs btn-ghost" @click="emit('jd-optimize')"><ThunderboltOutlined /> 基于岗位优化</button>
        <button class="px-3 text-xs btn-ghost" @click="emit('interview')">AI 面试</button>
        <button class="px-3 text-xs btn-ghost" @click="emit('history')"><HistoryOutlined /> 历史</button>
        <button class="px-3 text-xs btn-ghost" :disabled="scoring" @click="emit('score')">
          <a-spin v-if="scoring" size="small" class="mr-1" />
          <BarChartOutlined v-else class="mr-1" /> 评分
        </button>
        <GradientButton :loading="saving" @click="emit('save')">
          <SaveOutlined /> {{ saving ? '保存中' : '保存' }}
        </GradientButton>
        <a-dropdown :disabled="exporting">
          <GradientButton :loading="exporting">
            <DownloadOutlined /> {{ exporting ? '导出中' : '导出' }}
          </GradientButton>
          <template #overlay>
            <a-menu>
              <a-menu-item key="pdf" @click="emit('export-pdf')">导出 PDF</a-menu-item>
              <a-menu-item key="word" @click="emit('export-word')">导出 Word</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <!-- 小屏：更多操作下拉 -->
      <div class="flex items-center gap-2 shrink-0 lg:hidden">
        <GradientButton size="small" :loading="saving" @click="emit('save')">
          <SaveOutlined />
        </GradientButton>
        <a-dropdown>
          <button class="px-2 text-xs btn-ghost"><MenuOutlined /></button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="emit('appearance')"><BgColorsOutlined /> 模板与样式</a-menu-item>
              <a-menu-divider />
              
              <a-menu-item @click="emit('match')">岗位匹配分析</a-menu-item>
              <a-menu-item @click="emit('jd-optimize')">岗位优化简历</a-menu-item>
              <a-menu-item @click="emit('interview')">AI 面试</a-menu-item>
              <a-menu-item @click="emit('history')">历史版本</a-menu-item>
              <a-menu-item :disabled="scoring" @click="emit('score')">AI 评分</a-menu-item>
              <a-menu-divider />
              <a-menu-item v-if="!isMobile" @click="emit('export-pdf')">导出 PDF</a-menu-item>
              <a-menu-item v-if="!isMobile" @click="emit('export-word')">导出 Word</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  LeftOutlined, SaveOutlined, DownloadOutlined, MenuOutlined, DownOutlined,
  AimOutlined, BarChartOutlined, ThunderboltOutlined,
  AppstoreOutlined, BgColorsOutlined, HistoryOutlined,
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

defineProps({
  templateId: { type: Number, default: 56 },
  currentTemplateName: { type: String, default: '轻简通用' },
  saving: { type: Boolean, default: false },
  exporting: { type: Boolean, default: false },
  scoring: { type: Boolean, default: false },
})

const emit = defineEmits([
  'appearance', 'match', 'jd-optimize', 'interview', 'history', 'score', 'save', 'export-pdf', 'export-word',
])

const router = useRouter()
const isMobile = useMediaQuery()
</script>
