<!--
  统一生成页顶部的辅助识别区。
  PDF 与自由文本都只负责流式回填下方表单，不在这里创建简历记录。
-->
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  FilePdfOutlined,
  FileTextOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import { extractResumeTextStream, uploadRecognizeResumeStream } from '@/api/resume'
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
let activeRecognitionController = null

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

watch(loading, (value) => emit('loading-change', value), { immediate: true })

/** 选择 PDF，仅保留当前文件；实际上传由“开始识别”触发。 */
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
  return false
}

function removePdf() {
  if (loading.value) return false
  pdfFile.value = null
  fileList.value = []
  state.fileName = ''
  return true
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

async function recognizePdf() {
  if (!pdfFile.value) {
    message.warning(state.fileName ? '刷新后请重新选择 PDF 文件' : '请先选择 PDF 文件')
    return
  }
  await runRecognition(
    (handlers) => uploadRecognizeResumeStream(pdfFile.value, handlers),
    '正在上传并识别 PDF 原文事实...'
  )
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

defineExpose({ clearDraft })
onBeforeUnmount(() => activeRecognitionController?.abort())
</script>

<template>
  <a-card class="card-base mb-5" :bordered="false">
    <template #title>
      <div class="flex flex-col gap-1">
        <span class="text-base font-semibold text-ink">辅助识别</span>
        <span class="text-xs font-normal text-muted">只提取原文事实并回填，不生成、不润色；也可以跳过识别直接填写表单</span>
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
      class="mb-5 w-full"
    />

    <div v-if="state.method === 'pdf'" class="space-y-4">
      <a-upload-dragger
        :file-list="fileList"
        :before-upload="beforePdfUpload"
        :remove="removePdf"
        :disabled="loading || disabled"
        accept="application/pdf,.pdf"
        :max-count="1"
      >
        <p class="ant-upload-drag-icon"><InboxOutlined /></p>
        <p class="ant-upload-text">点击或拖拽 PDF 简历到这里</p>
        <p class="ant-upload-hint">仅支持含可复制文本层的 PDF，最大 10MB；扫描件或图片型 PDF 请先完成 OCR。若可复制文字仍识别失败，可改用「智能文字识别」粘贴后再试</p>
      </a-upload-dragger>
      <div class="flex justify-center sm:justify-end">
        <GradientButton
          class="min-h-11 w-full justify-center sm:w-auto sm:min-w-[160px]"
          :loading="loading"
          :disabled="disabled"
          @click="recognizePdf"
        >
          <FilePdfOutlined v-if="!loading" /> 开始 PDF 识别
        </GradientButton>
      </div>
    </div>

    <div v-else class="space-y-4">
      <a-textarea
        v-model:value="state.rawText"
        :disabled="loading || disabled"
        :auto-size="{ minRows: 7, maxRows: 14 }"
        :maxlength="8000"
        show-count
        placeholder="粘贴已有简历内容，系统只提取其中明确写出的事实，不会补写或优化..."
        class="input-field"
      />
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <a-button
          class="min-h-11 w-full sm:w-auto sm:min-w-[120px]"
          :disabled="loading || disabled"
          @click="fillTextExample"
        >
          填写示例
        </a-button>
        <GradientButton
          class="min-h-11 w-full justify-center sm:w-auto sm:min-w-[160px]"
          :loading="loading"
          :disabled="disabled"
          @click="recognizeText"
        >
          <FileTextOutlined v-if="!loading" /> 开始文字识别
        </GradientButton>
      </div>
    </div>

    <!-- 内部仍按 JSON 流解析和回填，但这里只展示中文可读内容。 -->
    <div v-if="hasRun" class="mt-5 overflow-hidden rounded-card border border-line/60 bg-cream/70">
      <div class="flex items-center gap-2 border-b border-line/50 px-4 py-3 text-sm font-medium">
        <a-spin v-if="loading" size="small" />
        <CheckCircleFilled v-else-if="statusType === 'success'" class="text-success" />
        <ExclamationCircleOutlined v-else class="text-warning" />
        <ThunderboltOutlined v-if="statusType === 'processing' && !loading" class="text-brand" />
        <span>{{ state.status || '等待识别' }}</span>
      </div>
      <pre
        v-if="readableStreamText"
        class="max-h-64 overflow-auto whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6 text-ink-secondary"
      >{{ readableStreamText }}</pre>
      <p v-else class="px-4 py-3 text-xs text-muted">识别到完整内容后会在这里逐步显示中文结果，并同步写入下方表单。</p>
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
