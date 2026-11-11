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
    <!-- 骨架屏占位：模拟简历预览卡片的加载状态 -->
    <div v-else class="lazy-render-skeleton" aria-hidden="true">
      <div class="skeleton-header" />
      <div class="skeleton-line skeleton-line--long" />
      <div class="skeleton-line skeleton-line--medium" />
      <div class="skeleton-line skeleton-line--short" />
      <div class="skeleton-block" />
      <div class="skeleton-line skeleton-line--long" />
      <div class="skeleton-line skeleton-line--medium" />
    </div>
  </div>
</template>

<style scoped>
/* 隔离占位区域的布局与绘制，降低首屏渲染成本。 */
.lazy-render-skeleton {
  min-height: inherit;
  contain: layout paint;
  padding: 12px;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-radius: 8px;
  overflow: hidden;
}

/* 骨架屏动画 */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.skeleton-header {
  width: 60%;
  height: 16px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
  height: 10px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  border-radius: 3px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line--long { width: 90%; }
.skeleton-line--medium { width: 70%; animation-delay: 0.1s; }
.skeleton-line--short { width: 50%; animation-delay: 0.2s; }

.skeleton-block {
  width: 100%;
  height: 40px;
  margin: 12px 0;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  animation-delay: 0.3s;
}
</style>
