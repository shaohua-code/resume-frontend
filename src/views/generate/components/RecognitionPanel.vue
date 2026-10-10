<!--
  统一生成页顶部的先导入已有简历区。
  PDF/Word 与文字两种模式各自只保留一个主识别按钮；支持复用已存唯一源文件。
-->
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  FilePdfOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import {
  extractResumeTextStream,
  uploadRecognizeResumeStream,
  uploadRecognizeExistingStream,
  getUploadedResume,
  getUploadedResumeContent,
  deleteUploadedResume,
} from '@/api/resume'
import { getErrorMessage } from '@/utils/errorMessage'
import {
  RESUME_UPLOAD_ACCEPT,
  getResumeFileExt,
  isPdfResumeFile,
  validateResumeUploadFile,
} from '@/utils/resumeUploadFile'
import {
  normalizeResumeFields,
  extractTargetPositionFromText,
} from '@/constants/resumeFieldSchema'
import { parsePartialResumeJson } from '../utils/streamResumeParser'
import { formatRecognitionPreview } from '../utils/recognitionPreview'
import { useGenerateDraft } from '../composables/useGenerateDraft'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['loading-change', 'partial', 'complete'])
const route = useRoute()

const { state, clear: clearDraft } = useGenerateDraft('ai-resume-recognition-draft-v2', {
  // 兼容首页和旧上传路由：lazy 入口默认文字识别，其余入口默认 PDF 识别。
  method: route.query.mode === 'lazy' ? 'text' : 'pdf',
  rawText: '',
  phase: 'idle',
  status: '',
  streamText: '',
  previewResume: {},
  fileName: '',
  error: '',
})

// 刷新时只恢复已经收到的内容，并明确标记中断；禁止自动重放 AI 请求。
if (state.phase === 'running') {
  state.phase = 'interrupted'
  state.status = '上次识别因页面刷新中断，请检查已回填内容后重新识别'
}

const pdfFile = ref(null)
const fileList = ref([])
// 服务端已保存的唯一简历源文件元信息（size / mtime / ext）
const existingFile = ref(null)
const deleting = ref(false)
// 已有云端文件时默认收起替换区，避免与主识别 CTA 抢注意力。
const showReplaceUpload = ref(false)
const previewOpen = ref(false)
const previewUrl = ref('')
const previewLoading = ref(false)
/** 识别过程自动展开；完成后收起原文预览，给表单留出首屏空间。 */
const isMobile = useMediaQuery('(max-width: 639px)')
const streamExpanded = ref(false)
/** 流式预览区，增量输出时滚到底部 */
const streamPreRef = ref(null)
const streamBoxRef = ref(null)
let activeRecognitionController = null
let localPreviewUrl = ''

/** 当前可预览对象：仅 PDF 走 iframe；Word 走下载 */
const canInlinePreview = computed(() => {
  if (pdfFile.value) return isPdfResumeFile(pdfFile.value)
  if (existingFile.value) {
    return isPdfResumeFile({
      name: existingFile.value.filename || '',
      filename: existingFile.value.filename || '',
    }) || existingFile.value.ext === '.pdf'
  }
  return false
})
const previewActionLabel = computed(() => (canInlinePreview.value ? '预览' : '下载'))

/** 流式文本更新后，预览区始终贴底 */
async function scrollStreamToBottom() {
  await nextTick()
  const el = streamPreRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function revokePreviewUrl() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  if (localPreviewUrl) {
    URL.revokeObjectURL(localPreviewUrl)
    localPreviewUrl = ''
  }
}

/** 触发浏览器下载 blob（Word 不内嵌预览时使用） */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'resume.docx'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** 预览本地/已存 PDF，或下载 Word（.docx） */
async function openPdfPreview() {
  if (previewLoading.value) return
  previewLoading.value = true
  try {
    revokePreviewUrl()
    if (pdfFile.value) {
      if (!isPdfResumeFile(pdfFile.value)) {
        // Word：直接下载本地已选文件，避免 iframe 无法渲染
        downloadBlob(pdfFile.value, pdfFile.value.name || 'resume.docx')
        message.success('已开始下载 Word 文件')
        return
      }
      previewUrl.value = URL.createObjectURL(pdfFile.value)
      previewOpen.value = true
      return
    }
    if (!existingFile.value) {
      message.warning('请先选择或上传简历文件')
      return
    }
    const blob = await getUploadedResumeContent()
    const ext = existingFile.value.ext || getResumeFileExt(existingFile.value.filename) || '.pdf'
    const mime = ext === '.docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf'
    const fileBlob = blob instanceof Blob ? blob : new Blob([blob], { type: mime })
    if (ext === '.docx') {
      downloadBlob(fileBlob, existingFile.value.filename || 'resume.docx')
      message.success('已开始下载 Word 文件')
      return
    }
    previewUrl.value = URL.createObjectURL(fileBlob)
    previewOpen.value = true
  } catch (e) {
    message.error(getErrorMessage(e) || '文件预览失败')
  } finally {
    previewLoading.value = false
  }
}

function closePdfPreview() {
  previewOpen.value = false
  revokePreviewUrl()
}

// 示例只用于帮助用户理解可识别格式，内容全部是演示数据且不会自动发起 AI 请求。
const TEXT_RECOGNITION_EXAMPLE = `姓名：张三
求职意向：Java 开发工程师
电话：13800000000
邮箱：zhangsan@example.com
工作年限：3年

教育经历：
2018.09—2022.06，广东工业大学，软件工程专业，本科。
主修课程：Java程序设计、数据库原理、计算机网络。

专业技能：
Java、Spring Boot、MySQL、Redis、Git。

工作经历：
2022.07—至今，广州示例科技有限公司，Java开发工程师。
负责订单系统接口开发、数据库维护及线上问题排查。

项目经历：
2023.03—2023.12，电商订单管理系统，后端开发。
使用Spring Boot、MySQL和Redis完成订单创建、查询及状态更新功能。

证书：
大学英语四级、计算机二级。`

const loading = computed(() => state.phase === 'running')
const hasRun = computed(() => state.phase !== 'idle' || !!state.streamText)
const textLength = computed(() => String(state.rawText || '').trim().length)
const readableStreamText = computed(() => {
  const completed = state.previewResume && Object.keys(state.previewResume).length
    ? state.previewResume
    : parsePartialResumeJson(state.streamText)
  return formatRecognitionPreview(completed)
})
const statusType = computed(() => {
  if (state.phase === 'complete') return 'success'
  if (state.phase === 'error' || state.phase === 'interrupted') return 'warning'
  return 'processing'
})
// 底部唯一主按钮文案：新文件优先，否则复用已上传。
const pdfPrimaryLabel = computed(() => {
  if (pdfFile.value) return '上传并识别'
  if (existingFile.value) return '识别已上传简历'
  return '开始文件识别'
})
const canStartPdf = computed(() => !!(pdfFile.value || existingFile.value))
/** 所有屏宽都可手动展开识别原文；完成时默认收起。 */
const showStreamBody = computed(() => streamExpanded.value)

function toggleStreamExpanded() {
  // 识别进行中保持可见；结束后让用户决定是否展开原文核对。
  if (loading.value) return
  streamExpanded.value = !streamExpanded.value
}

watch(loading, (value) => {
  emit('loading-change', value)
  if (value) streamExpanded.value = true
  else if (state.phase === 'complete') streamExpanded.value = false
}, { immediate: true })

// 流式增量与可读预览变化时滚到底部
watch(
  () => [state.streamText, readableStreamText.value, loading.value, showStreamBody.value],
  () => {
    if ((state.streamText || loading.value) && showStreamBody.value) scrollStreamToBottom()
  },
)

/** 拉取当前用户已保存的唯一简历源文件，供直接识别。 */
async function fetchExisting() {
  try {
    const res = await getUploadedResume()
    existingFile.value = res.data || null
    // 无云端文件时始终展示上传区；有文件时默认收起替换区。
    if (!existingFile.value) showReplaceUpload.value = true
  } catch {
    existingFile.value = null
    showReplaceUpload.value = true
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}

/** 选择 PDF/Word，仅保留当前文件；实际上传由主识别按钮触发并覆盖服务端旧文件。 */
function beforePdfUpload(file) {
  const errMsg = validateResumeUploadFile(file)
  if (errMsg) {
    message.warning(errMsg)
    return false
  }
  pdfFile.value = file
  fileList.value = [file]
  state.fileName = file.name
  showReplaceUpload.value = true
  return false
}

function removePdf() {
  if (loading.value) return false
  pdfFile.value = null
  fileList.value = []
  state.fileName = ''
  // 移除新选文件后，若仍有云端文件则重新收起替换区。
  if (existingFile.value) showReplaceUpload.value = false
  return true
}


/** 删除服务端已保存的唯一简历源文件。 */
async function handleDeleteExisting() {
  if (loading.value || props.disabled || deleting.value) return
  deleting.value = true
  try {
    await deleteUploadedResume()
    existingFile.value = null
    showReplaceUpload.value = true
    message.success('已删除已上传的简历')
  } catch (error) {
    message.error(error?.message || '删除失败，请重试')
  } finally {
    deleting.value = false
  }
}

/** 每次收到增量后解析已闭合字段，立即安全回填到下方唯一表单。 */
function emitPartialResult() {
  const partial = parsePartialResumeJson(state.streamText)
  if (Object.keys(partial).length) emit('partial', partial)
}

function finishRecognition(data) {
  const source = data?.resume || data || {}
  const normalized = normalizeResumeFields(source)
  // 模型漏提意向岗位时，从输入原文「求职意向：xxx」回退补齐
  if (!normalized.target_position) {
    normalized.target_position = extractTargetPositionFromText(state.rawText)
  }
  emit('complete', normalized)
  state.previewResume = normalized
  state.phase = 'complete'
  state.status = '识别完成，原文事实已回填到下方表单，尚未优化'
  state.error = ''
}

async function runRecognition(operation, startStatus) {
  if (loading.value || props.disabled) return
  activeRecognitionController?.abort()
  const controller = new AbortController()
  activeRecognitionController = controller
  // 各屏宽在识别开始时展开结果区，方便用户即时核对流式内容。
  if (isMobile.value) streamExpanded.value = true
  state.phase = 'running'
  state.status = startStatus
  state.streamText = ''
  state.previewResume = {}
  state.error = ''
  let doneHandled = false
  await nextTick()
  streamBoxRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })

  try {
    const result = await operation({
      signal: controller.signal,
      onStatus: (status) => {
        state.status = status || 'AI 正在识别原文事实...'
      },
      onChunk: (chunk) => {
        state.streamText += chunk
        state.status = 'AI 正在流式提取原文事实，表单将持续回填...'
        emitPartialResult()
        scrollStreamToBottom()
      },
      onDone: (data) => {
        doneHandled = true
        finishRecognition(data)
        scrollStreamToBottom()
      },
    })
    if (!doneHandled && result) finishRecognition(result)
  } catch (error) {
    if (error?.silent) {
      state.phase = 'idle'
      state.status = '已取消邮箱验证，本次识别未执行'
      return
    }
    state.phase = 'error'
    state.error = error?.message || '识别失败，请重试'
    state.status = state.error
    message.error(state.error)
  } finally {
    if (activeRecognitionController === controller) activeRecognitionController = null
  }
}

/** 唯一文件识别入口：新选文件优先上传覆盖，否则复用已上传文件。 */
async function recognizePdf() {
  if (pdfFile.value) {
    await runRecognition(
      (handlers) => uploadRecognizeResumeStream(pdfFile.value, handlers),
      '正在上传并识别简历原文事实...'
    )
    if (state.phase === 'complete') {
      await fetchExisting()
      pdfFile.value = null
      fileList.value = []
      showReplaceUpload.value = false
    }
    return
  }
  if (existingFile.value) {
    await runRecognition(
      (handlers) => uploadRecognizeExistingStream(handlers),
      '正在识别已上传简历原文事实...'
    )
    return
  }
  message.warning(state.fileName ? '刷新后请重新选择简历文件' : '请先选择 PDF 或 Word（.docx）文件')
}

async function recognizeText() {
  const text = String(state.rawText || '').trim()
  if (text.length < 20) {
    message.warning('请至少填写 20 个字的简历内容')
    return
  }
  await runRecognition(
    (handlers) => extractResumeTextStream(text, handlers),
    '正在识别文字中的原文事实...'
  )
}

/** 填入可直接识别的演示简历，但保留用户点击“开始识别”的明确确认步骤。 */
function fillTextExample() {
  if (loading.value || props.disabled) return
  state.rawText = TEXT_RECOGNITION_EXAMPLE
}

function clearTextInput() {
  if (loading.value || props.disabled) return
  state.rawText = ''
}

defineExpose({ clearDraft })
onMounted(fetchExisting)
onBeforeUnmount(() => {
  activeRecognitionController?.abort()
  revokePreviewUrl()
})
</script>

<template>
  <!-- 不用 card-base 的 p-5，避免与 ant-card-body 双重内边距导致两侧空白过大 -->
  <a-card
    class="recognition-panel mb-3 rounded-card border border-line/60 bg-surface shadow-card sm:mb-4"
    :bordered="false"
  >
    <template #title>
      <div class="flex flex-col gap-0.5">
        <span class="text-base font-semibold text-ink">先导入已有简历</span>
        <span class="text-xs font-normal text-muted">上传或粘贴简历，识别后填入下方资料；没有电子简历也可以直接填写。</span>
      </div>
    </template>

    <!-- 切换组在卡片内容区水平居中；窄屏保持按钮等宽，便于触控。 -->
    <div class="mb-3 flex justify-center">
      <a-segmented
        v-model:value="state.method"
        :disabled="loading || disabled"
        :options="[
          { label: '上传简历文件', value: 'pdf' },
          { label: '粘贴简历内容', value: 'text' },
        ]"
        size="middle"
        class="w-full sm:w-auto"
      />
    </div>

    <!-- 文件识别：已存状态 + 可选替换区 + 唯一主按钮 -->
    <div v-if="state.method === 'pdf'" class="space-y-2.5">
      <div
        v-if="existingFile"
        class="flex flex-col gap-2 rounded-lg border border-line/30 bg-cream/50 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3"
      >
        <div class="min-w-0 space-y-1">
          <div class="existing-file-title flex items-center gap-2 text-sm font-medium text-ink">
            <FileDoneOutlined class="shrink-0 text-success" />
            <span>已保存一份简历文件，可直接识别</span>
          </div>
          <div class="flex flex-wrap text-xs gap-x-4 gap-y-1 text-muted">
            <span>{{ formatSize(existingFile.size) }}</span>
            <span>{{ formatTime(existingFile.mtime) }}</span>
            <span v-if="existingFile.ext">{{ existingFile.ext.toUpperCase() }}</span>
            <span v-if="pdfFile" class="text-brand-dark">已选新文件，识别时将覆盖</span>
          </div>
        </div>
        <div class="existing-file-actions flex flex-col gap-1.5 sm:flex-row sm:shrink-0 sm:gap-2">
          <a-button
            class="w-full min-h-10 sm:w-auto sm:min-h-11"
            :disabled="loading || disabled"
            :loading="previewLoading"
            @click="openPdfPreview"
          >
            <EyeOutlined v-if="canInlinePreview" />
            <DownloadOutlined v-else />
            {{ previewActionLabel }}
          </a-button>
          <a-button
            class="w-full min-h-10 sm:w-auto sm:min-h-11"
            :disabled="loading || disabled"
            @click="showReplaceUpload = !showReplaceUpload"
          >
            <CloudUploadOutlined /> {{ showReplaceUpload ? '收起替换' : '替换文件' }}
          </a-button>
          <a-button
            class="w-full min-h-10 sm:w-auto sm:min-h-11"
            danger
            :disabled="loading || disabled || deleting"
            :loading="deleting"
            @click="handleDeleteExisting"
          >
            <DeleteOutlined /> 删除
          </a-button>
        </div>
      </div>

      <div v-if="!existingFile || showReplaceUpload || pdfFile" class="space-y-1.5">
        <a-upload-dragger
          class="resume-upload-dropzone"
          :file-list="fileList"
          :before-upload="beforePdfUpload"
          :remove="removePdf"
          :disabled="loading || disabled"
          :accept="RESUME_UPLOAD_ACCEPT"
          :max-count="1"
        >
          <div class="resume-upload-inner">
            <span class="resume-upload-icon"><InboxOutlined /></span>
            <span class="resume-upload-copy">
              <strong>{{ existingFile ? '选择新文件，替换当前简历材料' : '上传简历文件' }}</strong>
              <span>拖到这里，或从设备选择 · PDF / DOCX · 最大 10MB</span>
            </span>
            <span class="resume-upload-action" aria-hidden="true">浏览文件&nbsp; →</span>
          </div>
        </a-upload-dragger>
        <div v-if="pdfFile" class="flex justify-end">
          <a-button
            class="min-h-11"
            :disabled="loading || disabled"
            :loading="previewLoading"
            @click="openPdfPreview"
          >
            <EyeOutlined v-if="canInlinePreview" />
            <DownloadOutlined v-else />
            {{ canInlinePreview ? '预览已选文件' : '下载已选文件' }}
          </a-button>
        </div>
        <p class="text-xs leading-5 text-muted">
          扫描件需先 OCR；扫描件无法读取时，可以切换到「粘贴简历内容」手动导入。
        </p>
      </div>

      <div v-if="canStartPdf" class="flex justify-end border-t border-line/40 pt-3">
        <GradientButton
          class="min-h-10 w-full justify-center sm:min-h-11 sm:w-auto sm:min-w-[180px]"
          :loading="loading"
          :disabled="disabled || !canStartPdf"
          @click="recognizePdf"
        >
          <FilePdfOutlined v-if="!loading" /> {{ pdfPrimaryLabel }}
        </GradientButton>
      </div>

      <!-- PDF 预览：本地 blob 或鉴权拉取后的 blob；Word 走下载不进此弹窗 -->
      <a-modal
        v-model:open="previewOpen"
        title="PDF 预览"
        :footer="null"
        width="90vw"
        :style="{ top: '24px' }"
        @cancel="closePdfPreview"
      >
        <iframe
          v-if="previewUrl"
          :src="previewUrl"
          class="w-full h-[70vh] border-0 rounded-card bg-white"
          title="PDF 预览"
        />
      </a-modal>
    </div>

    <!-- 明确标出粘贴内容、识别门槛和字数，减少首次使用时的猜测。 -->
    <div v-else class="space-y-3">
      <div class="flex flex-col gap-1">
        <label for="generate-resume-text" class="text-sm font-semibold text-ink">粘贴简历内容</label>
        <p class="text-xs leading-5 text-muted">建议粘贴完整简历，识别后会填入下方资料；至少输入 20 个字。</p>
      </div>
      <!-- 保留足够的粘贴空间，同时把下方资料区提前带入首屏。 -->
      <a-textarea
        id="generate-resume-text"
        v-model:value="state.rawText"
        :disabled="loading || disabled"
        :auto-size="{ minRows: isMobile ? 4 : 5, maxRows: 14 }"
        :maxlength="8000"
        placeholder="粘贴简历正文，包含个人信息、教育经历、工作或项目经历、技能等。"
        class="input-field"
      />
      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <span :class="textLength >= 20 ? 'text-success' : 'text-muted'">
          {{ textLength >= 20 ? '内容长度满足识别要求' : '至少输入 20 个字后即可识别' }}
        </span>
        <span class="shrink-0 tabular-nums text-muted">{{ textLength }} / 8000</span>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div class="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
          <a-button
            class="min-h-10 w-full sm:min-h-11 sm:w-auto sm:min-w-[112px]"
            :disabled="loading || disabled"
            @click="fillTextExample"
          >
            填写示例
          </a-button>
          <a-button
            class="min-h-10 w-full sm:min-h-11 sm:w-auto sm:min-w-[112px]"
            :disabled="loading || disabled || !textLength"
            @click="clearTextInput"
          >
            清空
          </a-button>
        </div>
        <GradientButton
          class="min-h-10 w-full justify-center sm:min-h-11 sm:w-auto sm:min-w-[200px]"
          :loading="loading"
          :disabled="disabled || textLength < 20"
          @click="recognizeText"
        >
          <FileTextOutlined v-if="!loading" /> 识别并填入表单
        </GradientButton>
      </div>
    </div>
    <!-- 流式结果：识别期间展开，完成后默认收起，避免长原文挤压下方表单。 -->
    <div
      v-if="hasRun"
      ref="streamBoxRef"
      class="mt-3 min-w-0 overflow-hidden rounded-lg border border-line/30 bg-cream/40 sm:mt-4"
    >
      <button
        type="button"
        class="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium sm:px-3 sm:py-2.5"
        :class="showStreamBody ? 'border-b border-line/25' : ''"
        :aria-expanded="showStreamBody"
        :disabled="loading"
        @click="toggleStreamExpanded"
      >
        <a-spin v-if="loading" size="small" />
        <CheckCircleFilled v-else-if="statusType === 'success'" class="text-success" />
        <ExclamationCircleOutlined v-else class="text-warning" />
        <ThunderboltOutlined v-if="statusType === 'processing' && !loading" class="text-brand" />
        <span class="min-w-0 flex-1 truncate">{{ state.status || '等待识别' }}</span>
        <span v-if="!loading" class="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted">
          {{ showStreamBody ? '收起原文' : '查看识别原文' }}
          <UpOutlined v-if="showStreamBody" />
          <DownOutlined v-else />
        </span>
      </button>
      <div v-show="showStreamBody">
        <pre
          v-if="readableStreamText"
          ref="streamPreRef"
          class="max-h-64 overflow-auto break-words whitespace-pre-wrap px-2.5 py-2 text-sm leading-6 text-ink-secondary sm:px-3 sm:py-2.5"
        >{{ readableStreamText }}</pre>
        <p v-else class="px-2.5 py-2 text-xs text-muted sm:px-3 sm:py-2.5">识别内容会逐步显示在这里，并同步写入下方表单。</p>
      </div>
    </div>
  </a-card>
</template>

<style scoped>
/* 识别模块是创作流程的起点，用清爽实体卡片和主题色文件投递区建立亲和感。 */
:deep(.recognition-panel.ant-card) { overflow: hidden; border-radius: 21px; }
/* 禁用时降低背景饱和度但保留深色文字，按钮仍清楚可读。 */
.recognition-panel :deep(.btn-primary:disabled),
.recognition-panel :deep(.btn-primary-sm:disabled) {
  border-color: color-mix(in srgb, var(--color-brand) 24%, var(--color-line));
  background: color-mix(in srgb, var(--color-brand) 17%, var(--color-surface));
  color: var(--color-brand-dark);
  box-shadow: none;
}
:deep(.ant-card-head) {
  @apply min-h-0 border-b border-line/40 px-4 py-4 sm:px-6 sm:py-5;
}
:deep(.ant-card-body) {
  @apply px-4 py-4 sm:px-6 sm:py-5;
}
:deep(.ant-card-head-title) {
  @apply overflow-visible whitespace-normal;
}
:deep(.resume-upload-dropzone.ant-upload-wrapper .ant-upload-drag) {
  min-height: 102px;
  padding: 19px 20px;
  border-radius: 17px;
  border-color: var(--color-line);
  background: var(--color-cream);
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}
:deep(.resume-upload-dropzone.ant-upload-wrapper .ant-upload-drag:hover) {
  border-color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand-lighter) 36%, var(--color-surface));
  box-shadow: 0 8px 22px color-mix(in srgb, var(--color-brand) 10%, transparent);
}
:deep(.resume-upload-dropzone .ant-upload-btn) {
  padding: 0 !important;
}
.resume-upload-inner {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  text-align: left;
}
.resume-upload-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-brand) 12%, var(--color-line));
  border-radius: 14px;
  background: var(--color-accent-lighter);
  color: var(--color-brand-dark);
}
.resume-upload-icon :deep(.anticon) { font-size: 21px; }
.resume-upload-copy { display: grid; min-width: 0; gap: 5px; }
.resume-upload-copy strong { color: var(--color-ink); font-size: 14px; font-weight: 700; }
.resume-upload-copy > span { color: var(--color-ink-secondary); font-size: 12px; line-height: 1.5; }
.resume-upload-action {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  border: 0;
  border-radius: 11px;
  background: var(--color-brand);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}
@media (max-width: 640px) {
  .existing-file-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }
  .existing-file-actions :deep(.ant-btn) {
    min-width: 0;
    min-height: 40px;
    padding-inline: 4px;
    font-size: 12px;
  }
  .existing-file-title { gap: 6px; font-size: 13px; }
  :deep(.ant-segmented) {
    display: flex;
    width: min(100%, 420px);
    min-height: 48px;
    padding: 4px;
    border: 1px solid color-mix(in srgb, var(--color-brand) 10%, var(--color-line));
    border-radius: 14px;
    background: color-mix(in srgb, var(--color-brand-lighter) 34%, var(--color-cream));
  }
  :deep(.ant-segmented-group) { display: flex; width: 100%; }
  :deep(.ant-segmented-item) { flex: 1; min-width: 0; border-radius: 10px; }
  :deep(.ant-segmented-item-label) {
    display: flex;
    min-height: 38px;
    align-items: center;
    justify-content: center;
    padding-inline: 8px;
    font-size: 13px;
    font-weight: 600;
  }
  :deep(.ant-segmented-thumb) {
    border-radius: 10px;
    background: var(--color-surface);
    box-shadow: 0 2px 8px rgb(49 39 102 / 11%), 0 1px 2px rgb(25 35 58 / 6%);
  }
  :deep(.ant-segmented-item-selected) { color: var(--color-brand-dark); font-weight: 700; }
  :deep(.resume-upload-dropzone.ant-upload-wrapper .ant-upload-drag) {
    min-height: 84px;
    padding: 13px 12px;
  }
  .resume-upload-inner {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
  }
  .resume-upload-icon {
    width: 38px;
    height: 38px;
  }
  :deep(.ant-card-head) { padding-right: 15px; padding-left: 15px; }
  :deep(.ant-card-body) { padding: 15px; }
  .resume-upload-action { display: none; }
}
@media (max-width: 375px) {
  :deep(.ant-segmented-item-label) {
    @apply px-2 text-xs;
  }
}
</style>
