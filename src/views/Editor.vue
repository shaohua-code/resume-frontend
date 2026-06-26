<!--
  简历编辑器页
  全民简历式布局：顶部工具栏 + 中间 A4 预览 + 底部 Tab 编辑区
-->
<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { DownloadOutlined, CheckOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useResumeStore } from '@/stores/resume'
import {
  DEFAULT_SPACING,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_MODULES,
  extractEditorSettings,
  applyEditorSettingsToResume,
} from '@/constants/editorSettings'
import { TEMPLATE_LIST, getTemplateName, clampTemplateId } from '@/constants/templateRegistry'
import EditorToolbar from '@/components/resume-editor/EditorToolbar.vue'
import EditorEditPanel from '@/components/resume-editor/EditorEditPanel.vue'
import ResumePreview from '@/components/resume-editor/ResumePreview.vue'

const route = useRoute()
const resumeStore = useResumeStore()

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
const skin = ref(extractEditorSettings({}).skin)
const modules = ref(DEFAULT_MODULES.map((m) => ({ ...m })))

// 预览页数（从 ResumePreview expose 读取）
const pageCount = computed(() => previewRef.value?.getPageCount?.() ?? 1)

// 恢复编辑器设置
function loadEditorSettings(source) {
  const settings = extractEditorSettings(source)
  Object.assign(spacing, settings.spacing)
  fontSize.value = settings.fontSize
  fontFamily.value = settings.fontFamily
  skin.value = settings.skin
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
    skin: skin.value,
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

async function handleExportPDF() {
  exporting.value = true
  try {
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

<template>
  <div class="editor-page">
    <EditorToolbar
      v-model:spacing="spacing"
      v-model:font-size="fontSize"
      v-model:font-family="fontFamily"
      v-model:skin="skin"
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
          :skin="skin"
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
    <a-modal v-model:open="showOptimizeModal" title="AI优化项目描述" :confirm-loading="resumeStore.optimizing" @ok="handleOptimize">
      <a-form layout="vertical">
        <a-form-item label="目标岗位">
          <a-input v-model:value="optimizeTarget" placeholder="如：前端开发工程师" />
        </a-form-item>
        <a-form-item label="选择要优化的项目">
          <a-select v-model:value="optimizeIndex" style="width: 100%">
            <a-select-option v-for="(p, i) in (resume.projects || [])" :key="i" :value="i">
              {{ p.name || `项目${i + 1}` }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- JD匹配弹窗 -->
    <a-modal v-model:open="showMatchModal" title="JD岗位匹配分析" :confirm-loading="resumeStore.matching" width="600px" @ok="handleMatch">
      <a-form layout="vertical">
        <a-form-item label="粘贴岗位JD内容">
          <a-textarea v-model:value="jdText" :rows="6" placeholder="请粘贴岗位的JD描述..." />
        </a-form-item>
      </a-form>
      <div v-if="matchResult" class="match-result">
        <a-progress :percent="matchResult.match_score" :stroke-color="matchResult.match_score >= 80 ? '#52c41a' : matchResult.match_score >= 60 ? '#faad14' : '#ff4d4f'" />
        <p><strong>岗位关键词：</strong>{{ matchResult.keywords?.join('、') }}</p>
        <p><strong>缺失技能：</strong>{{ matchResult.missing_skills?.join('、') || '无' }}</p>
        <p><strong>优化建议：</strong></p>
        <ul>
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
              <span class="template-paper-line"></span>
              <span class="template-paper-line short"></span>
              <span class="template-paper-line"></span>
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
    <a-modal v-model:open="showScoreModal" title="AI简历评分" :footer="null" width="500px">
      <div v-if="scoreResult" class="score-result">
        <div class="score-total">
          <a-progress type="circle" :percent="scoreResult.total" :size="120" :stroke-color="scoreResult.total >= 80 ? '#52c41a' : scoreResult.total >= 60 ? '#faad14' : '#ff4d4f'" />
          <span class="score-label">总分</span>
        </div>
        <a-row :gutter="[16, 16]" style="margin-top: 24px">
          <a-col v-for="item in scoreItems" :key="item.key" :span="12">
            <a-card size="small">
              <a-progress :percent="Math.round((scoreResult[item.key] / item.max) * 100)" :format="() => `${scoreResult[item.key]}/${item.max}`" />
              <div style="text-align: center; margin-top: 4px; color: #666">{{ item.label }}</div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.editor-page {
  min-height: 100vh;
  background: #39394d;
}
.editor-main {
  padding-top: 70px;
  padding-bottom: 340px;
  min-height: 100vh;
}
.preview-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 410px);
}
.down-big {
  position: fixed;
  right: 32px;
  bottom: 360px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.4);
  transition: all 0.2s;
}
.down-big:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(22, 119, 255, 0.5);
}
.down-big:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.match-result {
  margin-top: 16px;
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
}
.match-result p {
  margin-bottom: 8px;
}
.score-result {
  text-align: center;
}
.score-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.score-label {
  font-size: 16px;
  font-weight: 600;
}
.template-scroll {
  max-height: calc(100vh - 120px);
  padding-right: 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.template-scroll::-webkit-scrollbar {
  width: 8px;
}
.template-scroll::-webkit-scrollbar-thumb {
  background: #c8d6ea;
  border-radius: 999px;
}
.template-scroll::-webkit-scrollbar-thumb:hover {
  background: #9db6d8;
}
.template-scroll::-webkit-scrollbar-track {
  background: #f3f6fb;
  border-radius: 999px;
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding-bottom: 8px;
}
.template-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 116px;
  padding: 14px;
  border: 1px solid #e5eaf3;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(180deg, #fff, #fbfdff);
}
.template-card:hover {
  border-color: #1677ff;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(22, 119, 255, 0.14);
}
.template-card.active {
  border-color: #1677ff;
  background: linear-gradient(180deg, #f0f7ff, #ffffff);
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.16);
}
.template-thumb {
  position: relative;
  width: 72px;
  height: 92px;
  padding: 12px 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
}
.template-num {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 14px;
}
.template-paper-line {
  width: 42px;
  height: 4px;
  margin-bottom: 6px;
  background: rgba(255,255,255,0.72);
  border-radius: 999px;
}
.template-paper-line.short {
  width: 28px;
}
.template-info {
  flex: 1;
  min-width: 0;
}
.template-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}
.template-desc {
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
}
.template-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  background: #1677ff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

:deep(.template-drawer .ant-drawer-body) {
  padding: 18px 16px 18px 20px;
  background: #f7faff;
}
</style>
