<!-- AI简历风格模板 5：深海蓝金品牌带 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-05 w-full bg-white">
    <div class="brand-stripe" aria-hidden="true"></div>
    <span class="brand-corner brand-corner-a" aria-hidden="true"></span>
    <span class="brand-corner brand-corner-b" aria-hidden="true"></span>
    <ResumeStandardContent
      :resume="resume"
      :variant="5"
      :visible-modules="visibleModules"
    />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-05 {
  position: relative;
  word-break: break-word;
}

.brand-stripe {
  height: 0.55em;
  background: var(--skin-top-band-bg);
  pointer-events: none;
}

.brand-corner {
  position: absolute;
  z-index: 1;
  top: 0.55em;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  pointer-events: none;
}

.brand-corner-a {
  border-width: 0 4.8em 4.8em 0;
  border-color: transparent var(--skin-header-border) transparent transparent;
}

.brand-corner-b {
  top: 0.55em;
  border-width: 0 2.4em 2.4em 0;
  border-color: transparent var(--skin-top-band-bg) transparent transparent;
}

.rt-custom-05 :deep(.rt-body) {
  padding: 0;
}

.rt-custom-05 :deep(.rt-header) {
  position: relative;
  padding: 1.55em 1.7em 1.4em;
  border: 0;
  border-bottom: 4px solid var(--skin-header-border);
  background: var(--skin-header-bg);
}

.rt-custom-05 :deep(.rt-banner) {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  margin: 0 0 1.1em;
  padding: 0 0 1em;
  text-align: center;
  border: 0;
  border-bottom: 1px solid var(--skin-divider-color);
}

.rt-custom-05 :deep(.rt-banner-avatar) {
  width: 5.4em;
  height: 5.4em;
  margin: 0 0 0.75em;
  border-color: var(--skin-top-band-bg);
  border-radius: 50%;
}

.rt-custom-05 :deep(.rt-name) {
  margin: 0;
  letter-spacing: 0.2em;
}

.rt-custom-05 :deep(.rt-slogan) {
  margin: 0.3em 0 0;
  letter-spacing: 0.16em;
}

.rt-custom-05 :deep(.rt-basic-grid) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55em;
}

.rt-custom-05 :deep(.rt-basic-row) {
  justify-content: center;
  min-width: 0;
  padding: 0.5em 0.65em;
  border-radius: 999px;
  text-align: center;
}

.rt-custom-05 :deep(.rt-basic-wide) {
  grid-column: auto;
}

.rt-custom-05 :deep(.rt-label) {
  min-width: auto;
  font-weight: 700;
}

.rt-custom-05 :deep(.rt-section) {
  position: relative;
}

.rt-custom-05 :deep(.rt-title) {
  gap: 0.7em;
  margin-bottom: 0.8em;
}

.rt-custom-05 :deep(.rt-title::before) {
  width: 1.05em;
  height: 1.05em;
  flex: 0 0 1.05em;
  border: 0.28em solid var(--skin-skill-border);
  border-radius: 50%;
  background: var(--skin-title-color) !important;
  box-shadow: 0 0 0 3px var(--skin-skill-bg);
}

.rt-custom-05 :deep(.rt-title::after) {
  height: 2px;
}

.rt-custom-05 :deep(.rt-item) {
  position: relative;
  margin-bottom: 0.75em;
  padding: 0.9em 1em 0.9em 1.2em;
  border-width: 1px;
  border-radius: 10px 3px 10px 3px;
}

.rt-custom-05 :deep(.rt-item::before) {
  content: '';
  position: absolute;
  inset: 0.75em auto 0.75em 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--skin-top-band-bg);
}

.rt-custom-05 :deep(.rt-item-header) {
  margin-bottom: 0.25em !important;
}

.rt-custom-05 :deep(.rt-sub) {
  margin-bottom: 0.35em;
}

.rt-custom-05 :deep(.rt-skills) {
  gap: 0.55em;
}

.rt-custom-05 :deep(.rt-skill) {
  padding: 0.45em 0.9em;
  border-radius: 999px;
}

.rt-custom-05 :deep(.rt-list) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4em 1.4em;
  padding: 0;
  list-style: none;
}

.rt-custom-05 :deep(.rt-list li) {
  position: relative;
  padding-left: 1.1em;
}

.rt-custom-05 :deep(.rt-list li::before) {
  content: '';
  position: absolute;
  top: 0.72em;
  left: 0;
  width: 0.42em;
  height: 0.42em;
  background: var(--skin-top-band-bg);
  transform: rotate(45deg);
}
</style>
