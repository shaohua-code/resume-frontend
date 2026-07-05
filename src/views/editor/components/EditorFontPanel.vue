<!--
  字体设置面板：字体族 + 文字大小 + 标题/基本信息/姓名/内容颜色
-->
<script setup>
import {
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  DEFAULT_LABEL_COLOR,
  DEFAULT_BASIC_CONTENT_COLOR,
  DEFAULT_NAME_COLOR,
  DEFAULT_CONTENT_COLOR,
} from '@/constants/editorSettings'

const fontFamily = defineModel('fontFamily', { type: String, required: true })
const fontSize = defineModel('fontSize', { type: Number, required: true })
const labelColor = defineModel('labelColor', { type: String, default: null })
const basicContentColor = defineModel('basicContentColor', { type: String, default: null })
const nameColor = defineModel('nameColor', { type: String, default: null })
const contentColor = defineModel('contentColor', { type: String, required: true })

const emit = defineEmits(['change'])

// 字体颜色项配置
const FONT_COLOR_FIELDS = [
  {
    key: 'labelColor',
    label: '标题字体颜色',
    hint: '作用于基本信息标签（姓名、电话、邮箱等）；深色顶栏模板默认白色',
    default: DEFAULT_LABEL_COLOR,
  },
  {
    key: 'basicContentColor',
    label: '基本信息内容颜色',
    hint: '作用于基本信息行内容值（电话、邮箱、岗位、教育等）；默认黑色',
    default: DEFAULT_BASIC_CONTENT_COLOR,
  },
  {
    key: 'nameColor',
    label: '姓名文本颜色',
    hint: '仅作用于顶栏大姓名（如「张三」）；深色顶栏默认白色，浅色顶栏默认黑色',
    default: DEFAULT_NAME_COLOR,
  },
  {
    key: 'contentColor',
    label: '文本内容颜色',
    hint: '作用于段落、列表、条目正文等（不含基本信息值、顶栏大姓名与模块大标题）',
    default: DEFAULT_CONTENT_COLOR,
  },
]

// 颜色模型映射
const COLOR_MODELS = {
  labelColor,
  basicContentColor,
  nameColor,
  contentColor,
}

// 获取颜色选择器当前展示值
function getColorValue(key, fieldDefault) {
  return COLOR_MODELS[key].value || fieldDefault
}

// 颜色选择变更
function onColorChange(key, event) {
  COLOR_MODELS[key].value = event.target.value
  emit('change')
}
</script>

<template>
  <div class="w-[280px] max-h-[70vh] overflow-y-auto py-2">
    <div class="mb-4 flex items-center">
      <label class="w-[72px] flex-shrink-0 text-sm font-medium text-ink">字体：</label>
      <a-select
        v-model:value="fontFamily"
        class="w-[180px]"
        @change="emit('change')"
      >
        <a-select-option v-for="f in FONT_OPTIONS" :key="f.value" :value="f.value">
          {{ f.label }}
        </a-select-option>
      </a-select>
    </div>
    <div class="mb-4 flex items-center">
      <label class="w-[72px] flex-shrink-0 text-sm font-medium text-ink">文字大小：</label>
      <a-select
        v-model:value="fontSize"
        class="w-[180px]"
        @change="emit('change')"
      >
        <a-select-option v-for="s in FONT_SIZE_OPTIONS" :key="s" :value="s">
          {{ s }}
        </a-select-option>
      </a-select>
    </div>

    <h5 class="mb-3 text-sm font-semibold text-ink">字体颜色</h5>
    <div class="space-y-3">
      <div
        v-for="field in FONT_COLOR_FIELDS"
        :key="field.key"
        class="rounded-button border border-line/40 bg-cream/40 px-3 py-2"
      >
        <div class="mb-1.5 flex items-center justify-between gap-2">
          <span class="text-xs font-medium text-ink">{{ field.label }}</span>
          <input
            type="color"
            class="h-7 w-10 cursor-pointer rounded border border-line/60 bg-white p-0.5"
            :value="getColorValue(field.key, field.default)"
            @input="onColorChange(field.key, $event)"
          />
        </div>
        <p class="m-0 text-[11px] leading-relaxed text-muted">
          {{ field.hint }}
        </p>
      </div>
    </div>
  </div>
</template>
