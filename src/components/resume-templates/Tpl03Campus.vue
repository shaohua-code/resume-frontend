<!-- AI简历风格模板 3：新锐校招海报 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-03 w-full bg-white">
    <div class="campus-poster-cap" aria-hidden="true">
      <b>NEW TALENT</b><span>PORTFOLIO / RESUME</span><i></i>
    </div>
    <ResumeStandardContent :resume="resume" :variant="3" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-03 { position: relative; word-break: break-word; }
.campus-poster-cap { display: grid; grid-template-columns: auto auto 1fr; align-items: center; gap: .8em; padding: .72em 1.4em; border-bottom: 5px solid var(--skin-top-band-bg); background: var(--skin-header-bg); color: var(--font-basic-content-color); pointer-events: none; }
.campus-poster-cap b { padding: .25em .55em; background: var(--skin-top-band-bg); color: var(--skin-title-color); letter-spacing: .12em; }
.campus-poster-cap span { font-size: .72em; font-weight: 800; letter-spacing: .18em; }
.campus-poster-cap i { height: 1px; background: var(--skin-header-border); }
.rt-custom-03 :deep(.rt-body) { counter-reset: campus-section; padding: 0 0 1.2em; }
.rt-custom-03 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr); gap: 1.2em; margin: 0 0 var(--section-gap); padding: 1.35em 1.45em; border: 0; background: var(--skin-header-bg); }
.rt-custom-03 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: 0 1.2em 0 0; border: 0; border-right: 1px solid var(--skin-header-border); text-align: left; }
.rt-custom-03 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.4em; height: 6.4em; margin: 0 1em 0 0; border: 3px solid var(--skin-top-band-bg); border-radius: 0; object-fit: cover; }
.rt-custom-03 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; line-height: 1.08 !important; letter-spacing: .12em; }
.rt-custom-03 :deep(.rt-slogan) { align-self: start; margin: .45em 0 0; font-weight: 800; letter-spacing: .14em; }
.rt-custom-03 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: center; gap: .5em; }
.rt-custom-03 :deep(.rt-basic-row) { padding: .5em .6em; border: 1px solid var(--skin-basic-row-border); border-radius: 0; background: var(--skin-basic-row-bg); }
.rt-custom-03 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-03 :deep(.rt-label) { min-width: auto; font-size: .82em; font-weight: 900; }
.rt-custom-03 :deep(.rt-section) { counter-increment: campus-section; margin: 0 1.45em var(--section-gap); }
.rt-custom-03 :deep(.rt-title) { display: grid; grid-template-columns: 2.6em auto 1fr; gap: .65em; margin: 0 0 .7em; font-size: 1.05em !important; letter-spacing: .08em; }
.rt-custom-03 :deep(.rt-title::before) { content: '0' counter(campus-section); width: auto; height: auto; padding: .18em .3em; border-radius: 0; background: var(--skin-top-band-bg) !important; color: var(--skin-title-color); text-align: center; }
.rt-custom-03 :deep(.rt-title::after) { height: 3px; background: linear-gradient(90deg, var(--skin-title-color) 0 76%, var(--skin-skill-border) 76%) !important; }
.rt-custom-03 :deep(.rt-item) { margin: 0 0 .65em; padding: .72em .9em; border: 0; border-left: 4px solid var(--skin-skill-border); border-radius: 0; background: var(--skin-item-bg); box-shadow: 3px 3px 0 var(--skin-item-border); }
.rt-custom-03 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5em; }
.rt-custom-03 :deep(.rt-skill) { padding: .48em .6em; border-radius: 0; text-align: center; }
.rt-custom-03 :deep(.rt-list) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em 1em; padding: 0; list-style: none; }
.rt-custom-03 :deep(.rt-list li) { padding-left: .8em; border-left: 3px solid var(--skin-top-band-bg); }
</style>
