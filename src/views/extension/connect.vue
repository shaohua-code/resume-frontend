<script setup>
import { computed, onMounted, ref } from 'vue'
import { CheckCircle2, ShieldCheck } from 'lucide-vue-next'
import request from '@/utils/request'

const status = ref('ready')
const redirectUri = computed(() => new URLSearchParams(window.location.search).get('redirect_uri') || '')

async function connectExtension() {
  if (!redirectUri.value) {
    status.value = 'missing'
    return
  }

  status.value = 'working'
  try {
    const result = await request.post('/auth/extension/code', { redirect_uri: redirectUri.value })
    window.location.assign(result.redirect_url)
  } catch {
    status.value = 'missing'
  }
}

// 已登录用户直接签发一次性授权码。未登录用户会先经过现有路由守卫，登录后再自动继续。
onMounted(() => {
  void connectExtension()
})
</script>

<template>
  <main class="connect-page">
    <section class="connect-box">
      <div class="mark"><ShieldCheck :size="28" /></div>
      <p class="eyebrow">AI 简历浏览器扩展</p>
      <h1>连接你的求职工作台</h1>
      <p class="lead">扩展只会获得准备岗位所需的受限会话，不会读取网页端的登录凭据。</p>
      <div v-if="status === 'working'" class="success"><CheckCircle2 :size="20" /> 正在安全连接扩展…</div>
      <div v-else class="notice">缺少扩展回调地址，请从浏览器扩展中重新打开连接。</div>
    </section>
  </main>
</template>

<style scoped>
.connect-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:#eaf1ed;color:#18313a}.connect-box{max-width:480px;background:#fff;padding:44px;border:1px solid #d7e3db;border-radius:8px;box-shadow:0 16px 44px rgba(19,57,63,.09)}.mark{width:54px;height:54px;display:grid;place-items:center;background:#d9f0e7;color:#167861;border-radius:7px}.eyebrow{margin:25px 0 10px;color:#23836f;font-size:13px;font-weight:800}.connect-box h1{margin:0;font-size:30px;line-height:1.25}.lead{margin:17px 0 28px;color:#667b77;line-height:1.75}.success,.notice{display:flex;align-items:center;gap:6px;margin-top:16px;color:#718581;font-size:13px}.success{color:#177861;font-weight:700}.notice{padding:12px;background:#fff5d9;color:#84641d;border-radius:5px;line-height:1.6}@media(max-width:520px){.connect-box{padding:30px 24px}.connect-box h1{font-size:26px}}
</style>
