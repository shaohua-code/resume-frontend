<!--
  上传 PDF 简历并 AI 优化面板
  支持：新上传 PDF、引用已上传简历直接优化
-->
<template>
  <div class="mx-auto max-w-3xl">
    <!-- 优化方向置顶，两个卡片共享 -->
    <a-card ref="targetCardRef" class="card-base mb-4" :bordered="false">
      <a-form layout="vertical" class="mb-0">
        <a-form-item label="优化方向（必填，AI 会按该方向优化）" required class="mb-0">
          <a-input
            ref="targetInputRef"
            v-model:value="targetPosition"
            placeholder="如：会计，运营，前端开发工程师 / 行政专员 / 财务会计 / 产品经理"
            size="large"
            allow-clear
            class="input-field"
          />
        </a-form-item>
      </a-form>
    </a-card>

    <a-card v-if="existingFile" class="card-base mb-4" :bordered="false">
      <template #title>
        <span class="flex items-center gap-2 text-base font-semibold text-ink">
          <FileDoneOutlined class="text-success" /> 已上传简历（仅保留最新一份）
        </span>
      </template>
      <a-descriptions :column="2" size="small">
        <a-descriptions-item label="文件大小">
          {{ formatSize(existingFile.size) }}
        </a-descriptions-item>
        <a-descriptions-item label="上传时间">
          {{ formatTime(existingFile.mtime) }}
        </a-descriptions-item>
      </a-descriptions>
      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          class="btn-danger inline-flex h-10 min-w-[160px] items-center justify-center gap-2 rounded-button px-5 text-sm"
          :disabled="deleting"
          @click="handleDelete"
        >
          <DeleteOutlined /> 删除已上传的简历
        </button>
        <GradientButton
          class="inline-flex h-10 min-w-[160px] items-center justify-center"
          :loading="uploading && useExistingFile"
          @click="handleOptimizeExisting"
        >
          <ThunderboltFilled /> 直接优化已上传简历
        </GradientButton>
        <button
          v-if="canShowJdOptimize"
          type="button"
          class="btn-ghost inline-flex h-10 min-w-[160px] items-center justify-center gap-1.5 rounded-button px-5 text-sm"
          @click="openJdOptimize"
        >
          <AimOutlined /> 按 JD 优化简历
        </button>
      </div>
    </a-card>

    <a-card class="card-base mb-4" :bordered="false">
      <template #title>
        <span class="flex items-center gap-2 text-base font-semibold text-ink">
          <CloudUploadOutlined class="text-brand-dark" /> {{ existingFile ? '替换上传（覆盖已有）' : '选择 PDF 简历' }}
        </span>
      </template>

      <a-form layout="vertical">
        <a-upload-dragger
          v-model:fileList="fileList"
          :before-upload="beforeUpload"
          :max-count="1"
          accept="application/pdf"
          :disabled="uploading"
          class="upload-dragger-custom rounded-card border border-dashed border-line/60 bg-white/50 transition-colors hover:border-brand/40"
        >
          <p class="ant-upload-drag-icon text-brand-dark">
            <InboxOutlined class="text-5xl" />
          </p>
          <p class="ant-upload-text text-base font-medium text-ink">点击或拖拽 PDF 文件到此处</p>
          <p class="ant-upload-hint text-sm text-muted">仅支持 PDF 格式，单个文件不超过 10MB</p>
        </a-upload-dragger>

        <div
          v-if="uploading"
          ref="streamPreviewAnchorRef"
          class="mt-4 rounded-card border border-line/50 bg-cream p-2 sm:p-4"
        >
          <a-progress
            v-if="uploadPercent < 100 && !streamText"
            :percent="uploadPercent"
            status="active"
            stroke-color="#00D4FF"
          />
          <div v-if="uploadPercent < 100 && !streamText" class="mt-2 text-center text-sm text-muted">
            正在上传并连接 AI...
          </div>
          <div v-else class="text-left">
            <StreamResumePreview
              :stream-text="streamText"
              :loading="uploading"
              :template-id="resumeStore.currentTemplateId"
              :loading-hint="isJdOptimize ? 'AI 正在根据岗位 JD 优化你的简历...' : undefined"
            />
          </div>
        </div>

        <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GradientButton
            class="inline-flex h-10 min-w-[160px] items-center justify-center w-full sm:w-auto"
            :loading="uploading && !useExistingFile && !isJdOptimize"
            @click="handleSubmit"
          >
            <ThunderboltFilled /> 开始 AI 优化
          </GradientButton>
          <button
            v-if="canShowJdOptimize && fileList.length"
            type="button"
            class="btn-ghost inline-flex h-10 min-w-[160px] items-center justify-center gap-1.5 rounded-button px-5 text-sm"
            :disabled="uploading"
            @click="openJdOptimize"
          >
            <AimOutlined /> 按 JD 优化简历
          </button>
        </div>
      </a-form>
    </a-card>

    <a-card v-if="optimizeResult" class="mb-4 rounded-card border-0 bg-white shadow-card" :bordered="false">
      <template #title>
        <span class="flex items-center gap-2 text-base font-semibold text-ink">
          <CheckCircleFilled class="text-success" /> 优化完成
        </span>
      </template>

      <h3 class="mb-3 text-base font-semibold text-ink">AI 优化要点</h3>
      <ul class="space-y-2">
        <li
          v-for="(note, idx) in optimizeResult.optimization_notes"
          :key="idx"
          class="flex items-start gap-2 border-b border-dashed border-line/60 py-2 text-sm text-ink-secondary last:border-b-0"
        >
          <BulbOutlined class="mt-0.5 text-warning" /> {{ note }}
        </li>
        <li v-if="!optimizeResult.optimization_notes?.length" class="py-2 text-sm text-muted">
          （AI 未返回优化要点）
        </li>
      </ul>

      <a-divider />

      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <GradientButton @click="goEditor">
          <EditOutlined /> 进入编辑器查看完整简历
        </GradientButton>
        <button
          v-if="canShowJdOptimize"
          type="button"
          class="btn-ghost inline-flex h-10 items-center gap-1.5 rounded-button px-5 text-sm"
          @click="openJdOptimize"
        >
          <AimOutlined /> 按 JD 优化简历
        </button>
      </div>
    </a-card>

    <!-- JD 输入弹窗（确定后复用上方 PDF 优化预览区） -->
    <JdResumeOptimizeModal
      v-model:open="jdOptimizeOpen"
      :template-id="resumeStore.currentTemplateId"
      @confirm-start="handleJdConfirmStart"
    />

    <!-- 超过 5 份简历时的二次确认弹窗 -->
    <a-modal
      v-model:open="overLimitVisible"
      title="简历数量超限提醒"
      ok-text="继续生成（替换最后一份）"
      cancel-text="取消"
      @ok="confirmOverLimit"
    >
      <div class="py-2 text-sm leading-relaxed text-ink-secondary">
        每人最多生成 <span class="font-semibold text-danger">5</span> 份简历，继续生成将
        <span class="font-semibold text-danger">替换最后一份简历</span>，简历将无法找回。
        <br /><br />
        是否继续操作？
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  FileDoneOutlined,
  CloudUploadOutlined,
  InboxOutlined,
  ThunderboltFilled,
  CheckCircleFilled,
  BulbOutlined,
  EditOutlined,
  DeleteOutlined,
  AimOutlined,
} from '@ant-design/icons-vue'
import {
  uploadOptimizeResume,
  uploadOptimizeResumeStream,
  uploadOptimizeExistingStream,
  uploadOptimizeExisting,
  uploadOptimizeByJdStream,
  uploadOptimizeByJdExistingStream,
  getUploadedResume,
  deleteUploadedResume,
  createResume as createApi,
} from '@/api/resume'
import { useResumeStore } from '@/stores/resume'
import GradientButton from '@/components/GradientButton.vue'
import JdResumeOptimizeModal from '@/components/JdResumeOptimizeModal.vue'
import StreamResumePreview from './StreamResumePreview.vue'
import { useScrollToStreamPreview } from '@/composables/useScrollToStreamPreview'
import { normalizeResumeFields } from '@/constants/resumeFieldSchema'
import { parsePartialResumeJson } from '../utils/streamResumeParser'

const router = useRouter()
const resumeStore = useResumeStore()
const streamPreviewAnchorRef = ref(null)
const { scrollToStreamPreview } = useScrollToStreamPreview(streamPreviewAnchorRef)

const fileList = ref([])
const targetPosition = ref('')
const uploading = ref(false)
const uploadPercent = ref(0)
const optimizeResult = ref(null)
const streamText = ref('')
const useExistingFile = ref(false)
// 是否为 JD 优化流程（复用同一预览区，文案略有不同）
const isJdOptimize = ref(false)

const existingFile = ref(null)
const deleting = ref(false)
const targetCardRef = ref(null)
const targetInputRef = ref(null)

// 超过 5 份简历时的二次确认弹窗状态
const overLimitVisible = ref(false)
// 暂存优化结果，等待超限确认后落库
const pendingResult = ref(null)
// 标记是否已确认超限，避免重复弹窗
const overLimitConfirmed = ref(false)

// JD 优化弹窗
const jdOptimizeOpen = ref(false)

// 有 PDF（已上传或已选择）即可 JD 优化，无需先完成 PDF 优化
const canShowJdOptimize = computed(() => !!(existingFile.value || fileList.value.length))

/** 打开 JD 输入弹窗 */
function openJdOptimize() {
  if (!existingFile.value && !fileList.value.length) {
    message.warning('请先上传或选择 PDF 简历')
    return
  }
  jdOptimizeOpen.value = true
}

/** 确定后：复用 PDF 优化预览区，走 PDF+JD 流式接口 */
async function handleJdConfirmStart({ jdText }) {
  if (uploading.value) return
  if (!jdText?.trim()) {
    message.warning('JD 内容不能为空')
    return
  }

  // 优先使用已上传 PDF；否则使用当前选择的文件
  const useExisting = !!existingFile.value && !fileList.value.length
  if (!useExisting && !fileList.value.length) {
    message.warning('请先上传或选择 PDF 简历')
    return
  }

  useExistingFile.value = useExisting
  isJdOptimize.value = true
  await beginStreamingPreview()

  try {
    let resultData = null
    if (useExisting) {
      resultData = await uploadOptimizeByJdExistingStream(jdText.trim(), streamHandlers)
    } else {
      const file = fileList.value[0]
      const realFile = file.originFileObj || file
      resultData = await uploadOptimizeByJdStream(realFile, jdText.trim(), streamHandlers)
    }
    if (resultData) await handleOptimizeSuccess(resultData)
  } catch (e) {
    /* request / fetch 已提示 */
  } finally {
    uploading.value = false
    useExistingFile.value = false
    isJdOptimize.value = false
  }
}

// 未填优化方向时，滚动并聚焦到输入框
async function focusTargetPosition() {
  message.warning('请先填写优化方向')
  await nextTick()
  targetCardRef.value?.$el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  targetInputRef.value?.focus?.()
}

function beforeUpload(file) {
  if (file.size > 10 * 1024 * 1024) {
    message.error('文件大小不能超过 10MB')
    return false
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    message.error('仅支持 PDF 文件')
    return false
  }
  fileList.value = [file]
  return false
}

function resetOptimizeState() {
  uploading.value = true
  uploadPercent.value = 0
  optimizeResult.value = null
  streamText.value = ''
}

/** 开始流式优化并重置状态，同时滚动到预览区 */
async function beginStreamingPreview() {
  resetOptimizeState()
  await scrollToStreamPreview()
}

// 流式回调：onStatus 仅内部使用，不渲染技术文案
const streamHandlers = {
  onStatus: () => {
    uploadPercent.value = 100
  },
  onChunk: (chunk) => {
    uploadPercent.value = 100
    streamText.value += chunk
  },
}

async function handleOptimizeSuccess(resultData) {
  // 超限检查：未确认过时，先检查简历数量
  if (!overLimitConfirmed.value) {
    await resumeStore.fetchResumeCount()
    if (resumeStore.resumeTotal >= resumeStore.resumeMaxCount) {
      // 暂存结果，弹窗等待用户确认
      pendingResult.value = resultData
      overLimitVisible.value = true
      return
    }
  }

  await persistOptimizeResult(resultData)
  overLimitConfirmed.value = false
}

// 将优化结果落库并展示
async function persistOptimizeResult(resultData) {
  optimizeResult.value = resultData
  resumeStore.currentResume = resultData.resume

  // 若 AI 未从 PDF 解析出岗位信息，强制使用用户填写的优化方向作为兜底
  if (resultData.resume && !resultData.resume.target_position && targetPosition.value?.trim()) {
    console.warn('[UploadPanel] PDF 未解析到岗位信息，已使用优化方向:', targetPosition.value)
    resultData.resume.target_position = targetPosition.value.trim()
    resumeStore.currentResume.target_position = targetPosition.value.trim()
  }

  try {
    const createRes = await createApi({
      title: resultData.resume?.name ? `${resultData.resume.name}的简历` : '未命名简历',
      resume_json: resultData.resume,
      template_id: resumeStore.currentTemplateId || 1,
      score: 0,
    })
    if (createRes.success && createRes.data?.id) {
      resumeStore.currentResumeId = createRes.data.id
    }
  } catch (createErr) {
    console.warn('[UploadPanel] 自动创建简历失败:', createErr)
  }
  message.success('AI 优化完成')
  await fetchExisting()
}

// 确认超限后继续落库
async function confirmOverLimit() {
  overLimitVisible.value = false
  overLimitConfirmed.value = true
  if (pendingResult.value) {
    await persistOptimizeResult(pendingResult.value)
    pendingResult.value = null
  }
}

async function handleSubmit() {
  if (uploading.value) return
  if (!targetPosition.value.trim()) {
    await focusTargetPosition()
    return
  }
  if (!fileList.value.length) {
    message.warning('请先选择 PDF 文件')
    return
  }
  const file = fileList.value[0]
  const realFile = file.originFileObj || file

  useExistingFile.value = false
  await beginStreamingPreview()

  try {
    let resultData = null
    try {
      resultData = await uploadOptimizeResumeStream(realFile, targetPosition.value, streamHandlers)
    } catch (streamErr) {
      console.warn('[UploadPanel] 流式失败，回退同步接口:', streamErr)
      uploadPercent.value = 0
      const res = await uploadOptimizeResume(realFile, targetPosition.value, (p) => {
        uploadPercent.value = p
      })
      if (res.success) resultData = res.data
    }
    if (resultData) await handleOptimizeSuccess(resultData)
  } catch (e) {
    /* request / fetch 已提示 */
  } finally {
    uploading.value = false
  }
}

async function handleOptimizeExisting() {
  if (!targetPosition.value.trim()) {
    await focusTargetPosition()
    return
  }
  if (!existingFile.value) {
    message.warning('暂无已上传的简历')
    return
  }
  if (uploading.value) return

  useExistingFile.value = true
  await beginStreamingPreview()

  try {
    let resultData = null
    try {
      resultData = await uploadOptimizeExistingStream(targetPosition.value, streamHandlers)
    } catch (streamErr) {
      console.warn('[UploadPanel] 已有文件流式失败，回退同步接口:', streamErr)
      uploadPercent.value = 100
      const res = await uploadOptimizeExisting(targetPosition.value)
      if (res.success) resultData = res.data
    }
    if (resultData) await handleOptimizeSuccess(resultData)
  } catch (e) {
    /* request / fetch 已提示 */
  } finally {
    uploading.value = false
    useExistingFile.value = false
  }
}

function goEditor() {
  router.push('/editor')
}

async function fetchExisting() {
  try {
    const res = await getUploadedResume()
    existingFile.value = res.data || null
  } catch (e) {
    existingFile.value = null
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await deleteUploadedResume()
    existingFile.value = null
    message.success('已删除')
  } finally {
    deleting.value = false
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}

onMounted(fetchExisting)

/**
 * 构建当前简历快照，供 JD 优化弹窗使用
 */
function getResumeSnapshot() {
  if (optimizeResult.value?.resume && Object.keys(optimizeResult.value.resume).length) {
    return normalizeResumeFields({ ...optimizeResult.value.resume })
  }
  if (streamText.value) {
    const parsed = parsePartialResumeJson(streamText.value)
    if (Object.keys(parsed).length) return normalizeResumeFields(parsed)
  }
  if (resumeStore.currentResume && Object.keys(resumeStore.currentResume).length) {
    return normalizeResumeFields({ ...resumeStore.currentResume })
  }
  return null
}

/**
 * 用户确认应用优化结果：更新预览数据（Upload 模式自动落库，无需手动应用）
 */
function applyOptimizedResume(optimized) {
  optimizeResult.value = {
    resume: normalizeResumeFields(optimized),
    optimization_notes: optimizeResult.value?.optimization_notes || [],
  }
  resumeStore.currentResume = optimizeResult.value.resume
}

defineExpose({ getResumeSnapshot, applyOptimizedResume })
</script>

<style scoped>
:deep(.ant-upload-drag-icon) {
  @apply mb-2 text-brand-dark;
}

:deep(.ant-upload-text) {
  @apply text-base font-medium text-ink;
}

:deep(.ant-upload-hint) {
  @apply text-sm text-muted;
}

/* 去掉文件列表项默认灰边框 */
:deep(.ant-upload-list-item) {
  @apply border-0 bg-transparent p-0 shadow-none;
}

:deep(.ant-upload-list-item .ant-upload-list-item-info) {
  @apply rounded-button bg-brand-lighter/40 px-3 py-1.5;
}

:deep(.ant-upload-list-item .ant-upload-list-item-actions) {
  @apply hidden;
}
</style>
