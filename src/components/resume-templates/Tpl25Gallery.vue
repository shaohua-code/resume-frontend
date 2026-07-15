<!-- AI简历风格模板 25：策展画廊拼贴 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-25 w-full bg-white">
    <div class="gallery-ribbon" aria-hidden="true"><i></i><b>SELECTED WORK &amp; EXPERIENCE</b><span></span><em>25</em></div>
    <ResumeStandardContent :resume="resume" :variant="25" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-25 { word-break: break-word; }
.gallery-ribbon { display: grid; grid-template-columns: 5em auto 1fr auto; align-items: center; gap: .8em; padding: .65em 1.3em; background: var(--skin-header-bg); color: var(--skin-basic-row-bg); pointer-events: none; }
.gallery-ribbon i { height: 1.5em; background: var(--skin-top-band-bg); transform: skewX(-25deg); }
.gallery-ribbon b { font-size: .7em; letter-spacing: .16em; }
.gallery-ribbon span { height: 1px; background: var(--skin-header-border); }
.gallery-ribbon em { font-style: normal; font-weight: 900; }
.rt-custom-25 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1.15em; padding: 1.2em 1.35em; }
.rt-custom-25 :deep(.rt-header) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .9fr); gap: 1.2em; margin-bottom: var(--section-gap); padding-bottom: 1em; border-bottom: 5px solid var(--skin-top-band-bg); }
.rt-custom-25 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: 1em; border: 0; background: var(--skin-basic-row-bg); text-align: left; }
.rt-custom-25 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.8em; height: 6.8em; margin: 0 1em 0 0; border: 5px solid white; border-radius: 0; box-shadow: 7px 7px 0 var(--skin-skill-border); object-fit: cover; }
.rt-custom-25 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: 1.04 !important; letter-spacing: .05em; }
.rt-custom-25 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 800; letter-spacing: .1em; }
.rt-custom-25 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5em; align-content: center; }
.rt-custom-25 :deep(.rt-basic-row) { display: block; padding: .5em .6em; border: 0; border-left: 4px solid var(--skin-basic-row-border); border-radius: 0; background: var(--skin-basic-row-bg); }
.rt-custom-25 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-25 :deep(.rt-label) { display: block; min-width: 0; font-size: .68em; letter-spacing: .12em; }
.rt-custom-25 :deep(.rt-section) { grid-column: span 1; margin-bottom: var(--section-gap); padding: .9em; border: 1px solid var(--skin-item-border); background: var(--skin-item-bg); }
.rt-custom-25 :deep(.rt-section[data-resume-module='work_experience']), .rt-custom-25 :deep(.rt-section[data-resume-module='projects']), .rt-custom-25 :deep(.rt-section[data-resume-module='basic']) { grid-column: 1 / -1; }
.rt-custom-25 :deep(.rt-section:nth-of-type(3n + 1)) { border-top: 6px solid var(--skin-top-band-bg); }
.rt-custom-25 :deep(.rt-section:nth-of-type(3n + 2)) { border-top: 6px solid var(--skin-skill-border); }
.rt-custom-25 :deep(.rt-section:nth-of-type(3n)) { border-top: 6px solid var(--skin-title-color); }
.rt-custom-25 :deep(.rt-title) { gap: .55em; margin: 0 0 .65em; font-size: 1.02em !important; letter-spacing: .1em; }
.rt-custom-25 :deep(.rt-title::before) { width: 1.15em; height: 1.15em; border-radius: 50% 0 50% 50%; background: var(--skin-top-band-bg) !important; }
.rt-custom-25 :deep(.rt-title::after) { height: 2px; background: var(--skin-divider-color) !important; }
.rt-custom-25 :deep(.rt-item) { margin: 0; padding: .65em 0; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-25 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45em; }
.rt-custom-25 :deep(.rt-skill) { border-radius: 0 1em 1em 1em; text-align: center; }
.rt-custom-25 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-25 :deep(.rt-list li) { padding: .4em .6em; border-left: 4px solid var(--skin-top-band-bg); }
</style>
