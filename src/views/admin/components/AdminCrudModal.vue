<script setup>
/**
 * 管理端公告 / 模型表单弹窗；公告内容使用 Quill 富文本，下方实时预览。
 */
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { uploadFile, resolveUploadUrl } from '@/api/upload'
import AnnouncementRichContent from '@/components/AnnouncementRichContent.vue'

const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  type: {
    type: String,
    default: 'announcements',
  },
  title: {
    type: String,
    default: '',
  },
  form: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit', 'update:form'])
const editorRef = ref(null)

// 长表单在小屏使用视口安全宽度和内部滚动，避免按钮或字段被屏幕边缘裁切。
const isMobile = useMediaQuery()
const modalWidth = computed(() => {
  if (isMobile.value) return 'calc(100vw - 24px)'
  // 公告富文本需要更宽编辑区
  return props.type === 'announcements' ? 720 : 520
})
const modalBodyStyle = computed(() => ({
  maxHeight: isMobile.value ? 'calc(100vh - 120px)' : '70vh',
  overflowY: 'auto',
  padding: isMobile.value ? '16px' : undefined,
}))

/** 公告工具栏：标题、列表、链接与图片 */
const announcementToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean'],
]

function announcementImageHandler() {
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

const announcementEditorOptions = {
  placeholder: '请输入公告内容，支持标题、列表、链接与图片…',
  modules: {
    toolbar: {
      container: announcementToolbar,
      handlers: { image: announcementImageHandler },
    },
  },
}

// 预置常用值，同时允许直接输入新供应商或新模型类型，为后续扩展保留入口。
const providerOptions = [
  { value: 'deepseek' },
  { value: 'dashscope' },
]
const modelTypeOptions = [
  { value: 'text', label: '文本模型' },
  { value: 'audio', label: '语音模型' },
  { value: 'vision', label: '视觉模型' },
  { value: 'omni', label: '全模态模型' },
  { value: 'embedding', label: '向量模型' },
]
const thinkingOptions = [
  { value: 'default', label: '默认（使用供应商默认）' },
  { value: 'true', label: '开启深度思考' },
  { value: 'false', label: '关闭深度思考' },
]

function toThinkingOption(value) {
  if (value === true) return 'true'
  if (value === false) return 'false'
  return 'default'
}

function updateThinking(value) {
  // null means do not send enable_thinking, so models without this parameter stay compatible.
  const mapped = value === 'default' ? null : value === 'true'
  updateField('thinking_enabled', mapped)
}

function updateField(key, value) {
  emit('update:form', { ...props.form, [key]: value })
}
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    :footer="null"
    :width="modalWidth"
    :body-style="modalBodyStyle"
    destroy-on-close
    @update:open="open = $event"
  >
    <a-form layout="vertical">
      <template v-if="type === 'announcements'">
        <a-form-item label="标题">
          <a-input :value="form.title" class="input-field" @update:value="updateField('title', $event)" />
        </a-form-item>
        <a-form-item label="版本号（可选）">
          <a-input
            :value="form.version_label"
            class="input-field"
            placeholder="如 v1.2.0"
            @update:value="updateField('version_label', $event)"
          />
        </a-form-item>
        <a-form-item label="内容（富文本）">
          <QuillEditor
            ref="editorRef"
            :content="form.content || ''"
            content-type="html"
            theme="snow"
            :options="announcementEditorOptions"
            class="announcement-quill-editor min-h-[220px] rounded-card border border-line bg-white"
            @update:content="updateField('content', $event)"
          />
        </a-form-item>
        <!-- 与用户端一致的富文本预览，编辑时即时可见 -->
        <a-form-item label="预览效果">
          <div class="max-h-56 overflow-y-auto rounded-card border border-line/70 bg-cream/40 px-4 py-3">
            <AnnouncementRichContent
              v-if="form.content"
              :content="form.content"
            />
            <p v-else class="text-sm text-muted">输入内容后在此预览用户端展示效果</p>
          </div>
        </a-form-item>
        <a-form-item label="生效开始时间">
          <a-date-picker
            show-time
            class="w-full"
            :value="form.start_at"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            placeholder="留空表示立即生效"
            @update:value="updateField('start_at', $event || null)"
          />
        </a-form-item>
        <a-form-item label="生效结束时间">
          <a-date-picker
            show-time
            class="w-full"
            :value="form.end_at"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            placeholder="留空表示长期有效"
            @update:value="updateField('end_at', $event || null)"
          />
        </a-form-item>
        <a-form-item label="是否启用">
          <a-switch :checked="form.enabled" @update:checked="updateField('enabled', $event)" />
        </a-form-item>
      </template>
      <template v-if="type === 'models'">
        <a-form-item label="模型名称">
          <a-input :value="form.name" class="input-field" @update:value="updateField('name', $event)" />
        </a-form-item>
        <a-form-item label="模型Key">
          <a-input :value="form.model_key" class="input-field" @update:value="updateField('model_key', $event)" />
        </a-form-item>
        <a-form-item label="供应商标识">
          <a-auto-complete
            :value="form.provider"
            :options="providerOptions"
            class="input-field w-full"
            placeholder="deepseek / dashscope / 其他"
            @update:value="updateField('provider', $event)"
          />
        </a-form-item>
        <a-form-item label="模型类型">
          <a-auto-complete
            :value="form.model_type"
            :options="modelTypeOptions"
            class="input-field w-full"
            placeholder="text / vision / 其他"
            @update:value="updateField('model_type', $event)"
          />
        </a-form-item>
        <a-form-item label="API 地址（留空使用供应商默认地址）">
          <a-input :value="form.api_url" class="input-field" placeholder="https://.../chat/completions" @update:value="updateField('api_url', $event)" />
        </a-form-item>
        <a-form-item label="API 密钥环境变量名">
          <a-input :value="form.api_key_env" class="input-field" placeholder="DEEPSEEK_API_KEY" @update:value="updateField('api_key_env', $event)" />
        </a-form-item>
        <a-form-item label="官方输入基准价（元/百万 token）">
          <a-input-number :value="form.input_price_per_million" :min="0" :step="0.1" class="input-field w-full" @update:value="updateField('input_price_per_million', $event)" />
        </a-form-item>
        <a-form-item label="官方缓存输入基准价（元/百万 token）">
          <a-input-number :value="form.cached_input_price_per_million" :min="0" :step="0.01" class="input-field w-full" @update:value="updateField('cached_input_price_per_million', $event)" />
        </a-form-item>
        <a-form-item label="官方输出基准价（元/百万 token）">
          <a-input-number :value="form.output_price_per_million" :min="0" :step="0.1" class="input-field w-full" @update:value="updateField('output_price_per_million', $event)" />
        </a-form-item>
        <a-form-item label="是否开启深度思考">
          <a-select
            :value="toThinkingOption(form.thinking_enabled)"
            :options="thinkingOptions"
            class="input-field w-full"
            @update:value="updateThinking"
          />
        </a-form-item>
        <a-form-item label="是否启用">
          <a-switch :checked="form.enabled" @update:checked="updateField('enabled', $event)" />
        </a-form-item>
      </template>
    </a-form>

    <!-- 小屏按钮等分占满可用宽度，减少误触并保证 44px 触控高度。 -->
    <div class="mt-5 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
      <button class="btn-ghost min-h-11" @click="open = false">取消</button>
      <button class="btn-primary min-h-11" @click="emit('submit')">确定</button>
    </div>
  </a-modal>
</template>

<style scoped>
:deep(.input-field .ant-input),
:deep(.input-field .ant-input-number-input),
:deep(.input-field textarea) {
  @apply bg-transparent;
}
:deep(.ant-modal-title) {
  @apply font-semibold text-ink;
}
.announcement-quill-editor :deep(.ql-container) {
  min-height: 180px;
  font-size: 14px;
}
.announcement-quill-editor :deep(.ql-editor) {
  min-height: 180px;
}
@media (max-width: 640px) {
  .announcement-quill-editor :deep(.ql-toolbar) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
