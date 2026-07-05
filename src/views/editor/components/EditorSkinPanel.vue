<!--
  皮肤设置面板
  模块标题色仅作用于六大模块标题，其余颜色可自由调整背景/边框等
-->
<script setup>
import { CheckOutlined } from '@ant-design/icons-vue'
import {
  SKIN_COLORS,
  SKIN_COLOR_FIELDS,
  SKIN_PRESET_THEMES,
  BASE_SKIN_THEME,
} from '@/constants/skin'

const skinTheme = defineModel('skinTheme', { type: Object, required: true })

const emit = defineEmits(['change', 'select'])

// 选择推荐预设皮肤
function pickPreset(val) {
  skinTheme.value = { ...SKIN_PRESET_THEMES[val] }
  emit('change')
  emit('select', val)
}

// 自定义某项颜色
function onColorChange(key, event) {
  skinTheme.value = {
    ...skinTheme.value,
    [key]: event.target.value,
    preset: 'custom',
  }
  emit('change')
}

// 重置为默认蓝色主题
function resetTheme() {
  skinTheme.value = { ...SKIN_PRESET_THEMES.blue }
  emit('change')
}
</script>

<template>
  <div class="w-[280px] max-h-[70vh] overflow-y-auto py-1">
    <h5 class="mb-3 text-sm font-semibold text-ink">推荐皮肤</h5>
    <div class="mb-4 flex flex-wrap gap-2.5">
      <span
        v-for="s in SKIN_COLORS"
        :key="s.value"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-transparent text-xs text-white transition-transform duration-150 hover:scale-110"
        :class="{ 'border-ink shadow-sm': skinTheme.preset === s.value }"
        :style="{ backgroundColor: s.color }"
        @click="pickPreset(s.value)"
      >
        <CheckOutlined v-if="skinTheme.preset === s.value" />
      </span>
    </div>

    <div class="mb-2 flex items-center justify-between">
      <h5 class="text-sm font-semibold text-ink">自定义颜色</h5>
      <button
        type="button"
        class="text-xs text-brand-dark transition-colors hover:underline"
        @click="resetTheme"
      >
        重置
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="field in SKIN_COLOR_FIELDS"
        :key="field.key"
        class="rounded-button border border-line/40 bg-cream/40 px-3 py-2"
      >
        <div class="mb-1.5 flex items-center justify-between gap-2">
          <span class="text-xs font-medium text-ink">{{ field.label }}</span>
          <input
            type="color"
            class="h-7 w-10 cursor-pointer rounded border border-line/60 bg-white p-0.5"
            :value="skinTheme[field.key] || BASE_SKIN_THEME[field.key]"
            @input="onColorChange(field.key, $event)"
          />
        </div>
        <p v-if="field.hint" class="m-0 text-[11px] leading-relaxed text-muted">
          {{ field.hint }}
        </p>
      </div>
    </div>
  </div>
</template>
