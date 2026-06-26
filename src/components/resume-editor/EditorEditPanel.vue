<!--
  底部编辑区：横向 Tab + 模块显隐 + 表单内容
-->
<script setup>
import { ref, watch, nextTick } from 'vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import ResumeEditorForm from './ResumeEditorForm.vue'

const resume = defineModel({ type: Object, required: true })
const activeModule = defineModel('activeModule', { type: String, default: 'basic' })
const modules = defineModel('modules', { type: Array, required: true })

const props = defineProps({
  highlightModule: { type: String, default: '' },
})

const tabScrollRef = ref(null)
const formRef = ref(null)

// 切换 Tab
function selectTab(key) {
  activeModule.value = key
}

// Tab 栏左右滚动
function scrollTabs(dir) {
  if (tabScrollRef.value) {
    tabScrollRef.value.scrollBy({ left: dir * 120, behavior: 'smooth' })
  }
}

const editContentRef = ref(null)

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

defineExpose({ scrollToModule, modules })
</script>

<template>
  <div class="edit-panel">
    <div class="edit-top">
      <a-button type="text" size="small" class="tab-scroll-btn" @click="scrollTabs(-1)">
        <LeftOutlined />
      </a-button>
      <div ref="tabScrollRef" class="edit-tab-scroll">
        <ul class="edit-tab">
          <li
            v-for="(mod, idx) in modules"
            :key="mod.key"
            :class="{ active: activeModule === mod.key, highlighted: highlightModule === mod.key }"
            @click="selectTab(mod.key)"
          >
            <b>{{ mod.title }}</b>
            <a-switch
              v-if="mod.key !== 'basic'"
              :checked="mod.visible"
              size="small"
              class="tab-switch"
              @click.stop
              @change="(checked) => { modules[idx].visible = checked }"
            />
          </li>
        </ul>
      </div>
      <a-button type="text" size="small" class="tab-scroll-btn" @click="scrollTabs(1)">
        <RightOutlined />
      </a-button>
    </div>

    <div ref="editContentRef" class="edit-content">
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
.edit-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
}
.edit-top {
  display: flex;
  align-items: center;
  height: 48px;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 8px;
  background: #fafafa;
}
.tab-scroll-btn {
  flex-shrink: 0;
}
.edit-tab-scroll {
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.edit-tab-scroll::-webkit-scrollbar {
  display: none;
}
.edit-tab {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0 8px;
  gap: 4px;
  white-space: nowrap;
}
.edit-tab li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}
.edit-tab li:hover {
  color: #1677ff;
  background: #f0f7ff;
}
.edit-tab li.active {
  color: #1677ff;
  font-weight: 600;
  background: #fff;
  border-bottom-color: #1677ff;
}
.edit-tab li.highlighted {
  animation: tab-flash 2s ease-out;
}
@keyframes tab-flash {
  0% { background: #e6f7ff; }
  50% { background: #bae7ff; }
  100% { background: #fff; }
}
.tab-switch {
  margin-left: 4px;
}
.edit-content {
  max-height: 280px;
  overflow-y: auto;
  padding: 16px 24px;
}
</style>
