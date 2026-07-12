<!--
  基于岗位 JD 优化简历 — 共享弹窗组件
  inputOnly=true（默认）：纯输入弹窗，图片/文本二选一，确定后 emit confirm-start
  inputOnly=false（编辑器）：输入 → 弹窗内流式预览 → 应用替换
-->
<script setup>
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  BulbOutlined,
  CheckCircleFilled,
  PictureOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import StreamResumePreview from '@/views/generate/components/StreamResumePreview.vue'
import { useJdResumeOptimize } from '@/composables/useJdResumeOptimize'
import { extractJdFromImage } from '@/api/resume'
import { clampTemplateId } from '@/constants/templateRegistry'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useScrollToStreamPreview } from '@/composables/useScrollToStreamPreview'

// 弹窗显隐，父组件 v-model:open 控制
const open = defineModel('open', { type: Boolean, default: false })

const props = defineProps({
  // 当前待优化的简历对象（编辑器预览阶段需要）
  resume: {
    type: Object,
    default: () => ({}),
  },
  // 流式预览使用的模板 ID
  templateId: {
    type: Number,
    default: 1,
  },
  // true：仅输入后关闭弹窗；false：编辑器保留弹窗内预览
  inputOnly: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['apply', 'confirm-start'])

const isMobile = useMediaQuery()
const streamPreviewAnchorRef = ref(null)
const { scrollToStreamPreview } = useScrollToStreamPreview(streamPreviewAnchorRef)

// 弹窗阶段：input 输入 JD | preview 流式预览（仅 inputOnly=false）
const phase = ref('input')

// JD 文本与图片（二选一必填）
const jdText = ref('')
const jdImageFile = ref(null)
const jdImageName = ref('')
const extracting = ref(false)

const {
  streamText,
  loading,
  optimizeResult,
  reset: resetOptimize,
  startOptimize,
  getOptimizedResume,
} = useJdResumeOptimize()

// 规范化模板 ID
const previewTemplateId = computed(() => clampTemplateId(props.templateId))

// 弹窗标题随阶段变化
const modalTitle = computed(() => (
  phase.value === 'input' ? '按岗位 JD 优化简历' : 'JD 优化预览'
))

// 弹窗宽度：移动端预览阶段 95vw
const modalWidth = computed(() => {
  if (isMobile.value) return '95vw'
  return phase.value === 'preview' ? 860 : 640
})

// 打开/关闭弹窗时重置状态
watch(open, (val) => {
  if (val) {
    phase.value = 'input'
    jdText.value = ''
    jdImageFile.value = null
    jdImageName.value = ''
    extracting.value = false
    resetOptimize()
  } else {
    phase.value = 'input'
    jdText.value = ''
    jdImageFile.value = null
    jdImageName.value = ''
    extracting.value = false
    resetOptimize()
  }
})

/** 选择 JD 图片（仅保留一份） */
function handleImageBeforeUpload(file) {
  if (!file.type?.startsWith('image/')) {
    message.warning('请上传图片文件')
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    message.warning('图片大小不能超过 10MB')
    return false
  }
  jdImageFile.value = file
  jdImageName.value = file.name
  return false
}

/** 清除已选图片 */
function clearJdImage() {
  jdImageFile.value = null
  jdImageName.value = ''
}

/**
 * 解析最终 JD 文本：有文本用文本，仅图片则 OCR 提取
 * @returns {Promise<string|null>}
 */
async function resolveJdText() {
  const trimmed = jdText.value.trim()
  if (trimmed) return trimmed
  if (!jdImageFile.value) return null

  extracting.value = true
  try {
    const res = await extractJdFromImage(jdImageFile.value)
    const text = res?.data?.jd_text?.trim() || ''
    if (!text) {
      message.warning('未能从图片中识别 JD 内容，请换一张更清晰的图片或改用文本粘贴')
      return null
    }
    jdText.value = text
    return text
  } catch (e) {
    message.error(e.message || '图片识别失败，请重试')
    return null
  } finally {
    extracting.value = false
  }
}

/** 阶段1：点击确定 — 校验后提交或进入预览 */
async function handleConfirm() {
  const hasText = !!jdText.value.trim()
  const hasImage = !!jdImageFile.value
  if (!hasText && !hasImage) {
    message.warning('请粘贴 JD 文本或上传 JD 图片（二选一）')
    return
  }

  const finalJdText = await resolveJdText()
  if (!finalJdText) return

  // 生成页：关闭弹窗，交由父组件页内流式预览
  if (props.inputOnly) {
    emit('confirm-start', { jdText: finalJdText })
    open.value = false
    return
  }

  // 编辑器：弹窗内进入预览并自动开始优化
  phase.value = 'preview'
  await scrollToStreamPreview()
  await startOptimize(props.resume, { jdText: finalJdText, skipBasicCheck: true, inputOnly: false })
}

/** 用户确认后将优化结果交给父组件合并 */
function handleApply() {
  const optimized = getOptimizedResume()
  if (!optimized) return
  emit('apply', optimized)
  open.value = false
}

/** 取消并关闭 */
function handleCancel() {
  open.value = false
}
</script>

<template>
  <a-modal
    v-model:open="open"
    :title="modalTitle"
    :footer="null"
    :width="modalWidth"
    class="modal-fresh"
    destroy-on-close
    @cancel="handleCancel"
  >
    <!-- 阶段1：JD 输入（文本与图片二选一） -->
    <template v-if="phase === 'input'">
      <a-form layout="vertical" class="mb-2">
        <a-form-item label="粘贴岗位 JD 内容">
          <a-textarea
            v-model:value="jdText"
            :rows="6"
            placeholder="请粘贴目标岗位的职位描述、任职要求、岗位职责等..."
            class="input-field"
          />
        </a-form-item>

        <a-form-item class="mb-0">
          <template #label>
            <span class="inline-flex items-center gap-1.5 text-sm text-ink-secondary">
              <PictureOutlined /> 或上传 JD 图片
            </span>
          </template>
          <a-upload
            accept="image/*"
            :show-upload-list="false"
            :before-upload="handleImageBeforeUpload"
          >
            <button
              type="button"
              class="flex h-10 w-full items-center justify-center gap-2 rounded-button border border-dashed border-line/60 bg-cream/50 text-sm text-ink-secondary transition-colors hover:border-brand/40 hover:bg-brand-lighter/30"
            >
              <UploadOutlined />
              {{ jdImageName || '点击上传 JD 截图/图片（支持 OCR 识别）' }}
            </button>
          </a-upload>
          <button
            v-if="jdImageName"
            type="button"
            class="mt-2 text-xs text-muted underline hover:text-danger"
            @click="clearJdImage"
          >
            清除已选图片
          </button>
          <p class="mt-2 text-xs text-muted">文本与图片二选一必填，仅上传图片时将自动识别内容</p>
        </a-form-item>
      </a-form>

      <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="btn-ghost inline-flex h-10 items-center justify-center px-6"
          @click="handleCancel"
        >
          取消
        </button>
        <GradientButton
          class="inline-flex h-10 items-center justify-center px-6"
          :loading="extracting"
          @click="handleConfirm"
        >
          确定
        </GradientButton>
      </div>
    </template>

    <!-- 阶段2：流式预览 + 优化要点（仅编辑器 inputOnly=false） -->
    <template v-else>
      <div class="max-h-[calc(100vh-120px)] overflow-y-auto">
        <div
          ref="streamPreviewAnchorRef"
          class="mb-4 rounded-card border border-line/50 bg-cream p-2 lg:p-4"
        >
          <StreamResumePreview
            :stream-text="streamText"
            :loading="loading"
            :template-id="previewTemplateId"
            :scale="0.6"
            loading-hint="AI 正在根据岗位 JD 优化你的简历..."
          />
        </div>

        <div
          v-if="optimizeResult && !loading"
          class="mb-4 rounded-card border border-line/40 bg-white p-3 shadow-soft lg:p-4"
        >
        <p class="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
          <CheckCircleFilled class="text-success" /> 优化完成
        </p>
        <h4 class="mb-2 text-sm font-medium text-ink-secondary">AI 优化要点</h4>
        <ul class="space-y-2">
          <li
            v-for="(note, idx) in optimizeResult.optimization_notes"
            :key="idx"
            class="flex items-start gap-2 border-b border-dashed border-line/60 py-2 text-sm text-ink-secondary last:border-b-0"
          >
            <BulbOutlined class="mt-0.5 shrink-0 text-warning" />
            <span>{{ note }}</span>
          </li>
          <li v-if="!optimizeResult.optimization_notes?.length" class="py-2 text-sm text-muted">
            （AI 未返回优化要点）
          </li>
        </ul>
        </div>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="btn-ghost inline-flex h-10 items-center justify-center px-6"
            @click="handleCancel"
          >
            取消
          </button>
          <GradientButton
            class="inline-flex h-10 items-center justify-center px-6"
            :disabled="!optimizeResult || loading"
            @click="handleApply"
          >
            应用替换
          </GradientButton>
        </div>
      </div>
    </template>
  </a-modal>
</template>
