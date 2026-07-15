<!-- AI简历风格模板 21：新野兽派作品档案 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-21 w-full bg-white">
    <div class="brutal-cap" aria-hidden="true"><b>21</b><span>MAKE / THINK / DELIVER</span><i></i><em>PROFILE</em></div>
    <ResumeStandardContent :resume="resume" :variant="21" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-21 { word-break: break-word; border: 3px solid var(--skin-header-border); }
.brutal-cap { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: .8em; padding: .6em .8em; border-bottom: 3px solid var(--skin-header-border); background: var(--skin-skill-bg); color: var(--font-content-color); pointer-events: none; }
.brutal-cap b { padding: .3em .55em; border: 2px solid var(--skin-header-border); background: var(--skin-top-band-bg); font-size: 1.15em; }
.brutal-cap span, .brutal-cap em { font-size: .7em; font-style: normal; font-weight: 900; letter-spacing: .14em; }
.brutal-cap i { height: 3px; background: var(--skin-header-border); }
.rt-custom-21 :deep(.rt-body) { counter-reset: brutal-section; padding: 0 1.1em 1.1em; }
.rt-custom-21 :deep(.rt-header) { margin: 0 -1.1em var(--section-gap); padding: 1.25em 1.2em; border-bottom: 3px solid var(--skin-header-border); background: var(--skin-header-bg); }
.rt-custom-21 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-items: center; margin: 0 0 .85em; padding: 0; border: 0; text-align: left; }
.rt-custom-21 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.6em; height: 5.6em; margin: 0 1em 0 0; border: 3px solid var(--skin-header-border); border-radius: 0; box-shadow: 6px 6px 0 var(--skin-top-band-bg); object-fit: cover; }
.rt-custom-21 :deep(.rt-name) { margin: 0; font-size: 2.55em !important; line-height: 1 !important; letter-spacing: .04em; text-transform: uppercase; }
.rt-custom-21 :deep(.rt-slogan) { margin: .4em 0 0; font-weight: 900; letter-spacing: .12em; }
.rt-custom-21 :deep(.rt-basic-grid) { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5em; }
.rt-custom-21 :deep(.rt-basic-row) { display: block; padding: .52em .6em; border: 2px solid var(--skin-basic-row-border); border-radius: 0; box-shadow: 3px 3px 0 var(--skin-basic-row-border); }
.rt-custom-21 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-21 :deep(.rt-label) { display: block; min-width: 0; margin-bottom: .18em; font-size: .7em; letter-spacing: .1em; }
.rt-custom-21 :deep(.rt-section) { counter-increment: brutal-section; margin-bottom: var(--section-gap); }
.rt-custom-21 :deep(.rt-title) { display: grid; grid-template-columns: 2em auto 1fr; gap: .6em; margin: 0 0 .65em; font-size: 1.08em !important; text-transform: uppercase; }
.rt-custom-21 :deep(.rt-title::before) { content: counter(brutal-section); width: auto; height: auto; padding: .08em .25em; border: 2px solid var(--skin-header-border); border-radius: 0; background: var(--skin-top-band-bg) !important; color: var(--font-content-color); text-align: center; }
.rt-custom-21 :deep(.rt-title::after) { height: 3px; background: var(--skin-header-border) !important; }
.rt-custom-21 :deep(.rt-item) { margin: 0 0 .75em; padding: .75em .85em; border: 2px solid var(--skin-item-border); border-radius: 0; box-shadow: 5px 5px 0 var(--skin-skill-border); }
.rt-custom-21 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5em; }
.rt-custom-21 :deep(.rt-skill) { padding: .5em; border: 2px solid var(--skin-skill-border); border-radius: 0; text-align: center; text-transform: uppercase; }
.rt-custom-21 :deep(.rt-list) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5em; padding: 0; list-style: none; }
.rt-custom-21 :deep(.rt-list li) { padding: .5em .65em; border: 2px solid var(--skin-item-border); background: var(--skin-item-bg); }
</style>
