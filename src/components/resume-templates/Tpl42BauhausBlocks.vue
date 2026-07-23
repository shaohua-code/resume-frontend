<!-- AI简历风格模板 42：包豪斯积木，以基础几何、粗线和模块色块塑造大胆秩序。 -->
<script setup>
// 标准内容继续负责字段与分页语义，本组件仅提供几何构成样式。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 几何图形不承载用户内容，关闭交互以保护模块点击。 -->
  <div class="resume-template rt rt-custom-42 w-full bg-white">
    <div class="bauhaus-shapes" aria-hidden="true">
      <i></i><i></i><i></i><b>FORM 42</b><span>CAREER / FUNCTION</span>
    </div>
    <ResumeStandardContent :resume="resume" :variant="42" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 圆、方、线三种基础形态与粗边框构成鲜明包豪斯视觉。 */
.rt-custom-42 { word-break: break-word; background: var(--skin-item-bg); border: 3px solid var(--skin-header-border); }
.bauhaus-shapes { display: grid; grid-template-columns: 2.2em 2.2em 4.4em auto 1fr; align-items: center; gap: .55em; padding: .65em 1.1em; border-bottom: 3px solid var(--skin-header-border); color: var(--font-content-color); pointer-events: none; }
.bauhaus-shapes i:first-child { height: 2.2em; border-radius: 50%; background: var(--skin-top-band-bg); }
.bauhaus-shapes i:nth-child(2) { height: 2.2em; background: var(--skin-skill-border); }
.bauhaus-shapes i:nth-child(3) { height: .45em; background: var(--skin-title-color); }
.bauhaus-shapes b,
.bauhaus-shapes span { font-size: .68em; letter-spacing: .14em; }

/* 头部采用大胆双色块分区，头像裁切范围仅限自身。 */
.rt-custom-42 :deep(.rt-body) { padding: 1em 0 1.25em; }
.rt-custom-42 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 0; margin-bottom: var(--section-gap); border: 3px solid var(--skin-header-border); background: var(--skin-header-bg); box-shadow: .5em .5em 0 var(--skin-top-band-bg); }
.rt-custom-42 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: 1em; border: 0; border-right: 3px solid var(--skin-header-border); background: var(--skin-top-band-bg); text-align: left; }
.rt-custom-42 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.1em; height: 5.1em; margin: 0 .85em 0 0; border: 3px solid var(--skin-header-border); border-radius: 50% 0 50% 50%; object-fit: cover; }
.rt-custom-42 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: .95 !important; letter-spacing: .02em; }
.rt-custom-42 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 900; letter-spacing: .1em; }
.rt-custom-42 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; }
.rt-custom-42 :deep(.rt-basic-row) { display: block; padding: .48em .55em; border: 0; border-right: 2px solid var(--skin-basic-row-border); border-bottom: 2px solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-42 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-42 :deep(.rt-label) { display: block; min-width: 0; font-size: .65em; letter-spacing: .1em; }

/* 模块用粗框和交替顶色区分，长经历仍可直接跨页。 */
.rt-custom-42 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .85em .95em; border: 3px solid var(--skin-item-border); background: var(--skin-item-bg); box-shadow: .38em .38em 0 var(--skin-divider-color); }
.rt-custom-42 :deep(.rt-section:nth-of-type(3n + 1)) { border-top: .7em solid var(--skin-top-band-bg); }
.rt-custom-42 :deep(.rt-section:nth-of-type(3n + 2)) { border-top: .7em solid var(--skin-skill-border); }
.rt-custom-42 :deep(.rt-section:nth-of-type(3n)) { border-top: .7em solid var(--skin-title-color); }
.rt-custom-42 :deep(.rt-title) { gap: .55em; margin: 0 0 .6em; letter-spacing: .1em; }
.rt-custom-42 :deep(.rt-title)::before { width: 1.05em; height: 1.05em; border: 3px solid var(--skin-header-border); border-radius: 50%; background: var(--skin-top-band-bg) !important; }
.rt-custom-42 :deep(.rt-title)::after { height: 3px; background: var(--skin-header-border) !important; }
.rt-custom-42 :deep(.rt-item) { margin: 0; padding: .62em .65em; border: 0; border-left: .45em solid var(--skin-item-border); border-radius: 0; background: var(--skin-basic-row-bg) !important; }
.rt-custom-42 :deep(.rt-item + .rt-item) { margin-top: .5em; }
.rt-custom-42 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .4em; }
.rt-custom-42 :deep(.rt-skill) { border: 2px solid var(--skin-skill-border); border-radius: 0; text-align: center; }
.rt-custom-42 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-42 :deep(.rt-list li) { padding: .4em .55em; border: 2px solid var(--skin-item-border); }
</style>
