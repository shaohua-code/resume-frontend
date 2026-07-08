<!--
  头像上传组件
  通过统一上传接口获取 URL，绑定 resume.avatar
-->
<script setup>
import { ref } from 'vue'
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { uploadFile, resolveUploadUrl } from '@/api/upload'

const avatarUrl = defineModel({ type: String, default: '' })

const uploading = ref(false)

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
    message.error(e.response?.data?.detail || e.message || '头像上传失败')
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
      <img
        v-if="avatarUrl"
        :src="resolveUploadUrl(avatarUrl)"
        alt="头像预览"
        class="h-full w-full object-cover"
      >
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
      <p class="text-xs text-muted">支持 JPG/PNG/WebP，不上传则模板不显示头像，建议上传寸照</p>
    </div>
  </div>
</template>
