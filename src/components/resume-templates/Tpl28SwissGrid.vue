<!-- AI简历风格模板 28：瑞士网格，以严格栏线和编号系统组织高密度信息。 -->
<script setup>
// 复用标准字段映射和模块显隐，只在当前组件内建立网格式视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 根节点保持全宽正常文档流，保证长条目可以按 A4 有效高度直接切片。 -->
  <div class="resume-template rt rt-custom-28 w-full bg-white">
    <!-- 网格索引仅作装饰并关闭指针事件，不遮挡正文模块定位。 -->
    <div class="swiss-index" aria-hidden="true">
      <b>CURRICULUM VITAE</b><i></i><span>GRID / 28</span><em>PROFILE</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="28" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 高对比细栏线与规则编号形成理性、精准的瑞士平面设计感。 */
.rt-custom-28 { word-break: break-word; border-top: .7em solid var(--skin-top-band-bg); }
.swiss-index {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: .8em;
  padding: .6em 1.25em;
  border-bottom: 1px solid var(--skin-divider-color);
  color: var(--font-content-color);
  pointer-events: none;
}
.swiss-index b,
.swiss-index span,
.swiss-index em { font-size: .66em; font-style: normal; font-weight: 900; letter-spacing: .15em; }
.swiss-index i { height: 1px; background: var(--skin-divider-color); }
.swiss-index em { padding: .28em .5em; background: var(--skin-title-color); color: var(--font-basic-content-color); }

/* 正文使用可自然增高的 CSS 网格，不设置固定高度与裁切。 */
.rt-custom-28 :deep(.rt-body) { padding: 1.1em 0 1.25em; }
.rt-custom-28 :deep(.rt-header) {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  gap: 0;
  margin-bottom: var(--section-gap);
  border: 2px solid var(--skin-header-border);
  background: var(--skin-header-bg);
}
.rt-custom-28 :deep(.rt-banner) {
  display: grid;
  grid-template-columns: auto 1fr;
  align-content: center;
  margin: 0;
  padding: 1em;
  border: 0;
  border-right: 2px solid var(--skin-header-border);
  text-align: left;
}
.rt-custom-28 :deep(.rt-banner-avatar) {
  grid-row: 1 / 3;
  width: 4.8em;
  height: 5.8em;
  margin: 0 .9em 0 0;
  border: 0;
  border-radius: 0;
  object-fit: cover;
}
.rt-custom-28 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: 1 !important; letter-spacing: -.02em; }
.rt-custom-28 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 800; letter-spacing: .08em; }
.rt-custom-28 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; align-content: stretch; }
.rt-custom-28 :deep(.rt-basic-row) { display: block; padding: .48em .55em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-28 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-28 :deep(.rt-label) { display: block; min-width: 0; margin-bottom: .1em; font-size: .65em; letter-spacing: .08em; }

/* 每个模块保留独立语义容器，左侧短标题栏建立统一阅读坐标。 */
.rt-custom-28 :deep(.rt-section) { display: grid; grid-template-columns: 6.2em minmax(0, 1fr); gap: 0 1em; margin-bottom: var(--section-gap); }
.rt-custom-28 :deep(.rt-title) { grid-row: 1 / span 40; display: block; margin: 0; padding: .5em; border-top: 4px solid var(--skin-title-color); border-bottom: 1px solid var(--skin-divider-color); font-size: .9em !important; letter-spacing: .1em; }
.rt-custom-28 :deep(.rt-title::before),
.rt-custom-28 :deep(.rt-title::after) { display: none; }
.rt-custom-28 :deep(.rt-item),
.rt-custom-28 :deep(.rt-skills),
.rt-custom-28 :deep(.rt-list),
.rt-custom-28 :deep(.rt-text) { grid-column: 2; }
.rt-custom-28 :deep(.rt-item) { margin: 0; padding: .55em 0; border: 0; border-top: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-28 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--skin-skill-border); border-left: 1px solid var(--skin-skill-border); }
.rt-custom-28 :deep(.rt-skill) { padding: .45em; border: 0; border-right: 1px solid var(--skin-skill-border); border-bottom: 1px solid var(--skin-skill-border); border-radius: 0; text-align: center; }
.rt-custom-28 :deep(.rt-list) { margin: 0; padding: 0; list-style: none; }
.rt-custom-28 :deep(.rt-list li) { padding: .35em 0; border-top: 1px solid var(--skin-divider-color); }
</style>
