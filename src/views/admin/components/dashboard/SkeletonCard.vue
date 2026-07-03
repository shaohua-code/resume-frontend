<script setup>
/**
 * 卡片骨架屏
 * 加载态占位，避免页面空白；可配置高度与是否圆角卡片外观。
 */
defineProps({
  height: {
    type: String,
    default: '130px',
  },
})
</script>

<template>
  <!-- minHeight 由父级传入动态设置，属于必须动态计算的样式 -->
  <div class="card-base flex flex-col justify-center" :style="{ minHeight: height }">
    <a-skeleton active :paragraph="{ rows: 2 }" :title="{ width: '40%' }" />
  </div>
</template>
