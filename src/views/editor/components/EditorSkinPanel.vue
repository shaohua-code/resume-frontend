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
  <div class="w-[240px] py-1">
    <h5 class="mb-3 text-sm font-semibold text-ink">推荐皮肤</h5>
    <div class="flex flex-wrap gap-2.5">
      <span
        v-for="s in SKIN_COLORS"
        :key="s.value"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-transparent text-xs text-white transition-transform duration-150 hover:scale-110"
        :class="{ 'border-ink shadow-sm': skin === s.value }"
        :style="{ backgroundColor: s.color }"
        @click="pick(s.value)"
      >
        <CheckOutlined v-if="skin === s.value" />
      </span>
    </div>
  </div>
</template>
