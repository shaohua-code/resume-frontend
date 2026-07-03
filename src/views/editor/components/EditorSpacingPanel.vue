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
  <div class="w-[320px] py-1">
    <div class="mb-4">
      <h5 class="mb-2 text-sm font-medium text-ink">
        模块上下间距：<b class="font-bold text-brand-dark">{{ spacing.sectionGap }}</b>
      </h5>
      <div class="flex items-center gap-3">
        <a-slider
          v-model:value="spacing.sectionGap"
          :min="SPACING_RANGES.sectionGap.min"
          :max="SPACING_RANGES.sectionGap.max"
          :step="SPACING_RANGES.sectionGap.step"
          class="flex-1"
          :track-style="{ backgroundColor: '#7DD3E8' }"
          :handle-style="{ borderColor: '#7DD3E8' }"
          @change="emit('change')"
        />
        <button class="btn-ghost h-7 px-2 py-1 text-xs" @click="resetKey('sectionGap')">重置</button>
      </div>
    </div>

    <div class="mb-4">
      <h5 class="mb-2 text-sm font-medium text-ink">
        行间距：<b class="font-bold text-brand-dark">{{ spacing.lineHeight.toFixed(2) }}</b>
      </h5>
      <div class="flex items-center gap-3">
        <a-slider
          v-model:value="spacing.lineHeight"
          :min="SPACING_RANGES.lineHeight.min"
          :max="SPACING_RANGES.lineHeight.max"
          :step="SPACING_RANGES.lineHeight.step"
          class="flex-1"
          :track-style="{ backgroundColor: '#7DD3E8' }"
          :handle-style="{ borderColor: '#7DD3E8' }"
          @change="emit('change')"
        />
        <button class="btn-ghost h-7 px-2 py-1 text-xs" @click="resetKey('lineHeight')">重置</button>
      </div>
    </div>

    <div class="mb-3">
      <h5 class="mb-2 text-sm font-medium text-ink">
        页面边距：<b class="font-bold text-brand-dark">{{ spacing.padding }}</b>
      </h5>
      <div class="flex items-center gap-3">
        <a-slider
          v-model:value="spacing.padding"
          :min="SPACING_RANGES.padding.min"
          :max="SPACING_RANGES.padding.max"
          :step="SPACING_RANGES.padding.step"
          class="flex-1"
          :track-style="{ backgroundColor: '#7DD3E8' }"
          :handle-style="{ borderColor: '#7DD3E8' }"
          @change="emit('change')"
        />
        <button class="btn-ghost h-7 px-2 py-1 text-xs" @click="resetKey('padding')">重置</button>
      </div>
    </div>

    <div class="border-t border-line/60 pt-3 text-xs text-muted">
      简历共 {{ pageCount }} 页
    </div>
  </div>
</template>
