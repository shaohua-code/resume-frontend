<script setup>
/**
 * 新用户三步指引：仅登录后、生成页、且存在 pending 标记时展示。
 * 使用 Teleport 自建居中层，避免 a-modal 在窄屏被顶出视口只剩底部「跳过指引」。
 */
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
  currentStep.value = 0
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

/** 登录态 / 路由 / pending 任一不满足则立刻关闭，防止首页底部残留按钮。 */
function syncGuideVisibility() {
  const shouldOpen = route.path === '/generate'
    && userStore.isLoggedIn
    && !!userStore.token
    && hasPendingNewUserGuide(userStore.userInfo)
  open.value = shouldOpen
  if (!shouldOpen) currentStep.value = 0
}

onMounted(() => {
  window.addEventListener(NEW_USER_GUIDE_PENDING_EVENT, syncGuideVisibility)
  syncGuideVisibility()
})

onBeforeUnmount(() => {
  window.removeEventListener(NEW_USER_GUIDE_PENDING_EVENT, syncGuideVisibility)
  open.value = false
})

watch(
  () => [route.path, userStore.isLoggedIn, userStore.token, userStore.userInfo?.userId, userStore.userInfo?.account],
  syncGuideVisibility,
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-user-guide-title"
    >
      <!-- 遮罩：拦截底层页面点击，避免只露出底部按钮时仍可操作首页 -->
      <div class="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" @click="dismissGuide" />
      <div class="relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-banner bg-white shadow-float">
        <div class="shrink-0 border-b border-line/60 px-5 py-4 sm:px-6">
          <h2 id="new-user-guide-title" class="text-base font-semibold text-ink sm:text-lg">
            3 步完成第一份简历
          </h2>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <p class="mb-5 text-sm leading-6 text-ink-secondary">
            第一次使用不用摸索，跟着下面的步骤即可完成生成、编辑和导出。
          </p>
          <a-steps :current="currentStep" size="small" class="mb-6">
            <a-step v-for="item in steps" :key="item.title" :title="item.shortTitle" />
          </a-steps>
          <section class="flex items-start gap-4 rounded-card border border-line/70 bg-gradient-to-br from-canvas/90 to-white p-4 sm:items-center sm:p-6">
            <div
              class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-card text-xl shadow-sm sm:h-14 sm:w-14 sm:text-2xl"
              :class="steps[currentStep].iconClass"
            >
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
        </div>
        <div class="shrink-0 border-t border-line/60 px-5 py-4 sm:px-6">
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" class="btn-ghost" @click="dismissGuide">跳过指引</button>
            <div class="flex gap-2">
              <button
                v-if="currentStep > 0"
                type="button"
                class="btn-ghost flex-1 sm:flex-none"
                @click="currentStep -= 1"
              >
                上一步
              </button>
              <button
                v-if="currentStep < steps.length - 1"
                type="button"
                class="btn-primary flex-1 sm:flex-none"
                @click="currentStep += 1"
              >
                下一步
              </button>
              <button
                v-else
                type="button"
                class="btn-primary flex-1 sm:flex-none"
                @click="finishGuide"
              >
                开始制作
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
