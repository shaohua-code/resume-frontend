<!-- AI简历风格模板 15：跨境航空名片 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-15 w-full bg-white">
    <div class="airmail-band" aria-hidden="true"><b>GLOBAL PROFILE</b><span>CN / EN</span><i>15</i></div>
    <ResumeStandardContent :resume="resume" :variant="15" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-15 { word-break: break-word; border-top: 10px solid transparent; border-image: repeating-linear-gradient(135deg, var(--skin-title-color) 0 18px, white 18px 30px, var(--skin-top-band-bg) 30px 48px, white 48px 60px) 10; }
.airmail-band { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 1em; padding: .6em 1.4em; border-bottom: 1px solid var(--skin-header-border); color: var(--skin-title-color); pointer-events: none; }
.airmail-band b { letter-spacing: .18em; }
.airmail-band span { font-size: .72em; font-weight: 800; letter-spacing: .16em; }
.airmail-band i { padding: .2em .55em; background: var(--skin-top-band-bg); color: white; font-style: normal; font-weight: 900; }
.rt-custom-15 :deep(.rt-body) { padding: 1.15em 1.4em; }
.rt-custom-15 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); gap: 1.2em; margin-bottom: var(--section-gap); padding: 1.1em; border: 1px solid var(--skin-header-border); background: var(--skin-header-bg); box-shadow: 6px 6px 0 var(--skin-basic-row-border); }
.rt-custom-15 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: 0 1em 0 0; border: 0; border-right: 1px dashed var(--skin-header-border); text-align: left; }
.rt-custom-15 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.2em; height: 5.8em; margin: 0 .9em 0 0; border: 0; border-radius: 50% 50% 8px 8px; object-fit: cover; }
.rt-custom-15 :deep(.rt-name) { align-self: end; margin: 0; letter-spacing: .14em; }
.rt-custom-15 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; letter-spacing: .12em; }
.rt-custom-15 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em; }
.rt-custom-15 :deep(.rt-basic-row) { display: block; padding: .45em .55em; border: 0; border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; background: transparent !important; }
.rt-custom-15 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-15 :deep(.rt-label) { display: block; min-width: 0; font-size: .7em; font-weight: 900; letter-spacing: .12em; }
.rt-custom-15 :deep(.rt-section) { display: grid; grid-template-columns: 8.5em minmax(0, 1fr); gap: 0 1.1em; margin-bottom: var(--section-gap); padding-bottom: .8em; border-bottom: 1px solid var(--skin-divider-color); }
.rt-custom-15 :deep(.rt-title) { grid-column: 1; grid-row: 1 / span 20; display: block; margin: 0; padding: .15em .8em 0 0; border-right: 4px solid var(--skin-top-band-bg); line-height: 1.35 !important; letter-spacing: .08em; }
.rt-custom-15 :deep(.rt-title::before), .rt-custom-15 :deep(.rt-title::after) { display: none; }
.rt-custom-15 :deep(.rt-title span::after) { display: block; margin-top: .4em; color: var(--font-content-color); font-size: .55em; font-weight: 600; letter-spacing: .16em; opacity: .62; }
.rt-custom-15 :deep(.rt-section[data-resume-module='educations'] .rt-title span::after) { content: 'EDUCATION'; }
.rt-custom-15 :deep(.rt-section[data-resume-module='internships'] .rt-title span::after) { content: 'INTERNSHIP'; }
.rt-custom-15 :deep(.rt-section[data-resume-module='work_experience'] .rt-title span::after) { content: 'EXPERIENCE'; }
.rt-custom-15 :deep(.rt-section[data-resume-module='projects'] .rt-title span::after) { content: 'PROJECTS'; }
.rt-custom-15 :deep(.rt-section[data-resume-module='skills'] .rt-title span::after) { content: 'SKILLS'; }
.rt-custom-15 :deep(.rt-section[data-resume-module='awards'] .rt-title span::after) { content: 'HONORS'; }
.rt-custom-15 :deep(.rt-section[data-resume-module='basic'] .rt-title span::after) { content: 'PROFILE'; }
.rt-custom-15 :deep(.rt-item), .rt-custom-15 :deep(.rt-skills), .rt-custom-15 :deep(.rt-list), .rt-custom-15 :deep(.rt-text) { grid-column: 2; }
.rt-custom-15 :deep(.rt-item) { margin: 0; padding: .58em 0 .68em; border: 0; border-bottom: 1px dashed var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-15 :deep(.rt-skills) { gap: .45em; }
.rt-custom-15 :deep(.rt-skill) { border-radius: 2px; }
.rt-custom-15 :deep(.rt-list) { margin: 0; padding-left: 1.2em; }
</style>
