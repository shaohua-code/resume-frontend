<script setup>
/**
 * 用户充值弹窗 - 分步流程：付款上传凭证 → 提交后展示管理员联系码
 * 文案按平台变量动态展示，移动端使用「截图到 XX」提示
 */
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { getRechargeInfo, submitRechargeRequest } from '@/api/wallet'
import { uploadFile, resolveUploadUrl } from '@/api/upload'
import { useMediaQuery } from '@/composables/useMediaQuery'
import GradientButton from '@/components/GradientButton.vue'

const open = defineModel('open', { type: Boolean, default: false })

const isMobile = useMediaQuery()
const loading = ref(false)
const submitting = ref(false)
const uploadingProof = ref(false)
const currentStep = ref(1)
const rechargeInfo = ref({
  payment_qrcode_url: '',
  contact_qrcode_url: '',
  payment_platform: '',
  contact_platform: '',
  admin_nickname: '',
})

// 用户填写的凭证与实付金额
const proofUrl = ref('')
const paidAmount = ref(null)

const modalWidth = computed(() => (isMobile.value ? '95vw' : 420))
const paymentUrl = computed(() => resolveUploadUrl(rechargeInfo.value.payment_qrcode_url))
const contactUrl = computed(() => resolveUploadUrl(rechargeInfo.value.contact_qrcode_url))
const proofPreviewUrl = computed(() => resolveUploadUrl(proofUrl.value))

/** 付款码平台展示文案 */
const paymentPlatformLabel = computed(() => rechargeInfo.value.payment_platform?.trim() || '')
/** 管理员联系码平台展示文案 */
const contactPlatformLabel = computed(() => rechargeInfo.value.contact_platform?.trim() || '')

/** Step1 付款提示：桌面端 / 移动端文案不同 */
const paymentTip = computed(() => {
  if (isMobile.value) {
    return paymentPlatformLabel.value
      ? `请截图到${paymentPlatformLabel.value}扫码完成付款`
      : '请截图扫码完成付款'
  }
  return paymentPlatformLabel.value
    ? `请${paymentPlatformLabel.value}扫码完成付款，上传支付凭证并填写实付金额`
    : '请扫码完成付款，上传支付凭证并填写实付金额'
})

/** Step2 联系管理员提示：桌面端 / 移动端文案不同 */
const contactTip = computed(() => {
  if (isMobile.value) {
    return contactPlatformLabel.value
      ? `截图到${contactPlatformLabel.value}添加管理员${contactPlatformLabel.value}，加快充值确认`
      : '截图添加管理员，加快充值确认'
  }
  return contactPlatformLabel.value
    ? `扫码添加管理员${contactPlatformLabel.value}，加快充值确认`
    : '扫码添加管理员，加快充值确认'
})

/** 重置弹窗状态 */
function resetForm() {
  currentStep.value = 1
  proofUrl.value = ''
  paidAmount.value = null
}

/** 拉取归属管理员的充值二维码与平台信息 */
async function fetchRechargeInfo() {
  loading.value = true
  try {
    const res = await getRechargeInfo()
    rechargeInfo.value = {
      payment_qrcode_url: res.data?.payment_qrcode_url || '',
      contact_qrcode_url: res.data?.contact_qrcode_url || '',
      payment_platform: res.data?.payment_platform || '',
      contact_platform: res.data?.contact_platform || '',
      admin_nickname: res.data?.admin_nickname || '',
    }
  } finally {
    loading.value = false
  }
}

/** 上传前校验：仅允许图片 */
function beforeUpload(file) {
  const isImage = /^image\/(jpeg|png|gif|webp)$/i.test(file.type)
  if (!isImage) {
    message.error('仅支持 JPG / PNG / GIF / WEBP 图片')
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    message.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

/** 上传支付凭证 */
async function handleProofUpload(file) {
  if (!beforeUpload(file)) return false
  if (uploadingProof.value) return false

  uploadingProof.value = true
  try {
    const uploaded = await uploadFile(file)
    const url = uploaded?.url || ''
    if (!url) {
      message.error('上传失败，请重试')
      return false
    }
    proofUrl.value = url
    message.success('凭证上传成功')
  } catch {
    message.error('上传失败，请重试')
  } finally {
    uploadingProof.value = false
  }
  return false
}

/** 提交充值凭证 */
async function handleSubmit() {
  if (!proofUrl.value) {
    message.warning('请上传支付凭证')
    return
  }
  const amount = Number(paidAmount.value)
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    message.warning('请输入大于 0 的实付金额')
    return
  }

  submitting.value = true
  try {
    const res = await submitRechargeRequest({
      proof_url: proofUrl.value,
      paid_amount: amount,
    })
    rechargeInfo.value = {
      ...rechargeInfo.value,
      contact_qrcode_url: res.data?.contact_qrcode_url || rechargeInfo.value.contact_qrcode_url,
      contact_platform: res.data?.contact_platform || rechargeInfo.value.contact_platform,
      admin_nickname: res.data?.admin_nickname || rechargeInfo.value.admin_nickname,
    }
    currentStep.value = 2
    message.success('凭证已提交，请等待管理员确认')
  } catch {
    // 错误提示由 request 拦截器统一处理
  } finally {
    submitting.value = false
  }
}

watch(open, (visible) => {
  if (visible) {
    resetForm()
    fetchRechargeInfo()
  }
})
</script>

<template>
  <a-modal
    v-model:open="open"
    title="账户充值"
    :footer="null"
    :width="modalWidth"
    centered
  >
    <a-spin :spinning="loading">
      <!-- Step 1：扫码付款 + 上传凭证 -->
      <div v-if="currentStep === 1" class="flex flex-col items-center gap-4 py-2">
        <div
          v-if="paymentUrl"
          class="flex w-full max-w-[280px] items-center justify-center overflow-hidden rounded-card border border-line/60 bg-canvas/50 p-3"
        >
          <img :src="paymentUrl" alt="付款码" class="w-full object-contain" />
        </div>
        <div v-else class="py-4 text-center text-sm text-muted">
          管理员暂未配置付款码
        </div>
        <p class="text-center text-sm leading-relaxed text-ink-secondary">
          {{ paymentTip }}
        </p>

        <!-- 支付凭证上传 -->
        <div class="flex w-full flex-col items-center gap-2">
          <div
            v-if="proofPreviewUrl"
            class="flex w-full max-w-[200px] items-center justify-center overflow-hidden rounded-card border border-line/60 bg-canvas/50 p-2"
          >
            <img :src="proofPreviewUrl" alt="支付凭证" class="w-full object-contain" />
          </div>
          <a-upload
            :show-upload-list="false"
            accept="image/*"
            :before-upload="handleProofUpload"
          >
            <button
              type="button"
              class="btn-ghost-sm inline-flex items-center gap-1.5"
              :disabled="uploadingProof"
            >
              <UploadOutlined />
              {{ proofUrl ? '更换凭证' : '上传支付凭证' }}
            </button>
          </a-upload>
        </div>

        <!-- 实付金额 -->
        <div class="w-full">
          <p class="mb-2 text-sm text-muted">实付金额 <span class="text-danger">*</span></p>
          <a-input-number
            v-model:value="paidAmount"
            :min="0.01"
            :step="0.01"
            class="w-full input-field"
            placeholder="请输入实际支付金额"
          />
        </div>

        <GradientButton
          class="w-full sm:w-auto"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交凭证
        </GradientButton>
      </div>

      <!-- Step 2：联系管理员 -->
      <div v-else class="flex flex-col items-center gap-4 py-2">
        <div class="w-full rounded-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
          凭证已提交，请等待管理员确认入账
        </div>
        <p v-if="rechargeInfo.admin_nickname" class="text-sm text-ink-secondary">
          管理员：{{ rechargeInfo.admin_nickname }}
        </p>
        <div
          v-if="contactUrl"
          class="flex w-full max-w-[280px] items-center justify-center overflow-hidden rounded-card border border-line/60 bg-canvas/50 p-3"
        >
          <img :src="contactUrl" alt="管理员二维码" class="w-full object-contain" />
        </div>
        <div v-else class="py-4 text-center text-sm text-muted">
          管理员暂未配置联系二维码
        </div>
        <p class="text-center text-xs text-muted">
          {{ contactTip }}
        </p>
      </div>
    </a-spin>
  </a-modal>
</template>
