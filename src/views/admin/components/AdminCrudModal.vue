<script setup>
const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  type: {
    type: String,
    default: 'plans',
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

function updateField(key, value) {
  // 表单字段更新时整体抛出新对象，避免直接修改父组件传入的 props。
  emit('update:form', { ...props.form, [key]: value })
}
</script>

<template>
  <a-modal :open="open" :title="title" :footer="null" @update:open="open = $event">
    <a-form layout="vertical">
      <template v-if="type === 'plans'">
        <a-form-item label="套餐名称">
          <a-input :value="form.name" class="input-field" @update:value="updateField('name', $event)" />
        </a-form-item>
        <a-form-item label="价格">
          <a-input-number :value="form.price" class="input-field w-full" @update:value="updateField('price', $event)" />
        </a-form-item>
        <a-form-item label="有效天数">
          <a-input-number :value="form.duration_days" class="input-field w-full" @update:value="updateField('duration_days', $event)" />
        </a-form-item>
        <a-form-item label="说明">
          <a-textarea :value="form.description" class="input-field" @update:value="updateField('description', $event)" />
        </a-form-item>
        <a-form-item label="是否启用">
          <a-switch :checked="form.enabled" @update:checked="updateField('enabled', $event)" />
        </a-form-item>
      </template>
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
        <a-form-item label="任务类型">
          <a-input :value="form.task_type" class="input-field" @update:value="updateField('task_type', $event)" />
        </a-form-item>
        <a-form-item label="输入单价（元/百万 token）">
          <a-input-number :value="form.input_price_per_million" :min="0" :step="0.1" class="input-field w-full" @update:value="updateField('input_price_per_million', $event)" />
        </a-form-item>
        <a-form-item label="输出单价（元/百万 token）">
          <a-input-number :value="form.output_price_per_million" :min="0" :step="0.1" class="input-field w-full" @update:value="updateField('output_price_per_million', $event)" />
        </a-form-item>
        <a-form-item label="VIP专属">
          <a-switch :checked="form.vip_only" @update:checked="updateField('vip_only', $event)" />
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
/* Ant Design 输入框内部背景透明，适配 .input-field 外层样式 */
:deep(.input-field .ant-input),
:deep(.input-field .ant-input-number-input),
:deep(.input-field textarea) {
  @apply bg-transparent;
}
/* 弹窗标题颜色 */
:deep(.ant-modal-title) {
  @apply font-semibold text-ink;
}
</style>
