<!-- AI简历风格模板 16 -->
<script setup>
import TplVariant from './TplVariant.vue'
defineProps({ resume: { type: Object, default: () => ({}) } })
</script>
<template>
  <TplVariant :resume="resume" :variant="16" />
</template>
