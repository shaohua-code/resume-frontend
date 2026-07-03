<script setup>
/**
 * 注册页 - 邮箱验证码 + 用户名 + 密码
 */
import { onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import GlassCard from '@/components/GlassCard.vue'
import GradientButton from '@/components/GradientButton.vue'
import { createCountdown } from '../login/utils/countdown'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const submitting = ref(false)
const sending = ref(false)
const codeCountdown = ref(0)
const countdown = createCountdown(60)

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

  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 72, message: '密码长度需在 6-72 位之间' },
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

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

async function handleRegister() {
  submitting.value = true
  try {
    const res = await userStore.register({
      email: form.email,
      code: form.code,
      username: form.username,
      password: form.password,
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
}

onUnmounted(() => countdown.stop())
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6" style="background: var(--gradient-hero)">
    <div class="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
    <div class="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
    <GlassCard glow class="relative w-full max-w-[460px] animate-scale-in">
      <div class="mb-6 text-center">
        <img src="/vite.svg" alt="Logo" class="mx-auto mb-3 h-12 w-12" />
        <h2 class="mb-1 text-2xl font-bold text-ink">注册账号</h2>
        <p class="text-sm text-ink-secondary">先验证邮箱，再创建 AI 简历助手账号</p>
      </div>
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" @finish="handleRegister">
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="form.email" placeholder="请输入有效邮箱" size="large" autocomplete="email" class="input-field" />
        </a-form-item>
        <a-form-item label="邮箱验证码" name="code">
          <a-input v-model:value="form.code" placeholder="请输入邮箱验证码" size="large" class="input-field">
            <template #suffix>
              <button type="button" class="link-text text-xs disabled:text-muted" :disabled="codeCountdown > 0 || sending" @click="handleSendCode">
                {{ codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码' }}
              </button>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="form.username" placeholder="请输入用户名" size="large" autocomplete="username" allow-clear class="input-field" />
        </a-form-item>
        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="form.password" placeholder="6-72 位，建议字母+数字组合" size="large" autocomplete="new-password" class="input-field" />
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password v-model:value="form.confirmPassword" placeholder="请再次输入密码" size="large" autocomplete="new-password" class="input-field" />
        </a-form-item>
        <a-form-item>
          <GradientButton block :loading="submitting" @click="handleRegister">验证邮箱并注册</GradientButton>
        </a-form-item>
      </a-form>
      <div class="mt-4 text-center text-sm text-ink-secondary">
        已有账号？<router-link to="/login" class="link-text">立即登录</router-link>
      </div>
    </GlassCard>
  </div>
</template>

<style scoped>
:deep(.input-field .ant-input) { @apply bg-transparent; }
</style>
