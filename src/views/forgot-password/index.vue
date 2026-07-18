<script setup>
/**
 * 忘记密码页（验证码重置方案）
 * H5 移动端优化：步骤清晰、表单紧凑、触摸友好、安全区域适配
 * 仅已绑定邮箱可获取验证码，再输入验证码和新密码完成重置
 */
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import LoginCard from '../login/components/LoginCard.vue'
import GradientButton from '@/components/GradientButton.vue'
import { resetPassword, updatePassword } from '@/api/auth'
import { createCountdown } from '../login/utils/countdown'

const router = useRouter()

const form = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
})
// 步骤状态：send=发送验证码, reset=设置新密码
const step = ref('send')
const sending = ref(false)
const resetting = ref(false)
const countdown = createCountdown(60)
const cd = ref(0)

onUnmounted(() => countdown.stop())

// 校验两次输入密码是否一致
function validateConfirmPassword(_rule, value) {
  if (!value) return Promise.reject(new Error('请再次输入新密码'))
  if (value !== form.password) return Promise.reject(new Error('两次输入的密码不一致'))
  return Promise.resolve()
}

// 发送重置验证码
async function handleSendCode() {
  if (!form.email || countdown.isRunning()) return
  sending.value = true
  try {
    await resetPassword(form.email)
    message.success('验证码已发送，请查收邮箱')
    step.value = 'reset'
    countdown.start((val) => { cd.value = val })
  } finally {
    sending.value = false
  }
}

// 提交新密码
async function handleReset() {
  if (form.password !== form.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  resetting.value = true
  try {
    await updatePassword(form.email, form.code, form.password)
    message.success('密码重置成功，请使用新密码登录')
    router.push('/login')
  } finally {
    resetting.value = false
  }
}
</script>

<template>
  <LoginCard>
    <!-- 标题区：移动端缩小尺寸 -->
    <h3 class="mb-1 text-center text-base font-semibold text-ink sm:text-lg">忘记密码</h3>
    <!-- 随机账号没有绑定邮箱时无法走找回流程，文案提前说明边界。 -->
    <p class="mb-4 text-center text-xs text-ink-secondary sm:mb-6 sm:text-sm">通过账号已绑定的邮箱重置密码</p>

    <!-- 步骤1：发送验证码 -->
    <a-form v-if="step === 'send'" :model="form" layout="vertical" class="forgot-form" @finish="handleSendCode">
      <a-form-item
        label="邮箱"
        name="email"
        :rules="[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]"
        class="!mb-4 sm:!mb-5"
      >
        <a-input
          v-model:value="form.email"
          placeholder="请输入账号已绑定的邮箱"
          size="large"
          autocomplete="email"
          class="input-field"
        />
      </a-form-item>
      <!-- 按钮：移动端高度适配 -->
      <a-form-item class="!mb-2 sm:!mb-4">
        <GradientButton block html-type="submit" :loading="sending" class="h-11 sm:h-12">获取验证码</GradientButton>
      </a-form-item>
    </a-form>

    <!-- 步骤2：设置新密码 -->
    <a-form v-else :model="form" layout="vertical" class="forgot-form" @finish="handleReset">
      <a-form-item label="邮箱" name="email" class="!mb-3 sm:!mb-5">
        <a-input v-model:value="form.email" disabled size="large" class="input-field bg-canvas/50" />
      </a-form-item>

      <a-form-item
        label="验证码"
        name="code"
        :rules="[{ required: true, len: 6, message: '请输入 6 位验证码' }]"
        class="!mb-3 sm:!mb-5"
      >
        <a-input
          v-model:value="form.code"
          placeholder="请输入验证码"
          size="large"
          maxlength="6"
          class="input-field"
        >
          <!-- 验证码按钮：增大点击区域（≥44x44pt）-->
          <template #suffix>
            <button
              type="button"
              class="code-button link-text text-xs disabled:text-muted"
              :disabled="cd > 0 || sending"
              @click="handleSendCode"
            >
              {{ cd > 0 ? `${cd}s 后重发` : '重新发送' }}
            </button>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label="新密码"
        name="password"
        :rules="[{ required: true, min: 6, max: 72, message: '密码长度需在 6-72 位之间' }]"
        class="!mb-3 sm:!mb-5"
      >
        <a-input-password
          v-model:value="form.password"
          placeholder="请输入新密码"
          size="large"
          autocomplete="new-password"
          class="input-field"
        />
      </a-form-item>

      <a-form-item
        label="确认新密码"
        name="confirmPassword"
        :rules="[{ required: true, validator: validateConfirmPassword }]"
        class="!mb-3 sm:!mb-5"
      >
        <a-input-password
          v-model:value="form.confirmPassword"
          placeholder="请再次输入新密码"
          size="large"
          autocomplete="new-password"
          class="input-field"
        />
      </a-form-item>

      <!-- 提交按钮：移动端高度适配 -->
      <a-form-item class="!mb-2 sm:!mb-4">
        <GradientButton block html-type="submit" :loading="resetting" class="h-11 sm:h-12">确认重置</GradientButton>
      </a-form-item>
    </a-form>

    <!-- 底部链接：移动端增加点击区域 -->
    <template #footer>
      <span class="px-2 py-1">
        想起密码了？<router-link to="/login" class="link-text px-2 py-1">返回登录</router-link>
      </span>
    </template>
  </LoginCard>
</template>

<style scoped>
/* 表单区域：移动端紧凑布局 */
.forgot-form :deep(.ant-form-item) {
  @apply mb-3 sm:mb-5;
}

/* 输入框样式 */
:deep(.input-field .ant-input) {
  @apply bg-transparent;
}

/* 移动端输入框高度适配 */
@media (max-width: 640px) {
  .forgot-form :deep(.ant-input-lg) {
    height: 44px; /* 符合 Apple HIG 规范 */
  }
}

/* 验证码按钮：增大点击区域（与登录页一致）*/
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
