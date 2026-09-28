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
          :aria-label="`更换简历模板，当前使用${currentTemplateName}`"
          title="更换简历模板"
          @click="emit('template')"
        >
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-brand shadow-sm">
            <AppstoreOutlined />
          </span>
          <span class="min-w-0 flex-1 leading-tight">
            <span class="block text-[9px] font-medium tracking-wide text-muted">更换模板</span>
            <span class="block truncate text-[11px] font-semibold text-brand-dark sm:text-xs">{{ currentTemplateName }}</span>
          </span>
          <DownOutlined class="shrink-0 text-[10px] text-muted" />
        </button>
      </div>

      <!-- 桌面端：间距/字体/皮肤 -->
      <ul class="items-center justify-center flex-1 hidden gap-1 p-0 mx-auto list-none lg:flex">
        <li v-for="item in settingItems" :key="item.key" class="inline-block">
          <a-popover v-model:open="item.open.value" trigger="click" placement="bottom">
            <template #content>
              <EditorSpacingPanel v-if="item.key === 'spacing'" :spacing="spacing" :page-count="pageCount" @change="onSettingsChange" />
              <EditorFontPanel
                v-else-if="item.key === 'font'"
                :template-id="templateId"
                v-model:font-family="fontFamily"
                v-model:font-size="fontSize"
                v-model:label-color="labelColor"
                v-model:basic-content-color="basicContentColor"
                v-model:name-color="nameColor"
                v-model:content-color="contentColor"
                @change="onSettingsChange"
              />
              <EditorSkinPanel
                v-else
                v-model:skin-theme="skinTheme"
                :template-id="templateId"
                @change="onSettingsChange"
                @select="onSkinSelect"
              />
            </template>
            <div
              class="inline-flex select-none items-center gap-1.5 rounded-button px-3 py-2 text-sm font-medium text-ink-secondary transition-all duration-200 hover:bg-brand-lighter hover:text-brand-dark"
              :class="{ 'bg-brand-lighter text-brand-dark': item.open.value }"
            >
              <component :is="item.icon" />
              <b class="hidden font-semibold xl:inline">{{ item.label }}</b>
            </div>
          </a-popover>
        </li>
      </ul>

      <!-- 桌面端：右侧操作 -->
      <div class="items-center hidden gap-2 shrink-0 lg:flex">
        <button class="px-3 text-xs btn-ghost" @click="emit('match')"><AimOutlined /> JD匹配</button>
        <button class="px-3 text-xs btn-ghost" @click="emit('jd-optimize')"><ThunderboltOutlined /> 基于岗位优化</button>
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
              <a-menu-item @click="openMobilePanel('spacing')">间距设置</a-menu-item>
              <a-menu-item @click="openMobilePanel('font')">字体设置</a-menu-item>
              <!-- <a-menu-item @click="openMobilePanel('skin')">皮肤设置</a-menu-item> -->
              <a-menu-divider />
              
              <a-menu-item @click="emit('match')">岗位匹配分析</a-menu-item>
              <a-menu-item @click="emit('jd-optimize')">岗位优化简历</a-menu-item>
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

    <!-- 小屏设置弹窗：移动端全宽展示 -->
    <a-modal
      v-model:open="mobilePanelOpen"
      :title="mobilePanelTitle"
      :footer="null"
      :width="isMobile ? '95vw' : undefined"
      class="modal-fresh"
    >
      <EditorSpacingPanel v-if="mobilePanel === 'spacing'" :spacing="spacing" :page-count="pageCount" @change="onSettingsChange" />
      <EditorFontPanel
        v-else-if="mobilePanel === 'font'"
        :template-id="templateId"
        v-model:font-family="fontFamily"
        v-model:font-size="fontSize"
        v-model:label-color="labelColor"
        v-model:basic-content-color="basicContentColor"
        v-model:name-color="nameColor"
        v-model:content-color="contentColor"
        @change="onSettingsChange"
      />
      <EditorSkinPanel
        v-else-if="mobilePanel === 'skin'"
        v-model:skin-theme="skinTheme"
        :template-id="templateId"
        @change="onSettingsChange"
        @select="onSkinSelect"
      />
    </a-modal>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  LeftOutlined, SaveOutlined, DownloadOutlined, MenuOutlined, DownOutlined,
  AimOutlined, BarChartOutlined, ThunderboltOutlined,
  AppstoreOutlined, ColumnWidthOutlined, FontSizeOutlined, BgColorsOutlined, HistoryOutlined,
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import EditorSpacingPanel from './EditorSpacingPanel.vue'
import EditorFontPanel from './EditorFontPanel.vue'
import EditorSkinPanel from './EditorSkinPanel.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const spacing = defineModel('spacing', { type: Object, required: true })
const fontSize = defineModel('fontSize', { type: Number, required: true })
const fontFamily = defineModel('fontFamily', { type: String, required: true })
const labelColor = defineModel('labelColor', { type: String, default: null })
const basicContentColor = defineModel('basicContentColor', { type: String, default: null })
const nameColor = defineModel('nameColor', { type: String, default: null })
const contentColor = defineModel('contentColor', { type: String, required: true })
const skinTheme = defineModel('skinTheme', { type: Object, required: true })

defineProps({
  templateId: { type: Number, default: 56 },
  currentTemplateName: { type: String, default: '轻简通用' },
  pageCount: { type: Number, default: 1 },
  saving: { type: Boolean, default: false },
  exporting: { type: Boolean, default: false },
  scoring: { type: Boolean, default: false },
})

const emit = defineEmits([
  'settings-change', 'template', 'match', 'jd-optimize', 'history', 'score', 'save', 'export-pdf', 'export-word',
])

const router = useRouter()
const isMobile = useMediaQuery()
const showSpacing = ref(false)
const showFont = ref(false)
const showSkin = ref(false)
const mobilePanelOpen = ref(false)
const mobilePanel = ref('spacing')

const mobilePanelTitle = computed(() => ({
  spacing: '间距设置',
  font: '字体设置',
  skin: '皮肤设置',
}[mobilePanel.value] || '设置'))

// 小屏打开设置面板弹窗
function openMobilePanel(key) {
  mobilePanel.value = key
  mobilePanelOpen.value = true
}

// 桌面端设置项配置
const settingItems = [
  { key: 'spacing', label: '间距设置', icon: ColumnWidthOutlined, open: showSpacing },
  { key: 'font', label: '字体', icon: FontSizeOutlined, open: showFont },
  // { key: 'skin', label: '皮肤设置', icon: BgColorsOutlined, open: showSkin },
]

function onSettingsChange() {
  emit('settings-change')
}

function onSkinSelect() {
  showSkin.value = false
  onSettingsChange()
}
</script>
