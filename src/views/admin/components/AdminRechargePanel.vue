<script setup>
/**
 * 充值管理 - 上传付款码与管理员联系二维码（按当前管理员隔离）
 * 付款码与管理员码可分别配置平台；超管可编辑充值邮件模板
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import {
  getAdminRechargeConfig,
  saveAdminRechargeConfig,
  getRechargeEmailTemplates,
  saveRechargeEmailTemplates,
} from '@/api/admin'
import { uploadFile, resolveUploadUrl } from '@/api/upload'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isSuperAdmin = computed(() => userStore.role === 'SUPER_ADMIN')

const loading = ref(false)
const templateLoading = ref(false)
const templateSaving = ref(false)
const uploadingPayment = ref(false)
const uploadingContact = ref(false)
const savingPlatform = ref(false)

/** 当前管理员的二维码配置（含平台） */
const config = reactive({
  payment_qrcode_url: '',
  contact_qrcode_url: '',
  payment_platform: '',
  contact_platform: '',
})

/** 邮件模板配置（超管专属） */
const emailTemplates = reactive({
  admin_notify: { subject: '', html: '', text: '' },
  user_confirm: { subject: '', html: '', text: '' },
  placeholders: [],
})

/** 构建保存 payload，保留未修改字段 */
function buildSavePayload(overrides = {}) {
  return {
    payment_qrcode_url: config.payment_qrcode_url,
    contact_qrcode_url: config.contact_qrcode_url,
    payment_platform: config.payment_platform,
    contact_platform: config.contact_platform,
    ...overrides,
  }
}

/** 同步服务端返回的配置到本地 */
function applyConfig(data = {}) {
  config.payment_qrcode_url = data.payment_qrcode_url || ''
  config.contact_qrcode_url = data.contact_qrcode_url || ''
  config.payment_platform = data.payment_platform || ''
  config.contact_platform = data.contact_platform || ''
}

/** 加载当前管理员配置 */
async function loadConfig() {
  loading.value = true
  try {
    const res = await getAdminRechargeConfig()
    applyConfig(res.data)
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

/** 校验平台是否已填写 */
function ensurePlatform(type) {
  const platform = type === 'payment' ? config.payment_platform.trim() : config.contact_platform.trim()
  if (!platform) {
    message.warning(type === 'payment' ? '请先填写付款码平台' : '请先填写管理员二维码平台')
    return false
  }
  return true
}

/** 保存平台配置（失焦时保存，空值不提交） */
async function savePlatformField(type) {
  const platform = type === 'payment'
    ? config.payment_platform.trim()
    : config.contact_platform.trim()
  if (!platform) return
  if (savingPlatform.value) return
  savingPlatform.value = true
  try {
    const res = await saveAdminRechargeConfig(buildSavePayload())
    applyConfig(res.data)
    message.success(type === 'payment' ? '付款码平台已保存' : '管理员码平台已保存')
  } catch {
    message.error('平台保存失败，请重试')
  } finally {
    savingPlatform.value = false
  }
}

/** 上传并保存指定类型的二维码 */
async function handleUpload(type, file) {
  if (!ensurePlatform(type)) return false

  const loadingRef = type === 'payment' ? uploadingPayment : uploadingContact
  if (loadingRef.value) return false

  loadingRef.value = true
  try {
    const uploaded = await uploadFile(file)
    const url = uploaded?.url || ''
    if (!url) {
      message.error('上传失败，请重试')
      return false
    }

    const payload = type === 'payment'
      ? buildSavePayload({ payment_qrcode_url: url })
      : buildSavePayload({ contact_qrcode_url: url })

    const res = await saveAdminRechargeConfig(payload)
    applyConfig(res.data)
    message.success(type === 'payment' ? '付款码已更新' : '管理员二维码已更新')
  } catch {
    message.error('上传失败，请重试')
  } finally {
    loadingRef.value = false
  }

  return false
}

/** 拦截默认上传，改为手动上传并保存 */
async function handleBeforeUpload(type, file) {
  if (!beforeUpload(file)) return false
  await handleUpload(type, file)
  return false
}

/** 加载邮件模板（仅超管） */
async function loadEmailTemplates() {
  if (!isSuperAdmin.value) return
  templateLoading.value = true
  try {
    const res = await getRechargeEmailTemplates()
    emailTemplates.admin_notify = {
      subject: res.data?.admin_notify?.subject || '',
      html: res.data?.admin_notify?.html || '',
      text: res.data?.admin_notify?.text || '',
    }
    emailTemplates.user_confirm = {
      subject: res.data?.user_confirm?.subject || '',
      html: res.data?.user_confirm?.html || '',
      text: res.data?.user_confirm?.text || '',
    }
    emailTemplates.placeholders = res.data?.placeholders || []
  } finally {
    templateLoading.value = false
  }
}

/** 保存邮件模板（仅超管） */
async function saveEmailTemplates() {
  if (!isSuperAdmin.value) return
  templateSaving.value = true
  try {
    await saveRechargeEmailTemplates({
      admin_notify: emailTemplates.admin_notify,
      user_confirm: emailTemplates.user_confirm,
    })
    message.success('邮件模板已保存')
  } catch {
    // 错误提示由 request 拦截器统一处理
  } finally {
    templateSaving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadConfig(), loadEmailTemplates()])
})
</script>

<template>
  <a-spin :spinning="loading">
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-ink sm:text-xl">充值管理</h2>
      <p class="mt-1 text-sm text-muted">配置仅对您的归属用户生效，与其他管理员互不影响</p>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- 付款码 -->
      <a-card :bordered="false" class="card-base">
        <template #title>
          <span class="text-base font-semibold text-ink">付款码</span>
        </template>
        <div class="flex flex-col items-center gap-4">
          <!-- 付款码所属平台（与管理员码可不同） -->
          <div class="w-full max-w-[280px]">
            <p class="mb-2 text-sm text-muted">平台 <span class="text-danger">*</span></p>
            <a-input
              v-model:value="config.payment_platform"
              class="input-field"
              placeholder="如：微信、支付宝"
              @blur="savePlatformField('payment')"
            />
          </div>
          <div class="flex h-52 w-full max-w-[240px] items-center justify-center overflow-hidden rounded-card border border-dashed border-line/60 bg-canvas/50 sm:h-60">
            <img
              v-if="config.payment_qrcode_url"
              :src="resolveUploadUrl(config.payment_qrcode_url)"
              alt="付款码预览"
              class="h-full w-full object-contain p-2"
            />
            <div v-else class="px-4 text-center text-sm text-muted">请填写平台后上传付款二维码</div>
          </div>
          <a-upload
            :show-upload-list="false"
            accept="image/*"
            :before-upload="(file) => handleBeforeUpload('payment', file)"
          >
            <button
              type="button"
              class="btn-ghost-sm inline-flex items-center gap-1.5"
              :disabled="uploadingPayment"
            >
              <UploadOutlined />
              {{ config.payment_qrcode_url ? '更换付款码' : '上传付款码' }}
            </button>
          </a-upload>
        </div>
      </a-card>

      <!-- 管理员联系二维码 -->
      <a-card :bordered="false" class="card-base">
        <template #title>
          <span class="text-base font-semibold text-ink">管理员二维码</span>
        </template>
        <div class="flex flex-col items-center gap-4">
          <!-- 管理员联系码所属平台 -->
          <div class="w-full max-w-[280px]">
            <p class="mb-2 text-sm text-muted">平台 <span class="text-danger">*</span></p>
            <a-input
              v-model:value="config.contact_platform"
              class="input-field"
              placeholder="如：微信、QQ"
              @blur="savePlatformField('contact')"
            />
          </div>
          <div class="flex h-52 w-full max-w-[240px] items-center justify-center overflow-hidden rounded-card border border-dashed border-line/60 bg-canvas/50 sm:h-60">
            <img
              v-if="config.contact_qrcode_url"
              :src="resolveUploadUrl(config.contact_qrcode_url)"
              alt="管理员二维码预览"
              class="h-full w-full object-contain p-2"
            />
            <div v-else class="px-4 text-center text-sm text-muted">请填写平台后上传管理员联系二维码</div>
          </div>
          <a-upload
            :show-upload-list="false"
            accept="image/*"
            :before-upload="(file) => handleBeforeUpload('contact', file)"
          >
            <button
              type="button"
              class="btn-ghost-sm inline-flex items-center gap-1.5"
              :disabled="uploadingContact"
            >
              <UploadOutlined />
              {{ config.contact_qrcode_url ? '更换二维码' : '上传二维码' }}
            </button>
          </a-upload>
        </div>
      </a-card>
    </div>

    <!-- 超管专属：充值邮件模板编辑 -->
    <div v-if="isSuperAdmin" class="mt-6">
      <div class="mb-4">
        <h3 class="text-base font-semibold text-ink sm:text-lg">充值邮件模板</h3>
        <p class="mt-1 text-sm text-muted">
          占位符：
          <span
            v-for="item in emailTemplates.placeholders"
            :key="item"
            class="mr-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-muted"
          >
            {{ item }}
          </span>
        </p>
      </div>

      <a-spin :spinning="templateLoading">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- 管理员通知模板 -->
          <a-card :bordered="false" class="card-base">
            <template #title>
              <span class="text-base font-semibold text-ink">管理员通知邮件</span>
            </template>
            <div class="space-y-3">
              <div>
                <p class="mb-2 text-sm text-muted">邮件主题</p>
                <a-input v-model:value="emailTemplates.admin_notify.subject" class="input-field" />
              </div>
              <div>
                <p class="mb-2 text-sm text-muted">HTML 正文</p>
                <a-textarea
                  v-model:value="emailTemplates.admin_notify.html"
                  :rows="10"
                  class="input-field font-mono text-xs"
                />
              </div>
            </div>
          </a-card>

          <!-- 用户确认模板 -->
          <a-card :bordered="false" class="card-base">
            <template #title>
              <span class="text-base font-semibold text-ink">用户确认邮件</span>
            </template>
            <div class="space-y-3">
              <div>
                <p class="mb-2 text-sm text-muted">邮件主题</p>
                <a-input v-model:value="emailTemplates.user_confirm.subject" class="input-field" />
              </div>
              <div>
                <p class="mb-2 text-sm text-muted">HTML 正文</p>
                <a-textarea
                  v-model:value="emailTemplates.user_confirm.html"
                  :rows="10"
                  class="input-field font-mono text-xs"
                />
              </div>
            </div>
          </a-card>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="btn-primary"
            :disabled="templateSaving"
            @click="saveEmailTemplates"
          >
            {{ templateSaving ? '保存中...' : '保存邮件模板' }}
          </button>
        </div>
      </a-spin>
    </div>
  </a-spin>
</template>
