<!--
  简历模板路由组件
  根据 templateId 动态加载对应模板 chunk，避免 50 套组件同步打进首包
-->
<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { clampTemplateId, getTemplateLoader } from '@/constants/templateRegistry'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  templateId: { type: Number, default: 1 },
  visibleModules: { type: Array, default: () => [] },
})

// 缓存 async 组件实例，避免切换模板时重复 defineAsyncComponent
const asyncTemplateCache = new Map()

function resolveAsyncTemplate(id) {
  const safeId = clampTemplateId(id)
  if (!asyncTemplateCache.has(safeId)) {
    asyncTemplateCache.set(safeId, defineAsyncComponent(getTemplateLoader(safeId)))
  }
  return asyncTemplateCache.get(safeId)
}

const safeId = computed(() => clampTemplateId(props.templateId))
const activeComponent = computed(() => resolveAsyncTemplate(safeId.value))
</script>

<template>
  <component
    :is="activeComponent"
    :resume="resume"
    :visible-modules="visibleModules"
  />
</template>
