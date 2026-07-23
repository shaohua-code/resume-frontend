<!-- AI简历风格模板 37：东方印鉴，以竖向题签、朱印和框线呈现端庄文化感。 -->
<script setup>
// 共享标准模块保证所有字段和定位标记，本组件仅定义印鉴主题样式。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 印鉴装饰不承载用户内容，关闭指针事件并保持普通文档流。 -->
  <div class="resume-template rt rt-custom-37 w-full bg-white">
    <div class="heritage-title" aria-hidden="true">
      <b>履历</b><i></i><span>CAREER ARCHIVE</span><em>三七</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="37" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 纸色、朱印和双框线构成东方档案视觉，颜色均可通过皮肤面板替换。 */
.rt-custom-37 { word-break: break-word; background: var(--skin-item-bg); border: .45em double var(--skin-header-border); }
.heritage-title { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: .8em; padding: .65em 1.2em; color: var(--font-content-color); pointer-events: none; }
.heritage-title b { font-size: 1.1em; letter-spacing: .3em; }
.heritage-title i { height: 1px; background: var(--skin-divider-color); }
.heritage-title span { font-size: .62em; letter-spacing: .18em; }
.heritage-title em { padding: .35em; border: 2px solid var(--skin-top-band-bg); color: var(--skin-title-color); font-style: normal; font-weight: 900; }

/* 个人头部采用横向题名与信息格，头像使用方形印谱框。 */
.rt-custom-37 :deep(.rt-body) { padding: .45em 0 1.25em; }
.rt-custom-37 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1em; border: 1px solid var(--skin-header-border); background: var(--skin-header-bg); }
.rt-custom-37 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .75em; border: 0; border-right: 3px double var(--skin-header-border); text-align: left; }
.rt-custom-37 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 5.8em; margin: 0 .9em 0 0; border: 4px double var(--skin-top-band-bg); border-radius: 0; object-fit: cover; }
.rt-custom-37 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: 1 !important; letter-spacing: .18em; }
.rt-custom-37 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 700; letter-spacing: .12em; }
.rt-custom-37 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; align-content: center; border-top: 1px solid var(--skin-basic-row-border); border-left: 1px solid var(--skin-basic-row-border); }
.rt-custom-37 :deep(.rt-basic-row) { display: block; padding: .46em .55em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-37 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-37 :deep(.rt-label) { display: block; min-width: 0; font-size: .66em; letter-spacing: .12em; }

/* 模块标题采用居中的题签结构，条目仍逐条参与内容识别。 */
.rt-custom-37 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .75em .9em; border: 1px solid var(--skin-item-border); background: var(--skin-item-bg); }
.rt-custom-37 :deep(.rt-title) { display: grid; grid-template-columns: 1fr auto 1fr; gap: .7em; margin: 0 0 .65em; text-align: center; letter-spacing: .16em; }
.rt-custom-37 :deep(.rt-title)::before,
.rt-custom-37 :deep(.rt-title)::after { width: auto; height: 3px; border-radius: 0; background: var(--skin-divider-color) !important; }
.rt-custom-37 :deep(.rt-title span) { padding: .15em .7em; border: 1px solid var(--skin-title-color); }
.rt-custom-37 :deep(.rt-item) { margin: 0; padding: .62em .2em; border: 0; border-bottom: 1px dashed var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-37 :deep(.rt-skills) { justify-content: center; gap: .45em; }
.rt-custom-37 :deep(.rt-skill) { border-radius: 0; border-style: double; }
.rt-custom-37 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-37 :deep(.rt-list li) { padding: .38em .55em; border-left: 3px double var(--skin-top-band-bg); }
</style>
