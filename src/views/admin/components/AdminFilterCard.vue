<script setup>
/**
 * 管理后台列表筛选容器：统一标题、辅助说明和筛选控件的视觉节奏。
 */
import { SlidersHorizontal } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: '筛选记录',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <a-card :bordered="false" class="card-base admin-filter-card">
    <div class="filter-heading">
      <span class="filter-icon" aria-hidden="true">
        <SlidersHorizontal class="h-4 w-4" />
      </span>
      <div class="min-w-0">
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
    </div>
    <div class="filter-controls">
      <slot />
    </div>
    <div v-if="$slots.context" class="filter-context">
      <slot name="context" />
    </div>
  </a-card>
</template>

<style scoped>
/* 后台筛选字段统一到易触控高度，并使用系统主题变量保持焦点反馈一致。 */
.filter-heading { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.filter-icon { display:flex; width:36px; height:36px; flex:0 0 auto; align-items:center; justify-content:center; border-radius:12px; background:var(--color-brand-lighter); color:var(--color-brand-dark); }
.filter-heading h2 { margin:0; color:var(--color-ink); font-size:14px; font-weight:700; line-height:1.35; }
.filter-heading p { margin:3px 0 0; color:var(--color-ink-secondary); font-size:12px; line-height:1.45; }
.filter-controls :deep(.ant-input-affix-wrapper),
.filter-controls :deep(.ant-picker) { min-height:44px; border-radius:12px; border-color:var(--color-line); background:var(--color-surface); }
.filter-controls :deep(.ant-select-single) { height:44px; }
.filter-controls :deep(.ant-select-single .ant-select-selector) { height:44px; align-items:center; border-radius:12px; border-color:var(--color-line); background:var(--color-surface); }
.filter-controls :deep(.ant-input-affix-wrapper:hover),
.filter-controls :deep(.ant-picker:hover),
.filter-controls :deep(.ant-select:not(.ant-select-disabled):hover .ant-select-selector) { border-color:color-mix(in srgb, var(--color-brand-dark) 42%, var(--color-line)); }
.filter-controls :deep(.ant-input-affix-wrapper-focused),
.filter-controls :deep(.ant-picker-focused),
.filter-controls :deep(.ant-select-focused .ant-select-selector) { border-color:var(--color-brand-dark); box-shadow:0 0 0 2px color-mix(in srgb, var(--color-brand-dark) 12%, transparent); }
.filter-context { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:12px; color:var(--color-ink-secondary); font-size:12px; }
</style>
