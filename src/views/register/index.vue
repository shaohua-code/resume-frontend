<script setup>
/**
 * 注册页 - 邮箱验证码 + 用户名 + 密码
 * H5 移动端优化：表单紧凑布局、触摸友好、安全区域适配
 * 支持 URL 参数 ?invite=code 携带邀请码，注册成功后绑定归属管理员
 */
import { onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import GlassCard from '@/components/GlassCard.vue'
import GradientButton from '@/components/GradientButton.vue'
import { createCountdown } from '../login/utils/countdown'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)
const sending = ref(false)
const codeCountdown = ref(0)
const countdown = createCountdown(60)

// 从 URL 读取邀请码
const inviteCode = ref(route.query.invite || '')

const form = reactive({
  email: '',
  code: '',
  username: '',
  password: '',
  confirmPassword: '',
})

function validateConfirmPassword(_rule, value) {
  if (!value) return Promise.reject(new Error('请再次输入密码'))
  if (value !== form.password) return Promise.reject(new Error('两次输入的密码不一致'))
  return Promise.resolve()
}

const rules = {
  email: [{ required: true, type: 'email', message: '请输入有效的邮箱地址' }],
  code: [{ required: true, message: '请输入邮箱验证码' }],

  username: [
    { required: true, message: '请输入用户名' },
    { min: 2, max: 32, message: '用户名长度需在 2-32 位之间' },
    { pattern: /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/, message: '用户名仅支持中英文/数字/下划线/中划线' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 72, message: '密码长度需在 6-72 位之间' },
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

// 发送验证码
async function handleSendCode() {
  if (!formRef.value || sending.value || countdown.isRunning()) return
  try {
    await formRef.value.validateFields(['email'])
  } catch {
    return
  }
  sending.value = true
  try {
    const res = await userStore.sendCode(form.email)
    if (res?.code) form.code = res.code
    countdown.start((val) => { codeCountdown.value = val })
  } finally {
    sending.value = false
  }
}

// 提交注册
async function handleRegister() {
  formRef.value.validateFields().then(async () => {
  submitting.value = true
  try {
    const res = await userStore.register({
      email: form.email,
      code: form.code,
      username: form.username,
      password: form.password,
      invite_code: inviteCode.value || undefined,
    })
    if (res?.need_verify) {
      message.info('请先完成邮箱验证码验证')
      router.push({ path: '/login', query: { email: form.email } })
    } else {
      router.push('/generate')
    }
    } finally {
      submitting.value = false
    }
  })
}

onUnmounted(() => countdown.stop())
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

    <!-- 卡片主体：移动端优化宽度和内边距 -->
    <GlassCard glow class="relative w-full max-w-[460px] animate-scale-in max-sm:max-w-[100%]">
      <!-- Logo 和标题区：移动端缩小 -->
      <div class="mb-5 text-center sm:mb-6">
        <img src="/vite.svg" alt="Logo" class="mx-auto mb-2.5 h-10 w-10 sm:mb-3 sm:h-12 sm:w-12" />
        <h2 class="mb-0.5 text-xl font-bold text-ink sm:mb-1 sm:text-2xl">注册账号</h2>
        <p class="text-xs text-ink-secondary sm:text-sm">先验证邮箱，再创建 AI 简历账号</p>
      </div>

      <!-- 表单区域：移动端紧凑布局 -->
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="register-form" @finish="handleRegister">
        <a-form-item label="邮箱" name="email" class="!mb-3 sm:!mb-5">
          <a-input v-model:value="form.email" placeholder="请输入有效邮箱" size="large" autocomplete="email" class="input-field" />
        </a-form-item>

        <a-form-item label="邮箱验证码" name="code" class="!mb-3 sm:!mb-5">
          <a-input v-model:value="form.code" placeholder="请输入邮箱验证码" size="large" class="input-field">
            <!-- 验证码按钮：增大点击区域（≥44x44pt）-->
            <template #suffix>
              <button
                type="button"
                class="text-xs code-button link-text disabled:text-muted"
                :disabled="codeCountdown > 0 || sending"
                @click="handleSendCode"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码' }}
              </button>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="用户名" name="username" class="!mb-3 sm:!mb-5">
          <a-input v-model:value="form.username" placeholder="请输入用户名" size="large" autocomplete="username" allow-clear class="input-field" />
        </a-form-item>

        <a-form-item label="密码" name="password" class="!mb-3 sm:!mb-5">
          <a-input-password v-model:value="form.password" placeholder="6-72 位，建议字母+数字组合" size="large" autocomplete="new-password" class="input-field" />
        </a-form-item>

        <a-form-item label="确认密码" name="confirmPassword" class="!mb-3 sm:!mb-5">
          <a-input-password v-model:value="form.confirmPassword" placeholder="请再次输入密码" size="large" autocomplete="new-password" class="input-field" />
        </a-form-item>

        <!-- 提交按钮：移动端高度适配 -->
        <a-form-item class="!mb-3 sm:!mb-4">
          <GradientButton block :loading="submitting" class="h-11 sm:h-12" @click="handleRegister">验证邮箱并注册</GradientButton>
        </a-form-item>
      </a-form>

      <!-- 底部链接 -->
      <div class="mt-3 text-xs text-center text-ink-secondary sm:mt-4 sm:text-sm">
        已有账号？<router-link to="/login" class="px-2 py-1 link-text">立即登录</router-link>
      </div>
    </GlassCard>
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

/* 表单区域：移动端紧凑布局 */
.register-form :deep(.ant-form-item) {
  @apply mb-3 sm:mb-5;
}

/* 输入框样式 */
:deep(.input-field .ant-input) {
  @apply bg-transparent;
}

/* 移动端输入框高度适配 */
@media (max-width: 640px) {
  .register-form :deep(.ant-input-lg) {
    height: 44px; /* 符合 Apple HIG 规范 */
  }
}

/* 验证码按钮：增大点击区域 */
.code-button {
  /* 最小触摸目标 44×44pt */
  min-width: 88px;
  min-height: 32px;
  padding: 6px 10px;
  margin: -6px -8px;

  /* 触摸反馈 */
  transition: opacity 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:active:not(:disabled) {
    opacity: 0.6;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
