<script setup>
/**
 * 首页 JD 输入模块 - 粘贴岗位描述后跳转生成页
 */
import { useRouter } from 'vue-router'
import { ThunderboltOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import GradientButton from '@/components/GradientButton.vue'
import { getCurrentSessionOwner } from '@/utils/emailBindingGate'

const router = useRouter()
const userStore = useUserStore()
const jdText = defineModel({ type: String, default: '' })

// 提交 JD 并跳转生成页
function handleSubmit() {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  // 先清理当前账号旧值；本次空输入也不能意外复用上一次导航失败留下的 JD。
  const owner = getCurrentSessionOwner()
  const pendingJdKey = owner ? `pending_jd:${owner}` : ''
  if (pendingJdKey) sessionStorage.removeItem(pendingJdKey)
  if (pendingJdKey && jdText.value.trim()) {
    sessionStorage.setItem(pendingJdKey, jdText.value.trim())
  }
  sessionStorage.removeItem('pending_jd')
  router.push('/generate')
}
</script>

<template>
  <div class="glass-glow mx-auto max-w-3xl text-left">
    <div class="glass-glow-inner px-4 py-5 sm:px-6 sm:py-6">
      <p class="mb-3 text-sm font-medium text-ink">JD 输入模块</p>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a-textarea
          v-model:value="jdText"
          :rows="2"
          placeholder="粘贴岗位 JD，AI 将为你定制匹配简历..."
          class="flex-1 rounded-button border-line bg-white/60 backdrop-blur-sm"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
        <GradientButton class="shrink-0" @click="handleSubmit">
          <ThunderboltOutlined />
          开始生成
        </GradientButton>
      </div>
    </div>
  </div>
</template>
