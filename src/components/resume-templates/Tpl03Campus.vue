<!-- 全民简历风格模板 3 -->
<script setup>
import TplVariant from './TplVariant.vue'
defineProps({ resume: { type: Object, default: () => ({}) } })
</script>
<template>
  <TplVariant :resume="resume" :variant="3" />
</template>
