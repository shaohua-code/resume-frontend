<template>
  <a-modal
    :open="open"
    :width="640"
    :footer="null"
    centered
    title="3 步完成第一份简历"
    wrap-class-name="new-user-guide-modal"
    @cancel="dismissGuide"
  >
    <p class="mb-5 text-sm leading-6 text-ink-secondary">
      第一次使用不用摸索，跟着下面的步骤即可完成生成、编辑和导出。
    </p>

    <a-steps :current="currentStep" size="small" class="mb-6">
      <a-step v-for="item in steps" :key="item.title" :title="item.shortTitle" />
    </a-steps>

    <section class="guide-content">
      <div class="guide-icon" :class="steps[currentStep].iconClass">
        <component :is="steps[currentStep].icon" />
      </div>
      <div class="min-w-0">
        <p class="text-base font-semibold text-ink">{{ steps[currentStep].title }}</p>
        <p class="mt-2 text-sm leading-6 text-ink-secondary">{{ steps[currentStep].description }}</p>
        <p class="mt-3 rounded-button bg-white/75 px-3 py-2 text-xs leading-5 text-brand-dark">
          {{ steps[currentStep].tip }}
        </p>
      </div>
    </section>

    <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" class="btn-ghost" @click="dismissGuide">跳过指引</button>
      <div class="flex gap-2">
        <button v-if="currentStep > 0" type="button" class="btn-ghost flex-1 sm:flex-none" @click="currentStep -= 1">
          上一步
        </button>
        <button v-if="currentStep < steps.length - 1" type="button" class="btn-primary flex-1 sm:flex-none" @click="currentStep += 1">
          下一步
        </button>
        <button v-else type="button" class="btn-primary flex-1 sm:flex-none" @click="finishGuide">
          开始制作
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FileSearchOutlined, FormOutlined, RocketOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import {
  completeNewUserGuide,
  hasPendingNewUserGuide,
  NEW_USER_GUIDE_PENDING_EVENT,
} from '@/utils/newUserGuide'

const userStore = useUserStore()
const route = useRoute()
const open = ref(false)
const currentStep = ref(0)

const steps = [
  {
    shortTitle: '准备内容',
    title: '选择最顺手的录入方式',
    description: '可以上传 PDF、粘贴已有文字，或直接在页面里填写。辅助识别后的内容仍然可以手动修改。',
    tip: '首次使用 AI 能力时，系统会引导你绑定并验证邮箱。',
    icon: FileSearchOutlined,
    iconClass: 'bg-cyan-50 text-brand-dark',
  },
  {
    shortTitle: '生成简历',
    title: '检查信息并生成简历',
    description: '补齐基本信息、教育经历、实习与项目，确认内容无误后点击生成，系统会为你整理成专业简历。',
    tip: '经历尽量写清“做了什么、怎么做、结果如何”，生成效果会更好。',
    icon: FormOutlined,
    iconClass: 'bg-violet-50 text-accent',
  },
  {
    shortTitle: '编辑导出',
    title: '进入编辑器完成最后调整',
    description: '生成后可继续修改内容、切换模板和调整字体间距，确认预览效果后导出 PDF 或 Word。',
    tip: '导出前建议检查分页和联系方式，确保投递版本完整无误。',
    icon: RocketOutlined,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
]

function closeAndRemember() {
  completeNewUserGuide(userStore.userInfo)
  open.value = false
}

function dismissGuide() {
  closeAndRemember()
}

function finishGuide() {
  closeAndRemember()
  window.requestAnimationFrame(() => {
    document.querySelector('form, [data-resume-form]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function syncGuideVisibility() {
  // 指引内容对应生成流程，只在登录后的生成页出现，不遮挡注册凭据、登录或后台页面。
  open.value = route.path === '/generate'
    && userStore.isLoggedIn
    && hasPendingNewUserGuide(userStore.userInfo)
}

onMounted(() => {
  window.addEventListener(NEW_USER_GUIDE_PENDING_EVENT, syncGuideVisibility)
  syncGuideVisibility()
})

onBeforeUnmount(() => window.removeEventListener(NEW_USER_GUIDE_PENDING_EVENT, syncGuideVisibility))
watch(() => route.path, syncGuideVisibility)
</script>

<style scoped>
.guide-content {
  @apply flex min-h-[178px] items-start gap-4 rounded-card border border-line/70 bg-gradient-to-br from-canvas/90 to-white p-4 sm:items-center sm:p-6;
}

.guide-icon {
  @apply inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-card text-xl shadow-sm sm:h-14 sm:w-14 sm:text-2xl;
}

:global(.new-user-guide-modal .ant-modal-content) {
  @apply overflow-hidden rounded-banner;
}

@media (max-width: 480px) {
  :global(.new-user-guide-modal .ant-modal) {
    max-width: calc(100vw - 24px);
  }
}
</style>
