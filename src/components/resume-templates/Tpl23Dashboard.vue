<!-- AI简历风格模板 23：信息仪表盘 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-23 w-full bg-white">
    <div class="dash-status" aria-hidden="true"><b>PROFILE OVERVIEW</b><span>● ACTIVE</span><i>23 / DATA</i></div>
    <ResumeStandardContent :resume="resume" :variant="23" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-23 { word-break: break-word; background: var(--skin-header-bg); }
.dash-status { display: grid; grid-template-columns: 1fr auto auto; gap: 1em; padding: .7em 1.2em; border-bottom: 1px solid var(--skin-header-border); color: var(--font-basic-content-color); pointer-events: none; }
.dash-status b, .dash-status span, .dash-status i { font-size: .7em; font-style: normal; letter-spacing: .14em; }
.dash-status span { color: var(--skin-top-band-bg); }
.rt-custom-23 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--section-gap); padding: 1.15em; }
.rt-custom-23 :deep(.rt-header) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, .78fr) minmax(0, 1.22fr); gap: 1em; margin: 0; padding: 1em; border: 1px solid var(--skin-header-border); border-radius: 8px; background: var(--skin-basic-row-bg); }
.rt-custom-23 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: 0 1em 0 0; border: 0; border-right: 1px solid var(--skin-header-border); text-align: left; }
.rt-custom-23 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 4.8em; height: 4.8em; margin: 0 .85em 0 0; border: 3px solid var(--skin-top-band-bg); border-radius: 12px; object-fit: cover; }
.rt-custom-23 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.1em !important; letter-spacing: .08em; }
.rt-custom-23 :deep(.rt-slogan) { align-self: start; margin: .3em 0 0; }
.rt-custom-23 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .42em; }
.rt-custom-23 :deep(.rt-basic-row) { display: block; padding: .48em .55em; border: 1px solid var(--skin-basic-row-border); border-radius: 6px; background: var(--skin-basic-row-bg); }
.rt-custom-23 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-23 :deep(.rt-label) { display: block; min-width: 0; margin-bottom: .12em; font-size: .68em; letter-spacing: .08em; }
.rt-custom-23 :deep(.rt-section) { grid-column: span 1; margin: 0; padding: .85em .9em; border: 1px solid var(--skin-item-border); border-radius: 8px; background: var(--skin-item-bg); box-shadow: 0 4px 0 var(--skin-divider-color); }
.rt-custom-23 :deep(.rt-section[data-resume-module='work_experience']), .rt-custom-23 :deep(.rt-section[data-resume-module='projects']), .rt-custom-23 :deep(.rt-section[data-resume-module='basic']) { grid-column: 1 / -1; }
.rt-custom-23 :deep(.rt-title) { gap: .55em; margin: 0 0 .6em; font-size: .98em !important; letter-spacing: .08em; }
.rt-custom-23 :deep(.rt-title::before) { width: .75em; height: .75em; border: 3px solid var(--skin-top-band-bg); border-radius: 3px; background: var(--skin-skill-bg) !important; }
.rt-custom-23 :deep(.rt-title::after) { height: 1px; background: var(--skin-divider-color) !important; }
.rt-custom-23 :deep(.rt-item) { margin: 0; padding: .62em 0; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-23 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4em; }
.rt-custom-23 :deep(.rt-skill) { padding: .4em .55em; border-radius: 5px; text-align: center; }
.rt-custom-23 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-23 :deep(.rt-list li) { padding: .35em .45em; border-left: 3px solid var(--skin-top-band-bg); }
</style>
