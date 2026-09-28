<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { CheckOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons-vue'
import LazyRender from '@/components/LazyRender.vue'
import TemplateMiniPreview from '@/components/TemplateMiniPreview.vue'
import { DEFAULT_SPACING, FONT_OPTIONS, FONT_SIZE_OPTIONS, SPACING_RANGES } from '@/constants/editorSettings'
import { EMPTY_SKIN_OVERRIDES } from '@/constants/skin'
import { getTemplateFontColorDefaults } from '@/constants/templateFontColors'
import { APPEARANCE_PALETTES, buildTemplateAppearancePalette } from '@/constants/templateAppearancePresets'
import { getTemplateSkinDefaults } from '@/constants/templateSkinColors'

// 面板始终编辑独立草稿；父级只接收预览快照，应用后才写入自动保存状态。
const props = defineProps({
  initialAppearance: { type: Object, required: true },
  templateList: { type: Array, default: () => [] },
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
  pageCount: { type: Number, default: 1 },
  canUndo: { type: Boolean, default: false },
  mobile: { type: Boolean, default: false },
})

const emit = defineEmits(['preview', 'apply', 'cancel', 'undo'])
const tabs = [
  { key: 'template', label: '模板' },
  { key: 'colors', label: '配色' },
  { key: 'layout', label: '排版' },
]
const activeTab = ref('template')
const search = ref('')
const category = ref('全部')
const fullPreviewOpen = ref(false)
const fullPreviewScale = computed(() => (props.mobile ? 0.42 : 0.78))
const originalAppearance = ref({})
const draft = reactive({})

// JSON 简历设置只包含可序列化值，用深拷贝隔离用户取消的草稿。
function clone(value) {
  return JSON.parse(JSON.stringify(value ?? {}))
}

function loadDraft(value) {
  const next = clone(value)
  originalAppearance.value = clone(next)
  Object.keys(draft).forEach((key) => delete draft[key])
  Object.assign(draft, next)
  emitPreview()
}

watch(() => props.initialAppearance, loadDraft, { deep: true, immediate: true })

const categories = computed(() => ['全部', ...new Set(props.templateList.map((item) => item.category).filter(Boolean))])
const filteredTemplates = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return props.templateList.filter((item) => {
    const matchesCategory = category.value === '全部' || item.category === category.value
    const matchesSearch = !query || `${item.name} ${item.category} ${item.desc}`.toLocaleLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })
})

const textColorFields = [
  { key: 'labelColor', label: '基本信息标签色', hint: '电话、邮箱等基本信息字段的标签文字' },
  { key: 'basicContentColor', label: '基本信息内容色', hint: '电话、邮箱、意向岗位和扩展信息的值' },
  { key: 'nameColor', label: '姓名颜色', hint: '简历页眉中的姓名文字' },
  { key: 'contentColor', label: '正文颜色', hint: '经历、项目、技能与个人评价等正文' },
]
const skinColorFields = [
  { key: 'titleColor', label: '模块标题色' },
  { key: 'dividerColor', label: '分隔线色' },
  { key: 'headerBg', label: '页眉背景色' },
  { key: 'headerBorder', label: '页眉边框色' },
  { key: 'itemBg', label: '经历条目背景色' },
  { key: 'itemBorder', label: '经历条目边框色' },
  { key: 'basicRowBg', label: '基本信息背景色' },
  { key: 'basicRowBorder', label: '基本信息边框色' },
  { key: 'skillBg', label: '技能标签背景色' },
  { key: 'skillBorder', label: '技能标签边框色' },
  { key: 'topBandBg', label: '强调色' },
]
const spacingFields = [
  { key: 'sectionGap', label: '模块上下间距', unit: 'px' },
  { key: 'lineHeight', label: '正文行距', unit: '' },
  { key: 'padding', label: '页面额外左右留白', unit: 'px' },
  { key: 'pageTopGap', label: '每页顶部安全留白', unit: 'px' },
  { key: 'pageBottomGap', label: '每页底部安全留白', unit: 'px' },
]
const layoutPresets = [
  { key: 'compact', label: '紧凑', values: { fontSize: 12, sectionGap: 5, lineHeight: 1.45, padding: 8 } },
  { key: 'standard', label: '标准', values: { fontSize: 13, sectionGap: 12, lineHeight: 1.6, padding: 18 } },
  { key: 'relaxed', label: '舒展', values: { fontSize: 14, sectionGap: 22, lineHeight: 1.85, padding: 28 } },
]

function currentFontDefaults() {
  return getTemplateFontColorDefaults(draft.templateId)
}

function currentSkinDefaults() {
  return getTemplateSkinDefaults(draft.templateId)
}

function profileFor(templateId) {
  return draft.templateAppearances?.[templateId] || null
}

function saveActiveColorProfile() {
  const profiles = { ...(draft.templateAppearances || {}) }
  profiles[draft.templateId] = {
    labelColor: draft.labelColor ?? null,
    basicContentColor: draft.basicContentColor ?? null,
    nameColor: draft.nameColor ?? null,
    contentColor: draft.contentColor ?? null,
    skinTheme: clone(draft.skinTheme || EMPTY_SKIN_OVERRIDES),
  }
  draft.templateAppearances = profiles
}

function activePreviewAppearance() {
  const profile = profileFor(draft.templateId)
  return {
    ...clone(draft),
    ...(profile || {}),
    templateId: draft.templateId,
    templateAppearances: draft.templateAppearances,
  }
}

function emitPreview() {
  if (draft.templateId) emit('preview', activePreviewAppearance())
}

function changeColor(key, value, fontColor = false) {
  draft[key] = value
  if (fontColor) saveActiveColorProfile()
  emitPreview()
}

// 自定义颜色脱离推荐色板标记，并实时同步到当前模板草稿预览。
function changeSkin(key, value) {
  const skinTheme = { ...draft.skinTheme, [key]: value, preset: 'custom' }
  delete skinTheme.palette
  draft.skinTheme = skinTheme
  saveActiveColorProfile()
  emitPreview()
}

function resetColorField(key, fontColor = false) {
  if (fontColor) {
    changeColor(key, null, true)
    return
  }
  changeSkin(key, null)
}

function resetCurrentPalette() {
  draft.labelColor = null
  draft.basicContentColor = null
  draft.nameColor = null
  draft.contentColor = null
  draft.skinTheme = clone(EMPTY_SKIN_OVERRIDES)
  saveActiveColorProfile()
  emitPreview()
}

function applyPalette(key) {
  const values = buildTemplateAppearancePalette(draft.templateId, key)
  if (!values) return
  Object.assign(draft, values)
  saveActiveColorProfile()
  emitPreview()
}

function chooseTemplate(templateId) {
  if (templateId === draft.templateId) return
  // 切换候选模板时恢复它自己的颜色；字体、字号和排版仍属于当前简历。
  const saved = profileFor(templateId)
  draft.templateId = templateId
  draft.labelColor = saved?.labelColor ?? null
  draft.basicContentColor = saved?.basicContentColor ?? null
  draft.nameColor = saved?.nameColor ?? null
  draft.contentColor = saved?.contentColor ?? null
  draft.skinTheme = clone(saved?.skinTheme || EMPTY_SKIN_OVERRIDES)
  emitPreview()
}

// 密度预设只更新字号和排版字段，避免把字号误写入间距对象。
function applyLayoutPreset(preset) {
  const { fontSize, ...spacingValues } = preset.values
  draft.fontSize = fontSize
  draft.spacing = { ...draft.spacing, ...spacingValues }
  emitPreview()
}

// 滑块按配置范围更新单个排版字段，保持其他草稿项不变。
function changeSpacing(key, value) {
  draft.spacing = { ...draft.spacing, [key]: Number(value) }
  emitPreview()
}

// 单个间距恢复项目默认值，不影响同组其他设置。
function resetLayoutField(key) {
  changeSpacing(key, DEFAULT_SPACING[key])
}

// 字体或字号分别恢复通用默认值。
function resetFontField(key) {
  if (key === 'fontFamily') {
    draft.fontFamily = "'Microsoft YaHei', sans-serif"
  } else {
    draft.fontSize = 13
  }
  emitPreview()
}

const previewAppearance = computed(() => activePreviewAppearance())
const changed = computed(() => JSON.stringify(draft) !== JSON.stringify(originalAppearance.value))

// 应用前确保当前模板配色也写入模板档案，后续切回仍可还原。
function apply() {
  saveActiveColorProfile()
  emit('apply', clone(draft))
}

// 取消只通知父级清除预览态，不触碰已应用配置。
function cancel() {
  emit('cancel')
}
</script>

<template>
  <div class="appearance-panel">
    <div class="appearance-panel__tabs" role="tablist" aria-label="简历样式设置">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.key"
        class="appearance-panel__tab"
        :class="{ 'appearance-panel__tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
      <button type="button" class="appearance-panel__undo" :disabled="!canUndo" @click="emit('undo')">撤销上次应用</button>
    </div>

    <div class="appearance-panel__workspace">
      <div class="appearance-panel__controls">
        <section v-if="activeTab === 'template'" role="tabpanel" aria-label="选择模板">
          <div class="appearance-panel__section-head">
            <div><h3>选择模板</h3><p>切换候选只改变预览，应用后才保存。</p></div>
            <button type="button" class="appearance-panel__link" @click="fullPreviewOpen = true"><EyeOutlined /> 完整预览</button>
          </div>
          <label class="appearance-panel__search">
            <SearchOutlined aria-hidden="true" />
            <input v-model="search" type="search" autocomplete="off" placeholder="搜索模板名称、行业或风格" aria-label="搜索模板" />
            <span>{{ filteredTemplates.length }} 套</span>
          </label>
          <div class="appearance-panel__categories" role="group" aria-label="模板分类">
            <button
              v-for="item in categories"
              :key="item"
              type="button"
              :aria-pressed="category === item"
              :class="{ 'is-active': category === item }"
              @click="category = item"
            >{{ item }}</button>
          </div>
          <div class="appearance-panel__template-list">
            <article v-for="item in filteredTemplates" :key="item.id" class="appearance-template-card">
              <button
                type="button"
                class="appearance-template-card__select"
                :class="{ 'is-active': draft.templateId === item.id }"
                :aria-pressed="draft.templateId === item.id"
                @click="chooseTemplate(item.id)"
              >
                <LazyRender :min-height="180" root-margin="180px 0px">
                  <TemplateMiniPreview
                    :template-id="item.id"
                    :resume="resume"
                    :appearance="draft.templateId === item.id ? previewAppearance : {
                      ...draft,
                      ...(profileFor(item.id) || {}),
                      templateId: item.id,
                      labelColor: profileFor(item.id)?.labelColor ?? null,
                      basicContentColor: profileFor(item.id)?.basicContentColor ?? null,
                      nameColor: profileFor(item.id)?.nameColor ?? null,
                      contentColor: profileFor(item.id)?.contentColor ?? null,
                      skinTheme: profileFor(item.id)?.skinTheme || EMPTY_SKIN_OVERRIDES,
                    }"
                    :visible-modules="visibleModules"
                    :scale="0.2"
                    preview-mode="page"
                    :show-label="false"
                  />
                </LazyRender>
                <span class="appearance-template-card__meta">
                  <span>{{ item.category }}</span>
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.desc }}</small>
                  <em><CheckOutlined v-if="draft.templateId === item.id" />{{ draft.templateId === item.id ? '当前预览' : '点击预览此模板' }}</em>
                </span>
              </button>
              <button type="button" class="appearance-template-card__zoom" :aria-label="`完整预览${item.name}`" @click="chooseTemplate(item.id); fullPreviewOpen = true"><EyeOutlined /></button>
            </article>
          </div>
          <p v-if="!filteredTemplates.length" class="appearance-panel__empty">没有找到匹配模板。试试更短的关键词或切换分类。</p>
        </section>

        <section v-else-if="activeTab === 'colors'" role="tabpanel" aria-label="配色设置">
          <div class="appearance-panel__section-head"><div><h3>配色</h3><p>推荐色板保留当前模板底色，并同时校准文字颜色。</p></div><button type="button" class="appearance-panel__link" @click="resetCurrentPalette">恢复模板默认</button></div>
          <div class="appearance-panel__palette-list" role="group" aria-label="推荐配色">
            <button v-for="palette in APPEARANCE_PALETTES" :key="palette.key" type="button" :aria-label="`${palette.label}推荐配色`" :title="palette.label" @click="applyPalette(palette.key)">
              <i :style="{ backgroundColor: palette.color }"><CheckOutlined v-if="draft.skinTheme?.palette === palette.key || draft.skinTheme?.preset === palette.key" /></i><span>{{ palette.label }}</span>
            </button>
          </div>

          <h4>文字颜色</h4>
          <div class="appearance-panel__color-grid">
            <label v-for="field in textColorFields" :key="field.key" class="appearance-color-field">
              <span><strong>{{ field.label }}</strong><small>{{ field.hint }}</small></span>
              <input type="color" :value="draft[field.key] || currentFontDefaults()[field.key]" :aria-label="field.label" @input="changeColor(field.key, $event.target.value, true)" />
              <button type="button" @click="resetColorField(field.key, true)">默认</button>
            </label>
          </div>

          <h4>背景与边框</h4>
          <div class="appearance-panel__color-grid">
            <label v-for="field in skinColorFields" :key="field.key" class="appearance-color-field">
              <span><strong>{{ field.label }}</strong><small>对全部 60 套模板生效</small></span>
              <input
                type="color"
                :value="draft.skinTheme?.[field.key] && draft.skinTheme[field.key] !== 'transparent' ? draft.skinTheme[field.key] : currentSkinDefaults()[field.key]"
                :aria-label="field.label"
                @input="changeSkin(field.key, $event.target.value)"
              />
              <button type="button" @click="resetColorField(field.key)">默认</button>
              <button type="button" class="appearance-color-field__transparent" @click="changeSkin(field.key, 'transparent')">透明</button>
            </label>
          </div>
        </section>

        <section v-else role="tabpanel" aria-label="排版设置">
          <div class="appearance-panel__section-head"><div><h3>排版</h3><p>快速应用密度，之后可逐项微调。</p></div></div>
          <div class="appearance-panel__density" role="group" aria-label="排版密度">
            <button v-for="preset in layoutPresets" :key="preset.key" type="button" @click="applyLayoutPreset(preset)">{{ preset.label }}</button>
          </div>
          <div class="appearance-panel__select-grid">
            <label><span>字体</span><select :value="draft.fontFamily" @change="draft.fontFamily = $event.target.value; emitPreview()"><option v-for="font in FONT_OPTIONS" :key="font.value" :value="font.value">{{ font.label }}</option></select><button type="button" @click="resetFontField('fontFamily')">默认</button></label>
            <label><span>正文字号</span><select :value="draft.fontSize" @change="draft.fontSize = Number($event.target.value); emitPreview()"><option v-for="size in FONT_SIZE_OPTIONS" :key="size" :value="size">{{ size }} px</option></select><button type="button" @click="resetFontField('fontSize')">默认</button></label>
          </div>
          <div v-for="field in spacingFields" :key="field.key" class="appearance-range-field">
            <div><label :for="`appearance-${field.key}`">{{ field.label }}</label><output>{{ Number(draft.spacing[field.key]).toFixed(field.key === 'lineHeight' ? 2 : 0) }} {{ field.unit }}</output></div>
            <input
              :id="`appearance-${field.key}`"
              type="range"
              :min="SPACING_RANGES[field.key].min"
              :max="SPACING_RANGES[field.key].max"
              :step="SPACING_RANGES[field.key].step"
              :value="draft.spacing[field.key]"
              @input="changeSpacing(field.key, $event.target.value)"
            />
            <button type="button" @click="resetLayoutField(field.key)">恢复默认</button>
          </div>
          <p class="appearance-panel__page-count">当前内容预览为 {{ pageCount }} 页；正式页数以应用后的 A4 分页为准。</p>
        </section>
      </div>

      <aside class="appearance-panel__preview" aria-label="样式实时预览">
        <div class="appearance-panel__preview-head"><div><strong>{{ templateList.find((item) => item.id === draft.templateId)?.name || '简历预览' }}</strong><small>实时预览 · {{ pageCount }} 页</small></div><button type="button" @click="fullPreviewOpen = true">放大查看</button></div>
        <TemplateMiniPreview
          :template-id="draft.templateId"
          :resume="resume"
          :appearance="previewAppearance"
          :visible-modules="visibleModules"
          :scale="mobile ? 0.35 : 0.48"
          preview-mode="page"
          :show-label="false"
        />
      </aside>
    </div>

    <footer class="appearance-panel__footer">
      <span>{{ changed ? '有未应用的样式更改' : '样式已同步' }}</span>
      <div><button type="button" class="appearance-panel__cancel" @click="cancel">取消</button><button type="button" class="appearance-panel__apply" :disabled="!changed" @click="apply">应用并保存</button></div>
    </footer>

    <a-modal v-model:open="fullPreviewOpen" :title="`${templateList.find((item) => item.id === draft.templateId)?.name || '简历'} · 完整预览`" :width="mobile ? '96vw' : 1060" :footer="null" class="modal-fresh">
      <div class="appearance-panel__full-preview">
        <TemplateMiniPreview :template-id="draft.templateId" :resume="resume" :appearance="previewAppearance" :visible-modules="visibleModules" :scale="fullPreviewScale" preview-mode="full" :show-label="false" />
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
/* 桌面用控制区与纸张并排；窄屏改为单列并保留可滚动预览。 */
.appearance-panel { display: flex; min-height: min(78vh, 920px); flex-direction: column; color: #243047; }
.appearance-panel__tabs { display: flex; align-items: center; gap: .5rem; border-bottom: 1px solid #dce3ec; padding: .25rem .25rem .8rem; }
.appearance-panel__tab { min-height: 40px; border: 0; border-radius: 10px; padding: .55rem 1rem; background: transparent; color: #64748b; font-weight: 700; }
.appearance-panel__tab--active { background: #eaf1ff; color: #2456a6; }
.appearance-panel__undo, .appearance-panel__link { border: 0; background: transparent; color: #315e9d; font-size: .85rem; font-weight: 700; }
.appearance-panel__undo { margin-left: auto; }
.appearance-panel__undo:disabled { color: #a5afbd; cursor: not-allowed; }
.appearance-panel__workspace { display: grid; min-height: 0; flex: 1; grid-template-columns: minmax(0, 1fr) minmax(270px, .86fr); gap: 1rem; padding: 1rem .25rem; }
.appearance-panel__controls { min-height: 0; overflow: auto; padding-right: .5rem; }
.appearance-panel__section-head, .appearance-panel__preview-head { display: flex; align-items: flex-start; justify-content: space-between; gap: .7rem; }
.appearance-panel__section-head h3 { margin: 0; font-size: 1.05rem; font-weight: 800; }
.appearance-panel__section-head p { margin: .25rem 0 .8rem; color: #718096; font-size: .8rem; }
.appearance-panel__search { display: flex; height: 40px; align-items: center; gap: .5rem; border: 1px solid #d7e0eb; border-radius: 10px; padding: 0 .7rem; }
.appearance-panel__search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; }
.appearance-panel__search span { color: #718096; font-size: .75rem; }
.appearance-panel__categories { display: flex; gap: .4rem; overflow-x: auto; padding: .7rem 0; }
.appearance-panel__categories button { flex: none; border: 1px solid #dce3ec; border-radius: 999px; padding: .35rem .7rem; background: white; color: #526176; font-size: .75rem; }
.appearance-panel__categories button.is-active { border-color: #3569ad; background: #3569ad; color: white; }
.appearance-panel__template-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem; }
.appearance-template-card { position: relative; min-width: 0; overflow: hidden; border: 1px solid #dce3ec; border-radius: 12px; background: #f6f8fb; }
.appearance-template-card__select { display: flex; width: 100%; min-height: 180px; align-items: center; gap: .45rem; border: 0; padding: .5rem; background: transparent; text-align: left; }
.appearance-template-card__select.is-active { outline: 2px solid #3569ad; outline-offset: -2px; }
.appearance-template-card__meta { display: flex; min-width: 0; flex-direction: column; gap: .22rem; }
.appearance-template-card__meta > span { color: #718096; font-size: .68rem; }
.appearance-template-card__meta strong { font-size: .82rem; }
.appearance-template-card__meta small { display: -webkit-box; overflow: hidden; color: #718096; font-size: .68rem; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.appearance-template-card__meta em { display: flex; align-items: center; gap: .2rem; color: #3569ad; font-size: .67rem; font-style: normal; font-weight: 700; }
.appearance-template-card__zoom { position: absolute; right: .45rem; top: .45rem; z-index: 2; display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid #dce3ec; border-radius: 9px; background: white; color: #315e9d; }
.appearance-panel__empty { padding: 1.5rem; color: #718096; text-align: center; }
.appearance-panel__controls h4 { margin: 1rem 0 .55rem; font-size: .86rem; font-weight: 800; }
.appearance-panel__palette-list { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .45rem; }
.appearance-panel__palette-list button { display: flex; min-height: 58px; align-items: center; gap: .45rem; border: 1px solid #e1e7ef; border-radius: 10px; padding: .35rem; background: white; color: #344256; font-size: .72rem; }
.appearance-panel__palette-list i { display: grid; width: 24px; height: 24px; flex: none; place-items: center; border-radius: 8px; color: white; font-size: .65rem; }
.appearance-panel__color-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
.appearance-color-field { display: grid; min-width: 0; grid-template-columns: minmax(0, 1fr) 36px auto auto; align-items: center; gap: .4rem; border: 1px solid #e1e7ef; border-radius: 10px; padding: .55rem; }
.appearance-color-field > span { display: flex; min-width: 0; flex-direction: column; gap: .16rem; }
.appearance-color-field strong { overflow: hidden; font-size: .76rem; text-overflow: ellipsis; white-space: nowrap; }
.appearance-color-field small { color: #718096; font-size: .64rem; line-height: 1.25; }
.appearance-color-field input { width: 34px; height: 30px; border: 0; padding: 0; background: transparent; }
.appearance-color-field button, .appearance-range-field button, .appearance-panel__select-grid button { border: 0; background: transparent; color: #3569ad; font-size: .68rem; white-space: nowrap; }
.appearance-color-field__transparent { color: #64748b !important; }
.appearance-panel__density { display: flex; gap: .5rem; margin: .25rem 0 1rem; }
.appearance-panel__density button { flex: 1; min-height: 40px; border: 1px solid #dce3ec; border-radius: 9px; background: white; color: #344256; font-weight: 700; }
.appearance-panel__select-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; }
.appearance-panel__select-grid label { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: .4rem; }
.appearance-panel__select-grid label > span { grid-column: 1 / -1; font-size: .78rem; font-weight: 700; }
.appearance-panel__select-grid select { min-width: 0; height: 38px; border: 1px solid #d5dee9; border-radius: 8px; padding: 0 .5rem; background: white; }
.appearance-range-field { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .15rem .6rem; align-items: center; border-bottom: 1px solid #edf0f5; padding: .7rem 0; }
.appearance-range-field div { display: flex; justify-content: space-between; gap: .5rem; }
.appearance-range-field label { font-size: .8rem; font-weight: 700; }
.appearance-range-field output { color: #3569ad; font-size: .78rem; font-weight: 700; }
.appearance-range-field input { grid-column: 1; width: 100%; accent-color: #3569ad; }
.appearance-panel__page-count { color: #718096; font-size: .75rem; }
.appearance-panel__preview { position: sticky; top: .25rem; align-self: start; max-height: 100%; overflow: auto; border: 1px solid #dce3ec; border-radius: 14px; padding: .7rem; background: #f1f4f8; }
.appearance-panel__preview-head { align-items: center; margin-bottom: .5rem; }
.appearance-panel__preview-head div { display: flex; flex-direction: column; gap: .2rem; }
.appearance-panel__preview-head strong { font-size: .85rem; }
.appearance-panel__preview-head small { color: #718096; font-size: .7rem; }
.appearance-panel__preview-head button { border: 0; background: transparent; color: #315e9d; font-size: .72rem; font-weight: 700; }
.appearance-panel__footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid #dce3ec; padding: .8rem .25rem .25rem; }
.appearance-panel__footer > span { color: #718096; font-size: .76rem; }
.appearance-panel__footer > div { display: flex; gap: .55rem; }
.appearance-panel__cancel, .appearance-panel__apply { min-height: 40px; border-radius: 9px; padding: 0 1rem; font-weight: 700; }
.appearance-panel__cancel { border: 1px solid #d7e0eb; background: white; color: #526176; }
.appearance-panel__apply { border: 1px solid #285d9f; background: #285d9f; color: white; }
.appearance-panel__apply:disabled { cursor: not-allowed; opacity: .48; }
.appearance-panel__full-preview { max-height: 70vh; overflow: auto; border: 1px solid #e1e7ef; border-radius: 12px; background: #f1f4f8; padding: 1rem; }
@media (max-width: 767px) {
  .appearance-panel { min-height: 80vh; }
  .appearance-panel__workspace { grid-template-columns: 1fr; grid-template-rows: minmax(240px, 38vh) minmax(0, 1fr); gap: .7rem; padding-top: .7rem; }
  .appearance-panel__preview { position: static; grid-row: 1; max-height: 38vh; overflow: hidden; }
  .appearance-panel__controls { grid-row: 2; }
  .appearance-template-card__select { min-height: 160px; align-items: flex-start; }
  .appearance-panel__color-grid { grid-template-columns: 1fr; }
}
</style>
