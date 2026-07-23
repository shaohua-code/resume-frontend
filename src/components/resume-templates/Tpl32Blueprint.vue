<!-- AI简历风格模板 32：工程蓝图，以坐标网格和制图框线表达技术可靠性。 -->
<script setup>
// 共享标准内容处理字段与模块开关，当前组件只负责蓝图式布局。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 蓝图标尺在普通文档流中渲染，不改变正文高度测量方式。 -->
  <div class="resume-template rt rt-custom-32 w-full bg-white">
    <div class="blueprint-scale" aria-hidden="true">
      <b>DRAWING NO. 032</b><i></i><span>CAREER SPECIFICATION</span><em>1:1</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="32" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 细密网格、图框和编号标签形成工程制图视觉，正文不设固定高。 */
.rt-custom-32 {
  word-break: break-word;
  background-color: var(--skin-item-bg);
  background-image:
    linear-gradient(var(--skin-divider-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--skin-divider-color) 1px, transparent 1px);
  background-size: 1.5em 1.5em;
}
.blueprint-scale { display: grid; grid-template-columns: auto 1fr auto auto; gap: .8em; align-items: center; padding: .65em 1.2em; border: 2px solid var(--skin-header-border); border-top-width: .65em; background: var(--skin-header-bg); color: var(--font-basic-content-color); pointer-events: none; }
.blueprint-scale b,
.blueprint-scale span,
.blueprint-scale em { font-size: .65em; font-style: normal; letter-spacing: .14em; }
.blueprint-scale i { height: 1px; background: var(--skin-header-border); }
.blueprint-scale em { padding: .25em .5em; border: 1px solid var(--skin-header-border); }

/* 信息头部采用图签表结构，头像保持固定媒体尺寸。 */
.rt-custom-32 :deep(.rt-body) { padding: 1.05em 0 1.25em; }
.rt-custom-32 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0; margin-bottom: var(--section-gap); border: 2px solid var(--skin-header-border); background: var(--skin-header-bg); }
.rt-custom-32 :deep(.rt-banner) { display: grid; grid-template-columns: 1fr auto; align-content: center; margin: 0; padding: 1em; border: 0; border-right: 1px solid var(--skin-header-border); text-align: left; }
.rt-custom-32 :deep(.rt-banner-avatar) { grid-column: 2; grid-row: 1 / 3; width: 5em; height: 6em; margin: 0 0 0 .85em; border: 1px solid var(--skin-header-border); border-radius: 0; object-fit: cover; }
.rt-custom-32 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; line-height: 1 !important; letter-spacing: .05em; }
.rt-custom-32 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; font-weight: 700; letter-spacing: .08em; }
.rt-custom-32 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; }
.rt-custom-32 :deep(.rt-basic-row) { display: block; padding: .48em .55em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-32 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-32 :deep(.rt-label) { display: block; min-width: 0; font-size: .65em; letter-spacing: .1em; }

/* 模块保持独立图框，标题与条目都接受分页器直接裁切。 */
.rt-custom-32 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .8em .9em; border: 2px solid var(--skin-item-border); background: var(--skin-item-bg); }
.rt-custom-32 :deep(.rt-title) { gap: .6em; margin: 0 0 .6em; padding-bottom: .35em; border-bottom: 3px double var(--skin-divider-color); letter-spacing: .12em; }
.rt-custom-32 :deep(.rt-title::before) { width: .8em; height: .8em; border: 2px solid var(--skin-title-color); border-radius: 0; background: transparent !important; }
.rt-custom-32 :deep(.rt-title::after) { display: none; }
.rt-custom-32 :deep(.rt-item) { margin: 0; padding: .6em .7em; border: 0; border-left: 3px solid var(--skin-item-border); border-radius: 0; background: var(--skin-basic-row-bg) !important; }
.rt-custom-32 :deep(.rt-item + .rt-item) { margin-top: .5em; }
.rt-custom-32 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .35em; }
.rt-custom-32 :deep(.rt-skill) { border-radius: 0; border-style: dashed; text-align: center; }
.rt-custom-32 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-32 :deep(.rt-list li) { padding: .35em .55em; border: 1px solid var(--skin-item-border); background: var(--skin-basic-row-bg); }
</style>
