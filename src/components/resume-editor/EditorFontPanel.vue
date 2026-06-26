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
  <div class="font-panel">
    <div class="font-row">
      <label class="font-label">字体：</label>
      <a-select
        v-model:value="fontFamily"
        style="width: 180px"
        @change="emit('change')"
      >
        <a-select-option v-for="f in FONT_OPTIONS" :key="f.value" :value="f.value">
          {{ f.label }}
        </a-select-option>
      </a-select>
    </div>
    <div class="font-row">
      <label class="font-label">文字大小：</label>
      <a-select
        v-model:value="fontSize"
        style="width: 180px"
        @change="emit('change')"
      >
        <a-select-option v-for="s in FONT_SIZE_OPTIONS" :key="s" :value="s">
          {{ s }}
        </a-select-option>
      </a-select>
    </div>
  </div>
</template>

<style scoped>
.font-panel {
  width: 280px;
  padding: 8px 0;
}
.font-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.font-row:last-child {
  margin-bottom: 0;
}
.font-label {
  width: 72px;
  flex-shrink: 0;
  font-size: 13px;
  color: #333;
  font-weight: 500;
}
</style>
