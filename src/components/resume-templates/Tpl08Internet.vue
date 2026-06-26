<!-- 全民简历风格模板 8 -->
<script setup>
import TplVariant from './TplVariant.vue'
defineProps({ resume: { type: Object, default: () => ({}) } })
</script>
<template>
  <TplVariant :resume="resume" :variant="8" />
</template>
