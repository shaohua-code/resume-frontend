<!--
  间距设置面板：模块间距 / 行间距 / 页面边距
-->
<script setup>
import { DEFAULT_SPACING, SPACING_RANGES } from '@/constants/editorSettings'

const props = defineProps({
  spacing: { type: Object, required: true },
  pageCount: { type: Number, default: 1 },
})

const emit = defineEmits(['change'])

// 重置单项间距为默认值（直接改字段，保持与父级 reactive 同一引用）
function resetKey(key) {
  props.spacing[key] = DEFAULT_SPACING[key]
  emit('change')
}
</script>

<template>
  <div class="spacing-panel">
    <div class="slider-box">
      <h5 class="slider-label">
        模块上下间距：<b>{{ spacing.sectionGap }}</b>
      </h5>
      <div class="slider-control">
        <a-slider
          v-model:value="spacing.sectionGap"
          :min="SPACING_RANGES.sectionGap.min"
          :max="SPACING_RANGES.sectionGap.max"
          :step="SPACING_RANGES.sectionGap.step"
          @change="emit('change')"
        />
        <a-button size="small" @click="resetKey('sectionGap')">重置</a-button>
      </div>
    </div>

    <div class="slider-box">
      <h5 class="slider-label">
        行间距：<b>{{ spacing.lineHeight.toFixed(2) }}</b>
      </h5>
      <div class="slider-control">
        <a-slider
          v-model:value="spacing.lineHeight"
          :min="SPACING_RANGES.lineHeight.min"
          :max="SPACING_RANGES.lineHeight.max"
          :step="SPACING_RANGES.lineHeight.step"
          @change="emit('change')"
        />
        <a-button size="small" @click="resetKey('lineHeight')">重置</a-button>
      </div>
    </div>

    <div class="slider-box">
      <h5 class="slider-label">
        页面边距：<b>{{ spacing.padding }}</b>
      </h5>
      <div class="slider-control">
        <a-slider
          v-model:value="spacing.padding"
          :min="SPACING_RANGES.padding.min"
          :max="SPACING_RANGES.padding.max"
          :step="SPACING_RANGES.padding.step"
          @change="emit('change')"
        />
        <a-button size="small" @click="resetKey('padding')">重置</a-button>
      </div>
    </div>

    <div class="page-info">
      简历共 {{ pageCount }} 页
    </div>
  </div>
</template>

<style scoped>
.spacing-panel {
  width: 320px;
  padding: 4px 0;
}
.slider-box {
  margin-bottom: 16px;
}
.slider-box:last-of-type {
  margin-bottom: 12px;
}
.slider-label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.slider-label b {
  color: #ff6b35;
  font-weight: 700;
}
.slider-control {
  display: flex;
  align-items: center;
  gap: 12px;
}
.slider-control :deep(.ant-slider) {
  flex: 1;
  margin: 0;
}
.page-info {
  font-size: 12px;
  color: #888;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
</style>
