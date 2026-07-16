<!--
  基于岗位 JD 优化简历 — 共享弹窗组件
  inputOnly=true（默认）：纯输入弹窗，图片/文本二选一，确定后 emit confirm-start
  inputOnly=false（编辑器）：输入 → 弹窗内流式预览 → 应用替换
-->
<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import {
  BulbOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import StreamResumePreview from '@/views/generate/components/StreamResumePreview.vue'
import { useJdResumeOptimize } from '@/composables/useJdResumeOptimize'
import { extractJdFromImageStream } from '@/api/resume'
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
const jdImageUrl = ref('')

function revokeJdImageUrl() {
  if (jdImageUrl.value) {
    URL.revokeObjectURL(jdImageUrl.value)
    jdImageUrl.value = ''
  }
}

// 图片预览 URL（使用稳定 ObjectURL，避免重复创建与内存泄漏）
watch(jdImageFile, (file) => {
  revokeJdImageUrl()
  if (file) jdImageUrl.value = URL.createObjectURL(file)
})

onBeforeUnmount(revokeJdImageUrl)

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

const modalBodyStyle = computed(() => ({
  maxHeight: 'calc(100vh - 120px)',
  overflow: 'hidden',
}))

const modalContentClass = 'max-h-[calc(100vh-160px)] overflow-y-auto pr-1'

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
  if (jdImageFile.value) {
    message.info('已选择图片，请先删除后再重新上传')
    return false
  }
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

/** 清除已选图片，释放 ObjectURL 防止内存泄漏 */
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
    jdText.value = ''
    const data = await extractJdFromImageStream(jdImageFile.value, {
      onChunk: (chunk) => {
        jdText.value += chunk
      },
    })
    const text = (data?.jd_text || jdText.value).trim()
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
    :body-style="modalBodyStyle"
    class="modal-fresh"
    destroy-on-close
    @cancel="handleCancel"
  >
    <!-- 阶段1：JD 输入（文本与图片二选一） -->
    <div :class="modalContentClass">
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
            <span class="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              <PictureOutlined /> 或上传 JD 图片
            </span>
          </template>

          <!-- 图片上传区域：支持点击和拖拽 -->
          <div
            class="group relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300"
            :class="jdImageFile ? 'border-success/50 bg-emerald-50/30' : 'cursor-pointer border-line/60 bg-gradient-to-b from-brand-lighter/20 to-cream/50 hover:border-brand/60 hover:from-brand-lighter/40'"
          >
            <!-- 未选图片：上传入口 -->
            <div v-if="!jdImageFile" class="flex w-full flex-col items-center gap-2 py-6 sm:py-8">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand/15 group-hover:scale-110">
                <UploadOutlined class="text-xl" />
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-ink">点击或拖拽上传 JD 截图</p>
                <p class="mt-1 text-xs text-muted">支持 JPG、PNG、WebP，最大 10MB</p>
              </div>
              <span class="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs text-brand">
                <ThunderboltOutlined /> AI 智能识别
              </span>
            </div>

            <!-- 已选图片：预览 + 信息 -->
            <div v-else class="flex w-full items-center gap-4 p-4">
              <a-image
                :src="jdImageUrl"
                alt="JD 预览"
                :width="64"
                :height="64"
                class="shrink-0 overflow-hidden rounded-lg object-cover ring-1 ring-black/5"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-ink">{{ jdImageName }}</p>
                <p class="mt-0.5 text-xs text-success">已选择，可点击图片预览</p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-danger"
                @click.stop="clearJdImage"
              >
                <DeleteOutlined />
              </button>
            </div>

            <!-- 隐藏的上传触发器，覆盖整个区域 -->
            <a-upload
              v-if="!jdImageFile"
              accept="image/*"
              :show-upload-list="false"
              :before-upload="handleImageBeforeUpload"
              class="absolute inset-0 [&_.ant-upload]:h-full [&_.ant-upload]:w-full [&_.ant-upload]:cursor-pointer"
            >
              <div class="h-full w-full"></div>
            </a-upload>
          </div>

          <p class="mt-2 text-xs text-muted">文本与图片二选一必填，仅上传图片时将自动 OCR 识别内容</p>
        </a-form-item>
      </a-form>

      <div class="flex flex-col-reverse gap-3 mt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center h-10 px-6 btn-ghost"
          @click="handleCancel"
        >
          取消
        </button>
        <GradientButton
          class="inline-flex items-center justify-center h-10 px-6"
          :loading="extracting"
          @click="handleConfirm"
        >
          {{ extracting ? '识别中' : '确定' }}
        </GradientButton>
      </div>
    </template>

    <!-- 阶段2：流式预览 + 优化要点（仅编辑器 inputOnly=false） -->
    <template v-else>
      <div>
        <div
          ref="streamPreviewAnchorRef"
          class="p-2 mb-4 border rounded-card border-line/50 bg-cream lg:p-4"
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
          class="p-3 mb-4 bg-white border rounded-card border-line/40 shadow-soft lg:p-4"
        >
        <p class="flex items-center gap-2 mb-3 text-base font-semibold text-ink">
          <CheckCircleFilled class="text-success" /> 优化完成
        </p>
        <h4 class="mb-2 text-sm font-medium text-ink-secondary">AI 优化要点</h4>
        <ul class="space-y-2">
          <li
            v-for="(note, idx) in optimizeResult.optimization_notes"
            :key="idx"
            class="flex items-start gap-2 py-2 text-sm border-b border-dashed border-line/60 text-ink-secondary last:border-b-0"
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
            class="inline-flex items-center justify-center h-10 px-6 btn-ghost"
            @click="handleCancel"
          >
            取消
          </button>
          <GradientButton
            class="inline-flex items-center justify-center h-10 px-6"
            :disabled="!optimizeResult || loading"
            @click="handleApply"
          >
            应用替换
          </GradientButton>
        </div>
      </div>
    </template>
    </div>
  </a-modal>
</template>
