<script setup>
/**
 * 新用户三步指引：仅登录后、生成页、且存在 pending 标记时展示。
 * 文案对齐当前统一生成页（识别回填 + Tab 表单 + 底栏 AI）与编辑器导出流程。
 * 使用 Teleport 自建居中层，避免 a-modal 在窄屏被顶出视口。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  FileSearchOutlined,
  ThunderboltOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'
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

/** 步骤内容随产品形态维护；存储键版本见 newUserGuide.js */
const steps = [
  {
    shortTitle: '录入内容',
    title: '识别导入或直接填写',
    description: '上方可选「智能 PDF 识别」或「智能文字识别」把已有内容回填到表单；也可以跳过识别，用「基本信息 / 教育背景 / 经历」三个 Tab 直接填写。识别只整理原文事实，不会自动生成简历。',
    tip: '姓名与意向岗位是必填项；其他模块可按需补充，信息越完整生成质量越好。',
    icon: FileSearchOutlined,
    iconClass: 'bg-cyan-50 text-brand-dark',
  },
  {
    shortTitle: 'AI 生成',
    title: '用底栏按钮生成或按岗位优化',
    description: '检查表单无误后，点击底部「开始 AI 生成」整理成专业简历；若已有明确招聘要求，可用「按岗位优化简历」对照岗位强化表述。生成结果会留在本页，确认保存后再进入编辑器。',
    tip: '首次使用 AI 能力时需绑定并验证邮箱；余额不足时请先到用户中心充值。',
    icon: ThunderboltOutlined,
    iconClass: 'bg-violet-50 text-accent',
  },
  {
    shortTitle: '编辑导出',
    title: '进编辑器润色并导出投递版',
    description: '生成成功后进入编辑器，可改内容、切换 27 套模板、调整字体间距，并用评分/匹配等工具查漏补缺，预览满意后导出 PDF 或 Word。简历列表、用量与账户资料在「用户中心」统一管理。',
    tip: '导出前检查分页、联系方式和头像；投递前建议再对一下目标岗位关键词。',
    icon: EditOutlined,
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
  // 完成后滚到表单区域，方便立刻开始填写
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
            注册后首次进入生成页会看到本指引；步骤对应当前「识别 → AI 生成 → 编辑导出」流程。
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
