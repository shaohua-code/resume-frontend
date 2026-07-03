<!--
  上传 PDF 简历并 AI 优化页
  特性：
  1. 仅允许上传 PDF，限制 10MB
  2. 每个用户只保留一份（后端覆盖式存储）
  3. 上传成功后展示已存在的文件信息，可选择重新上传或删除
  4. 优化完成后将结果写入 resumeStore.currentResume，跳转到编辑器
-->
<template>
  <div class="min-h-[calc(100vh-64px)] animate-fade-in pb-10">
    <PageHero
      compact
      title="上传 PDF 简历，AI 一键优化"
      subtitle="上传你已有的 PDF 简历，填写优化方向后，AI 将按该方向提取信息并使用 STAR 法则重写"
    />

    <div class="relative z-10 mx-auto -mt-6 max-w-3xl px-4 sm:px-6">
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
        <div class="mt-4 flex justify-end">
          <button class="btn-danger" :disabled="deleting" @click="handleDelete">
            <DeleteOutlined /> 删除已上传的简历
          </button>
        </div>
      </a-card>

      <!-- 上传区域 -->
      <a-card class="card-base mb-4" :bordered="false">
        <template #title>
          <span class="flex items-center gap-2 text-base font-semibold text-ink">
            <CloudUploadOutlined class="text-brand-dark" /> {{ existingFile ? '替换上传（覆盖已有）' : '选择 PDF 简历' }}
          </span>
        </template>

        <a-form layout="vertical">
          <a-form-item label="优化方向（必填，AI 会按该方向优化）" required>
            <a-input
              v-model:value="targetPosition"
              placeholder="如：前端开发工程师 / 行政专员 / 财务会计 / 产品经理"
              size="large"
              allow-clear
              class="input-field"
            />
          </a-form-item>

          <a-upload-dragger
            v-model:fileList="fileList"
            :before-upload="beforeUpload"
            :max-count="1"
            accept="application/pdf"
            :disabled="uploading"
            class="glass-glow-inner rounded-card border border-dashed border-line/60 bg-white/50 transition-colors hover:border-brand/40"
          >
            <p class="ant-upload-drag-icon text-brand-dark">
              <InboxOutlined class="text-5xl" />
            </p>
            <p class="ant-upload-text text-base font-medium text-ink">点击或拖拽 PDF 文件到此处</p>
            <p class="ant-upload-hint text-sm text-muted">仅支持 PDF 格式，单个文件不超过 10MB</p>
          </a-upload-dragger>

          <div v-if="uploading" class="mt-4 rounded-card bg-cream p-4">
            <a-progress :percent="uploadPercent" status="active" stroke-color="#00D4FF" />
            <div class="mt-2 text-center text-sm text-muted">
              {{ uploadPercent < 100 ? `上传中 ${uploadPercent}%` : 'AI 正在优化中，请稍候...' }}
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
            <button class="btn-ghost w-full sm:w-auto" @click="$router.push('/')">
              取消
            </button>
            <GradientButton
              class="w-full sm:w-auto"
              :disabled="!fileList.length || !targetPosition.trim() || uploading"
              :loading="uploading"
              @click="handleSubmit"
            >
              <ThunderboltFilled /> 开始 AI 优化
            </GradientButton>
          </div>
        </a-form>
      </a-card>

      <!-- 优化结果 -->
      <a-card v-if="optimizeResult" class="mb-4 rounded-card border-0 bg-white shadow-card" :bordered="false">
        <template #title>
          <span class="flex items-center gap-2 text-base font-semibold text-ink">
            <CheckCircleFilled class="text-success" /> 优化完成
          </span>
        </template>

        <h3 class="mb-3 text-base font-semibold text-ink">AI 优化要点</h3>
        <ul class="space-y-2">
          <li v-for="(note, idx) in optimizeResult.optimization_notes" :key="idx" class="flex items-start gap-2 border-b border-dashed border-line/60 py-2 text-sm text-ink-secondary last:border-b-0">
            <BulbOutlined class="mt-0.5 text-warning" /> {{ note }}
          </li>
          <li v-if="!optimizeResult.optimization_notes?.length" class="py-2 text-sm text-muted">
            （AI 未返回优化要点）
          </li>
        </ul>

        <a-divider />

        <div class="flex justify-center">
          <GradientButton @click="goEditor">
            <EditOutlined /> 进入编辑器查看完整简历
          </GradientButton>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  FileDoneOutlined,
  CloudUploadOutlined,
  InboxOutlined,
  ThunderboltFilled,
  CheckCircleFilled,
  BulbOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import {
  uploadOptimizeResume,
  getUploadedResume,
  deleteUploadedResume,
  createResume as createApi,
} from '@/api/resume'
import { useResumeStore } from '@/stores/resume'
import PageHero from '@/components/PageHero.vue'
import GradientButton from '@/components/GradientButton.vue'

const router = useRouter()
const resumeStore = useResumeStore()

const fileList = ref([])
const targetPosition = ref('')
const uploading = ref(false)
const uploadPercent = ref(0)
const optimizeResult = ref(null)

const existingFile = ref(null) // 已上传的文件元信息
const deleting = ref(false)

// 拦截自动上传，仅记录到 fileList，由按钮统一触发
function beforeUpload(file) {
  if (file.size > 10 * 1024 * 1024) {
    message.error('文件大小不能超过 10MB')
    return false
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    message.error('仅支持 PDF 文件')
    return false
  }
  // 替换文件列表，只保留当前选择的一个
  fileList.value = [file]
  return false // 阻止 a-upload 自动上传
}

async function handleSubmit() {
  if (!targetPosition.value.trim()) {
    message.warning('请先填写优化方向')
    return
  }
  if (!fileList.value.length) {
    message.warning('请先选择 PDF 文件')
    return
  }
  const file = fileList.value[0]
  // a-upload 把原始 File 包了一层，取 originFileObj 或本身
  const realFile = file.originFileObj || file

  uploading.value = true
  uploadPercent.value = 0
  optimizeResult.value = null

  try {
    const res = await uploadOptimizeResume(realFile, targetPosition.value, (p) => {
      uploadPercent.value = p
    })
    if (res.success) {
      optimizeResult.value = res.data
      // 写入 store，供编辑器使用
      resumeStore.currentResume = res.data.resume
      // AI 优化成功后立即创建数据库记录，确保后续保存是 update
      try {
        const createRes = await createApi({
          title: (res.data.resume && res.data.resume.name ? `${res.data.resume.name}的简历` : '未命名简历'),
          resume_json: res.data.resume,
          template_id: resumeStore.currentTemplateId || 1,
          score: 0,
        })
        if (createRes.success && createRes.data?.id) {
          resumeStore.currentResumeId = createRes.data.id
        }
      } catch (createErr) {
        console.warn('[UploadOptimize] 自动创建简历失败，保存时将无法更新:', createErr)
      }
      message.success('AI 优化完成')
      // 刷新已上传文件信息
      await fetchExisting()
    }
  } catch (e) {
    // request 拦截器已弹出错误提示
  } finally {
    uploading.value = false
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
</script>

<style scoped>
/* 拖拽上传区内部文字颜色统一 */
:deep(.ant-upload-drag-icon) {
  @apply mb-2 text-brand-dark;
}

:deep(.ant-upload-text) {
  @apply text-base font-medium text-ink;
}

:deep(.ant-upload-hint) {
  @apply text-sm text-muted;
}
</style>
