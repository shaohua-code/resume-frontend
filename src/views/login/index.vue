<script setup>
/**
 * 登录页 - 账号密码 / 邮箱验证码双 Tab
 */
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import GradientButton from '@/components/GradientButton.vue'
import LoginCard from './components/LoginCard.vue'
import { createCountdown } from './utils/countdown'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activeTab = ref('password')
const countdown = createCountdown(60)
const codeCountdown = ref(0)

const pwdForm = reactive({ identifier: '', password: '' })
const pwdLogging = ref(false)
const codeForm = reactive({ email: '', code: '' })
const sending = ref(false)
const codeLogging = ref(false)

// 账号密码登录
async function handlePasswordLogin() {
  pwdLogging.value = true
  try {
    await userStore.loginWithPassword(pwdForm.identifier, pwdForm.password)
    router.push(route.query.redirect || '/generate')
  } finally {
    pwdLogging.value = false
  }
}

// 发送验证码
async function handleSendCode() {
  if (!codeForm.email || countdown.isRunning()) return
  sending.value = true
  try {
    const res = await userStore.sendCode(codeForm.email)
    if (res?.code) codeForm.code = res.code
    countdown.start((val) => { codeCountdown.value = val })
  } finally {
    sending.value = false
  }
}

// 验证码登录
async function handleCodeLogin() {
  codeLogging.value = true
  try {
    await userStore.login(codeForm.email, codeForm.code)
    router.push(route.query.redirect || '/generate')
  } finally {
    codeLogging.value = false
  }
}

onUnmounted(() => countdown.stop())
</script>

<template>
  <LoginCard>
    <a-tabs :active-key="activeTab" centered class="login-tabs" @change="activeTab = $event">
      <a-tab-pane key="password" tab="账号密码">
        <a-form :model="pwdForm" layout="vertical" class="mt-2" @finish="handlePasswordLogin">
          <a-form-item label="用户名/邮箱" name="identifier" :rules="[{ required: true, message: '请输入用户名或邮箱' }]">
            <a-input v-model:value="pwdForm.identifier" placeholder="请输入用户名或邮箱" size="large" autocomplete="username" class="input-field" />
          </a-form-item>
          <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
            <a-input-password v-model:value="pwdForm.password" placeholder="请输入密码" size="large" autocomplete="current-password" class="input-field" />
          </a-form-item>
          <a-form-item>
            <GradientButton block html-type="submit" :loading="pwdLogging">登录</GradientButton>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="code" tab="邮箱验证码">
        <a-form :model="codeForm" layout="vertical" class="mt-2" @finish="handleCodeLogin">
          <a-form-item label="邮箱" name="email" :rules="[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]">
            <a-input v-model:value="codeForm.email" placeholder="请输入邮箱" size="large" class="input-field" />
          </a-form-item>
          <a-form-item label="验证码" name="code" :rules="[{ required: true, message: '请输入验证码' }]">
            <a-input v-model:value="codeForm.code" placeholder="请输入验证码" size="large" class="input-field">
              <template #suffix>
                <button type="button" class="link-text text-xs disabled:text-muted" :disabled="codeCountdown > 0 || sending" @click="handleSendCode">
                  {{ codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码' }}
                </button>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <GradientButton block html-type="submit" :loading="codeLogging">登录</GradientButton>
          </a-form-item>
          <p class="-mt-2 text-center text-xs text-muted">首次使用将自动注册账号</p>
        </a-form>
      </a-tab-pane>
    </a-tabs>
    <template #footer>
      还没有账号？<router-link to="/register" class="link-text">立即注册</router-link>
    </template>
  </LoginCard>
</template>

<style scoped>
.login-tabs :deep(.ant-tabs-nav::before) { @apply border-line; }
.login-tabs :deep(.ant-tabs-tab) { @apply text-sm font-medium text-ink-secondary; }
.login-tabs :deep(.ant-tabs-tab-active) { @apply text-brand-dark; }
.login-tabs :deep(.ant-tabs-ink-bar) { @apply bg-brand-dark; }
:deep(.input-field .ant-input) { @apply bg-transparent; }
</style>
