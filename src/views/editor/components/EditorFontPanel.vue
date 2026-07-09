<!--
  字体设置面板：字体族 + 文字大小 + 标题/基本信息/姓名/内容颜色
-->
<script setup>
import { computed } from 'vue'
import { FONT_OPTIONS, FONT_SIZE_OPTIONS } from '@/constants/editorSettings'
import { resolveFontColorDisplay, resetTemplateFontColors } from '@/constants/templateFontColors'

const props = defineProps({
  templateId: { type: Number, default: 1 },
})

const fontFamily = defineModel('fontFamily', { type: String, required: true })
const fontSize = defineModel('fontSize', { type: Number, required: true })
const labelColor = defineModel('labelColor', { type: String, default: null })
const basicContentColor = defineModel('basicContentColor', { type: String, default: null })
const nameColor = defineModel('nameColor', { type: String, default: null })
const contentColor = defineModel('contentColor', { type: String, default: null })

const emit = defineEmits(['change'])

// 字体颜色项配置
const FONT_COLOR_FIELDS = [
  {
    key: 'labelColor',
    label: '标题字体颜色',
    hint: '作用于基本信息标签（姓名、电话、邮箱等）；各模板默认色不同',
  },
  {
    key: 'basicContentColor',
    label: '基本信息内容颜色',
    hint: '作用于基本信息行内容值（电话、邮箱、岗位、教育等）',
  },
  {
    key: 'nameColor',
    label: '姓名文本颜色',
    hint: '仅作用于顶栏大姓名（如「张三」）；深色顶栏默认白色，浅色顶栏默认黑色',
  },
  {
    key: 'contentColor',
    label: '文本内容颜色',
    hint: '作用于段落、列表、条目正文等（不含基本信息值、顶栏大姓名与模块大标题）',
  },
]

// 颜色模型映射
const COLOR_MODELS = {
  labelColor,
  basicContentColor,
  nameColor,
  contentColor,
}

// 获取颜色选择器当前展示值（null 时用当前模板默认色）
function getColorValue(key) {
  return resolveFontColorDisplay(key, COLOR_MODELS[key].value, props.templateId)
}

// 颜色选择变更
function onColorChange(key, event) {
  COLOR_MODELS[key].value = event.target.value
  emit('change')
}

// 重置为当前模板默认字体色
function resetFontColors() {
  resetTemplateFontColors(
    { labelColor, basicContentColor, nameColor, contentColor },
    props.templateId,
  )
  emit('change')
}

// 模板切换时刷新 picker 展示
const panelKey = computed(() => props.templateId)
</script>

<template>
  <div :key="panelKey" class="w-[280px] max-h-[70vh] overflow-y-auto py-2">
    <div class="mb-4 flex items-center">
      <label class="w-[72px] flex-shrink-0 text-sm font-medium text-ink">字体：</label>
      <a-select
        v-model:value="fontFamily"
        class="input-field w-[180px]"
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
        class="input-field w-[180px]"
        @change="emit('change')"
      >
        <a-select-option v-for="s in FONT_SIZE_OPTIONS" :key="s" :value="s">
          {{ s }}
        </a-select-option>
      </a-select>
    </div>

    <div class="mb-3 flex items-center justify-between">
      <h5 class="m-0 text-sm font-semibold text-ink">字体颜色</h5>
      <button type="button" class="btn-ghost h-7 px-2 py-1 text-xs" @click="resetFontColors">
        重置
      </button>
    </div>
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
            :value="getColorValue(field.key)"
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
