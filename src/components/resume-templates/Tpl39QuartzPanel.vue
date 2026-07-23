<!-- AI简历风格模板 39：水晶面板，以半透明感边框和几何切面组织信息。 -->
<script setup>
// 复用标准内容的字段映射与模块语义，本组件只塑造水晶面板视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 几何切面均为装饰块，正文根容器不使用 overflow 或固定高度。 -->
  <div class="resume-template rt rt-custom-39 w-full bg-white">
    <div class="quartz-band" aria-hidden="true">
      <i></i><i></i><b>CRYSTAL PROFILE</b><span>FACET 39</span>
    </div>
    <ResumeStandardContent :resume="resume" :variant="39" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 渐变切面、细边和悬浮阴影营造轻盈的水晶信息面板。 */
.rt-custom-39 { word-break: break-word; background: linear-gradient(135deg, var(--skin-basic-row-bg), var(--skin-item-bg) 42%, var(--skin-skill-bg)); }
.quartz-band { display: grid; grid-template-columns: 4em 7em 1fr auto; gap: .25em; align-items: center; padding: .55em 1.25em; color: var(--font-content-color); pointer-events: none; }
.quartz-band i:first-child { height: 2.2em; background: linear-gradient(135deg, var(--skin-top-band-bg), var(--skin-skill-border)); }
.quartz-band i:nth-child(2) { height: 2.2em; background: linear-gradient(135deg, var(--skin-divider-color), transparent); }
.quartz-band b,
.quartz-band span { font-size: .67em; letter-spacing: .14em; }
.quartz-band span { padding: .3em .55em; border: 1px solid var(--skin-header-border); }

/* 头部使用通透双面板，头像只在自身多边框内裁切。 */
.rt-custom-39 :deep(.rt-body) { padding: .55em 0 1.25em; }
.rt-custom-39 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: .8em; margin-bottom: var(--section-gap); padding: .9em; border: 1px solid var(--skin-header-border); background: var(--skin-header-bg); box-shadow: 0 .5em 1.2em var(--skin-divider-color); }
.rt-custom-39 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 1px solid var(--skin-header-border); background: var(--skin-basic-row-bg); text-align: left; }
.rt-custom-39 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 5.5em; margin: 0 .85em 0 0; border: .35em double var(--skin-top-band-bg); border-radius: 1.4em .25em 1.4em .25em; object-fit: cover; }
.rt-custom-39 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; line-height: 1 !important; letter-spacing: .05em; }
.rt-custom-39 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 700; }
.rt-custom-39 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4em; align-content: center; }
.rt-custom-39 :deep(.rt-basic-row) { display: block; padding: .42em .5em; border-radius: .75em .15em .75em .15em; }
.rt-custom-39 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-39 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .08em; }

/* 模块以不同切面边框区分，内容高度仍由真实文本自然撑开。 */
.rt-custom-39 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .85em .95em; border: 1px solid var(--skin-item-border); border-radius: 1.2em .2em 1.2em .2em; background: var(--skin-item-bg); box-shadow: .3em .35em 0 var(--skin-divider-color); }
.rt-custom-39 :deep(.rt-section:nth-of-type(even)) { border-radius: .2em 1.2em .2em 1.2em; }
.rt-custom-39 :deep(.rt-title) { gap: .6em; margin: 0 0 .6em; letter-spacing: .08em; }
.rt-custom-39 :deep(.rt-title)::before { width: 1em; height: 1em; border: .3em double var(--skin-title-color); border-radius: .75em .1em .75em .1em; background: transparent !important; }
.rt-custom-39 :deep(.rt-title)::after { height: .4em; background: linear-gradient(90deg, var(--skin-divider-color), transparent) !important; }
.rt-custom-39 :deep(.rt-item) { margin: 0; padding: .6em .2em; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-39 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .4em; }
.rt-custom-39 :deep(.rt-skill) { border-radius: .7em .1em .7em .1em; text-align: center; }
.rt-custom-39 :deep(.rt-list) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4em; padding: 0; list-style: none; }
.rt-custom-39 :deep(.rt-list li) { padding: .38em .5em; border: 1px solid var(--skin-item-border); background: var(--skin-basic-row-bg); }
</style>
