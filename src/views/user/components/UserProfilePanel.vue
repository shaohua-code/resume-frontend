<script setup>
/**
 * 账户资料面板：修改昵称、修改密码；未绑邮箱可发起绑定
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { getRoleLabel, getStatusLabel } from '@/constants/roles'
import { getErrorMessage } from '@/utils/errorMessage'
import { requestEmailBinding } from '@/utils/emailBindingGate'
import { changeUserPassword, getUserProfile, updateUserProfile } from '@/api/user'

const userStore = useUserStore()
const loading = ref(false)
const savingNickname = ref(false)
const savingPassword = ref(false)
const nicknameFormRef = ref(null)
const passwordFormRef = ref(null)

const profile = reactive({
  account: '',
  email: '',
  email_bound: false,
  nickname: '',
  role: 'USER',
  status: 'ACTIVE',
})

const nicknameForm = reactive({
  nickname: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isEmailBound = computed(() => (
  profile.email_bound === true || userStore.isEmailBound
))

const nicknameRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 32, message: '昵称长度为 1-32 个字符', trigger: 'blur' },
  ],
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 72, message: '新密码长度为 6-72 位', trigger: 'blur' },
  ],
  confirmPassword: [
    {
      required: true,
      validator: async (_rule, value) => {
        if (!value) throw new Error('请再次输入新密码')
        if (value !== passwordForm.newPassword) throw new Error('两次输入的密码不一致')
      },
      trigger: 'blur',
    },
  ],
}

/** 将接口资料同步到本地展示与表单 */
function applyProfile(data = {}) {
  profile.account = data.account || userStore.userInfo.account || ''
  profile.email = data.email || userStore.userInfo.email || ''
  profile.email_bound = data.email_bound === true || data.email_verified === true
  profile.nickname = data.nickname || userStore.userInfo.nickname || ''
  profile.role = data.role || userStore.role
  profile.status = data.status || userStore.userInfo.status || 'ACTIVE'
  nicknameForm.nickname = profile.nickname
}

/** 拉取最新资料并刷新 store 缓存 */
async function loadProfile() {
  loading.value = true
  try {
    const res = await getUserProfile()
    const data = res.data || res || {}
    applyProfile(data)
    userStore.patchUserInfo({
      account: data.account,
      email: data.email,
      email_verified: data.email_verified,
      email_bound: data.email_bound,
      nickname: data.nickname,
      role: data.role,
      status: data.status,
    })
  } catch (e) {
    // 接口失败时回退到本地缓存，保证页面仍可编辑昵称
    applyProfile(userStore.userInfo)
    message.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

/** 保存昵称 */
async function handleSaveNickname() {
  if (savingNickname.value) return
  savingNickname.value = true
  try {
    await nicknameFormRef.value?.validate()
  } catch {
    savingNickname.value = false
    return
  }
  try {
    const res = await updateUserProfile({ nickname: nicknameForm.nickname.trim() })
    const data = res.data || {}
    applyProfile(data)
    userStore.patchUserInfo({ nickname: data.nickname })
    message.success(res.message || '昵称已更新')
  } catch (e) {
    message.error(getErrorMessage(e))
  } finally {
    savingNickname.value = false
  }
}

/** 修改密码；成功后写入新会话令牌 */
async function handleChangePassword() {
  if (savingPassword.value) return
  savingPassword.value = true
  try {
    await passwordFormRef.value?.validate()
  } catch {
    savingPassword.value = false
    return
  }
  try {
    const res = await changeUserPassword(
      passwordForm.oldPassword,
      passwordForm.newPassword,
    )
    // 改密会使旧 refresh 失效，需用返回的新令牌续会话
    userStore.persistAuth(res)
    if (res.data) {
      applyProfile(res.data)
      userStore.patchUserInfo({
        nickname: res.data.nickname,
        email: res.data.email,
        email_bound: res.data.email_bound,
        email_verified: res.data.email_verified,
      })
    }
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value?.resetFields()
    message.success(res.message || '密码已更新')
  } catch (e) {
    message.error(getErrorMessage(e))
  } finally {
    savingPassword.value = false
  }
}

/** 打开全局邮箱绑定弹窗 */
async function handleBindEmail() {
  try {
    await requestEmailBinding()
    await loadProfile()
    message.success('邮箱绑定成功')
  } catch {
    // 用户取消绑定不提示错误
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="flex flex-col gap-4">
    <a-spin :spinning="loading">
      <!-- 账户只读信息 -->
      <div class="flex flex-col gap-4 rounded-card border border-line/60 bg-surface p-5 shadow-card md:p-6">
        <div>
          <p class="text-base font-semibold text-ink">基本信息</p>
          <p class="mt-1 text-xs text-muted">登录账号与邮箱由系统管理，昵称可自行修改。</p>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-muted">登录账号</span>
            <span class="text-sm font-medium text-ink">{{ profile.account || '—' }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-xs text-muted">角色 / 状态</span>
            <span class="text-sm font-medium text-ink">
              {{ getRoleLabel(profile.role) }} · {{ getStatusLabel(profile.status) }}
            </span>
          </div>
          <div class="flex flex-col gap-2 sm:col-span-2">
            <span class="text-xs text-muted">绑定邮箱</span>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span class="text-sm font-medium text-ink">
                {{ profile.email || '暂未绑定邮箱' }}
              </span>
              <button
                v-if="!isEmailBound"
                type="button"
                class="inline-flex min-h-10 w-fit items-center justify-center rounded-button border border-line bg-surface px-3 text-sm text-ink-secondary transition hover:border-brand/30 hover:bg-brand-lighter/50 hover:text-brand-dark"
                @click="handleBindEmail"
              >
                绑定邮箱
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 修改昵称 -->
      <div class="mt-4 flex flex-col gap-4 rounded-card border border-line/60 bg-surface p-5 shadow-card md:p-6">
        <div>
          <p class="text-base font-semibold text-ink">修改昵称</p>
          <p class="mt-1 text-xs text-muted">昵称将显示在用户中心与导航栏。</p>
        </div>
        <a-form
          ref="nicknameFormRef"
          :model="nicknameForm"
          :rules="nicknameRules"
          layout="vertical"
          @finish="handleSaveNickname"
        >
          <a-form-item label="昵称" name="nickname">
            <a-input
              v-model:value="nicknameForm.nickname"
              :maxlength="32"
              placeholder="请输入昵称"
              allow-clear
            />
          </a-form-item>
          <button
            type="submit"
            class="btn-primary min-h-10"
            :disabled="savingNickname"
          >
            {{ savingNickname ? '保存中…' : '保存昵称' }}
          </button>
        </a-form>
      </div>

      <!-- 修改密码 -->
      <div class="mt-4 flex flex-col gap-4 rounded-card border border-line/60 bg-surface p-5 shadow-card md:p-6">
        <div>
          <p class="text-base font-semibold text-ink">修改密码</p>
          <p class="mt-1 text-xs text-muted">
            修改成功后其他设备需重新登录；忘记密码可走登录页邮箱重置。
          </p>
        </div>
        <a-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          layout="vertical"
          @finish="handleChangePassword"
        >
          <a-form-item label="当前密码" name="oldPassword">
            <a-input-password
              v-model:value="passwordForm.oldPassword"
              placeholder="请输入当前密码"
              autocomplete="current-password"
            />
          </a-form-item>
          <a-form-item label="新密码" name="newPassword">
            <a-input-password
              v-model:value="passwordForm.newPassword"
              placeholder="6-72 位新密码"
              autocomplete="new-password"
            />
          </a-form-item>
          <a-form-item label="确认新密码" name="confirmPassword">
            <a-input-password
              v-model:value="passwordForm.confirmPassword"
              placeholder="请再次输入新密码"
              autocomplete="new-password"
            />
          </a-form-item>
          <button
            type="submit"
            class="btn-primary min-h-10"
            :disabled="savingPassword"
          >
            {{ savingPassword ? '提交中…' : '更新密码' }}
          </button>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>
