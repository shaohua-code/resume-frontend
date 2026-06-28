<!--
  登录页
  两种登录方式 Tab 切换：
  1. 账号密码登录（用户名/邮箱 + 密码）
  2. 邮箱验证码登录（首次自动注册）
  底部提供注册链接
-->
<template>
  <!-- 外层全屏渐变背景容器 -->
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700 p-5">
    <!-- 登录卡片 -->
    <div class="w-[420px] rounded-xl bg-white p-10 shadow-2xl">
      <!-- 顶部 Logo + 标题 -->
      <div class="mb-6 text-center">
        <img src="/vite.svg" alt="Logo" class="mx-auto mb-3 h-12 w-12" />
        <h2 class="mb-1 text-2xl font-bold">AI简历助手</h2>
        <p class="text-sm text-gray-400">专业简历，让求职更简单</p>
      </div>

      <!-- 登录方式 Tab 切换 -->
      <a-tabs :active-key="activeTab" centered @change="activeTab = $event">
        <!-- Tab 1: 账号密码登录 -->
        <a-tab-pane key="password" tab="账号密码">
          <a-form
            :model="pwdForm"
            layout="vertical"
            class="mt-2"
            @finish="handlePasswordLogin"
          >
            <a-form-item
              label="用户名/邮箱"
              name="identifier"
              :rules="[{ required: true, message: '请输入用户名或邮箱' }]"
            >
              <a-input
                :value="pwdForm.identifier"
                placeholder="请输入用户名或邮箱"
                size="large"
                autocomplete="username"
                @update:value="pwdForm.identifier = $event"
              />
            </a-form-item>
            <a-form-item
              label="密码"
              name="password"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <a-input-password
                :value="pwdForm.password"
                placeholder="请输入密码"
                size="large"
                autocomplete="current-password"
                @update:value="pwdForm.password = $event"
              />
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="pwdLogging"
              >
                登录
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <!-- Tab 2: 邮箱验证码登录 -->
        <a-tab-pane key="code" tab="邮箱验证码">
          <a-form
            :model="codeForm"
            layout="vertical"
            class="mt-2"
            @finish="handleCodeLogin"
          >
            <a-form-item
              label="邮箱"
              name="email"
              :rules="[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]"
            >
              <a-input
                :value="codeForm.email"
                placeholder="请输入邮箱"
                size="large"
                @update:value="codeForm.email = $event"
              />
            </a-form-item>
            <a-form-item
              label="验证码"
              name="code"
              :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <a-input
                :value="codeForm.code"
                placeholder="请输入验证码"
                size="large"
                @update:value="codeForm.code = $event"
              >
                <template #suffix>
                  <a-button
                    type="link"
                    :disabled="codeCountdown > 0"
                    @click="handleSendCode"
                    :loading="sending"
                  >
                    {{ codeCountdown > 0 ? `${codeCountdown}s后重发` : '获取验证码' }}
                  </a-button>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="codeLogging"
              >
                登录
              </a-button>
            </a-form-item>
            <!-- 首次验证码登录会自动注册提示 -->
            <p class="-mt-2 text-center text-xs text-gray-400">首次使用将自动注册账号</p>
          </a-form>
        </a-tab-pane>
      </a-tabs>

      <!-- 底部注册引导 -->
      <div class="mt-4 text-center text-sm text-gray-400">
        还没有账号？<router-link to="/register" class="font-medium text-blue-600 hover:underline">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 当前激活的 Tab：password=账号密码 / code=邮箱验证码
const activeTab = ref('password')

// ===== Tab 1: 账号密码登录 =====
const pwdForm = reactive({ identifier: '', password: '' })
const pwdLogging = ref(false)

// 账号密码登录处理：调用 store 登录后跳转
async function handlePasswordLogin() {
  pwdLogging.value = true
  try {
    await userStore.loginWithPassword(pwdForm.identifier, pwdForm.password)
    const redirect = route.query.redirect || '/generate'
    router.push(redirect)
  } finally {
    pwdLogging.value = false
  }
}

// ===== Tab 2: 邮箱验证码登录 =====
const codeForm = reactive({ email: '', code: '' })
const sending = ref(false)
const codeLogging = ref(false)
const codeCountdown = ref(0)
let timer = null

// 发送验证码：调用后端发送邮件，同时启动 60s 倒计时
async function handleSendCode() {
  if (!codeForm.email) return
  sending.value = true
  try {
    const res = await userStore.sendCode(codeForm.email)
    // 开发环境下后端可能直接返回验证码，自动填入
    if (res?.code) {
      codeForm.code = res.code
    }
    // 启动 60s 倒计时，防止频繁发送
    codeCountdown.value = 60
    timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } finally {
    sending.value = false
  }
}

// 验证码登录处理：调用 store 登录后跳转
async function handleCodeLogin() {
  codeLogging.value = true
  try {
    await userStore.login(codeForm.email, codeForm.code)
    const redirect = route.query.redirect || '/generate'
    router.push(redirect)
  } finally {
    codeLogging.value = false
  }
}

// 组件卸载时清除倒计时定时器，避免内存泄漏
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* Ant Design Tabs 内部样式需要 :deep 穿透，Tailwind 无法替代 */
:deep(.ant-tabs-nav) {
  margin-bottom: 20px;
}
</style>
