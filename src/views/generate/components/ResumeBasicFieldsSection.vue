<!--
  基本信息表单区块（含扩展字段与自定义键值对）
-->
<script setup>
import { ref, computed } from 'vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
import GradientButton from '@/components/GradientButton.vue'
import {
  ThunderboltOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons-vue'
import {
  EXTENDED_BASIC_FIELDS,
  createEmptyCustomField,
  REQUIRED_BASIC_FORM_RULES,
} from '@/constants/resumeFieldSchema'

const resume = defineModel({ type: Object, required: true })

const props = defineProps({
  showAvatar: { type: Boolean, default: true },
  showSummary: { type: Boolean, default: true },
  showOptimize: { type: Boolean, default: false },
  isOptimizing: { type: Function, default: () => false },
  onOptimize: { type: Function, default: null },
  /** 是否校验姓名、意向岗位必填 */
  requiredBasic: { type: Boolean, default: true },
  /** 生成页将低频字段默认收进“更多内容”，编辑器仍可保持全部展开。 */
  collapsibleAdvanced: { type: Boolean, default: false },
  /** 流式识别或生成时由父级锁定全部表单控件。 */
  disabled: { type: Boolean, default: false },
})

const formRef = ref(null)
const moreOpen = ref(false)
const advancedKeys = new Set([
  'height',
  'weight',
  'ethnicity',
  'native_place',
  'political_status',
  'expected_salary',
])

const regularExtendedFields = computed(() => (
  props.collapsibleAdvanced
    ? EXTENDED_BASIC_FIELDS.filter((field) => !advancedKeys.has(field.key))
    : EXTENDED_BASIC_FIELDS
))
const advancedExtendedFields = computed(() => (
  props.collapsibleAdvanced
    ? EXTENDED_BASIC_FIELDS.filter((field) => advancedKeys.has(field.key))
    : []
))
const showAdvancedContent = computed(() => !props.collapsibleAdvanced || moreOpen.value)

// 姓名、意向岗位校验规则（随 requiredBasic 开关）
const formRules = computed(() => (props.requiredBasic ? REQUIRED_BASIC_FORM_RULES : {}))

/** 触发表单校验，供父组件调用 */
async function validate() {
  if (!props.requiredBasic) return true
  try {
    await formRef.value?.validate()
    return true
  } catch {
    return false
  }
}

defineExpose({ validate })

// 确保自定义字段数组存在
function ensureCustomFields() {
  if (!Array.isArray(resume.value.custom_fields)) {
    resume.value.custom_fields = []
  }
}

function addCustomField() {
  ensureCustomFields()
  resume.value.custom_fields.push(createEmptyCustomField())
}

function removeCustomField(index) {
  if (!resume.value.custom_fields) return
  resume.value.custom_fields.splice(index, 1)
}
</script>

<template>
  <a-form ref="formRef" :model="resume" :rules="formRules" layout="vertical" size="small">
    <a-row :gutter="12">
      <a-col v-if="showAvatar" :span="24">
        <a-form-item label="头像">
          <AvatarUpload v-model="resume.avatar" />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-form-item label="姓名" name="name" :required="requiredBasic">
          <a-input v-model:value="resume.name" class="input-field" placeholder="请输入姓名" />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-form-item label="意向岗位" name="target_position" :required="requiredBasic">
          <a-input
            v-model:value="resume.target_position"
            placeholder="如：财务分析师 / 机械工程师 / 运营经理"
            class="input-field"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-form-item label="手机">
          <a-input v-model:value="resume.phone" placeholder="请输入手机号" class="input-field" />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-form-item label="邮箱">
          <a-input v-model:value="resume.email" placeholder="请输入邮箱" class="input-field" />
        </a-form-item>
      </a-col>
      <!-- 扩展基本信息字段 -->
      <a-col
        v-for="field in regularExtendedFields"
        :key="field.key"
        :xs="24"
        :sm="8"
      >
        <a-form-item :label="field.label">
          <a-select
            v-if="field.type === 'select'"
            v-model:value="resume[field.key]"
            allow-clear
            :placeholder="`请选择${field.label}`"
            class="input-field w-full"
          >
            <a-select-option
              v-for="opt in field.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </a-select-option>
          </a-select>
          <a-input
            v-else
            v-model:value="resume[field.key]"
            :placeholder="field.placeholder"
            class="input-field"
          />
        </a-form-item>
      </a-col>

      <!-- 低频字段默认收起，减少移动端首屏长度。 -->
      <template v-if="showAdvancedContent">
        <a-col
          v-for="field in advancedExtendedFields"
          :key="field.key"
          :xs="24"
          :sm="8"
        >
          <a-form-item :label="field.label">
            <a-select
              v-if="field.type === 'select'"
              v-model:value="resume[field.key]"
              allow-clear
              :placeholder="`请选择${field.label}`"
              class="input-field w-full"
            >
              <a-select-option
                v-for="opt in field.options"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </a-select-option>
            </a-select>
            <a-input
              v-else
              v-model:value="resume[field.key]"
              :placeholder="field.placeholder"
              class="input-field"
            />
          </a-form-item>
        </a-col>
      </template>

      <!-- 自定义信息与其他低频字段一起收起。 -->
      <a-col v-if="showAdvancedContent" :span="24">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-ink">自定义信息</span>
          <button type="button" class="text-sm text-brand-dark hover:opacity-80" @click="addCustomField">
            <PlusOutlined /> 添加一项
          </button>
        </div>
        <div
          v-for="(item, index) in (resume.custom_fields || [])"
          :key="index"
          class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <a-input v-model:value="item.label" placeholder="名称，如：驾驶证" class="input-field sm:flex-1" />
          <a-input v-model:value="item.value" placeholder="内容，如：C1" class="input-field sm:flex-1" />
          <button type="button" class="text-danger hover:text-danger/80" @click="removeCustomField(index)">
            <DeleteOutlined />
          </button>
        </div>
      </a-col>

      <a-col v-if="collapsibleAdvanced" :span="24">
        <button
          type="button"
          class="btn-ghost flex h-10 w-full items-center justify-center gap-2 border-dashed text-sm"
          :disabled="disabled"
          @click="moreOpen = !moreOpen"
        >
          {{ moreOpen ? '收起更多内容' : '更多内容' }}
          <UpOutlined v-if="moreOpen" />
          <DownOutlined v-else />
        </button>
      </a-col>
      <a-col v-if="showSummary" :span="24">
        <a-form-item label="个人评价">
          <a-textarea v-model:value="resume.summary" :rows="3" class="input-field" />
        </a-form-item>
        <div v-if="showOptimize && onOptimize" class="mb-4 flex justify-end">
          <GradientButton :loading="isOptimizing('summary')" @click="onOptimize('summary')">
            <ThunderboltOutlined /> 优化个人评价
          </GradientButton>
        </div>
      </a-col>
    </a-row>
  </a-form>
</template>
