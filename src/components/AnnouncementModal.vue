<script setup>
/**
 * 登录用户在业务页首次展示生效中的版本公告。
 * 注册/登录/找回密码页即使已有会话也不弹，避免注册成功凭据弹窗被公告盖住。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Modal from 'ant-design-vue/es/modal'
import { getActiveAnnouncements } from '@/api/announcement'
import { useUserStore } from '@/stores/user'
import { hasSeenAnnouncement, markAnnouncementSeen } from '@/utils/announcementSeen'
import AnnouncementRichContent from '@/components/AnnouncementRichContent.vue'

/** 认证相关页面：不可展示版本公告 */
const AUTH_PATHS = ['/login', '/register', '/forgot-password']

const userStore = useUserStore()
const route = useRoute()
const open = ref(false)
const current = ref(null)

const isAuthPage = computed(() => AUTH_PATHS.some(
  (path) => route.path === path || route.path.startsWith(`${path}/`),
))

async function loadAndMaybeShow() {
  // 未登录或仍在注册/登录页时绝不请求与展示
  if (!userStore.isLoggedIn || isAuthPage.value) {
    open.value = false
    return
  }
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
watch(
  () => [userStore.isLoggedIn, route.path],
  ([loggedIn]) => {
    if (loggedIn) loadAndMaybeShow()
    else {
      open.value = false
      current.value = null
    }
  },
)
</script>

<template>
  <!-- 公告可能在轻量首页空闲阶段挂载，因此弹窗使用局部组件而不等待全局注册。 -->
  <Modal
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
    <div class="max-h-[60vh] overflow-y-auto">
      <AnnouncementRichContent :content="current?.content || ''" />
    </div>
    <div class="flex justify-end mt-5">
      <button type="button" class="btn-primary min-h-11 px-6" @click="handleClose">
        我知道了
      </button>
    </div>
  </Modal>
</template>
