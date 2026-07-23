<!-- AI简历风格模板 47：亚麻书信，以信纸抬头、细边和温柔留白呈现真诚表达。 -->
<script setup>
// 共享标准 DOM 确保字段、空数据和定位契约，本组件只定义书信式外观。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 信纸抬头为普通流装饰，不使用固定定位或遮罩正文。 -->
  <div class="resume-template rt rt-custom-47 w-full bg-white">
    <div class="linen-letterhead" aria-hidden="true">
      <b>PERSONAL LETTER</b><i></i><span>WITH PURPOSE &amp; EXPERIENCE</span><em>47</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="47" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 亚麻纸色、邮线和信签留白构成温和而正式的书信风格。 */
.rt-custom-47 { word-break: break-word; background: linear-gradient(90deg, var(--skin-basic-row-bg) 0 .55em, var(--skin-item-bg) .55em); }
.linen-letterhead { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: .8em; padding: .85em 1.35em .75em 1.6em; border-bottom: 3px double var(--skin-divider-color); color: var(--font-content-color); pointer-events: none; }
.linen-letterhead b,
.linen-letterhead span { font-size: .65em; letter-spacing: .16em; }
.linen-letterhead i { height: 1px; background: var(--skin-divider-color); }
.linen-letterhead em { padding: .35em .55em; border: 1px solid var(--skin-top-band-bg); color: var(--skin-title-color); font-style: normal; font-weight: 900; }

/* 头部像一封正式求职信的署名区，头像固定为邮票式媒体框。 */
.rt-custom-47 :deep(.rt-body) { padding: 1.1em 0 1.35em; }
.rt-custom-47 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, 1.02fr) minmax(0, .98fr); gap: 1.4em; margin-bottom: var(--section-gap); padding: 1em 0 1.1em; border: 0; border-bottom: 1px solid var(--skin-header-border); background: transparent; }
.rt-custom-47 :deep(.rt-banner) { display: grid; grid-template-columns: 1fr auto; align-content: center; margin: 0; padding: .8em; border: 1px solid var(--skin-header-border); border-radius: .2em; background: var(--skin-header-bg); text-align: left; box-shadow: .32em .32em 0 var(--skin-divider-color); }
.rt-custom-47 :deep(.rt-banner-avatar) { grid-column: 2; grid-row: 1 / 3; width: 4.8em; height: 5.8em; margin: 0 0 0 .9em; border: .35em double var(--skin-top-band-bg); border-radius: 0; object-fit: cover; }
.rt-custom-47 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: 1 !important; letter-spacing: .09em; }
.rt-custom-47 :deep(.rt-slogan) { align-self: start; margin: .45em 0 0; font-weight: 600; letter-spacing: .08em; }
.rt-custom-47 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5em 1em; align-content: center; }
.rt-custom-47 :deep(.rt-basic-row) { display: grid; grid-template-columns: auto 1fr; gap: .5em; padding: .35em 0; border: 0; border-bottom: 1px dotted var(--skin-basic-row-border); border-radius: 0; background: transparent !important; }
.rt-custom-47 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-47 :deep(.rt-label) { min-width: 0; font-size: .65em; letter-spacing: .08em; }

/* 模块像信件段落，以小题签和左侧细线维持连续阅读。 */
.rt-custom-47 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .3em 0 .3em 1em; border-left: 2px solid var(--skin-divider-color); }
.rt-custom-47 :deep(.rt-title) { gap: .65em; margin: 0 0 .65em; letter-spacing: .1em; }
.rt-custom-47 :deep(.rt-title)::before { width: 1.5em; height: .35em; border-radius: 999px; background: var(--skin-top-band-bg) !important; }
.rt-custom-47 :deep(.rt-title)::after { height: 1px; background: linear-gradient(90deg, var(--skin-divider-color), transparent) !important; }
.rt-custom-47 :deep(.rt-item) { margin: 0; padding: .62em .3em; border: 0; border-bottom: 1px dotted var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-47 :deep(.rt-skills) { gap: .45em; }
.rt-custom-47 :deep(.rt-skill) { border-radius: .2em; border-style: dotted; background: var(--skin-skill-bg) !important; }
.rt-custom-47 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-47 :deep(.rt-list li) { padding: .35em .55em; border-bottom: 1px dotted var(--skin-divider-color); }
</style>
