<script setup>
/**
 * 登录页 - 账号密码 / 邮箱验证码双 Tab
 * H5 移动端优化：Tab 栏触摸友好、表单间距优化、按钮高度适配
 * 随机注册账号默认使用账号密码登录，验证码登录仅服务于已绑定邮箱。
 */
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import GradientButton from '@/components/GradientButton.vue'
import LoginCard from './components/LoginCard.vue'
import { createCountdown } from './utils/countdown'
import { getIamLoginConfig, startIamLogin } from '@/api/auth'

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
const iamEnabled = ref(false)
const iamLogging = ref(false)
const iamErrorMessage = ref('')

/** 处理 IAM 回调的一次性桥接码；URL fragment 不会进入 HTTP 访问日志。 */
onMounted(async () => {
  const errorCode = String(route.query.iam_error || '')
  if (errorCode === 'identity_not_linked') {
    iamErrorMessage.value = '此统一账号尚未关联简历账号。请先用原账号登录，再到“用户中心-账户资料”完成绑定。'
  } else if (errorCode) {
    iamErrorMessage.value = '统一账号登录暂未完成，请重试或使用原登录方式。'
  }
  if (errorCode) {
    const safeQuery = { ...route.query }
    delete safeQuery.iam_error
    await router.replace({ path: '/login', query: safeQuery })
  }

  const code = new URLSearchParams(String(route.hash || '').replace(/^#/, '')).get('iam_code')
  if (code) {
    await router.replace({ path: '/login', query: route.query, hash: '' })
    try {
      await userStore.loginWithIamCode(code)
      await router.replace(route.query.redirect || '/')
    } catch {
      iamErrorMessage.value = '统一账号登录凭证已失效，请重新登录。'
    }
  }

  try {
    const config = await getIamLoginConfig()
    iamEnabled.value = config?.enabled === true
  } catch {
    iamEnabled.value = false
  }
})

/** 跳转到服务端 OIDC 授权入口；client secret 不进入浏览器。 */
async function handleIamLogin() {
  if (iamLogging.value) return
  iamLogging.value = true
  iamErrorMessage.value = ''
  try {
    const attempt = await startIamLogin()
    if (!attempt?.authorization_url) throw new Error('IAM login URL missing')
    window.location.assign(attempt.authorization_url)
  } catch {
    iamLogging.value = false
    iamErrorMessage.value = '统一账号登录暂不可用，请使用原登录方式。'
  }
}

// 账号密码登录
async function handlePasswordLogin() {
  pwdLogging.value = true
  try {
    await userStore.loginWithPassword(pwdForm.identifier, pwdForm.password)
    router.push(route.query.redirect || '/')
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
    router.push(route.query.redirect || '/')
  } finally {
    codeLogging.value = false
  }
}

onUnmounted(() => countdown.stop())
</script>

<template>
  <LoginCard>
    <!-- Tab 切换栏：移动端优化字体和间距 -->
    <a-tabs
      :active-key="activeTab"
      centered
      class="login-tabs"
      size="middle"
      @change="activeTab = $event"
    >
      <a-tab-pane key="password" tab="账号密码">
        <!-- 表单：移动端减小间距 -->
        <a-form :model="pwdForm" layout="vertical" class="login-form mt-1.5 sm:mt-2" @finish="handlePasswordLogin">
          <a-form-item label="账号/邮箱" name="identifier" :rules="[{ required: true, message: '请输入账号或已绑定邮箱' }]">
            <a-input v-model:value="pwdForm.identifier" placeholder="请输入系统账号或已绑定邮箱" size="large" autocomplete="username" class="input-field" />
          </a-form-item>
          <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
            <a-input-password v-model:value="pwdForm.password" placeholder="请输入密码" size="large" autocomplete="current-password" class="input-field" />
          </a-form-item>
          <a-form-item class="!mb-3 sm:!mb-4">
            <GradientButton block html-type="submit" :loading="pwdLogging" class="h-11 sm:h-12">登录</GradientButton>
          </a-form-item>
          <!-- 随机注册凭据是新用户的默认登录方式，避免误以为必须先绑定邮箱。 -->
          <p class="-mt-1 text-center text-xs text-muted sm:-mt-2">新账号请使用注册时生成的账号和密码登录</p>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="code" tab="邮箱验证码">
        <!-- 表单：移动端减小间距 -->
        <a-form :model="codeForm" layout="vertical" class="login-form mt-1.5 sm:mt-2" @finish="handleCodeLogin">
          <a-form-item label="邮箱" name="email" :rules="[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]">
            <a-input v-model:value="codeForm.email" placeholder="请输入邮箱" size="large" class="input-field" />
          </a-form-item>
          <a-form-item label="验证码" name="code" :rules="[{ required: true, message: '请输入验证码' }]">
            <a-input v-model:value="codeForm.code" placeholder="请输入验证码" size="large" class="input-field">
              <!-- 验证码按钮：移动端增大点击区域（≥44x44pt）-->
              <template #suffix>
                <button
                  type="button"
                  class="code-button text-xs link-text disabled:text-muted"
                  :disabled="codeCountdown > 0 || sending"
                  @click="handleSendCode"
                >
                  {{ codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码' }}
                </button>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item class="!mb-2 sm:!mb-4">
            <GradientButton block html-type="submit" :loading="codeLogging" class="h-11 sm:h-12">登录</GradientButton>
          </a-form-item>
          <!-- 邮箱验证码不再自动创建账号，只允许已完成绑定的用户登录。 -->
          <p class="-mt-1 text-center text-xs text-muted sm:-mt-2">仅已绑定邮箱的账号可使用验证码登录</p>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <div v-if="iamEnabled || iamErrorMessage" class="mt-4 flex flex-col gap-3">
      <a-alert v-if="iamErrorMessage" type="warning" show-icon :message="iamErrorMessage" />
      <div v-if="iamEnabled" class="flex items-center gap-3 text-xs text-muted">
        <span class="h-px flex-1 bg-line" />
        <span>统一身份认证</span>
        <span class="h-px flex-1 bg-line" />
      </div>
      <button
        v-if="iamEnabled"
        type="button"
        class="inline-flex min-h-11 w-full items-center justify-center rounded-button border border-brand/30 bg-brand-lighter/30 px-4 text-sm font-semibold text-brand-dark transition hover:bg-brand-lighter"
        :disabled="iamLogging"
        @click="handleIamLogin"
      >
        {{ iamLogging ? '正在跳转…' : '使用统一账号登录' }}
      </button>
    </div>

    <!-- 底部链接：移动端换行显示避免拥挤 -->
    <template #footer>
      <div class="flex flex-col items-center justify-center gap-1.5 text-xs sm:flex-row sm:gap-4 sm:text-sm">
        <router-link to="/forgot-password" class="link-text px-2 py-1">忘记密码？</router-link>
        <span class="hidden text-line sm:inline">|</span>
        <span>
          还没有账号？<router-link to="/register" class="link-text px-2 py-1">立即注册</router-link>
        </span>
      </div>
    </template>
  </LoginCard>
</template>

<style scoped>
/* Tab 栏样式优化 */
.login-tabs :deep(.ant-tabs-nav::before) {
  @apply border-line;
}

.login-tabs :deep(.ant-tabs-tab) {
  @apply px-4 py-2 text-sm font-medium text-ink-secondary;
  /* 移动端增大触摸目标 */
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.login-tabs :deep(.ant-tabs-tab-active) {
  @apply text-brand-dark;
}

.login-tabs :deep(.ant-tabs-ink-bar) {
  @apply bg-brand-dark;
}

/* 表单区域：移动端紧凑布局 */
.login-form :deep(.ant-form-item) {
  @apply mb-3 sm:mb-5;
}

/* 输入框样式 */
:deep(.input-field .ant-input) {
  @apply bg-transparent;
}

/* 移动端输入框高度适配 */
@media (max-width: 640px) {
  .login-form :deep(.ant-input-lg) {
    height: 44px; /* 符合 Apple HIG 规范 */
  }
}

/* 验证码按钮：增大点击区域 */
.code-button {
  /* 最小触摸目标 44×44pt */
  min-width: 88px;
  min-height: 32px;
  padding: 6px 10px;
  margin: -6px -8px; /* 抵消父元素 padding */

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
