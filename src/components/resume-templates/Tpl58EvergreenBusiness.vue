<!-- AI简历模板 58：墨绿商务，深松绿与浅石色的稳健组合，强调责任范围和专业积累。 -->
<script setup>
// 共享标准内容负责字段、显隐与定位，本组件只提供独立视觉语言。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'
defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 装饰条处于普通文档流且不接收点击，正文仍由标准模块完整渲染。 -->
  <div class="resume-template rt rt-custom-58 w-full bg-white">
    <div class="template-masthead" aria-hidden="true"><b>58</b><span>墨绿商务</span><i></i><em>CURRICULUM VITAE</em></div>
    <ResumeStandardContent :resume="resume" :variant="58" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 深松绿与浅石色的稳健组合，强调责任范围和专业积累。 */
.rt-custom-58 { word-break: break-word; color: var(--font-content-color); background: linear-gradient(90deg,#f4f7f4 0 .38em,#fff .38em); }
.template-masthead { display:flex; align-items:center; gap:.7em; padding:.65em 1.4em; border-bottom:1px solid var(--skin-divider-color); color:var(--skin-title-color); pointer-events:none; }
.template-masthead b { display:grid; place-items:center; width:2em; height:2em; background:var(--skin-top-band-bg); color:var(--font-basic-content-color); font-size:.72em; }
.template-masthead span,.template-masthead em { font-size:.62em; font-style:normal; font-weight:800; letter-spacing:.14em; }
.template-masthead i { flex:1; height:1px; background:var(--skin-divider-color); }
.rt-custom-58 :deep(.rt-body) { padding:1.35em 1.7em; }
.rt-custom-58 :deep(.rt-header) { display:grid; grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); align-items:center; gap:1.1em; margin-bottom:var(--section-gap); padding:1em 1.15em; border:1px solid var(--skin-header-border); border-top:.35em solid var(--skin-top-band-bg); background:var(--skin-header-bg); }
.rt-custom-58 :deep(.rt-banner) { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:.7em; margin:0; padding:.3em; border:0; text-align:left; }
.rt-custom-58 :deep(.rt-banner-avatar) { grid-row:span 2; width:4.8em; height:4.8em; margin:0; border:2px solid var(--skin-item-bg); border-radius:.35em; object-fit:cover; }
.rt-custom-58 :deep(.rt-name) { align-self:end; margin:0; font-size:2.2em !important; line-height:1.08 !important; letter-spacing:.06em; }
.rt-custom-58 :deep(.rt-slogan) { align-self:start; margin:.3em 0 0; color:var(--font-label-color); font-size:.92em; }
.rt-custom-58 :deep(.rt-basic-grid) { grid-template-columns:repeat(2,minmax(0,1fr));gap:.35em; }
.rt-custom-58 :deep(.rt-basic-row) { display:grid; grid-template-columns:5em minmax(0,1fr); gap:.35em; min-width:0; padding:.34em .45em; border:0; border-bottom:1px solid var(--skin-basic-row-border); border-radius:0; background:transparent; }
.rt-custom-58 :deep(.rt-label) { min-width:0; }
.rt-custom-58 :deep(.rt-section) { margin-bottom:var(--section-gap); }
.rt-custom-58 :deep(.rt-title) { gap:.6em; margin-bottom:.7em; color:var(--skin-title-color); border-bottom:2px solid var(--skin-top-band-bg); }
.rt-custom-58 :deep(.rt-title)::before { width:.4em; height:1em; border-radius:2px; background:var(--skin-top-band-bg) !important; }
.rt-custom-58 :deep(.rt-title)::after { height:1px; background:var(--skin-divider-color) !important; }
.rt-custom-58 :deep(.rt-item) { margin-bottom:.48em; padding:.65em .8em; border:0;border-left:4px solid var(--skin-item-border);border-radius:0;background:var(--skin-item-bg); }
.rt-custom-58 :deep(.rt-item-header) { color:var(--font-content-color); }
.rt-custom-58 :deep(.rt-sub) { color:var(--font-label-color); }
.rt-custom-58 :deep(.rt-text), .rt-custom-58 :deep(.rt-desc) { color:var(--font-content-color); }
.rt-custom-58 :deep(.rt-skill) { border-radius:.25em;background:var(--skin-skill-bg); }
.rt-custom-58 :deep(.rt-list) { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.25em 1em; padding-left:1.1em; }

</style>

