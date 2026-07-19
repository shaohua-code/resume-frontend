<!--
  头像上传组件
  通过统一上传接口获取 URL，绑定 resume.avatar；预览使用 a-image 支持点击放大
-->
<script setup>
import { computed, ref } from 'vue'
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import message from 'ant-design-vue/es/message'
import { uploadFile, resolveUploadUrl } from '@/api/upload'
import { getErrorMessage } from '@/utils/errorMessage'

const avatarUrl = defineModel({ type: String, default: '' })

const uploading = ref(false)

/** 可预览的绝对/可访问地址 */
const previewSrc = computed(() => (avatarUrl.value ? resolveUploadUrl(avatarUrl.value) : ''))

// 上传前校验：仅图片，最大 10MB
function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('头像仅支持图片格式')
    return false
  }
  if (file.size > 10 * 1024 * 1024) {
    message.error('图片大小不能超过 10MB')
    return false
  }
  handleUpload(file)
  return false
}

// 调用统一上传接口
async function handleUpload(file) {
  uploading.value = true
  try {
    const data = await uploadFile(file)
    avatarUrl.value = data.url || ''
    message.success('头像上传成功')
  } catch (e) {
    message.error(getErrorMessage(e, '头像上传失败'))
  } finally {
    uploading.value = false
  }
}

// 清除已上传头像
function removeAvatar() {
  avatarUrl.value = ''
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
      <!-- 有头像时用 a-image，点击可全屏预览 -->
      <a-image
        v-if="previewSrc"
        :src="previewSrc"
        :width="80"
        :height="80"
        alt="头像预览"
        class="avatar-preview-image h-full w-full"
        :preview="{ mask: '预览' }"
      />
      <LoadingOutlined v-else-if="uploading" class="text-xl text-brand" />
      <PlusOutlined v-else class="text-xl text-muted" />
    </div>
    <div class="flex flex-col gap-2">
      <a-upload
        :show-upload-list="false"
        accept="image/*"
        :before-upload="beforeUpload"
        :disabled="uploading"
      >
        <button type="button" class="btn-primary px-3 py-1 text-sm" :disabled="uploading">
          {{ avatarUrl ? '更换头像' : '上传头像' }}
        </button>
      </a-upload>
      <button
        v-if="avatarUrl"
        type="button"
        class="flex items-center gap-1 text-sm text-muted transition-colors hover:text-red-500"
        @click="removeAvatar"
      >
        <DeleteOutlined />
        删除头像
      </button>
      <p class="text-xs text-muted">支持 JPG/PNG/WebP，不上传则模板不显示头像，建议上传寸照；点击头像可预览</p>
    </div>
  </div>
</template>

<style scoped>
/* 圆形裁切与 a-image 内部 img 对齐 */
.avatar-preview-image :deep(.ant-image-img) {
  @apply h-20 w-20 rounded-full object-cover;
}

.avatar-preview-image :deep(.ant-image-mask) {
  @apply rounded-full;
}
</style>
