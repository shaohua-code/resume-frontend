<!-- AI简历风格模板 22：植物编辑手册 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-22 w-full bg-white">
    <div class="botanical-mark" aria-hidden="true"><i></i><span>GROW WITH PURPOSE</span><b>22</b></div>
    <ResumeStandardContent :resume="resume" :variant="22" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-22 { position: relative; word-break: break-word; background: linear-gradient(90deg, var(--skin-basic-row-bg) 0 1.2em, white 1.2em); }
.botanical-mark { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .8em; padding: .75em 1.4em .75em 2.2em; color: var(--skin-title-color); pointer-events: none; }
.botanical-mark i { width: 2.1em; height: 1.1em; border-radius: 100% 0 100% 0; background: var(--skin-top-band-bg); transform: rotate(-14deg); }
.botanical-mark span { font-size: .7em; font-weight: 900; letter-spacing: .18em; }
.botanical-mark b { width: 2.4em; height: 2.4em; border: 1px solid var(--skin-header-border); border-radius: 50%; line-height: 2.3em; text-align: center; }
.rt-custom-22 :deep(.rt-body) { padding: 0 1.35em 1.2em 2.2em; }
.rt-custom-22 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); gap: 1.25em; margin-bottom: var(--section-gap); padding: 1.15em; border: 1px solid var(--skin-header-border); border-radius: 2.8em 0 2.8em 0; background: var(--skin-header-bg); }
.rt-custom-22 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: 0 1em 0 0; border: 0; border-right: 1px solid var(--skin-header-border); text-align: left; }
.rt-custom-22 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 6.2em; margin: 0 .9em 0 0; border: 4px solid var(--skin-top-band-bg); border-radius: 50% 50% 6px 6px; object-fit: cover; }
.rt-custom-22 :deep(.rt-name) { align-self: end; margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 2.25em !important; letter-spacing: .08em; }
.rt-custom-22 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; }
.rt-custom-22 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em; }
.rt-custom-22 :deep(.rt-basic-row) { padding: .46em .6em; border: 0; border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; background: transparent !important; }
.rt-custom-22 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-22 :deep(.rt-label) { min-width: 0; font-size: .76em; }
.rt-custom-22 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .9em 1em; border: 1px solid var(--skin-item-border); border-radius: 0 1.8em 0 1.8em; background: var(--skin-item-bg); }
.rt-custom-22 :deep(.rt-title) { gap: .6em; margin: 0 0 .65em; font-family: Georgia, 'Times New Roman', serif; letter-spacing: .08em; }
.rt-custom-22 :deep(.rt-title::before) { width: 1.15em; height: .68em; border-radius: 100% 0 100% 0; background: var(--skin-top-band-bg) !important; transform: rotate(-18deg); }
.rt-custom-22 :deep(.rt-title::after) { height: 1px; background: linear-gradient(90deg, var(--skin-divider-color), transparent) !important; }
.rt-custom-22 :deep(.rt-item) { margin: 0; padding: .68em 0; border: 0; border-bottom: 1px dashed var(--skin-divider-color); border-radius: 0; background: transparent !important; }
.rt-custom-22 :deep(.rt-skills) { gap: .48em; }
.rt-custom-22 :deep(.rt-skill) { padding: .45em .75em; border-radius: 50% 50% 5px 5px; }
.rt-custom-22 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-22 :deep(.rt-list li) { padding: .35em 0 .35em 1.1em; border-bottom: 1px dotted var(--skin-divider-color); }
.rt-custom-22 :deep(.rt-list li::before) { content: '❧'; margin-left: -1.1em; margin-right: .35em; color: var(--skin-title-color); }
</style>
