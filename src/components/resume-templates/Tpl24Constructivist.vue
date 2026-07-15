<!-- AI简历风格模板 24：构成主义建筑档案 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-24 w-full bg-white">
    <div class="construct-cap" aria-hidden="true"><b>FORM</b><i></i><span>FUNCTION</span><em>24</em></div>
    <ResumeStandardContent :resume="resume" :variant="24" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-24 { position: relative; word-break: break-word; background: linear-gradient(90deg, var(--skin-top-band-bg) 0 .8em, white .8em); }
.construct-cap { display: grid; grid-template-columns: auto 4em 1fr auto; align-items: center; gap: .8em; padding: .7em 1.25em .7em 1.8em; color: var(--skin-title-color); pointer-events: none; }
.construct-cap b, .construct-cap span { font-size: .75em; letter-spacing: .2em; }
.construct-cap i { height: 2.2em; background: var(--skin-header-bg); transform: skewX(-28deg); }
.construct-cap em { width: 2.6em; height: 2.6em; border-radius: 50%; background: var(--skin-top-band-bg); color: white; font-style: normal; font-weight: 900; line-height: 2.6em; text-align: center; }
.rt-custom-24 :deep(.rt-body) { padding: 0 1.25em 1.2em 1.8em; }
.rt-custom-24 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(0, .88fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1.1em; border: 0; background: var(--skin-header-bg); box-shadow: 8px 8px 0 var(--skin-skill-bg); }
.rt-custom-24 :deep(.rt-banner) { display: grid; grid-template-columns: 1fr auto; align-content: center; margin: 0; padding: 0 1em 0 0; border: 0; border-right: 4px solid var(--skin-top-band-bg); text-align: left; }
.rt-custom-24 :deep(.rt-banner-avatar) { grid-column: 2; grid-row: 1 / 3; width: 5em; height: 6.2em; margin: 0 0 0 1em; border: 0; border-radius: 0 3em 0 0; object-fit: cover; }
.rt-custom-24 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.45em !important; line-height: 1 !important; letter-spacing: .02em; }
.rt-custom-24 :deep(.rt-slogan) { align-self: start; margin: .45em 0 0; font-weight: 900; letter-spacing: .1em; }
.rt-custom-24 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--skin-basic-row-border); border-left: 1px solid var(--skin-basic-row-border); }
.rt-custom-24 :deep(.rt-basic-row) { display: block; padding: .5em .6em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-24 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-24 :deep(.rt-label) { display: block; min-width: 0; font-size: .67em; letter-spacing: .12em; }
.rt-custom-24 :deep(.rt-section) { display: grid; grid-template-columns: 3.8em minmax(0, 1fr); gap: 0 1em; margin-bottom: var(--section-gap); }
.rt-custom-24 :deep(.rt-title) { grid-row: 1 / span 20; display: block; margin: 0; padding: .55em .35em; border: 2px solid var(--skin-title-color); background: var(--skin-skill-bg); text-align: center; writing-mode: vertical-rl; letter-spacing: .12em; }
.rt-custom-24 :deep(.rt-title::before), .rt-custom-24 :deep(.rt-title::after) { display: none; }
.rt-custom-24 :deep(.rt-item), .rt-custom-24 :deep(.rt-skills), .rt-custom-24 :deep(.rt-list), .rt-custom-24 :deep(.rt-text) { grid-column: 2; }
.rt-custom-24 :deep(.rt-item) { margin: 0 0 .6em; padding: .72em .85em; border: 0; border-left: 6px solid var(--skin-top-band-bg); border-radius: 0; background: var(--skin-item-bg); box-shadow: 4px 4px 0 var(--skin-item-border); }
.rt-custom-24 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45em; }
.rt-custom-24 :deep(.rt-skill) { border-radius: 0; text-align: center; }
.rt-custom-24 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-24 :deep(.rt-list li) { padding: .4em .6em; border-bottom: 2px solid var(--skin-divider-color); }
</style>
