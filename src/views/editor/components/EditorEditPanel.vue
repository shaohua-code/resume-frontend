<!--
  底部编辑区：横向 Tab + 模块显隐 + 表单内容
-->
<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import ResumeEditorForm from './ResumeEditorForm.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const resume = defineModel({ type: Object, required: true })
const activeModule = defineModel('activeModule', { type: String, default: 'basic' })
const modules = defineModel('modules', { type: Array, required: true })

const props = defineProps({
  highlightModule: { type: String, default: '' },
})

const emit = defineEmits(['collapsed-change'])

const tabScrollRef = ref(null)
const formRef = ref(null)
const isMobile = useMediaQuery()

// 整个编辑面板的折叠状态（true=收起，false=展开），移动端默认收起以突出预览
const collapsed = ref(false)

// 移动端默认折叠编辑面板，优先展示 A4 预览
onMounted(() => {
  if (isMobile.value) {
    collapsed.value = true
  }
  emit('collapsed-change', collapsed.value)
})

watch(collapsed, (value) => {
  emit('collapsed-change', value)
})

// 切换 Tab
function selectTab(key) {
  activeModule.value = key
}

// 点击预览定位到对应 Tab，并滚入视口
function scrollToModule(key) {
  activeModule.value = key
  nextTick(() => {
    const activeTab = tabScrollRef.value?.querySelector('li.active')
    activeTab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    editContentRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
    formRef.value?.focusModule?.(key)
  })
}

watch(
  () => props.highlightModule,
  (key) => {
    if (key) scrollToModule(key)
  }
)

const editContentRef = ref(null)

defineExpose({
  scrollToModule,
  modules,
  /** 校验基本信息必填项 */
  validateBasic: () => formRef.value?.validateBasic?.(),
})
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-50 border-t border-line/60 bg-surface pb-[env(safe-area-inset-bottom)] shadow-card">
    <div class="flex h-12 items-center bg-cream px-2">
      <div ref="tabScrollRef" class="flex-1 overflow-x-auto scrollbar-hide">
        <ul class="flex items-center gap-1 whitespace-nowrap px-2 py-0">
          <li
            v-for="(mod, idx) in modules"
            :key="mod.key"
            class="inline-flex cursor-pointer items-center gap-2 rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm text-ink-secondary transition-all duration-200 hover:bg-brand-lighter hover:text-brand-dark max-lg:px-2 max-lg:text-xs"
            :class="{
              'bg-surface font-semibold text-brand-dark border-b-brand-dark': activeModule === mod.key,
              'animate-pulse bg-brand-lighter': highlightModule === mod.key,
            }"
            @click="selectTab(mod.key)"
          >
            <b class="font-semibold">{{ mod.title }}</b>
            <a-switch
              v-if="mod.key !== 'basic'"
              :checked="mod.visible"
              size="small"
              class="ml-1"
              @click.stop
              @change="(checked) => { modules[idx].visible = checked }"
            />
          </li>
        </ul>
      </div>
    </div>

    <!-- 中央浮动折叠按钮 -->
    <div
      class="absolute left-1/2 top-[-22px] z-[60] flex h-[22px] w-11 -translate-x-1/2 cursor-pointer items-center justify-center rounded-t-[22px] border border-line/60 border-b-0 bg-cream text-xs text-brand-dark shadow-sm transition-all duration-200 hover:bg-brand-lighter"
      @click="collapsed = !collapsed"
    >
      <component :is="collapsed ? UpOutlined : DownOutlined" />
    </div>

    <div v-show="!collapsed" ref="editContentRef" class="max-h-[40vh] overflow-y-auto px-6 py-4 max-lg:max-h-[40vh] max-lg:px-3 max-lg:py-3 lg:max-h-[280px]">
      <ResumeEditorForm
        ref="formRef"
        v-model="resume"
        v-model:modules="modules"
        :active-module="activeModule"
      />
    </div>
  </div>
</template>

<style scoped>
/* 隐藏 Tab 栏横向滚动条 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
