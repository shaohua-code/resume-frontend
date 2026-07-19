<!--
  统一生成页顶部的辅助识别区。
  PDF / 文字两种模式各自只保留一个主识别按钮；PDF 支持复用已存唯一文件。
-->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import {
  extractResumeTextStream,
  uploadRecognizeResumeStream,
  uploadRecognizeExistingStream,
  getUploadedResume,
  getUploadedResumeContent,
  deleteUploadedResume,
} from '@/api/resume'
import { getErrorMessage } from '@/utils/errorMessage'
import { normalizeResumeFields } from '@/constants/resumeFieldSchema'
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
// 服务端已保存的唯一 PDF 元信息（size / mtime）
const existingFile = ref(null)
const deleting = ref(false)
// 已有云端 PDF 时默认收起替换区，避免与主识别 CTA 抢注意力。
const showReplaceUpload = ref(false)
const previewOpen = ref(false)
const previewUrl = ref('')
const previewLoading = ref(false)
let activeRecognitionController = null
let localPreviewUrl = ''

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

/** 预览本地新选文件或服务端已存 PDF */
async function openPdfPreview() {
  if (previewLoading.value) return
  previewLoading.value = true
  try {
    revokePreviewUrl()
    if (pdfFile.value) {
      // 本地尚未上传的文件直接用 blob URL
      previewUrl.value = URL.createObjectURL(pdfFile.value)
      previewOpen.value = true
      return
    }
    if (!existingFile.value) {
      message.warning('请先选择或上传 PDF')
      return
    }
    const blob = await getUploadedResumeContent()
    const fileBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/pdf' })
    previewUrl.value = URL.createObjectURL(fileBlob)
    previewOpen.value = true
  } catch (e) {
    message.error(getErrorMessage(e) || 'PDF 预览失败')
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
  return '开始 PDF 识别'
})
const canStartPdf = computed(() => !!(pdfFile.value || existingFile.value))

watch(loading, (value) => emit('loading-change', value), { immediate: true })

/** 拉取当前用户已保存的唯一 PDF，供直接识别。 */
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

/** 选择 PDF，仅保留当前文件；实际上传由主识别按钮触发并覆盖服务端旧文件。 */
function beforePdfUpload(file) {
  if (file.size > 10 * 1024 * 1024) {
    message.warning('PDF 文件不能超过 10MB')
    return false
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    message.warning('请选择 PDF 文件')
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


/** 删除服务端已保存的唯一 PDF。 */
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
  state.phase = 'running'
  state.status = startStatus
  state.streamText = ''
  state.previewResume = {}
  state.error = ''
  let doneHandled = false

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
      },
      onDone: (data) => {
        doneHandled = true
        finishRecognition(data)
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

/** 唯一 PDF 识别入口：新选文件优先上传覆盖，否则复用已上传文件。 */
async function recognizePdf() {
  if (pdfFile.value) {
    await runRecognition(
      (handlers) => uploadRecognizeResumeStream(pdfFile.value, handlers),
      '正在上传并识别 PDF 原文事实...'
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
      '正在识别已上传 PDF 原文事实...'
    )
    return
  }
  message.warning(state.fileName ? '刷新后请重新选择 PDF 文件' : '请先选择 PDF 文件')
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
  <a-card class="mb-5 card-base" :bordered="false">
    <template #title>
      <div class="flex flex-col gap-1">
        <span class="text-base font-semibold text-ink">辅助识别</span>
        <span class="text-xs font-normal text-muted">只提取原文事实并回填，不生成、不润色；也可跳过识别直接填写下方表单</span>
      </div>
    </template>

    <a-segmented
      v-model:value="state.method"
      :disabled="loading || disabled"
      :options="[
        { label: '智能 PDF 识别', value: 'pdf' },
        { label: '智能文字识别', value: 'text' },
      ]"
      block
      size="large"
      class="w-full mb-5"
    />

    <!-- PDF：已存状态 + 可选替换区 + 唯一主按钮 -->
    <div v-if="state.method === 'pdf'" class="space-y-4">
      <div
        v-if="existingFile"
        class="flex flex-col gap-3 p-4 border rounded-card border-line/60 bg-cream/70 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0 space-y-1">
          <div class="flex items-center gap-2 text-sm font-medium text-ink">
            <FileDoneOutlined class="shrink-0 text-success" />
            <span>已保存一份 PDF，可直接识别</span>
          </div>
          <div class="flex flex-wrap text-xs gap-x-4 gap-y-1 text-muted">
            <span>{{ formatSize(existingFile.size) }}</span>
            <span>{{ formatTime(existingFile.mtime) }}</span>
            <span v-if="pdfFile" class="text-brand-dark">已选新文件，识别时将覆盖</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <a-button
            class="w-full min-h-11 sm:w-auto"
            :disabled="loading || disabled"
            :loading="previewLoading"
            @click="openPdfPreview"
          >
            <EyeOutlined /> 预览
          </a-button>
          <a-button
            class="w-full min-h-11 sm:w-auto"
            :disabled="loading || disabled"
            @click="showReplaceUpload = !showReplaceUpload"
          >
            <CloudUploadOutlined /> {{ showReplaceUpload ? '收起替换' : '替换文件' }}
          </a-button>
          <a-button
            class="w-full min-h-11 sm:w-auto"
            danger
            :disabled="loading || disabled || deleting"
            :loading="deleting"
            @click="handleDeleteExisting"
          >
            <DeleteOutlined /> 删除
          </a-button>
        </div>
      </div>

      <div v-if="!existingFile || showReplaceUpload || pdfFile" class="space-y-2">
        <a-upload-dragger
          :file-list="fileList"
          :before-upload="beforePdfUpload"
          :remove="removePdf"
          :disabled="loading || disabled"
          accept="application/pdf,.pdf"
          :max-count="1"
        >
          <p class="ant-upload-drag-icon"><InboxOutlined /></p>
          <p class="ant-upload-text">
            {{ existingFile ? '选择新 PDF 以覆盖已有文件' : '点击或拖拽 PDF 到这里' }}
          </p>
          <p class="ant-upload-hint">含可复制文字 · 最大 10MB · 每人仅保留一份</p>
        </a-upload-dragger>
        <div v-if="pdfFile" class="flex justify-end">
          <a-button
            class="min-h-11"
            :disabled="loading || disabled"
            :loading="previewLoading"
            @click="openPdfPreview"
          >
            <EyeOutlined /> 预览已选文件
          </a-button>
        </div>
        <p class="text-xs leading-5 text-muted">
          扫描件需先 OCR；识别失败可切换到「智能文字识别」。
        </p>
      </div>

      <div class="flex justify-center sm:justify-end">
        <GradientButton
          class="min-h-11 w-full justify-center sm:w-auto sm:min-w-[180px]"
          :loading="loading"
          :disabled="disabled || !canStartPdf"
          @click="recognizePdf"
        >
          <FilePdfOutlined v-if="!loading" /> {{ pdfPrimaryLabel }}
        </GradientButton>
      </div>

      <!-- PDF 预览：本地 blob 或鉴权拉取后的 blob -->
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

    <!-- 文字：提示条 + 输入区 + 唯一主按钮 -->
    <div v-else class="space-y-4">
      <div class="px-3 py-2 text-xs leading-5 border rounded-card border-line/50 bg-cream/70 text-muted">
        粘贴整段简历即可；系统只抽取明确写出的事实，不会补写或润色。建议至少 20 字。
      </div>
      <a-textarea
        v-model:value="state.rawText"
        :disabled="loading || disabled"
        :auto-size="{ minRows: 8, maxRows: 16 }"
        :maxlength="8000"
        placeholder="例如：姓名、求职意向、教育经历、工作/项目经历、技能…"
        class="input-field"
      />
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-2 sm:flex-row">
          <a-button
            class="min-h-11 w-full sm:w-auto sm:min-w-[112px]"
            :disabled="loading || disabled"
            @click="fillTextExample"
          >
            填写示例
          </a-button>
          <a-button
            class="min-h-11 w-full sm:w-auto sm:min-w-[112px]"
            :disabled="loading || disabled || !textLength"
            @click="clearTextInput"
          >
            清空
          </a-button>
        </div>
        <GradientButton
          class="min-h-11 w-full justify-center sm:w-auto sm:min-w-[180px]"
          :loading="loading"
          :disabled="disabled || textLength < 20"
          @click="recognizeText"
        >
          <FileTextOutlined v-if="!loading" /> 开始文字识别
        </GradientButton>
      </div>
    </div>

    <!-- 流式结果预览：只展示中文可读内容 -->
    <div v-if="hasRun" class="min-w-0 mt-5 overflow-hidden border rounded-card border-line/60 bg-cream/70">
      <div class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b border-line/50">
        <a-spin v-if="loading" size="small" />
        <CheckCircleFilled v-else-if="statusType === 'success'" class="text-success" />
        <ExclamationCircleOutlined v-else class="text-warning" />
        <ThunderboltOutlined v-if="statusType === 'processing' && !loading" class="text-brand" />
        <span class="min-w-0 truncate">{{ state.status || '等待识别' }}</span>
      </div>
      <pre
        v-if="readableStreamText"
        class="px-4 py-3 overflow-auto text-sm leading-6 break-words whitespace-pre-wrap max-h-64 text-ink-secondary"
      >{{ readableStreamText }}</pre>
      <p v-else class="px-4 py-3 text-xs text-muted">识别内容会逐步显示在这里，并同步写入下方表单。</p>
    </div>
  </a-card>
</template>

<style scoped>
:deep(.ant-upload-drag-icon) {
  @apply mb-2 text-brand-dark;
}

@media (max-width: 375px) {
  :deep(.ant-segmented-item-label) {
    @apply px-2 text-xs;
  }
}
</style>
