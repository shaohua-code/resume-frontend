<!--
  用户反馈弹窗
  富文本输入 + 图片上传，提交后由服务端转 Markdown 存储
-->
<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useUserStore } from '@/stores/user'
import { submitFeedback } from '@/api/feedback'
import { uploadFile, resolveUploadUrl } from '@/api/upload'
import { useMediaQuery } from '@/composables/useMediaQuery'

const open = defineModel({ type: Boolean, default: false })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isMobile = useMediaQuery('(max-width: 640px)')

const contentHtml = ref('')
const submitting = ref(false)
const editorRef = ref(null)

// Quill 工具栏配置
const toolbarOptions = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean'],
]

// 自定义图片上传：走统一上传接口
function imageHandler() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const data = await uploadFile(file)
      const quill = editorRef.value?.getQuill?.()
      if (!quill) return
      const range = quill.getSelection(true)
      const url = resolveUploadUrl(data.url)
      quill.insertEmbed(range.index, 'image', url)
      quill.setSelection(range.index + 1)
    } catch (e) {
      message.error(e.response?.data?.detail || '图片上传失败')
    }
  }
  input.click()
}

const editorOptions = {
  placeholder: '请描述您遇到的问题或建议，可插入图片…',
  modules: {
    toolbar: {
      container: toolbarOptions,
      handlers: { image: imageHandler },
    },
  },
}

watch(open, (val) => {
  if (!val) contentHtml.value = ''
})

function stripText(html) {
  return String(html || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}

async function handleSubmit() {
  if (!userStore.token) {
    message.warning('请先登录后再提交反馈')
    open.value = false
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  if (!stripText(contentHtml.value)) {
    message.warning('请输入反馈内容')
    return
  }

  submitting.value = true
  try {
    await submitFeedback(contentHtml.value)
    message.success('感谢您的反馈，我们会尽快处理')
    open.value = false
    contentHtml.value = ''
  } catch (e) {
    message.error(e.response?.data?.detail || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Modal
    v-model:open="open"
    title="意见反馈"
    :confirm-loading="submitting"
    ok-text="提交反馈"
    cancel-text="取消"
    :width="isMobile ? 'calc(100vw - 24px)' : 640"
    destroy-on-close
    @ok="handleSubmit"
  >
    <p class="mb-3 text-sm text-muted">欢迎提出产品建议或问题，支持富文本与图片。</p>
    <QuillEditor
      ref="editorRef"
      v-model:content="contentHtml"
      content-type="html"
      theme="snow"
      :options="editorOptions"
      class="feedback-quill-editor min-h-[200px] rounded-card border border-line bg-white"
    />
  </Modal>
</template>

<style scoped>
.feedback-quill-editor :deep(.ql-container) {
  min-height: 180px;
  font-size: 14px;
}
.feedback-quill-editor :deep(.ql-editor) {
  min-height: 180px;
}

@media (max-width: 640px) {
  .feedback-quill-editor :deep(.ql-toolbar) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .feedback-quill-editor :deep(.ql-container),
  .feedback-quill-editor :deep(.ql-editor) {
    min-height: 140px;
  }
}
</style>
