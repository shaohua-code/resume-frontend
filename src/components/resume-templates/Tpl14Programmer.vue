<!-- AI简历风格模板 14：极夜技术蓝图 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-14 w-full bg-white">
    <div class="blueprint-console" aria-hidden="true">
      <span><i></i><i></i><i></i></span><b>PROFILE.SYSTEM / READY</b><em>14:TECH</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="14" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-14 { position: relative; word-break: break-word; background-image: linear-gradient(rgba(25, 167, 160, .045) 1px, transparent 1px), linear-gradient(90deg, rgba(25, 167, 160, .045) 1px, transparent 1px); background-size: 22px 22px; }
.blueprint-console { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1em; padding: .68em 1.25em; background: var(--skin-header-bg); color: var(--font-basic-content-color); pointer-events: none; }
.blueprint-console span { display: flex; gap: .35em; }
.blueprint-console i { width: .58em; height: .58em; border: 1px solid var(--skin-top-band-bg); border-radius: 50%; }
.blueprint-console i:first-child { background: var(--skin-top-band-bg); }
.blueprint-console b, .blueprint-console em { font-size: .7em; font-style: normal; letter-spacing: .15em; }
.blueprint-console em { color: var(--skin-top-band-bg); }
.rt-custom-14 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1.2em; padding: 0 1.35em 1.2em; }
.rt-custom-14 :deep(.rt-header) { grid-column: 1 / -1; margin: 0 -1.35em var(--section-gap); padding: 1.3em 1.35em; border-bottom: 5px solid var(--skin-top-band-bg); background: var(--skin-header-bg); }
.rt-custom-14 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-items: center; margin: 0 0 .9em; padding: 0 0 .9em; border: 0; border-bottom: 1px solid var(--skin-header-border); text-align: left; }
.rt-custom-14 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.6em; height: 5.6em; margin: 0 1em 0 0; border: 2px solid var(--skin-top-band-bg); border-radius: 3px; object-fit: cover; }
.rt-custom-14 :deep(.rt-name) { margin: 0; font-family: Consolas, monospace; letter-spacing: .08em; }
.rt-custom-14 :deep(.rt-name::before) { content: '{ '; color: var(--skin-top-band-bg); }
.rt-custom-14 :deep(.rt-name::after) { content: ' }'; color: var(--skin-top-band-bg); }
.rt-custom-14 :deep(.rt-slogan) { margin: .3em 0 0; font-family: Consolas, monospace; letter-spacing: .08em; }
.rt-custom-14 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45em; }
.rt-custom-14 :deep(.rt-basic-row) { padding: .48em .62em; border-radius: 2px; }
.rt-custom-14 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-14 :deep(.rt-label) { min-width: 0; font-family: Consolas, monospace; }
.rt-custom-14 :deep(.rt-label::before) { content: '$ '; color: var(--skin-top-band-bg); }
.rt-custom-14 :deep(.rt-section) { grid-column: 1 / -1; margin-bottom: var(--section-gap); }
.rt-custom-14 :deep(.rt-section[data-resume-module='skills']), .rt-custom-14 :deep(.rt-section[data-resume-module='awards']) { grid-column: span 1; }
.rt-custom-14 :deep(.rt-title) { gap: .55em; margin: 0 0 .65em; font-family: Consolas, monospace; letter-spacing: .06em; }
.rt-custom-14 :deep(.rt-title::before) { content: '//'; width: auto; height: auto; border-radius: 0; background: transparent !important; color: var(--skin-top-band-bg); }
.rt-custom-14 :deep(.rt-title::after) { height: 1px; background: repeating-linear-gradient(90deg, var(--skin-divider-color) 0 8px, transparent 8px 13px) !important; }
.rt-custom-14 :deep(.rt-item) { position: relative; margin-bottom: .65em; padding: .78em .9em .78em 1.15em; border-width: 1px 1px 1px 4px; border-radius: 2px; }
.rt-custom-14 :deep(.rt-item::after) { content: ''; position: absolute; top: -.18em; right: -.18em; width: .7em; height: .7em; border-top: 2px solid var(--skin-top-band-bg); border-right: 2px solid var(--skin-top-band-bg); }
.rt-custom-14 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em; }
.rt-custom-14 :deep(.rt-skill) { border-radius: 2px; font-family: Consolas, monospace; }
.rt-custom-14 :deep(.rt-skill::before) { content: '#'; margin-right: .3em; color: var(--skin-title-color); }
.rt-custom-14 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-14 :deep(.rt-list li) { padding: .35em 0; border-bottom: 1px dashed var(--skin-divider-color); }
.rt-custom-14 :deep(.rt-list li::before) { content: '[✓] '; color: var(--skin-title-color); font-family: Consolas, monospace; }
</style>
