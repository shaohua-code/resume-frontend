<!--
  智能识别生成简历面板
  Step0~Step2：自由文本填写 → AI 流式生成 → 预览编辑
-->
<template>
  <div class="mx-auto max-w-4xl">
    <a-card class="card-base mb-4" :bordered="false">
      <a-steps :current="currentStep" class="gen-steps">
        <a-step title="自由填写" description="键值对或分段描述均可" />
        <a-step title="AI 生成" description="智能解析并生成简历" />
        <a-step title="预览编辑" description="进入编辑器" />
      </a-steps>
    </a-card>

    <div class="animate-slide-up">
      <!-- Step0: 自由文本填写 -->
      <div v-show="currentStep === 0">
        <a-alert
          message="智能识别"
          description="支持任意格式填写，如「姓名：张三，学校：清华大学」。信息越完整，AI 生成质量越高。带 * 号的字段为必填项。"
          type="info"
          show-icon
          closable
          class="mb-4"
        />
        <a-card class="card-base mb-4" :bordered="false">
          <template #title>
            <span class="flex items-center gap-2 text-base font-semibold text-ink">
              <EditOutlined /> 简历信息（自由文本）
            </span>
          </template>
          <a-form layout="vertical">
            <a-form-item label="求职方向" required>
              <a-input
                v-model:value="targetPosition"
                placeholder="如：前端开发工程师 / 产品经理 / 数据分析"
                size="large"
                allow-clear
                class="input-field"
              />
            </a-form-item>
            <a-form-item label="简历内容" required>
              <a-textarea
                v-model:value="rawText"
                :rows="16"
                :maxlength="5000"
                show-count
                placeholder="请自由填写你的简历信息，例如：&#10;姓名：张三&#10;学校：清华大学&#10;专业：计算机科学与技术&#10;求职方向：前端开发工程师&#10;&#10;项目经历：&#10;1. 电商后台管理系统..."
                class="input-field lazy-textarea"
              />
            </a-form-item>
          </a-form>
          <div class="mt-2 flex justify-end">
            <button
              type="button"
              class="btn-ghost inline-flex h-9 items-center gap-1.5 rounded-button px-4 text-sm"
              @click="fillExample"
            >
              <FileTextOutlined /> 填入示例
            </button>
          </div>
        </a-card>

        <div class="flex justify-center p-4">
          <GradientButton
            class="inline-flex h-10 min-w-[160px] items-center justify-center gap-2"
            :loading="resumeStore.generating"
            @click="handleGenerate"
          >
            <ThunderboltOutlined v-if="!resumeStore.generating" />
            开始 AI 生成
          </GradientButton>
        </div>
      </div>

      <!-- Step1: AI 流式生成中 -->
      <div v-show="currentStep === 1">
        <a-card class="card-base mb-4 py-12 text-center" :bordered="false">
          <div class="mx-auto max-w-2xl">
            <div class="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <div class="absolute inset-0 animate-pulse rounded-full bg-brand/20 blur-xl" />
              <div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-lighter">
                <a-spin size="large" class="text-brand-dark" />
              </div>
            </div>
            <h2 class="mb-2 text-xl font-semibold text-brand-dark">AI 正在解析并生成专业简历...</h2>
            <p class="mb-2 text-sm text-muted">智能提取你的信息，用 STAR 法则优化项目描述</p>
            <div class="mb-6 flex items-center justify-center gap-1.5">
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand" style="animation-delay: 0ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand-light" style="animation-delay: 150ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-accent" style="animation-delay: 300ms" />
            </div>

            <div class="animate-fade-in rounded-card border border-line/50 bg-cream p-4 text-left sm:p-5">
              <StreamResumePreview
                :stream-text="resumeStore.streamText"
                :loading="resumeStore.generating"
              />
            </div>

            <div class="mt-6 rounded-card bg-cream p-5 text-left">
              <div
                v-for="(step, idx) in progressSteps"
                :key="idx"
                class="flex items-center gap-3 py-2 text-sm"
                :class="progressClass(idx)"
              >
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full text-xs"
                  :class="idx === progressIndex ? 'animate-spin' : ''"
                >
                  {{ idx < progressIndex ? '✓' : idx === progressIndex ? '⟳' : '○' }}
                </span>
                {{ step }}
              </div>
            </div>
            <p class="mt-6 text-xs text-warning">流式生成中，请耐心等待完成</p>
          </div>
        </a-card>
      </div>

      <!-- Step2: 生成成功 -->
      <div v-show="currentStep === 2">
        <a-card class="card-base mb-4 py-8" :bordered="false">
          <a-result
            status="success"
            title="🎉 简历生成成功！"
            sub-title="AI 已根据你的自由文本生成专业校招简历，前往编辑器进行预览、修改和导出"
          >
            <template #extra>
              <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <GradientButton class="inline-flex h-10 items-center" @click="goToEditor">
                  <EditOutlined /> 进入编辑器
                </GradientButton>
                <GradientButton ghost class="inline-flex h-10 items-center" @click="currentStep = 0">
                  <ReloadOutlined /> 重新生成
                </GradientButton>
              </div>
            </template>
          </a-result>
        </a-card>
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  EditOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { useResumeStore } from '@/stores/resume'
import GradientButton from '@/components/GradientButton.vue'
import StreamResumePreview from './StreamResumePreview.vue'

const router = useRouter()
const resumeStore = useResumeStore()

// 智能识别示例模板（键值对格式）
const EXAMPLE_TEMPLATE = `姓名：张三
学校：清华大学
专业：计算机科学与技术
学历：本科
求职方向：前端开发工程师
手机：13800138000
邮箱：zhang@example.com

技能：Vue3, JavaScript, TypeScript, Node.js

项目经历：
1. 电商后台管理系统 - 前端负责人
   技术栈：Vue3, Element Plus, Pinia
   2023.09 - 2024.06
   负责商品管理模块，优化列表渲染性能提升 40%

实习经历：
字节跳动 - 前端实习 - 2024.07 至 2024.12
参与组件库维护，封装 5+ 业务组件

获奖：2024 校级一等奖学金
证书：CET-6 550 分`

const currentStep = ref(0)
const rawText = ref('')
const targetPosition = ref('')

// 超过 5 份简历时的二次确认弹窗状态
const overLimitVisible = ref(false)
// 标记是否已确认超限，避免重复弹窗
const overLimitConfirmed = ref(false)

// 读取首页 JD 输入模块暂存的求职方向
onMounted(() => {
  const pendingJd = sessionStorage.getItem('pending_jd')
  if (pendingJd) {
    targetPosition.value = pendingJd
    sessionStorage.removeItem('pending_jd')
  }
})

const progressSteps = [
  '解析自由文本信息',
  '提取项目与实习经历',
  '生成个人评价中...',
  '整理技能标签',
]

// 根据流式文本长度估算进度
const progressIndex = computed(() => {
  if (currentStep.value !== 1) return progressSteps.length
  const len = resumeStore.streamText.length
  if (len > 800) return 3
  if (len > 400) return 2
  if (len > 100) return 1
  return 0
})

function progressClass(idx) {
  if (idx < progressIndex.value) return 'text-success'
  if (idx === progressIndex.value) return 'font-medium text-brand-dark'
  return 'text-muted'
}

// 一键填入示例模板
function fillExample() {
  rawText.value = EXAMPLE_TEMPLATE
  if (!targetPosition.value) {
    targetPosition.value = '前端开发工程师'
  }
  message.success('已填入示例，可直接生成或修改后生成')
}

// 校验输入并触发 AI 生成
async function handleGenerate() {
  const position = targetPosition.value.trim()
  if (!position) {
    message.warning('请填写求职方向')
    return
  }
  const text = rawText.value.trim()
  if (!text) {
    message.warning('请填写简历内容')
    return
  }
  if (text.length < 20) {
    message.warning('内容过短，请补充更多信息（至少 20 字）')
    return
  }

  // 超限检查：未确认过时，先检查简历数量
  if (!overLimitConfirmed.value) {
    await resumeStore.fetchResumeCount()
    if (resumeStore.resumeTotal >= resumeStore.resumeMaxCount) {
      overLimitVisible.value = true
      return
    }
  }

  currentStep.value = 1
  const result = await resumeStore.generateResume({
    input_mode: 'lazy',
    raw_text: text,
    target_position: position,
  })
  if (result) {
    currentStep.value = 2
    overLimitConfirmed.value = false
  } else {
    currentStep.value = 0
    overLimitConfirmed.value = false
  }
}

// 确认超限后继续生成
async function confirmOverLimit() {
  overLimitVisible.value = false
  overLimitConfirmed.value = true
  await handleGenerate()
}

function goToEditor() {
  router.push('/editor')
}
</script>

<style scoped>
:deep(.ant-card-head) {
  @apply border-b border-line/70 px-6;
}

:deep(.ant-card-body) {
  @apply px-4 py-5 sm:px-6;
}

:deep(.ant-form-item-label > label) {
  @apply text-sm font-medium text-ink-secondary;
}

:deep(.gen-steps .ant-steps-item-process .ant-steps-item-icon) {
  @apply border-brand-dark bg-brand-dark;
}

:deep(.gen-steps .ant-steps-item-finish .ant-steps-item-icon) {
  @apply border-brand-dark text-brand-dark;
}

:deep(.gen-steps .ant-steps-item-finish .ant-steps-item-tail::after) {
  @apply bg-brand;
}

:deep(.gen-steps .ant-steps-item-title) {
  @apply text-sm font-medium text-ink;
}

:deep(.gen-steps .ant-steps-item-description) {
  @apply text-xs text-muted;
}

/* 智能识别大文本框：更大书写区域 */
:deep(.lazy-textarea.ant-input-textarea-show-count) {
  @apply relative border-0 bg-transparent p-0 shadow-none;
}

:deep(.lazy-textarea textarea.ant-input) {
  @apply min-h-[320px] resize-y rounded-button border border-line bg-white/80 px-4 py-3 pb-8 text-sm leading-relaxed text-ink placeholder:text-muted transition-colors hover:border-brand/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15;
}

:deep(.lazy-textarea.ant-input-textarea-show-count::after) {
  @apply absolute bottom-3 right-3 text-xs text-muted;
}
</style>
