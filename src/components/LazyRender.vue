<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  minHeight: {
    type: String,
    default: '18rem',
  },
  rootMargin: {
    type: String,
    // 收紧预加载距离，避免首页一进来就预取模板/下方重块
    default: '200px 0px',
  },
})

const rootRef = ref(null)
const visible = ref(false)
let observer

// 组件一旦进入预加载范围就永久展示，避免滚动离开后反复卸载。
function reveal() {
  visible.value = true
  observer?.disconnect()
  observer = undefined
}

onMounted(() => {
  // 不支持 IntersectionObserver 时直接渲染，保证旧浏览器功能完整。
  if (!('IntersectionObserver' in window) || !rootRef.value) {
    reveal()
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) reveal()
    },
    { rootMargin: props.rootMargin },
  )
  observer.observe(rootRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <!-- 未进入预加载范围时保留高度，减少异步内容出现造成的布局跳动。 -->
  <div
    ref="rootRef"
    class="lazy-render"
    :style="visible ? undefined : { minHeight: props.minHeight }"
  >
    <slot v-if="visible" />
    <div v-else class="lazy-render-placeholder" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* 隔离占位区域的布局与绘制，降低首屏渲染成本。 */
.lazy-render-placeholder {
  min-height: inherit;
  contain: layout paint;
}
</style>
