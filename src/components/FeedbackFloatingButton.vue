<!--
  用户端反馈浮动按钮
  右下角可拖拽，点击打开反馈弹窗
-->
<script setup>
import { ref } from 'vue'
import { MessageOutlined } from '@ant-design/icons-vue'
import { useDraggable } from '@/composables/useDraggable'
import FeedbackModal from '@/components/FeedbackModal.vue'

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

  <FeedbackModal v-model="modalOpen" />
</template>
