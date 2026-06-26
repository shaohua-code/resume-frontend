<!--
  编辑器顶部固定工具栏
  间距 / 字体 / 皮肤 dropdown + 业务操作按钮
-->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  LeftOutlined, SaveOutlined, DownloadOutlined,
  BulbOutlined, AimOutlined, BarChartOutlined,
  AppstoreOutlined, ColumnWidthOutlined, FontSizeOutlined, BgColorsOutlined,
} from '@ant-design/icons-vue'
import EditorSpacingPanel from './EditorSpacingPanel.vue'
import EditorFontPanel from './EditorFontPanel.vue'
import EditorSkinPanel from './EditorSkinPanel.vue'

const spacing = defineModel('spacing', { type: Object, required: true })
const fontSize = defineModel('fontSize', { type: Number, required: true })
const fontFamily = defineModel('fontFamily', { type: String, required: true })
const skin = defineModel('skin', { type: String, required: true })

defineProps({
  currentTemplateName: { type: String, default: '极简校招版' },
  pageCount: { type: Number, default: 1 },
  saving: { type: Boolean, default: false },
  exporting: { type: Boolean, default: false },
  scoring: { type: Boolean, default: false },
})

const emit = defineEmits([
  'settings-change',
  'template',
  'optimize',
  'match',
  'score',
  'save',
  'export-pdf',
  'export-word',
])

const router = useRouter()
const showSpacing = ref(false)
const showFont = ref(false)
const showSkin = ref(false)

function onSettingsChange() {
  emit('settings-change')
}

function onSkinSelect() {
  showSkin.value = false
  onSettingsChange()
}
</script>

<template>
  <header class="editor-toolbar">
    <div class="toolbar-main">
      <div class="toolbar-left">
        <a-button @click="router.back()">
          <LeftOutlined /> 返回
        </a-button>
        <a-button type="text" class="template-btn" @click="emit('template')">
          <AppstoreOutlined /> 模板：{{ currentTemplateName }}
        </a-button>
      </div>

      <ul class="set-list">
        <li>
          <a-popover
            v-model:open="showSpacing"
            trigger="click"
            placement="bottom"
          >
            <template #content>
              <EditorSpacingPanel
                :spacing="spacing"
                :page-count="pageCount"
                @change="onSettingsChange"
              />
            </template>
            <div class="set-btn" :class="{ active: showSpacing }">
              <ColumnWidthOutlined />
              <b>间距设置</b>
            </div>
          </a-popover>
        </li>
        <li>
          <a-popover
            v-model:open="showFont"
            trigger="click"
            placement="bottom"
          >
            <template #content>
              <EditorFontPanel
                v-model:font-family="fontFamily"
                v-model:font-size="fontSize"
                @change="onSettingsChange"
              />
            </template>
            <div class="set-btn" :class="{ active: showFont }">
              <FontSizeOutlined />
              <b>字体</b>
            </div>
          </a-popover>
        </li>
        <li>
          <a-popover
            v-model:open="showSkin"
            trigger="click"
            placement="bottom"
          >
            <template #content>
              <EditorSkinPanel
                v-model:skin="skin"
                @change="onSettingsChange"
                @select="onSkinSelect"
              />
            </template>
            <div class="set-btn" :class="{ active: showSkin }">
              <BgColorsOutlined />
              <b>皮肤设置</b>
            </div>
          </a-popover>
        </li>
      </ul>

      <div class="toolbar-right">
        <a-button @click="emit('optimize')">
          <BulbOutlined /> AI优化
        </a-button>
        <a-button @click="emit('match')">
          <AimOutlined /> JD匹配
        </a-button>
        <a-button :loading="scoring" @click="emit('score')">
          <BarChartOutlined /> 评分
        </a-button>
        <a-button type="primary" :loading="saving" @click="emit('save')">
          <SaveOutlined /> 保存
        </a-button>
        <a-dropdown :disabled="exporting">
          <a-button type="primary" ghost :loading="exporting">
            <DownloadOutlined /> 导出
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="pdf" @click="emit('export-pdf')">导出 PDF（高清打印）</a-menu-item>
              <a-menu-item key="word" @click="emit('export-word')">导出 Word（可编辑）</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </header>
</template>

<style scoped>
.editor-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 70px;
  background: #fff;
  box-shadow: 0 0 12px rgba(57, 57, 77, 0.2);
}
.toolbar-main {
  max-width: 1400px;
  height: 70px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.template-btn {
  margin-left: 4px;
}
.set-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}
.set-list li {
  display: inline-block;
}
.set-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  transition: all 0.2s;
  user-select: none;
}
.set-btn:hover,
.set-btn.active {
  color: #1677ff;
  background: #e6f4ff;
}
.set-btn b {
  font-weight: 600;
}
</style>
