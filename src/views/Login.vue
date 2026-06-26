<!--
  登录页
  邮箱验证码登录，首次登录自动注册
  全屏居中卡片布局
-->
<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="/vite.svg" alt="Logo" class="login-logo" />
        <h2>AI简历助手</h2>
        <p>邮箱验证码登录，首次登录自动注册</p>
      </div>
      <a-form :model="form" layout="vertical" @finish="handleLogin" class="login-form">
        <a-form-item label="邮箱" name="email" :rules="[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]">
          <a-input v-model:value="form.email" placeholder="请输入邮箱" size="large" />
        </a-form-item>
        <a-form-item label="验证码" name="code" :rules="[{ required: true, message: '请输入验证码' }]">
          <a-input v-model:value="form.code" placeholder="请输入验证码" size="large">
            <template #suffix>
              <a-button type="link" :disabled="countdown > 0" @click="handleSendCode" :loading="sending">
                {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
              </a-button>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="logging">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({ email: '', code: '' })
const sending = ref(false)
const logging = ref(false)
const countdown = ref(0)
let timer = null

async function handleSendCode() {
  if (!form.email) {
    return
  }
  sending.value = true
  try {
    const res = await userStore.sendCode(form.email)
    // 开发环境下验证码直接返回，自动填入
    if (res?.code) {
      form.code = res.code
    }
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } finally {
    sending.value = false
  }
}

async function handleLogin() {
  logging.value = true
  try {
    await userStore.login(form.email, form.code)
    const redirect = route.query.redirect || '/generate'
    router.push(redirect)
  } finally {
    logging.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-logo {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}
.login-header h2 {
  font-size: 24px;
  margin-bottom: 4px;
}
.login-header p {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
