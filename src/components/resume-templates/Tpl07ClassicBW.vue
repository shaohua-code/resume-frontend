<!-- AI简历风格模板 7：墨印报刊排版 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-07 w-full bg-white">
    <div class="press-folio" aria-hidden="true"><span>CURRICULUM VITAE</span><b>07</b><span>SELECTED PROFILE</span></div>
    <ResumeStandardContent :resume="resume" :variant="7" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-07 { word-break: break-word; }
.press-folio { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1em; padding: .55em 1.4em; border-top: 9px solid var(--skin-top-band-bg); border-bottom: 1px solid var(--skin-header-border); color: var(--font-content-color); pointer-events: none; }
.press-folio span { font-size: .66em; font-weight: 900; letter-spacing: .18em; }
.press-folio span:last-child { text-align: right; }
.press-folio b { width: 2.4em; height: 2.4em; border: 1px solid var(--skin-header-border); border-radius: 50%; line-height: 2.3em; text-align: center; }
.rt-custom-07 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1.4em; padding: 1.1em 1.45em; }
.rt-custom-07 :deep(.rt-header) { grid-column: 1 / -1; margin-bottom: var(--section-gap); }
.rt-custom-07 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-items: center; margin: 0 0 .8em; padding: .85em 0; border-top: 4px double var(--skin-header-border); border-bottom: 4px double var(--skin-header-border); text-align: left; }
.rt-custom-07 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.2em; height: 5.2em; margin: 0 1em 0 0; border: 1px solid var(--skin-header-border); border-radius: 50%; filter: grayscale(1) contrast(1.08); object-fit: cover; }
.rt-custom-07 :deep(.rt-name) { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 2.5em !important; font-weight: 700; letter-spacing: .08em; }
.rt-custom-07 :deep(.rt-slogan) { margin: .28em 0 0; letter-spacing: .14em; text-transform: uppercase; }
.rt-custom-07 :deep(.rt-basic-grid) { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--skin-basic-row-border); border-left: 1px solid var(--skin-basic-row-border); }
.rt-custom-07 :deep(.rt-basic-row) { display: block; padding: .55em .65em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; background: var(--skin-basic-row-bg); }
.rt-custom-07 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-07 :deep(.rt-label) { display: block; min-width: 0; margin-bottom: .18em; font-size: .68em; letter-spacing: .14em; }
.rt-custom-07 :deep(.rt-section) { grid-column: 1 / -1; margin-bottom: var(--section-gap); }
.rt-custom-07 :deep(.rt-section[data-resume-module='skills']), .rt-custom-07 :deep(.rt-section[data-resume-module='awards']) { grid-column: span 1; }
.rt-custom-07 :deep(.rt-title) { gap: .65em; margin: 0 0 .7em; font-family: Georgia, 'Times New Roman', serif; font-size: 1.12em !important; letter-spacing: .1em; text-transform: uppercase; }
.rt-custom-07 :deep(.rt-title::before) { width: .65em; height: .65em; border: 2px solid var(--skin-top-band-bg); border-radius: 50%; background: transparent !important; }
.rt-custom-07 :deep(.rt-title::after) { height: 3px; background: repeating-linear-gradient(90deg, var(--skin-divider-color) 0 24px, transparent 24px 29px) !important; }
.rt-custom-07 :deep(.rt-item) { margin: 0; padding: .7em 0; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-07 :deep(.rt-item-header strong) { font-family: Georgia, 'Times New Roman', serif; font-size: 1.08em; }
.rt-custom-07 :deep(.rt-skills) { gap: .38em; }
.rt-custom-07 :deep(.rt-skill) { padding: .38em .65em; border-radius: 0; background: var(--skin-skill-bg); }
.rt-custom-07 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-07 :deep(.rt-list li) { padding: .38em 0; border-bottom: 1px dotted var(--skin-divider-color); }
</style>
