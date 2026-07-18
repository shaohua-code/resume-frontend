<script setup>
/**
 * 注册页 - 一键创建随机账号与密码
 * H5 移动端优化：信息聚焦、触摸友好、安全区域适配
 * 支持 URL 参数 ?invite=code 携带邀请码，注册成功后绑定归属管理员
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import GlassCard from '@/components/GlassCard.vue'
import GradientButton from '@/components/GradientButton.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const submitting = ref(false)
const credentialsModalOpen = ref(false)
const registrationCredentials = ref(null)

// 邀请码只随注册请求发送，不在页面或凭据弹窗中暴露具体值。
const inviteCode = ref(route.query.invite || '')

/** 提交无表单注册，并把一次性凭据仅保存在当前组件内存中。 */
async function handleRegister() {
  if (submitting.value || registrationCredentials.value) return
  submitting.value = true
  try {
    const res = await userStore.register(inviteCode.value)
    const account = String(res?.credentials?.account || '').trim()
    const password = String(res?.credentials?.password || '')
    if (!account || !password) {
      // 缺少一次性密码时不继续跳转，避免用户在未保存凭据的情况下离开页面。
      message.error('账号已创建，但服务端未返回完整登录凭据，请联系管理员')
      return
    }
    registrationCredentials.value = { account, password }
    credentialsModalOpen.value = true
  } finally {
    submitting.value = false
  }
}

/** 优先使用安全剪贴板，旧浏览器使用临时文本框完成同等复制。 */
async function copyText(text, successText) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const copied = document.execCommand('copy')
      textarea.remove()
      if (!copied) throw new Error('copy failed')
    }
    message.success(successText)
  } catch {
    message.error('复制失败，请手动复制并妥善保存')
  }
}

/** 一键复制使用清晰的双行格式，方便直接保存到密码管理器。 */
function copyAllCredentials() {
  if (!registrationCredentials.value) return
  const { account, password } = registrationCredentials.value
  void copyText(`账号：${account}\n密码：${password}`, '账号和密码已复制')
}

/** 用户确认保存后立即销毁内存中的明文密码，再进入简历生成页。 */
function handleCredentialsConfirmed() {
  credentialsModalOpen.value = false
  registrationCredentials.value = null
  router.push('/generate')
}

/** 刷新或关闭页面前触发浏览器保护，减少尚未保存的一次性密码被永久丢失。 */
function protectOneTimeCredentials(event) {
  if (!registrationCredentials.value) return
  event.preventDefault()
  event.returnValue = ''
}

// SPA 内部返回/跳转在用户明确确认保存前直接阻止，避免绕过不可关闭弹窗。
onBeforeRouteLeave(() => !registrationCredentials.value)
onMounted(() => window.addEventListener('beforeunload', protectOneTimeCredentials))

// 页面异常卸载时同样清空一次性密码，保证凭据不会跨页面驻留。
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', protectOneTimeCredentials)
  registrationCredentials.value = null
})
</script>

<template>
  <!-- 外层容器：添加安全区域适配和触摸优化 -->
  <div
    class="relative flex items-start justify-center min-h-screen p-3 overflow-hidden overflow-y-auto register-wrapper sm:p-6"
    style="background: var(--gradient-hero)"
    :style="{
      paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0))',
      paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0))',
    }"
  >
    <!-- 背景装饰光效：移动端缩小尺寸 -->
    <div class="absolute w-56 h-56 rounded-full pointer-events-none left-5 top-16 bg-white/20 blur-3xl sm:left-10 sm:top-20 sm:h-72 sm:w-72" />
    <div class="absolute w-64 h-64 rounded-full pointer-events-none bottom-10 right-5 bg-white/15 blur-3xl sm:bottom-20 sm:right-10 sm:h-96 sm:w-96" />

    <!-- 卡片主体：去除注册表单后聚焦“一键创建”和邮箱后置绑定说明。 -->
    <GlassCard glow class="relative w-full max-w-[460px] animate-scale-in max-sm:max-w-[100%]">
      <!-- Logo 和标题区：移动端缩小 -->
      <div class="mb-5 text-center sm:mb-6">
        <img src="/vite.svg" alt="Logo" class="mx-auto mb-2.5 h-10 w-10 sm:mb-3 sm:h-12 sm:w-12" />
        <h2 class="mb-0.5 text-xl font-bold text-ink sm:mb-1 sm:text-2xl">注册账号</h2>
        <p class="text-xs text-ink-secondary sm:text-sm">无需填写邮箱，系统为你生成安全登录凭据</p>
      </div>

      <!-- 注册规则说明：非 AI 功能可直接使用，AI 能力会在首次调用时要求绑定邮箱。 -->
      <div class="space-y-3 rounded-card border border-white/70 bg-white/55 p-4 shadow-soft backdrop-blur-sm sm:p-5">
        <div class="flex items-start gap-3">
          <span class="register-step">1</span>
          <div>
            <p class="text-sm font-medium text-ink">系统生成唯一账号和随机密码</p>
            <p class="mt-0.5 text-xs leading-5 text-ink-secondary">注册成功后只展示一次，请立即复制保存。</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="register-step">2</span>
          <div>
            <p class="text-sm font-medium text-ink">登录后可直接填写和管理简历</p>
            <p class="mt-0.5 text-xs leading-5 text-ink-secondary">使用 AI 识别、生成或优化时，再绑定并验证邮箱。</p>
          </div>
        </div>
      </div>

      <!-- 邀请链接存在时只提示已识别，不回显敏感的邀请码内容。 -->
      <p v-if="inviteCode" class="mt-3 rounded-button bg-mint/70 px-3 py-2 text-center text-xs text-emerald-700">
        已识别邀请链接，注册后将自动建立归属关系
      </p>

      <!-- 单一主操作降低移动端输入负担，后端负责账号唯一性与密码安全性。 -->
      <GradientButton block :loading="submitting" class="mt-5 h-11 sm:h-12" @click="handleRegister">
        {{ submitting ? '正在创建账号…' : '立即生成账号' }}
      </GradientButton>

      <!-- 底部链接 -->
      <div class="mt-3 text-xs text-center text-ink-secondary sm:mt-4 sm:text-sm">
        已有账号？<router-link to="/login" class="px-2 py-1 link-text">立即登录</router-link>
      </div>
    </GlassCard>

    <!-- 一次性凭据弹窗禁止点击遮罩关闭，避免用户误丢失不可再次查看的随机密码。 -->
    <Modal
      :open="credentialsModalOpen"
      :width="500"
      :footer="null"
      :closable="false"
      :keyboard="false"
      :mask-closable="false"
      centered
      title="账号创建成功"
      wrap-class-name="registration-credentials-modal"
    >
      <div v-if="registrationCredentials">
        <div class="mb-4 rounded-card border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p class="text-sm font-semibold">请立即保存账号和密码</p>
          <p class="mt-1 text-xs leading-5 sm:text-sm">密码仅在此处展示一次，关闭后无法再次查看。</p>
        </div>

        <!-- 账号和密码分开展示与复制，同时提供一键复制全部入口。 -->
        <div class="space-y-3">
          <div class="credential-row">
            <div class="min-w-0 flex-1">
              <p class="text-xs text-muted">账号</p>
              <p class="credential-value">{{ registrationCredentials.account }}</p>
            </div>
            <button
              type="button"
              class="btn-ghost-sm shrink-0"
              @click="copyText(registrationCredentials.account, '账号已复制')"
            >
              复制账号
            </button>
          </div>
          <div class="credential-row">
            <div class="min-w-0 flex-1">
              <p class="text-xs text-muted">密码</p>
              <p class="credential-value">{{ registrationCredentials.password }}</p>
            </div>
            <button
              type="button"
              class="btn-ghost-sm shrink-0"
              @click="copyText(registrationCredentials.password, '密码已复制')"
            >
              复制密码
            </button>
          </div>
        </div>

        <!-- 375px 窄屏采用纵向按钮，确保主要操作清晰且触控面积充足。 -->
        <div class="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" class="btn-ghost w-full" @click="copyAllCredentials">一键复制全部</button>
          <button type="button" class="btn-primary w-full" @click="handleCredentialsConfirmed">
            我已保存，开始制作简历
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* 移动端容器优化 */
.register-wrapper {
  /* iOS 平滑滚动 */
  -webkit-overflow-scrolling: touch;
  /* 防止橡皮筋效果 */
  overscroll-behavior: contain;
  /* 触摸反馈 */
  -webkit-tap-highlight-color: transparent;
  padding-top: 1rem;
}

/* 小屏幕下确保卡片不贴边 */
@media (max-width: 480px) {
  .register-wrapper {
    padding-left: 12px;
    padding-right: 12px;
  }
}

/* 两步说明使用固定圆形序号，长文案换行时保持稳定对齐。 */
.register-step {
  @apply inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-lighter text-xs font-semibold text-brand-dark;
}

/* 一次性凭据使用等宽字体，并允许超窄屏在任意字符处安全换行。 */
.credential-row {
  @apply flex items-center gap-3 rounded-card border border-line bg-canvas/70 p-3 sm:p-4;
}

.credential-value {
  margin-top: 4px;
  color: var(--color-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: anywhere;
  user-select: all;
}

/* 移动端凭据行改为纵向，避免复制按钮压缩账号和密码。 */
@media (max-width: 480px) {
  .credential-row {
    align-items: stretch;
    flex-direction: column;
  }

  .credential-row .btn-ghost-sm {
    width: 100%;
  }
}
</style>
