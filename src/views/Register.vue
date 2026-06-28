<script setup>
/**
 * 注册页
 * 邮箱验证码 + 用户名 + 密码注册，后端会先校验邮箱验证码再创建可登录账号。
 */
import { onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const submitting = ref(false)
const sending = ref(false)
const codeCountdown = ref(0)
let timer = null

// 注册表单数据
const form = reactive({
  email: '',
  code: '',
  username: '',
  password: '',
  confirmPassword: '',
})

// 确认密码自定义校验：检查是否与密码一致
function validateConfirmPassword(_rule, value) {
  if (!value) {
    return Promise.reject(new Error('请再次输入密码'))
  }
  if (value !== form.password) {
    return Promise.reject(new Error('两次输入的密码不一致'))
  }
  return Promise.resolve()
}

// 表单校验规则
const rules = {
  email: [
    { required: true, type: 'email', message: '请输入有效的邮箱地址' },
  ],
  code: [
    { required: true, message: '请输入邮箱验证码' },
  ],
  username: [
    { required: true, message: '请输入用户名' },
    { min: 2, max: 32, message: '用户名长度需在 2-32 位之间' },
    {
      pattern: /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/,
      message: '仅支持中英文/数字/下划线/中划线',
    },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 72, message: '密码长度需在 6-72 位之间' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// 启动 60 秒验证码倒计时，防止频繁发送
function startCodeCountdown() {
  codeCountdown.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    codeCountdown.value -= 1
    if (codeCountdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

// 发送注册邮箱验证码：先校验邮箱，再调用后端发验证码并启动倒计时
async function handleSendCode() {
  if (!formRef.value || sending.value || codeCountdown.value > 0) return
  try {
    await formRef.value.validateFields(['email'])
  } catch {
    return
  }
  sending.value = true
  try {
    const res = await userStore.sendCode(form.email)
    // 开发环境后端可能直接返回验证码，便于联调
    if (res?.code) {
      form.code = res.code
    }
    startCodeCountdown()
  } catch (e) {
    console.error('[发送验证码失败]', e)
  } finally {
    sending.value = false
  }
}

// 注册处理：携带邮箱验证码，后端验证通过后设置密码并完成登录
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
      // 邮箱验证码已验证，注册成功后直接进入生成页
      router.push('/generate')
    }
  } catch (e) {
    console.error('[注册失败]', e)
  } finally {
    submitting.value = false
  }
}

// 组件卸载时清理倒计时定时器
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700 p-5">
    <div class="w-[440px] rounded-xl bg-white p-10 shadow-2xl">
      <div class="mb-6 text-center">
        <img src="/vite.svg" alt="Logo" class="mx-auto mb-3 h-12 w-12" />
        <h2 class="mb-1 text-2xl font-bold">注册账号</h2>
        <p class="text-sm text-gray-400">先验证邮箱，再创建 AI 简历助手账号</p>
      </div>

      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        class="mt-2"
        @finish="handleRegister"
      >
        <a-form-item label="邮箱" name="email">
          <a-input
            :value="form.email"
            placeholder="请输入有效邮箱"
            size="large"
            autocomplete="email"
            @update:value="form.email = $event"
          />
        </a-form-item>

        <a-form-item label="邮箱验证码" name="code">
          <a-input
            :value="form.code"
            placeholder="请输入邮箱验证码"
            size="large"
            @update:value="form.code = $event"
          >
            <template #suffix>
              <a-button
                type="link"
                :disabled="codeCountdown > 0"
                :loading="sending"
                @click="handleSendCode"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}s后重发` : '获取验证码' }}
              </a-button>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="用户名" name="username">
          <a-input
            :value="form.username"
            placeholder="2-32位，中英文/数字/下划线/中划线"
            size="large"
            autocomplete="username"
            allow-clear
            @update:value="form.username = $event"
          />
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password
            :value="form.password"
            placeholder="6-72位，建议字母+数字组合"
            size="large"
            autocomplete="new-password"
            @update:value="form.password = $event"
          />
        </a-form-item>

        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password
            :value="form.confirmPassword"
            placeholder="请再次输入密码"
            size="large"
            autocomplete="new-password"
            @update:value="form.confirmPassword = $event"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="submitting"
          >
            验证邮箱并注册
          </a-button>
        </a-form-item>
      </a-form>

      <div class="mt-4 text-center text-sm text-gray-400">
        已有账号？<router-link to="/login" class="font-medium text-blue-600 hover:underline">立即登录</router-link>
      </div>
    </div>
  </div>
</template>
