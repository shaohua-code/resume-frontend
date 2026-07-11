<script setup>
/**
 * 忘记密码页（验证码重置方案）
 * 用户输入邮箱获取验证码，再输入验证码和新密码完成重置
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
const step = ref('send') // send: 发送验证码, reset: 设置新密码
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
    <h3 class="mb-1 text-lg font-semibold text-center text-ink">忘记密码</h3>
    <p class="mb-6 text-sm text-center text-ink-secondary">通过邮箱验证码重置密码</p>

    <a-form v-if="step === 'send'" :model="form" layout="vertical" @finish="handleSendCode">
      <a-form-item
        label="邮箱"
        name="email"
        :rules="[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]"
      >
        <a-input
          v-model:value="form.email"
          placeholder="请输入注册邮箱"
          size="large"
          autocomplete="email"
          class="input-field"
        />
      </a-form-item>
      <a-form-item>
        <GradientButton block html-type="submit" :loading="sending">获取验证码</GradientButton>
      </a-form-item>
    </a-form>

    <a-form v-else :model="form" layout="vertical" @finish="handleReset">
      <a-form-item label="邮箱" name="email">
        <a-input v-model:value="form.email" disabled size="large" class="input-field bg-canvas/50" />
      </a-form-item>
      <a-form-item
        label="验证码"
        name="code"
        :rules="[{ required: true, len: 6, message: '请输入 6 位验证码' }]"
      >
        <a-input
          v-model:value="form.code"
          placeholder="请输入验证码"
          size="large"
          maxlength="6"
          class="input-field"
        >
          <template #suffix>
            <button
              type="button"
              class="text-xs link-text disabled:text-muted"
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
      >
        <a-input-password
          v-model:value="form.confirmPassword"
          placeholder="请再次输入新密码"
          size="large"
          autocomplete="new-password"
          class="input-field"
        />
      </a-form-item>
      <a-form-item>
        <GradientButton block html-type="submit" :loading="resetting">确认重置</GradientButton>
      </a-form-item>
    </a-form>

    <template #footer>
      想起密码了？<router-link to="/login" class="link-text">返回登录</router-link>
    </template>
  </LoginCard>
</template>

<style scoped>
:deep(.input-field .ant-input) { @apply bg-transparent; }
</style>
