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
import { generateResumeStream, uploadOptimizeResumeStream } from '@/api/resume'
import { normalizeResumeFields } from '@/constants/resumeFieldSchema'
import { parsePartialResumeJson } from '../utils/streamResumeParser'
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
const loading = computed(() => state.phase === 'running')
const hasRun = computed(() => state.phase !== 'idle' || !!state.streamText)
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
  state.phase = 'complete'
  state.status = '识别完成，内容已回填到下方表单'
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
  state.error = ''
  let doneHandled = false

  try {
    const result = await operation({
      signal: controller.signal,
      onStatus: (status) => {
        state.status = status || 'AI 正在识别并整理信息...'
      },
      onChunk: (chunk) => {
        state.streamText += chunk
        state.status = 'AI 正在流式识别，表单将持续回填...'
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
    (handlers) => uploadOptimizeResumeStream(pdfFile.value, '', handlers),
    '正在上传并解析 PDF...'
  )
}

async function recognizeText() {
  const text = String(state.rawText || '').trim()
  if (text.length < 20) {
    message.warning('请至少填写 20 个字的简历内容')
    return
  }
  await runRecognition(
    (handlers) => generateResumeStream({
      input_mode: 'lazy',
      raw_text: text,
      name: '',
      target_position: '',
    }, handlers),
    '正在理解文字内容...'
  )
}

defineExpose({ clearDraft })
onBeforeUnmount(() => activeRecognitionController?.abort())
</script>

<template>
  <a-card class="card-base mb-5" :bordered="false">
    <template #title>
      <div class="flex flex-col gap-1">
        <span class="text-base font-semibold text-ink">辅助识别</span>
        <span class="text-xs font-normal text-muted">可选用一种方式回填，也可以跳过识别直接填写表单</span>
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
        <p class="ant-upload-hint">仅支持 PDF，最大 10MB；识别结果只回填表单</p>
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
        placeholder="粘贴或自由填写已有简历内容，支持分段描述、键值对等任意格式..."
        class="input-field"
      />
      <div class="flex justify-center sm:justify-end">
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

    <!-- 状态与流式原文完成后仍保留，用户可核对识别过程。 -->
    <div v-if="hasRun" class="mt-5 overflow-hidden rounded-card border border-line/60 bg-cream/70">
      <div class="flex items-center gap-2 border-b border-line/50 px-4 py-3 text-sm font-medium">
        <a-spin v-if="loading" size="small" />
        <CheckCircleFilled v-else-if="statusType === 'success'" class="text-success" />
        <ExclamationCircleOutlined v-else class="text-warning" />
        <ThunderboltOutlined v-if="statusType === 'processing' && !loading" class="text-brand" />
        <span>{{ state.status || '等待识别' }}</span>
      </div>
      <pre
        v-if="state.streamText"
        class="max-h-52 overflow-auto whitespace-pre-wrap break-words px-4 py-3 text-xs leading-6 text-ink-secondary"
      >{{ state.streamText }}</pre>
      <p v-else class="px-4 py-3 text-xs text-muted">识别内容将在这里流式显示，并同步写入下方表单。</p>
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
