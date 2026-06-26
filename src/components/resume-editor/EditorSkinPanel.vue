<!--
  皮肤色板面板
-->
<script setup>
import { CheckOutlined } from '@ant-design/icons-vue'
import { SKIN_COLORS } from '@/constants/skin'

const skin = defineModel('skin', { type: String, required: true })

const emit = defineEmits(['change', 'select'])

function pick(val) {
  skin.value = val
  emit('change')
  emit('select', val)
}
</script>

<template>
  <div class="skin-panel">
    <h5 class="skin-title">推荐皮肤</h5>
    <div class="skin-list">
      <span
        v-for="s in SKIN_COLORS"
        :key="s.value"
        class="skin-item"
        :class="{ active: skin === s.value }"
        :style="{ backgroundColor: s.color }"
        @click="pick(s.value)"
      >
        <CheckOutlined v-if="skin === s.value" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.skin-panel {
  width: 240px;
  padding: 4px 0;
}
.skin-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.skin-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.skin-item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  border: 2px solid transparent;
  transition: transform 0.15s;
}
.skin-item:hover {
  transform: scale(1.1);
}
.skin-item.active {
  border-color: #333;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}
</style>
