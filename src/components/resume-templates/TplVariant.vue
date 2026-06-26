<!--
  模板变体容器：variant 决定样式类名与内容布局
-->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  variant: { type: Number, required: true },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div
    class="resume-template rt"
    :class="'rt-v' + String(variant).padStart(2, '0')"
  >
    <ResumeStandardContent
      :resume="resume"
      :variant="variant"
      :visible-modules="visibleModules"
    />
  </div>
</template>

<style src="./shared/templateVariants.css"></style>
<style src="./shared/resumeTemplateBase.css"></style>
