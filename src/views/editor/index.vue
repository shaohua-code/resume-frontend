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
      @optimize="showOptimizeModal = true"
      @match="showMatchModal = true"
      @score="handleScore"
      @save="handleSave"
      @export-pdf="handleExportPDF"
      @export-word="handleExportWord"
    />

    <main class="editor-main">
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
          @section-click="handleSectionClick"
        />
        <a-dropdown :disabled="exporting">
          <button type="button" class="down-big" :disabled="exporting">
            <DownloadOutlined />
            下载/导出简历
          </button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="pdf" @click="handleExportPDF">导出 PDF（高清打印）</a-menu-item>
              <a-menu-item key="word" @click="handleExportWord">导出 Word（可编辑）</a-menu-item>
              <a-menu-item key="markdown" @click="handleExportMarkdown">导出 Markdown（VIP）</a-menu-item>
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
    />

    <!-- AI优化弹窗 -->
    <a-modal
      v-model:open="showOptimizeModal"
      title="AI优化项目描述"
      :confirm-loading="resumeStore.optimizing"
      class="editor-modal"
      @ok="handleOptimize"
    >
      <a-form layout="vertical">
        <a-form-item label="目标岗位">
          <a-input :value="optimizeTarget" placeholder="如：前端开发工程师" class="editor-modal-input" @update:value="optimizeTarget = $event" />
        </a-form-item>
        <a-form-item label="选择要优化的项目">
          <a-select :value="optimizeIndex" class="editor-modal-select" @update:value="optimizeIndex = $event">
            <a-select-option v-for="(p, i) in (resume.projects || [])" :key="i" :value="i">
              {{ p.name || `项目${i + 1}` }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- JD匹配弹窗 -->
    <a-modal
      v-model:open="showMatchModal"
      title="JD岗位匹配分析"
      :confirm-loading="resumeStore.matching"
      width="600px"
      class="editor-modal"
      @ok="handleMatch"
    >
      <a-form layout="vertical">
        <a-form-item label="粘贴岗位JD内容">
          <a-textarea :value="jdText" :rows="6" placeholder="请粘贴岗位的JD描述..." class="editor-modal-textarea" @update:value="jdText = $event" />
        </a-form-item>
      </a-form>
      <div v-if="matchResult" class="match-result">
        <a-progress
          :percent="matchResult.match_score"
          :stroke-color="matchProgressColor"
          class="mb-3"
        />
        <p><strong>岗位关键词：</strong>{{ matchResult.keywords?.join('、') }}</p>
        <p><strong>缺失技能：</strong>{{ matchResult.missing_skills?.join('、') || '无' }}</p>
        <p><strong>优化建议：</strong></p>
        <ul class="list-disc pl-5 text-sm text-ink-secondary">
          <li v-for="(s, i) in matchResult.suggestions" :key="i">{{ s }}</li>
        </ul>
      </div>
    </a-modal>

    <!-- 模板选择抽屉 -->
    <a-drawer
      v-model:open="showTemplateDrawer"
      title="选择简历模板"
      placement="right"
      width="760"
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
      width="500px"
      class="editor-modal"
    >
      <div v-if="scoreResult" class="score-result">
        <div class="score-total">
          <a-progress type="circle" :percent="scoreResult.total" :size="120" :stroke-color="scoreColor" />
          <span class="score-label">总分</span>
        </div>
        <a-row :gutter="[16, 16]" class="mt-6">
          <a-col v-for="item in scoreItems" :key="item.key" :span="12">
            <a-card size="small" class="score-item-card">
              <a-progress :percent="Math.round((scoreResult[item.key] / item.max) * 100)" :format="() => `${scoreResult[item.key]}/${item.max}`" />
              <div class="mt-1 text-center text-xs text-ink-secondary">{{ item.label }}</div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
import { DEFAULT_SKIN_THEME } from '@/constants/skin'
import { TEMPLATE_LIST, getTemplateName, clampTemplateId } from '@/constants/templateRegistry'
import { applyTemplateFontColorDefaults } from '@/constants/templateFontColors'
import EditorToolbar from './components/EditorToolbar.vue'
import EditorEditPanel from './components/EditorEditPanel.vue'
import ResumePreview from './components/ResumePreview.vue'

const route = useRoute()
const resumeStore = useResumeStore()
const userStore = useUserStore()

const templateId = ref(clampTemplateId(resumeStore.currentTemplateId))
const currentResumeId = ref(resumeStore.currentResumeId)
const resume = reactive({ ...resumeStore.currentResume })

const previewRef = ref(null)
const editPanelRef = ref(null)

const saving = ref(false)
const exporting = ref(false)

const activeModule = ref('basic')
const highlightModule = ref('')

const spacing = reactive({ ...DEFAULT_SPACING })
const fontSize = ref(DEFAULT_FONT_SIZE)
const fontFamily = ref(DEFAULT_FONT_FAMILY)
const labelColor = ref(null)
const basicContentColor = ref(null)
const nameColor = ref(null)
const contentColor = ref(null)
const skinTheme = ref({ ...DEFAULT_SKIN_THEME })
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
  showTemplateDrawer.value = false
  message.success(`已切换到「${getTemplateName(templateId.value)}」`)
}

const showOptimizeModal = ref(false)
const optimizeTarget = ref('')
const optimizeIndex = ref(0)

async function handleOptimize() {
  const projects = resume.projects || []
  const proj = projects[optimizeIndex.value]
  if (!proj?.description) {
    message.warning('请先填写项目描述')
    return
  }
  const result = await resumeStore.optimizeProject(proj.description, optimizeTarget.value)
  if (result) {
    proj.description = result.optimized || proj.description
    showOptimizeModal.value = false
    message.success('项目描述已优化')
  }
}

const showMatchModal = ref(false)
const jdText = ref('')
const matchResult = ref(null)

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
    message.warning('请输入岗位JD')
    return
  }
  // 预保存静默执行，避免与 JD 匹配结果的提示混淆
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
const scoreItems = [
  { key: 'content_completeness', label: '内容完整度', max: 20 },
  { key: 'skill_match', label: '技能匹配度', max: 20 },
  { key: 'project_quality', label: '项目质量', max: 30 },
  { key: 'resume_structure', label: '简历结构', max: 15 },
  { key: 'format_quality', label: '排版规范', max: 15 },
]

async function handleScore() {
  // 预保存静默执行，避免与评分结果的提示混淆
  const saved = await saveResumeData({ silent: true })
  if (saved?.id) {
    const result = await resumeStore.scoreResume(saved.id)
    if (result?.success) {
      scoreResult.value = result.data
      showScoreModal.value = true
    }
  }
}

// 统一的保存方法
// 始终走 update 路径，依赖 currentResumeId（已由 store 或 onMounted 写入）
// options.silent = true 时不弹 toast（用于自动保存、评分/JD 预保存）
async function saveResumeData({ silent = false } = {}) {
  // 兜底同步：每次保存前把 store 中的 ID 同步到本地 ref
  if (resumeStore.currentResumeId && resumeStore.currentResumeId !== currentResumeId.value) {
    currentResumeId.value = resumeStore.currentResumeId
  }
  if (!currentResumeId.value) {
    const msg = '当前简历尚未落库，无法保存。请先经过 AI 生成或从列表选择已有简历进入编辑。'
    if (!silent) message.error(msg)
    throw new Error(msg)
  }
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
  return await resumeStore.saveResume(
    {
      id: currentResumeId.value,
      title: resume.name ? `${resume.name}的简历` : '未命名简历',
      resume_json: JSON.stringify(resume),
      template_id: templateId.value,
      score: scoreResult.value?.total || 0,
    },
    { silent }
  )
}

async function handleSave() {
  saving.value = true
  try {
    await saveResumeData()
  } finally {
    saving.value = false
  }
}

async function ensureCanExport() {
  if (!userStore.isVip) {
    message.warning('普通用户暂不支持导出，请升级 VIP 后使用')
    return false
  }
  // 导出前通知后端记录导出行为，同时让后端再次校验 VIP / 管理员权限
  const saved = await saveResumeData({ silent: true })
  if (saved?.id) {
    await exportResumeApi(saved.id)
    return true
  }
  return false
}

async function handleExportPDF() {
  exporting.value = true
  try {
    const canExport = await ensureCanExport()
    if (!canExport) return
    const pages = previewRef.value?.getPdfPageElements?.()
    if (!pages?.length) {
      message.error('未找到简历内容')
      return
    }

    let wrapper = document.getElementById('resume-export-wrapper')
    if (!wrapper) {
      wrapper = document.createElement('div')
      wrapper.id = 'resume-export-wrapper'
      document.body.appendChild(wrapper)
    }

    wrapper.innerHTML = ''
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;pointer-events:none;background:#fff;overflow:visible'

    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const PAGE_W = 794
    const PAGE_H = 1123
    const EXPORT_SCALE = Math.max(2.5, Math.min(window.devicePixelRatio || 1, 2) * 1.5)
    const IMAGE_QUALITY = 0.92
    const pdf = new jsPDF({ unit: 'px', format: [PAGE_W, PAGE_H], orientation: 'portrait', compress: true, precision: 12 })

    // 按预览分页逐页截图，保证 PDF 页数与屏幕一致
    for (let i = 0; i < pages.length; i++) {
      wrapper.appendChild(pages[i])
      await nextTick()

      const canvas = await html2canvas(pages[i], {
        // 使用高清截图配合高质量 JPEG，兼顾文字清晰度和导出体积
        scale: EXPORT_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: PAGE_W,
        height: PAGE_H,
        windowWidth: PAGE_W,
        windowHeight: PAGE_H,
      })

      const imgData = canvas.toDataURL('image/jpeg', IMAGE_QUALITY)
      if (i > 0) pdf.addPage([PAGE_W, PAGE_H], 'portrait')
      pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_W, PAGE_H, undefined, 'MEDIUM')
      wrapper.removeChild(pages[i])
    }

    pdf.save(`${resume.name || '简历'}_AI简历助手.pdf`)
    message.success('PDF导出成功')
  } catch (e) {
    console.error('[导出PDF失败]', e)
    message.error('PDF导出失败')
  } finally {
    exporting.value = false
    const wrapper = document.getElementById('resume-export-wrapper')
    if (wrapper) wrapper.innerHTML = ''
  }
}

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
    saveAs(blob, `${resume.name || '简历'}_AI简历助手.doc`)
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
    return `### ${item.name || '项目经历'}\n- 角色：${item.role || ''}\n- 时间：${item.start_date || ''} - ${item.end_date || ''}\n- 技术栈：${techStack}\n- 描述：${item.description || ''}`
  }).join('\n\n')
  const internshipText = (resume.internships || []).map((item) => {
    return `### ${item.company || '实习经历'}\n- 岗位：${item.position || ''}\n- 时间：${item.start_date || ''} - ${item.end_date || ''}\n- 描述：${item.description || ''}`
  }).join('\n\n')
  // Markdown 导出使用当前编辑态数据，方便 VIP 下载可二次编辑的文本版本
  return `# ${resume.name || '个人简历'}\n\n${resume.phone || ''} ${resume.email || ''}\n\n## 个人简介\n${resume.summary || ''}${buildMarkdownList('技能标签', resume.skills || [])}\n## 项目经历\n${projectText || '暂无'}\n\n## 实习经历\n${internshipText || '暂无'}${buildMarkdownList('获奖经历', resume.awards || [])}${buildMarkdownList('证书', resume.certificates || [])}`
}

async function handleExportMarkdown() {
  exporting.value = true
  try {
    const canExport = await ensureCanExport()
    if (!canExport) return
    const { saveAs } = await import('file-saver')
    const blob = new Blob([buildMarkdownResume()], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, `${resume.name || '简历'}_AI简历助手.md`)
    message.success('Markdown导出成功')
  } catch (e) {
    console.error('[导出Markdown失败]', e)
    message.error('Markdown导出失败')
  } finally {
    exporting.value = false
  }
}

onBeforeUnmount(() => {
  const wrapper = document.getElementById('resume-export-wrapper')
  if (wrapper) wrapper.remove()
})

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await resumeStore.fetchResumeDetail(Number(id))
    Object.assign(resume, resumeStore.currentResume)
    templateId.value = clampTemplateId(resumeStore.currentTemplateId)
    loadEditorSettings(resume)
  } else if (Object.keys(resumeStore.currentResume).length) {
    Object.assign(resume, resumeStore.currentResume)
    loadEditorSettings(resume)
  }
  if (resumeStore.currentResumeId) {
    currentResumeId.value = resumeStore.currentResumeId
  }
})
</script>

<style scoped>
/* 编辑器外层：深色工作区，突出 A4 纸张 */
.editor-page {
  @apply min-h-screen bg-[#39394d];
}

/* 主内容区：留出顶部工具栏 + 底部编辑面板空间 */
.editor-main {
  @apply min-h-screen pb-[340px] pt-[70px];
}

/* 预览区居中 */
.preview-area {
  @apply relative flex min-h-[calc(100vh-410px)] flex-col items-center;
}

/* 右下角大下载按钮 */
.down-big {
  @apply fixed bottom-[360px] right-8 z-40 inline-flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand to-brand-light px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60;
}

/* JD 匹配结果展示 */
.match-result {
  @apply mt-4 rounded-card bg-canvas p-4 text-sm text-ink-secondary;
}

.match-result p {
  @apply mb-2;
}

/* 评分结果区 */
.score-result {
  @apply text-center;
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

/* 模板网格布局 */
.template-grid {
  @apply grid grid-cols-2 gap-4 pb-2;
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
  @apply rounded-button border-line bg-white px-4 py-2 text-sm text-ink placeholder:text-muted transition-colors hover:border-brand-lighter focus:border-brand focus:ring-2 focus:ring-brand/10;
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
