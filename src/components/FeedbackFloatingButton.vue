<!--
  用户端反馈浮动按钮
  右下角可拖拽，点击打开反馈弹窗；弹窗与 Quill 仅在打开时异步加载
-->
<script setup>
import { defineAsyncComponent, ref } from 'vue'
import { MessageOutlined } from '@ant-design/icons-vue'
import { useDraggable } from '@/composables/useDraggable'

// 仅用户打开反馈时再拉取 Modal + Quill，避免 idle 挂载按钮时预取富文本编辑器
const FeedbackModal = defineAsyncComponent(() => import('@/components/FeedbackModal.vue'))

const modalOpen = ref(false)

const {
  elRef,
  pos,
  dragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  wasDragged,
} = useDraggable()

// 拖拽与点击区分：未发生明显移动才打开弹窗
function handleClick() {
  if (wasDragged()) return
  modalOpen.value = true
}
</script>

<template>
  <div class="contents">
    <button
      ref="elRef"
      type="button"
      aria-label="意见反馈"
      class="fixed z-[999] flex h-12 w-12 cursor-grab items-center justify-center rounded-full border border-brand/30 bg-brand text-lg text-white shadow-card transition-shadow hover:shadow-card-hover active:cursor-grabbing"
      :class="{ 'shadow-card-hover': dragging }"
      :style="{ right: pos.right + 'px', bottom: pos.bottom + 'px' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @click="handleClick"
    >
      <MessageOutlined />
    </button>
    <!-- 仅打开时挂载，避免 idle 加载按钮时预取 Quill -->
    <FeedbackModal v-if="modalOpen" v-model="modalOpen" />
  </div>
</template>
