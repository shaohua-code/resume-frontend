<script setup>
/**
 * 登录用户首次进入时展示生效中的版本公告（Markdown，禁 HTML）
 */
import { computed, onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import { getActiveAnnouncements } from '@/api/announcement'
import { useUserStore } from '@/stores/user'
import { hasSeenAnnouncement, markAnnouncementSeen } from '@/utils/announcementSeen'

const userStore = useUserStore()
const open = ref(false)
const current = ref(null)

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const htmlContent = computed(() => md.render(String(current.value?.content || '')))

async function loadAndMaybeShow() {
  if (!userStore.isLoggedIn) return
  try {
    const res = await getActiveAnnouncements()
    const items = res.items || []
    // 取最新一条未读公告
    const next = items.find((item) => !hasSeenAnnouncement(userStore.userInfo, item.id))
    if (next) {
      current.value = next
      open.value = true
    }
  } catch {
    // 公告失败不阻断主流程
  }
}

function handleClose() {
  if (current.value) markAnnouncementSeen(userStore.userInfo, current.value.id)
  open.value = false
}

onMounted(loadAndMaybeShow)
watch(() => userStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) loadAndMaybeShow()
  else {
    open.value = false
    current.value = null
  }
})
</script>

<template>
  <a-modal
    v-model:open="open"
    :title="current?.title || '版本公告'"
    :footer="null"
    :mask-closable="false"
    width="560px"
    @cancel="handleClose"
  >
    <div v-if="current?.version_label" class="mb-3 text-xs text-muted">
      版本 {{ current.version_label }}
    </div>
    <!-- Markdown 渲染区：html:false 防 XSS -->
    <div
      class="max-h-[60vh] overflow-y-auto text-sm leading-6 text-ink"
      v-html="htmlContent"
    />
    <div class="flex justify-end mt-5">
      <button type="button" class="btn-primary min-h-11 px-6" @click="handleClose">
        我知道了
      </button>
    </div>
  </a-modal>
</template>
