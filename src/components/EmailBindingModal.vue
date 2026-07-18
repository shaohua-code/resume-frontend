<!--
  全局邮箱绑定弹窗
  仅在服务端返回 EMAIL_BINDING_REQUIRED 后出现，绑定成功再释放原 AI 请求。
-->
<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { createCountdown } from '@/views/login/utils/countdown'
import {
  cancelEmailBinding,
  completeEmailBinding,
  emailBindingGateOpen,
} from '@/utils/emailBindingGate'

const userStore = useUserStore()
const formRef = ref(null)
const step = ref('email')
const sending = ref(false)
const binding = ref(false)
const countdownValue = ref(0)
const countdown = createCountdown(60)

// 弹窗只保留本次绑定所需数据，关闭后立即清空，不写入任何持久化存储。
const form = reactive({
  email: '',
  code: '',
})

const busy = computed(() => sending.value || binding.value)
const isCodeStep = computed(() => step.value === 'code')

// 每次门禁打开都创建干净流程；已有但未验证的邮箱仅用于减少重复输入。
watch(
  emailBindingGateOpen,
  (open) => {
    if (!open) return
    countdown.stop()
    countdownValue.value = 0
    step.value = 'email'
    form.email = userStore.userInfo.email || ''
    form.code = ''
  },
  { immediate: true },
)

/** 校验邮箱后发送验证码，频率限制与有效期由后端统一控制。 */
async function handleSendCode() {
  if (busy.value || countdown.isRunning()) return
  // 在异步校验前同步占用互斥位，阻止双击或回车并发发送。
  sending.value = true
  try {
    await formRef.value?.validateFields(['email'])
  } catch {
    sending.value = false
    return
  }

  try {
    await userStore.sendEmailBindingCode(form.email.trim())
    step.value = 'code'
    form.code = ''
    countdown.start((value) => {
      countdownValue.value = value
    })
  } finally {
    sending.value = false
  }
}

/** 验证并绑定邮箱；成功后全局门禁会让此前被拦截的 AI 操作自动续接。 */
async function handleBindEmail() {
  if (busy.value) return
  // 与发送步骤相同，先锁定再校验，避免同一验证码被并发提交。
  binding.value = true
  try {
    await formRef.value?.validateFields(['email', 'code'])
  } catch {
    binding.value = false
    return
  }

  try {
    const boundUser = await userStore.bindAccountEmail(form.email.trim(), form.code.trim())
    message.success('邮箱绑定成功，正在继续刚才的操作')
    completeEmailBinding(boundUser)
  } finally {
    binding.value = false
  }
}

/** 返回邮箱步骤时废弃当前验证码输入，避免验证码与新邮箱错配。 */
function handleBack() {
  if (busy.value) return
  countdown.stop()
  countdownValue.value = 0
  form.code = ''
  step.value = 'email'
}

/** 关闭弹窗代表放弃本次 AI 操作，页面仍保留原始表单内容。 */
function handleCancel() {
  if (busy.value) return
  countdown.stop()
  countdownValue.value = 0
  form.code = ''
  cancelEmailBinding()
}

onBeforeUnmount(() => countdown.stop())
</script>

<template>
  <Modal
    :open="emailBindingGateOpen"
    :width="480"
    :footer="null"
    :mask-closable="false"
    :keyboard="!busy"
    :closable="!busy"
    centered
    destroy-on-close
    title="绑定邮箱后继续使用 AI"
    wrap-class-name="email-binding-modal-wrap"
    @cancel="handleCancel"
  >
    <!-- 明确说明邮箱只在 AI 能力前强制绑定，非 AI 功能不受影响。 -->
    <div class="mb-5 rounded-card border border-brand/20 bg-brand-lighter/45 p-4">
      <p class="text-sm font-medium text-ink">
        {{ isCodeStep ? '验证码已发送，请完成验证' : '当前账号尚未绑定邮箱' }}
      </p>
      <p class="mt-1 text-xs leading-5 text-ink-secondary sm:text-sm">
        完成绑定后会自动继续刚才的 AI 操作，无需重新填写内容。
      </p>
    </div>

    <a-form ref="formRef" :model="form" layout="vertical" @finish="isCodeStep ? handleBindEmail() : handleSendCode()">
      <a-form-item
        label="邮箱"
        name="email"
        :rules="[{ required: true, type: 'email', message: '请输入有效的邮箱地址' }]"
        class="!mb-4"
      >
        <a-input
          v-model:value="form.email"
          :disabled="isCodeStep || busy"
          autocomplete="email"
          placeholder="请输入要绑定的邮箱"
          size="large"
          class="input-field"
        />
      </a-form-item>

      <!-- 第二步才渲染验证码字段，避免浏览器在发送前错误自动填充。 -->
      <a-form-item
        v-if="isCodeStep"
        label="验证码"
        name="code"
        :rules="[
          { required: true, message: '请输入邮箱验证码' },
          { pattern: /^\d{6}$/, message: '请输入 6 位数字验证码' },
        ]"
        class="!mb-2"
      >
        <a-input
          v-model:value="form.code"
          :disabled="busy"
          autocomplete="one-time-code"
          inputmode="numeric"
          maxlength="6"
          placeholder="请输入 6 位验证码"
          size="large"
          class="input-field"
        >
          <template #suffix>
            <button
              type="button"
              class="email-binding-resend link-text disabled:text-muted"
              :disabled="countdownValue > 0 || busy"
              @click="handleSendCode"
            >
              {{ countdownValue > 0 ? `${countdownValue}s 后重发` : '重新发送' }}
            </button>
          </template>
        </a-input>
      </a-form-item>

      <!-- 自定义底部在 375px 窄屏改为纵向，保证每个操作都有足够触控面积。 -->
      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn-ghost w-full sm:w-auto" :disabled="busy" @click="handleCancel">
          暂不绑定
        </button>
        <button
          v-if="isCodeStep"
          type="button"
          class="btn-ghost w-full sm:w-auto"
          :disabled="busy"
          @click="handleBack"
        >
          修改邮箱
        </button>
        <button
          type="submit"
          class="btn-primary w-full sm:min-w-[120px] sm:w-auto"
          :disabled="busy"
        >
          <span v-if="busy" class="email-binding-spinner" aria-hidden="true" />
          {{ isCodeStep ? (binding ? '验证中…' : '验证并继续') : (sending ? '发送中…' : '发送验证码') }}
        </button>
      </div>
    </a-form>
  </Modal>
</template>

<style scoped>
/* 验证码重发按钮保持 44px 触控区域，同时不挤压输入内容。 */
.email-binding-resend {
  min-width: 88px;
  min-height: 44px;
  margin: -8px -10px -8px 4px;
  padding: 8px 10px;
  font-size: 12px;
}

/* 原生主按钮复用全站视觉，局部补充轻量加载指示。 */
.email-binding-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: email-binding-spin 0.75s linear infinite;
}

@keyframes email-binding-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 小屏弹窗按钮占满宽度，输入框字体与高度由全局移动端规则统一兜底。 */
@media (max-width: 640px) {
  .email-binding-resend {
    min-width: 84px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .email-binding-spinner {
    animation-duration: 1.5s;
  }
}
</style>
