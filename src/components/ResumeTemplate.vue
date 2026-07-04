<!--
  简历模板路由组件
  根据 templateId 动态渲染 20 套AI简历风格模板
-->
<script setup>
import { computed } from 'vue'
import { TEMPLATE_MAP, clampTemplateId } from '@/constants/templateRegistry'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  templateId: { type: Number, default: 1 },
  visibleModules: { type: Array, default: () => [] },
})

const safeId = computed(() => clampTemplateId(props.templateId))
const activeComponent = computed(() => TEMPLATE_MAP[safeId.value] || TEMPLATE_MAP[1])
</script>

<template>
  <component
    :is="activeComponent"
    :resume="resume"
    :visible-modules="visibleModules"
  />
</template>
