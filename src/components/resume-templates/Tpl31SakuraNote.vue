<!-- AI简历风格模板 31：樱色手账，以点线、便签和柔和圆角营造亲和表达。 -->
<script setup>
// 使用共享内容保证字段与 data-resume-module 完整，本文件只添加手账视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 手账底纹不承载正文，根节点保持正常流与可分页高度。 -->
  <div class="resume-template rt rt-custom-31 w-full bg-white">
    <div class="sakura-tabs" aria-hidden="true">
      <b>PROFILE NOTE</b><span>01</span><span>02</span><span>03</span><em>31</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="31" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 左侧装订色带与顶部页签形成轻量手账感，不对正文做 overflow 裁切。 */
.rt-custom-31 { word-break: break-word; background: linear-gradient(90deg, var(--skin-basic-row-bg) 0 1em, var(--skin-item-bg) 1em); }
.sakura-tabs { display: grid; grid-template-columns: 1fr repeat(3, auto) auto; gap: .45em; align-items: end; padding: .65em 1.2em .65em 1.8em; border-bottom: 1px dashed var(--skin-divider-color); color: var(--font-content-color); pointer-events: none; }
.sakura-tabs b { font-size: .68em; letter-spacing: .16em; }
.sakura-tabs span { padding: .3em .55em; border: 1px solid var(--skin-basic-row-border); border-radius: .8em .8em 0 0; background: var(--skin-basic-row-bg); font-size: .62em; }
.sakura-tabs em { padding: .35em .6em; border-radius: 50%; background: var(--skin-top-band-bg); color: var(--font-basic-content-color); font-style: normal; font-weight: 900; }

/* 头部像贴入手账的个人卡片，头像框可裁切但不包裹正文。 */
.rt-custom-31 :deep(.rt-body) { padding: 1em 0 1.2em; }
.rt-custom-31 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1em; border: 1px dashed var(--skin-header-border); border-radius: 1.2em; background: var(--skin-header-bg); box-shadow: .35em .35em 0 var(--skin-basic-row-bg); }
.rt-custom-31 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .7em; border: 0; border-radius: .9em; background: var(--skin-basic-row-bg); text-align: left; }
.rt-custom-31 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 4.8em; height: 5.4em; margin: 0 .8em 0 0; border: 4px solid var(--skin-skill-border); border-radius: 50% 50% .5em .5em; object-fit: cover; }
.rt-custom-31 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.2em !important; line-height: 1 !important; letter-spacing: .08em; }
.rt-custom-31 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; padding-bottom: .2em; border-bottom: 2px dotted var(--skin-top-band-bg); font-weight: 700; }
.rt-custom-31 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42em; align-content: center; }
.rt-custom-31 :deep(.rt-basic-row) { display: block; padding: .44em .55em; border: 0; border-bottom: 1px dotted var(--skin-basic-row-border); border-radius: 0; background: transparent !important; }
.rt-custom-31 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-31 :deep(.rt-label) { display: block; min-width: 0; font-size: .68em; }

/* 模块以可自然延展的便签块展示，长描述仍能跨页。 */
.rt-custom-31 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .85em 1em; border: 1px dashed var(--skin-item-border); border-radius: .8em; background: var(--skin-item-bg); }
.rt-custom-31 :deep(.rt-section:nth-of-type(even)) { background: var(--skin-basic-row-bg); }
.rt-custom-31 :deep(.rt-title) { gap: .55em; margin: 0 0 .6em; letter-spacing: .08em; }
.rt-custom-31 :deep(.rt-title::before) { content: '✿'; width: auto; height: auto; border-radius: 0; background: transparent !important; color: var(--skin-top-band-bg); }
.rt-custom-31 :deep(.rt-title::after) { height: 1px; background: repeating-linear-gradient(90deg, var(--skin-divider-color) 0 .4em, transparent .4em .75em) !important; }
.rt-custom-31 :deep(.rt-item) { margin: 0; padding: .62em .2em; border: 0; border-bottom: 1px dotted var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-31 :deep(.rt-skills) { gap: .45em; }
.rt-custom-31 :deep(.rt-skill) { border-style: dashed; border-radius: .75em; }
.rt-custom-31 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-31 :deep(.rt-list li) { padding: .34em .55em; border-bottom: 1px dotted var(--skin-divider-color); }
</style>
