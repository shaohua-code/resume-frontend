<script setup>
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
  <a-modal :open="open" :title="title" :footer="null" @update:open="open = $event">
    <a-form layout="vertical">
      <template v-if="type === 'announcements'">
        <a-form-item label="标题">
          <a-input :value="form.title" class="input-field" @update:value="updateField('title', $event)" />
        </a-form-item>
        <a-form-item label="内容">
          <a-textarea :value="form.content" :rows="5" class="input-field" @update:value="updateField('content', $event)" />
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

    <div class="mt-5 flex justify-end gap-3">
      <button class="btn-ghost" @click="open = false">取消</button>
      <button class="btn-primary" @click="emit('submit')">确定</button>
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
</style>
