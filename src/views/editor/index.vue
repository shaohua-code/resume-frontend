<!--
  简历编辑器页
  全民简历式布局：顶部工具栏 + 中间 A4 预览 + 底部 Tab 编辑区
-->
<template>
  <div class="editor-page">
    <EditorToolbar
      v-model:spacing="spacing"
      v-model:font-size="fontSize"
      v-model:font-family="fontFamily"
      v-model:label-color="labelColor"
      v-model:basic-content-color="basicContentColor"
      v-model:name-color="nameColor"
      v-model:content-color="contentColor"
      v-model:skin-theme="skinTheme"
      :template-id="templateId"
      :current-template-name="currentTemplateName"
      :page-count="pageCount"
      :saving="saving"
      :exporting="exporting"
      :scoring="resumeStore.scoring"
      @template="showTemplateDrawer = true"
      @match="showMatchModal = true"
      @jd-optimize="openJdOptimizeModal"
      @history="openHistoryModal"
      @score="handleScore"
      @save="handleSave"
      @export-pdf="handleExportPDF"
      @export-word="handleExportWord"
    />

    <main class="editor-main" :class="{ 'editor-main--panel-collapsed': editPanelCollapsed }">
      <div class="preview-area">
        <ResumePreview
          ref="previewRef"
          :resume="resume"
          :template-id="templateId"
          :spacing="spacing"
          :font-size="fontSize"
          :font-family="fontFamily"
          :label-color="labelColor"
          :basic-content-color="basicContentColor"
          :name-color="nameColor"
          :content-color="contentColor"
          :skin-theme="skinTheme"
          :visible-modules="modules"
          :edit-panel-collapsed="editPanelCollapsed"
          @section-click="handleSectionClick"
        />
        <a-dropdown :disabled="exporting"  v-if="!isMobile">
          <button
            type="button"
            class="down-big"
            :class="editPanelCollapsed ? 'down-big--panel-collapsed' : 'down-big--panel-expanded'"
            :disabled="exporting"
          >
            <DownloadOutlined />
            <span class="hidden sm:inline">下载/导出简历</span>
            <span class="sm:hidden" >导出</span>
          </button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="pdf"  @click="handleExportPDF">导出 PDF</a-menu-item>
              <a-menu-item key="word" @click="handleExportWord">导出 Word</a-menu-item>
              <a-menu-item key="markdown" @click="handleExportMarkdown">导出 Markdown</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </main>

    <EditorEditPanel
      ref="editPanelRef"
      v-model="resume"
      v-model:modules="modules"
      v-model:active-module="activeModule"
      :highlight-module="highlightModule"
      :template-id="templateId"
      @collapsed-change="editPanelCollapsed = $event"
      @ai-optimized="markAiHistoryPending"
    />

    <!-- JD匹配弹窗 -->
    <a-modal
      v-model:open="showMatchModal"
      title="岗位匹配分析"
      :confirm-loading="resumeStore.matching"
      :width="isMobile ? '95vw' : '600px'"
      class="editor-modal"
      @ok="handleMatch"
    >
      <a-form layout="vertical">
        <a-form-item label="粘贴岗位信息内容">
          <a-textarea :value="jdText" :rows="6" placeholder="请粘贴岗位的JD描述..." class="editor-modal-textarea" @update:value="jdText = $event" />
        </a-form-item>
      </a-form>
      <div v-if="matchResult" class="match-result">
        <a-progress
          :percent="matchResult.match_score"
          :stroke-color="matchProgressColor"
          class="mb-3"
        />
        <!-- 匹配优势 -->
        <div v-if="matchResult.match_advantages?.length" class="mb-2">
          <p><strong>匹配优势：</strong></p>
          <ul class="pl-5 text-sm list-disc text-emerald-600">
            <li v-for="(adv, i) in matchResult.match_advantages" :key="'adv-' + i">{{ adv }}</li>
          </ul>
        </div>
        <!-- 岗位不足 -->
        <div v-if="matchResult.position_gaps?.length" class="mb-2">
          <p><strong>岗位不足：</strong></p>
          <ul class="pl-5 text-sm text-orange-500 list-disc">
            <li v-for="(gap, i) in matchResult.position_gaps" :key="'gap-' + i">{{ gap }}</li>
          </ul>
        </div>
        <!-- 经验差距 -->
        <p v-if="matchResult.experience_gap" class="mb-2"><strong>经验差距：</strong>{{ matchResult.experience_gap }}</p>
        <p><strong>岗位关键词：</strong>{{ matchResult.keywords?.join('、') || '暂未提取' }}</p>
        <p><strong>缺失技能：</strong>{{ matchResult.missing_skills?.join('、') || '无' }}</p>
        <p><strong>优化建议：</strong></p>
        <ul class="pl-5 text-sm list-disc text-ink-secondary">
          <li v-for="(s, i) in matchResult.suggestions" :key="i">{{ s }}</li>
        </ul>
      </div>
    </a-modal>

    <!-- 岗位优化简历弹窗：对比后一键/逐项应用，不自动保存 -->
    <JdResumeOptimizeModal
      v-model:open="showJdOptimizeModal"
      :resume="resume"
      :template-id="templateId"
      :input-only="false"
      @apply="handleJdOptimizeApply"
      @apply-section="handleJdOptimizeApplySection"
    />

    <!-- 模板选择抽屉 -->
    <a-drawer
      v-model:open="showTemplateDrawer"
      title="选择简历模板"
      placement="right"
      :width="isMobile ? '100%' : 760"
      root-class-name="template-drawer"
    >
      <div class="template-scroll">
        <div class="template-grid">
          <div
            v-for="t in templateList"
            :key="t.id"
            class="template-card"
            :class="{ active: templateId === t.id }"
            @click="selectTemplate(t.id)"
          >
            <div class="template-thumb" :style="{ background: t.color }">
              <span class="template-num">{{ t.id }}</span>
              <span class="template-paper-line" />
              <span class="template-paper-line short" />
              <span class="template-paper-line" />
            </div>
            <div class="template-info">
              <div class="template-name">{{ t.name }}</div>
              <div class="template-desc">{{ t.desc }}</div>
            </div>
            <div v-if="templateId === t.id" class="template-check">
              <CheckOutlined />
            </div>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 评分弹窗 -->
    <a-modal
      v-model:open="showScoreModal"
      title="AI简历评分"
      :footer="null"
      :width="isMobile ? '95vw' : '500px'"
      class="editor-modal"
    >
      <!-- 顶部：AI 总结输出区（Markdown 渲染） -->
      <div class="score-stream">
        <p class="mb-3 text-sm font-semibold text-ink">AI 评分总结</p>
        <div ref="scoreStreamRef" class="score-stream-body">
          <MdRender v-if="scoreStreamingText" :content="scoreStreamingText" />
          <div v-else class="flex items-center gap-2 text-sm text-muted">
            <a-spin size="small" />
            <span>正在等待模型输出...</span>
          </div>
        </div>
      </div>
      <div v-if="scoreResult" class="score-result">
        <div class="score-total">
          <a-progress type="circle" :percent="scoreResult.total" :size="120" :stroke-color="scoreColor" />
          <span class="score-label">总分</span>
        </div>
        <a-row :gutter="[16, 16]" class="mt-6">
          <a-col v-for="item in scoreItems" :key="item.key" :span="12">
            <a-card size="small" class="score-item-card">
              <a-progress :percent="Math.round((scoreResult[item.key] / item.max) * 100)" :format="() => `${scoreResult[item.key]}/${item.max}`" />
              <div class="mt-1 text-xs text-center text-ink-secondary">{{ item.label }}</div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-modal>

    <!-- AI 历史版本：每条历史都用对应模板快照展示，可一键恢复 -->
    <a-modal
      v-model:open="showHistoryModal"
      title="历史版本"
      :footer="null"
      :width="isMobile ? '95vw' : 980"
      class="editor-modal"
    >
      <div v-if="historyLoading" class="flex items-center justify-center py-10 text-sm text-muted">
        <a-spin size="small" class="mr-2" /> 正在加载历史版本...
      </div>
      <div v-else-if="!historyItems.length" class="rounded-card border border-line/50 bg-canvas p-6 text-center text-sm text-muted">
        暂无 AI 生成或优化历史
      </div>
      <div v-else class="history-grid">
        <article
          v-for="item in historyItems"
          :key="item.id"
          class="history-card"
        >
          <div class="mb-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">{{ historySourceLabel(item.source_type) }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ formatHistoryTime(item.create_time) }}</p>
            </div>
            <button
              type="button"
              class="btn-ghost min-h-9 shrink-0 px-3 text-xs"
              :disabled="historyApplyingId === item.id"
              @click="applyHistory(item)"
            >
              <a-spin v-if="historyApplyingId === item.id" size="small" class="mr-1" />
              应用
            </button>
          </div>
          <ResumeTemplatePreviewPane
            :resume="parseHistoryResume(item.resume_json)"
            :template-id="item.template_id"
            :scale="isMobile ? 0.36 : 0.28"
            max-height="320px"
          />
        </article>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { DownloadOutlined, CheckOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useResumeStore } from '@/stores/resume'
import { useUserStore } from '@/stores/user'
import { exportResume as exportResumeApi } from '@/api/resume'
import {
  DEFAULT_SPACING,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_MODULES,
  extractEditorSettings,
  applyEditorSettingsToResume,
} from '@/constants/editorSettings'
import { EMPTY_SKIN_OVERRIDES } from '@/constants/skin'
import { TEMPLATE_LIST, getTemplateName, clampTemplateId } from '@/constants/templateRegistry'
import { applyTemplateFontColorDefaults } from '@/constants/templateFontColors'
import { applyTemplateSkinDefaults } from '@/constants/templateSkinColors'
import { normalizeResumeFields, syncFlatEducationFields, validateRequiredBasicFields, mergeOptimizedResume } from '@/constants/resumeFieldSchema'
import EditorToolbar from './components/EditorToolbar.vue'
import EditorEditPanel from './components/EditorEditPanel.vue'
import ResumePreview from './components/ResumePreview.vue'
import JdResumeOptimizeModal from '@/components/JdResumeOptimizeModal.vue'
import ResumeTemplatePreviewPane from '@/components/ResumeTemplatePreviewPane.vue'
// Markdown 渲染组件（按需加载）
import MdRender from '@/components/MdRender.vue'
import { useResumeExportPrint } from '@/composables/useResumeExportPrint'
import { useMediaQuery } from '@/composables/useMediaQuery'

const route = useRoute()
const resumeStore = useResumeStore()
const userStore = useUserStore()
const isMobile = useMediaQuery()
const editPanelCollapsed = ref(isMobile.value)

const templateId = ref(clampTemplateId(resumeStore.currentTemplateId))
const currentResumeId = ref(resumeStore.currentResumeId)
const resume = reactive({ ...resumeStore.currentResume })

const previewRef = ref(null)
const editPanelRef = ref(null)

const saving = ref(false)
const exporting = ref(false)
const autoSaveReady = ref(false)
const autoSaving = ref(false)
let autoSaveDebounceTimer = null
let lastSavedSnapshot = ''
// AI 优化应用后，下一次成功保存才写入历史；普通手动编辑保存不占用历史名额。
const pendingHistoryType = ref('')

const activeModule = ref('basic')
const highlightModule = ref('')

const spacing = reactive({ ...DEFAULT_SPACING })
const fontSize = ref(DEFAULT_FONT_SIZE)
const fontFamily = ref(DEFAULT_FONT_FAMILY)
const labelColor = ref(null)
const basicContentColor = ref(null)
const nameColor = ref(null)
const contentColor = ref(null)
const skinTheme = ref({ ...EMPTY_SKIN_OVERRIDES })
const modules = ref(DEFAULT_MODULES.map((m) => ({ ...m })))

// 预览页数（从 ResumePreview expose 读取）
const pageCount = computed(() => previewRef.value?.getPageCount?.() ?? 1)

// 恢复编辑器设置
function loadEditorSettings(source) {
  const settings = extractEditorSettings(source)
  Object.assign(spacing, settings.spacing)
  fontSize.value = settings.fontSize
  fontFamily.value = settings.fontFamily
  labelColor.value = settings.labelColor
  basicContentColor.value = settings.basicContentColor
  nameColor.value = settings.nameColor
  contentColor.value = settings.contentColor
  skinTheme.value = { ...settings.skinTheme }
  modules.value = settings.modules.map((m) => ({ ...m }))
}

// 点击预览模块，定位到底部 Tab
function handleSectionClick(moduleKey) {
  highlightModule.value = moduleKey
  activeModule.value = moduleKey
  editPanelRef.value?.scrollToModule?.(moduleKey)
  setTimeout(() => { highlightModule.value = '' }, 2000)
}

const templateList = TEMPLATE_LIST

const showTemplateDrawer = ref(false)
const currentTemplateName = computed(() => getTemplateName(templateId.value))

function selectTemplate(id) {
  templateId.value = clampTemplateId(id)
  resumeStore.currentTemplateId = templateId.value
  // 切换模板时重置字体色为该套模板默认（走 CSS fallback + content 预设）
  applyTemplateFontColorDefaults(
    { labelColor, basicContentColor, nameColor, contentColor },
    templateId.value,
  )
  // 切换模板时重置皮肤为该套模板默认
  applyTemplateSkinDefaults(skinTheme, templateId.value)
  showTemplateDrawer.value = false
  message.success(`已切换到「${getTemplateName(templateId.value)}」`)
}

const showMatchModal = ref(false)
const jdText = ref('')
const matchResult = ref(null)

// 岗位优化简历弹窗显隐
const showJdOptimizeModal = ref(false)
const showHistoryModal = ref(false)
const historyLoading = ref(false)
const historyApplyingId = ref(null)
const historyItems = ref([])

/** 打开 岗位优化弹窗 */
function openJdOptimizeModal() {
  showJdOptimizeModal.value = true
}

function markAiHistoryPending(type) {
  pendingHistoryType.value = type || 'section_optimize'
}

/**
 * 将岗位优化结果写回编辑器（全量或指定分区）
 * @param {object} optimized
 * @param {string[]|null} sectionKeys null 表示全量合并
 */
function writeJdOptimizeResult(optimized, sectionKeys = null) {
  const merged = mergeOptimizedResume(resume, optimized, sectionKeys)
  Object.keys(resume).forEach((key) => delete resume[key])
  Object.assign(resume, merged)
  resumeStore.currentResume = { ...merged }
}

/**
 * 一键应用岗位优化全部结果；不自动保存
 */
function handleJdOptimizeApply(payload) {
  const optimized = payload?.resume || payload
  if (!optimized || !Object.keys(optimized).length) return
  writeJdOptimizeResult(optimized, payload?.sectionKeys ?? null)
  markAiHistoryPending('jd_resume_optimize')
  message.success('已应用岗位优化结果，记得保存简历')
}

/**
 * 逐项应用某个变更分区；不关闭对比弹窗
 */
function handleJdOptimizeApplySection(payload) {
  const optimized = payload?.resume
  const sectionKey = payload?.sectionKey
  if (!optimized || !sectionKey) return
  writeJdOptimizeResult(optimized, [sectionKey])
  markAiHistoryPending('jd_resume_optimize')
  message.success('已应用该模块，可继续应用其他项或保存简历')
}

function parseHistoryResume(value) {
  if (typeof value !== 'string') return normalizeResumeFields(value || {})
  try {
    return normalizeResumeFields(JSON.parse(value || '{}'))
  } catch {
    return {}
  }
}

function historySourceLabel(type) {
  return {
    resume_generate: 'AI 生成',
    jd_resume_optimize: '岗位优化',
    section_optimize: '模块优化',
    pdf_optimize: 'PDF 优化',
    pdf_jd_optimize: 'PDF 岗位优化',
  }[type] || 'AI 优化'
}

function formatHistoryTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

async function openHistoryModal() {
  if (!currentResumeId.value) {
    message.warning('当前简历尚未保存，暂无历史版本')
    return
  }
  showHistoryModal.value = true
  historyLoading.value = true
  try {
    const result = await resumeStore.fetchResumeHistory(currentResumeId.value)
    historyItems.value = result.items || []
  } catch (e) {
    message.error(e?.response?.data?.detail || e?.message || '历史版本加载失败')
  } finally {
    historyLoading.value = false
  }
}

async function applyHistory(item) {
  if (!currentResumeId.value || !item?.id) return
  historyApplyingId.value = item.id
  try {
    const res = await resumeStore.applyHistoryVersion(currentResumeId.value, item.id)
    const history = res.data?.history || item
    const restored = parseHistoryResume(history.resume_json)
    Object.keys(resume).forEach((key) => delete resume[key])
    Object.assign(resume, restored)
    templateId.value = clampTemplateId(history.template_id)
    resumeStore.currentTemplateId = templateId.value
    resumeStore.currentResume = { ...restored }
    loadEditorSettings(resume)
    lastSavedSnapshot = getAutoSaveSnapshot()
    pendingHistoryType.value = ''
    showHistoryModal.value = false
  } catch (e) {
    message.error(e?.response?.data?.detail || e?.message || '历史版本应用失败')
  } finally {
    historyApplyingId.value = null
  }
}

// 根据匹配分数返回进度条颜色
const matchProgressColor = computed(() => {
  const score = matchResult.value?.match_score || 0
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
})

// 根据总分返回评分圆环颜色
const scoreColor = computed(() => {
  const score = scoreResult.value?.total || 0
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
})

async function handleMatch() {
  if (!jdText.value.trim()) {
    message.warning('请输入岗位信息')
    return
  }
  // 预保存静默执行，避免与 岗位匹配分析结果的提示混淆
  const saved = await saveResumeData({ silent: true })
  if (saved?.id) {
    const result = await resumeStore.matchJd(saved.id, jdText.value)
    if (result?.success) {
      matchResult.value = result.data
    }
  }
}

const showScoreModal = ref(false)
const scoreResult = ref(null)
const scoreStreamingText = ref('')
// 流式输出容器引用，用于自动滚动
const scoreStreamRef = ref(null)

// 流式输出时自动滚动到底部
watch(scoreStreamingText, () => {
  if (scoreStreamRef.value) {
    nextTick(() => {
      scoreStreamRef.value.scrollTop = scoreStreamRef.value.scrollHeight
    })
  }
})
const scoreItems = [
  { key: 'content_completeness', label: '内容完整度', max: 20 },
  { key: 'skill_match', label: '技能匹配度', max: 20 },
  { key: 'project_quality', label: '项目质量', max: 30 },
  { key: 'resume_structure', label: '简历结构', max: 15 },
  { key: 'format_quality', label: '排版规范', max: 15 },
]

async function handleScore() {
  scoreResult.value = null
  scoreStreamingText.value = ''
  showScoreModal.value = true
  try {
    // 预保存静默执行，避免与评分结果的提示混淆
    const saved = await saveResumeData({ silent: true })
    if (!saved?.id) {
      scoreStreamingText.value = '当前简历未保存成功，无法继续评分。'
      return
    }
    const result = await resumeStore.scoreResumeStream(saved.id, {
      onChunk: (chunk) => {
        scoreStreamingText.value += chunk
      },
    })
    if (result?.success) {
      scoreResult.value = result.data
      // 旧版自定义提示词只返回总分时，用后端归一化说明替代永不结束的等待态。
      if (!scoreStreamingText.value) {
        scoreStreamingText.value = result.data?.summary || result.data?.fallback_note || '评分已完成，请查看各维度结果。'
      }
    } else if (!scoreStreamingText.value) {
      scoreStreamingText.value = result?.error || '评分失败，请检查模型配置或稍后重试。'
    }
  } catch (e) {
    scoreStreamingText.value = e?.message || '评分失败，请稍后重试。'
  }
}

// 统一的保存方法
// 始终走 update 路径，依赖 currentResumeId（已由 store 或 onMounted 写入）
// options.silent = true 时不弹 toast（用于自动保存、评分/JD 预保存）
async function saveResumeData({ silent = false, skipValidation = false } = {}) {
  // 兜底同步：每次保存前把 store 中的 ID 同步到本地 ref
  if (resumeStore.currentResumeId && resumeStore.currentResumeId !== currentResumeId.value) {
    currentResumeId.value = resumeStore.currentResumeId
  }
  if (!currentResumeId.value) {
    const msg = '当前简历尚未落库，无法保存。请先经过 AI 生成或从列表选择已有简历进入编辑。'
    if (!silent) message.error(msg)
    if (silent) return null
    throw new Error(msg)
  }
  // 保存前校验姓名与意向岗位
  if (!skipValidation) {
    const formValid = await editPanelRef.value?.validateBasic?.()
    if (formValid === false) {
      activeModule.value = 'basic'
      if (!silent) message.warning('请完善基本信息：姓名与意向岗位为必填项')
      throw new Error('基本信息校验未通过')
    }
  }
  const basicCheck = validateRequiredBasicFields(resume)
  if (!basicCheck.ok) {
    activeModule.value = 'basic'
    if (!silent) message.warning(basicCheck.message)
    if (silent) return null
    throw new Error(basicCheck.message)
  }
  resume.name = basicCheck.name
  resume.target_position = basicCheck.target_position
  // 保存前写入编辑器设置到 resume_json
  applyEditorSettingsToResume(resume, {
    spacing,
    fontSize: fontSize.value,
    fontFamily: fontFamily.value,
    labelColor: labelColor.value,
    basicContentColor: basicContentColor.value,
    nameColor: nameColor.value,
    contentColor: contentColor.value,
    skinTheme: skinTheme.value,
    modules: modules.value,
  })
  // 保存前同步 educations 首条到扁平字段，兼容旧逻辑
  syncFlatEducationFields(resume)
  return await resumeStore.saveResume(
    {
      id: currentResumeId.value,
      title: resume.name ? `${resume.name}的简历` : '未命名简历',
      resume_json: JSON.stringify(resume),
      template_id: templateId.value,
      score: scoreResult.value?.total || 0,
      history_type: pendingHistoryType.value || undefined,
    },
    { silent }
  )
}

async function handleSave() {
  saving.value = true
  try {
    const saved = await saveResumeData()
    if (saved) {
      pendingHistoryType.value = ''
      lastSavedSnapshot = getAutoSaveSnapshot()
    }
  } finally {
    saving.value = false
  }
}

function getAutoSaveSnapshot() {
  return JSON.stringify({
    resume,
    templateId: templateId.value,
    spacing,
    fontSize: fontSize.value,
    fontFamily: fontFamily.value,
    labelColor: labelColor.value,
    basicContentColor: basicContentColor.value,
    nameColor: nameColor.value,
    contentColor: contentColor.value,
    skinTheme: skinTheme.value,
    modules: modules.value,
  })
}

function queueAutoSaveAfterChange(snapshot) {
  if (!autoSaveReady.value) return
  if (!snapshot || snapshot === lastSavedSnapshot) return
  if (autoSaveDebounceTimer) window.clearTimeout(autoSaveDebounceTimer)
  autoSaveDebounceTimer = window.setTimeout(async () => {
    if (autoSaving.value || saving.value || exporting.value) return
    autoSaving.value = true
    try {
      const saved = await saveResumeData({ silent: true, skipValidation: true })
      if (saved) {
        pendingHistoryType.value = ''
        lastSavedSnapshot = getAutoSaveSnapshot()
      }
    } catch (e) {
      console.warn('[自动保存跳过]', e)
    } finally {
      autoSaving.value = false
    }
  }, 1200)
}

async function ensureCanExport() {
  // 导出前保存简历并记录导出行为（全员免费）
  const saved = await saveResumeData({ silent: true })
  if (saved?.id) {
    await exportResumeApi(saved.id)
    return true
  }
  return false
}

// 浏览器打印 API 导出 PDF（矢量文字，用户需在打印窗口选择「另存为 PDF」）
const { handleExportPDF } = useResumeExportPrint({
  getPrintContent: () => previewRef.value?.getPrintContent?.(),
  beforeExport: ensureCanExport,
  onStart: () => { exporting.value = true },
  onEnd: () => { exporting.value = false },
})

// 导出 Word（.doc），Word/WPS 可打开并编辑文字
async function handleExportWord() {
  exporting.value = true
  try {
    const canExport = await ensureCanExport()
    if (!canExport) return
    const htmlContent = previewRef.value?.getWordHtml?.()
    if (!htmlContent) {
      message.error('未找到简历内容')
      return
    }

    const { saveAs } = await import('file-saver')

    const docHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
  body { font-family: 'Microsoft YaHei', SimSun, sans-serif; font-size: 12pt; color: #333; line-height: 1.6; }
  h1 { font-size: 22pt; font-weight: bold; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; }
  p, li { margin: 4pt 0; }
</style>
</head>
<body>${htmlContent}</body>
</html>`

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' })
    saveAs(blob, `${resume.name || '简历'}_AI简历.doc`)
    message.success('Word导出成功，可用 Word/WPS 打开编辑')
  } catch (e) {
    console.error('[导出Word失败]', e)
    message.error('Word导出失败')
  } finally {
    exporting.value = false
  }
}

function buildMarkdownList(title, items = []) {
  if (!items.length) return ''
  return `\n## ${title}\n${items.map((item) => `- ${item}`).join('\n')}\n`
}

function buildMarkdownResume() {
  const projectText = (resume.projects || []).map((item) => {
    const techStack = Array.isArray(item.tech_stack) ? item.tech_stack.join('、') : item.tech_stack || ''
    return `### ${item.name || '项目经历'}\n- 角色：${item.role || ''}\n- 时间：${item.start_date || ''} - ${item.end_date || ''}\n- 专业技能 / 工具：${techStack}\n- 描述：${item.description || ''}`
  }).join('\n\n')
  const internshipText = (resume.internships || []).map((item) => {
    return `### ${item.company || '实习经历'}\n- 岗位：${item.position || ''}\n- 时间：${item.start_date || ''} - ${item.end_date || ''}\n- 描述：${item.description || ''}`
  }).join('\n\n')
  // Markdown 导出使用当前编辑态数据，方便用户下载可二次编辑的文本版本
  return `# ${resume.name || '个人简历'}\n\n${resume.phone || ''} ${resume.email || ''}\n\n## 个人简介\n${resume.summary || ''}${buildMarkdownList('技能标签', resume.skills || [])}\n## 项目经历\n${projectText || '暂无'}\n\n## 实习经历\n${internshipText || '暂无'}${buildMarkdownList('获奖经历', resume.awards || [])}${buildMarkdownList('证书', resume.certificates || [])}`
}

async function handleExportMarkdown() {
  exporting.value = true
  try {
    const canExport = await ensureCanExport()
    if (!canExport) return
    const { saveAs } = await import('file-saver')
    const blob = new Blob([buildMarkdownResume()], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, `${resume.name || '简历'}_AI简历.md`)
    message.success('Markdown导出成功')
  } catch (e) {
    console.error('[导出Markdown失败]', e)
    message.error('Markdown导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await resumeStore.fetchResumeDetail(Number(id))
    Object.assign(resume, normalizeResumeFields(resumeStore.currentResume))
    templateId.value = clampTemplateId(resumeStore.currentTemplateId)
    loadEditorSettings(resume)
  } else if (Object.keys(resumeStore.currentResume).length) {
    Object.assign(resume, normalizeResumeFields(resumeStore.currentResume))
    loadEditorSettings(resume)
  }
  if (resumeStore.currentResumeId) {
    currentResumeId.value = resumeStore.currentResumeId
  }
  lastSavedSnapshot = getAutoSaveSnapshot()
  autoSaveReady.value = true
})

onBeforeUnmount(() => {
  if (autoSaveDebounceTimer) window.clearTimeout(autoSaveDebounceTimer)
})

watch(
  getAutoSaveSnapshot,
  queueAutoSaveAfterChange,
)
</script>

<style scoped>
/* 编辑器外层：深色工作区，突出 A4 纸张 */
.editor-page {
  @apply min-h-screen max-w-full overflow-x-hidden bg-[#39394d];
}

/* 主内容区：留出顶部工具栏 + 底部编辑面板空间，移动端缩减间距 */
.editor-main {
  @apply flex min-h-screen max-w-full flex-col overflow-x-hidden pt-[56px] pb-[calc(40vh+64px)] lg:pt-[70px] lg:pb-[340px];
}

/* 底部面板折叠时减少留白，扩大预览可视区 */
.editor-main--panel-collapsed {
  @apply max-lg:pb-[calc(64px+env(safe-area-inset-bottom,0px))];
}

/* 预览区居中，移动端限定高度使预览区内部可滚动 */
.preview-area {
  @apply relative flex min-h-[calc(100vh-280px)] max-w-full flex-1 flex-col items-center overflow-x-hidden max-lg:min-h-0 lg:min-h-[calc(100vh-410px)];
}

/* 右下角下载/导出按钮：桌面固定于编辑区上方，移动端贴近底部编辑栏 */
.down-big {
  @apply fixed bottom-[360px] right-8 z-40 inline-flex h-10 items-center gap-2 rounded-pill bg-gradient-to-r from-brand to-brand-light px-6 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60;
}

/* 移动端：底部编辑栏收起时 */
.down-big--panel-collapsed {
  @apply max-lg:bottom-[calc(72px+env(safe-area-inset-bottom,0px))] max-lg:right-4 max-lg:px-4;
}

/* 移动端：底部编辑栏展开时，上移避免遮挡 */
.down-big--panel-expanded {
  @apply max-lg:bottom-[calc(40vh+56px+env(safe-area-inset-bottom,0px))] max-lg:right-4 max-lg:px-4;
}

/* 岗位匹配分析结果展示 */
.match-result {
  @apply mt-4 rounded-card bg-canvas p-4 text-sm text-ink-secondary;
}

.match-result p {
  @apply mb-2;
}

/* 评分模型流式输出区 */
.score-stream {
  @apply mb-5 rounded-card border border-line/60 bg-canvas p-4;
}

.score-stream-body {
  @apply max-h-72 overflow-y-auto whitespace-pre-wrap text-left text-sm leading-6 text-ink-secondary;
}

.score-stream-body pre {
  @apply m-0 whitespace-pre-wrap break-words font-sans;
}

/* 评分结果区 */
.score-result {
  @apply text-center;
}

/* 历史卡片承载真实模板快照，移动端自动单列显示。 */
.history-grid {
  @apply grid grid-cols-1 gap-4 lg:grid-cols-3;
}

.history-card {
  @apply min-w-0 rounded-card border border-line/60 bg-surface p-3 shadow-sm;
}

.score-total {
  @apply flex flex-col items-center gap-2;
}

.score-label {
  @apply text-base font-semibold text-ink;
}

.score-item-card {
  @apply rounded-card border border-line/60 shadow-sm;
}

/* 模板卡片滚动容器 */
.template-scroll {
  @apply max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain pr-2;
}

.template-scroll::-webkit-scrollbar {
  @apply w-2;
}

.template-scroll::-webkit-scrollbar-thumb {
  @apply rounded-pill bg-line;
}

.template-scroll::-webkit-scrollbar-thumb:hover {
  @apply bg-muted;
}

.template-scroll::-webkit-scrollbar-track {
  @apply rounded-pill bg-canvas;
}

/* 模板网格布局：移动端单列 */
.template-grid {
  @apply grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2;
}

.template-card {
  @apply relative flex cursor-pointer items-center gap-3.5 rounded-card border border-line/60 bg-gradient-to-b from-white to-canvas/50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-lighter hover:shadow-card;
}

.template-card.active {
  @apply border-brand bg-brand-lighter/40 shadow-card-hover;
}

.template-thumb {
  @apply relative flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-button;
}

.template-num {
  @apply z-10 text-2xl font-bold text-white/90;
}

.template-paper-line {
  @apply absolute left-2 right-2 h-0.5 rounded-full bg-white/40;
}

.template-paper-line:nth-of-type(2) {
  @apply top-5;
}

.template-paper-line:nth-of-type(3) {
  @apply top-9 w-2/3;
}

.template-paper-line:nth-of-type(4) {
  @apply top-12;
}

.template-info {
  @apply min-w-0 flex-1;
}

.template-name {
  @apply truncate text-sm font-semibold text-ink;
}

.template-desc {
  @apply mt-0.5 line-clamp-2 text-xs text-muted;
}

.template-check {
  @apply absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs text-white;
}

/* 弹窗统一覆盖：输入框、选择框 */
.editor-modal :deep(.ant-modal-header) {
  @apply border-b border-line/60 pb-3;
}

.editor-modal :deep(.ant-modal-title) {
  @apply text-base font-semibold text-ink;
}

.editor-modal-input,
.editor-modal-select,
.editor-modal-textarea {
  @apply rounded-button border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-muted transition-colors hover:border-brand-lighter focus:border-brand focus:ring-2 focus:ring-brand/10;
}

.editor-modal :deep(.ant-form-item-label > label) {
  @apply text-sm font-medium text-ink-secondary;
}

/* 抽屉标题 */
:global(.template-drawer .ant-drawer-header) {
  @apply border-b border-line/60;
}

:global(.template-drawer .ant-drawer-title) {
  @apply text-base font-semibold text-ink;
}
</style>
