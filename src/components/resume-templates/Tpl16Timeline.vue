<!-- AI简历风格模板 16 -->
<script setup>
import TplVariant from './TplVariant.vue'
// 时间轴变体沿用统一模块可见性配置，避免独立壳层丢失缩略图与历史预览状态。
defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>
<template>
  <TplVariant :resume="resume" :variant="16" :visible-modules="visibleModules" />
</template>
