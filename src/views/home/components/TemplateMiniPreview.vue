<script setup>
/**
 * 模板缩略预览 - 缩放渲染真实模板组件
 */
import { computed } from 'vue'
import ResumeTemplate from '@/components/ResumeTemplate.vue'
import { DEFAULT_MODULES } from '@/constants/editorSettings'
import { getTemplateName } from '@/constants/templateRegistry'

const props = defineProps({
  templateId: {
    type: Number,
    default: 1,
  },
  resume: {
    type: Object,
    required: true,
  },
  scale: {
    type: Number,
    default: 0.32,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
})

const visibleModules = DEFAULT_MODULES.filter((m) => m.visible).map((m) => m.key)

// 根据缩放比例计算容器尺寸
const wrapperStyle = computed(() => ({
  width: `${794 * props.scale}px`,
  height: `${520 * props.scale}px`,
}))

const innerStyle = computed(() => ({
  width: '794px',
  transform: `scale(${props.scale})`,
  transformOrigin: 'top left',
}))
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="relative overflow-hidden rounded-card border border-line/60 bg-white shadow-card"
      :style="wrapperStyle"
    >
      <div class="pointer-events-none origin-top-left bg-white" :style="innerStyle">
        <div class="w-[794px] px-8 py-8 text-sm leading-relaxed text-ink">
          <ResumeTemplate
            :resume="resume"
            :template-id="templateId"
            :visible-modules="visibleModules"
          />
        </div>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/90 to-transparent" />
    </div>
    <p v-if="showLabel" class="mt-2 text-sm font-medium text-ink">{{ getTemplateName(templateId) }}</p>
  </div>
</template>
