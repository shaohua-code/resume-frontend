<!--
  字体设置面板：字体族 + 文字大小（无语言设置）
-->
<script setup>
import { FONT_OPTIONS, FONT_SIZE_OPTIONS } from '@/constants/editorSettings'

const fontFamily = defineModel('fontFamily', { type: String, required: true })
const fontSize = defineModel('fontSize', { type: Number, required: true })

const emit = defineEmits(['change'])
</script>

<template>
  <div class="w-[280px] py-2">
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
    <div class="flex items-center">
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
  </div>
</template>
