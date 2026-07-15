<!-- AI简历风格模板 9：暖灰酒红行政档案 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-09 w-full bg-white">
    <div class="admin-mast" aria-hidden="true">
      <span></span><i></i><span></span>
    </div>
    <ResumeStandardContent
      :resume="resume"
      :variant="9"
      :visible-modules="visibleModules"
    />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-09 {
  word-break: break-word;
}

.admin-mast {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.8em;
  height: 1.2em;
  pointer-events: none;
}

.admin-mast span {
  height: 1px;
  background: var(--skin-divider-color);
}

.admin-mast i {
  width: 0.55em;
  height: 0.55em;
  border: 1px solid var(--skin-top-band-bg);
  transform: rotate(45deg);
}

.rt-custom-09 :deep(.rt-body) {
  padding: 0;
  counter-reset: admin-section;
}

.rt-custom-09 :deep(.rt-header) {
  padding: 1.1em 0 1.2em;
  border-top: 3px double var(--skin-header-border);
  border-bottom: 3px double var(--skin-header-border);
  background: var(--skin-header-bg);
}

.rt-custom-09 :deep(.rt-banner) {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  margin: 0 0 1em;
  padding: 0 0 0.85em;
  text-align: left;
  border: 0;
  border-bottom: 1px solid var(--skin-divider-color);
}

.rt-custom-09 :deep(.rt-banner-avatar) {
  grid-row: 1 / 3;
  width: 5.6em;
  height: 6.7em;
  margin: 0 1.1em 0 0;
  border-width: 1px;
  border-radius: 2px;
}

.rt-custom-09 :deep(.rt-name) {
  margin: 0;
  letter-spacing: 0.28em;
}

.rt-custom-09 :deep(.rt-slogan) {
  margin: 0.2em 0 0;
  letter-spacing: 0.14em;
}

.rt-custom-09 :deep(.rt-basic-grid) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--skin-basic-row-border);
  border-left: 1px solid var(--skin-basic-row-border);
}

.rt-custom-09 :deep(.rt-basic-row) {
  min-width: 0;
  padding: 0.55em 0.7em;
  border-width: 0 1px 1px 0;
  border-radius: 0;
}

.rt-custom-09 :deep(.rt-basic-wide) {
  grid-column: auto;
}

.rt-custom-09 :deep(.rt-label) {
  min-width: 4.4em;
  font-weight: 700;
}

.rt-custom-09 :deep(.rt-section) {
  counter-increment: admin-section;
}

.rt-custom-09 :deep(.rt-title) {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 0.7em;
  margin-bottom: 0.75em;
  letter-spacing: 0.16em;
}

.rt-custom-09 :deep(.rt-title::before) {
  content: counter(admin-section, decimal-leading-zero);
  display: inline-grid;
  width: 2.2em;
  height: 2.2em;
  place-items: center;
  border: 1px solid var(--skin-title-color);
  background: transparent !important;
  font-size: 0.67em;
  letter-spacing: 0;
}

.rt-custom-09 :deep(.rt-title::after) {
  height: 3px;
  border-top: 1px solid var(--skin-divider-color);
  border-bottom: 1px solid var(--skin-divider-color);
  background: transparent !important;
}

.rt-custom-09 :deep(.rt-item) {
  margin: 0;
  padding: 0.75em 0.2em 0.85em;
  border-width: 0 0 1px;
  border-radius: 0;
  background: transparent !important;
}

.rt-custom-09 :deep(.rt-item + .rt-item) {
  padding-top: 0.9em;
}

.rt-custom-09 :deep(.rt-item-header) {
  margin-bottom: 0.25em !important;
}

.rt-custom-09 :deep(.rt-item-header strong) {
  letter-spacing: 0.04em;
}

.rt-custom-09 :deep(.rt-sub) {
  margin-bottom: 0.35em;
}

.rt-custom-09 :deep(.rt-skills) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--skin-skill-border);
  border-left: 1px solid var(--skin-skill-border);
}

.rt-custom-09 :deep(.rt-skill) {
  padding: 0.55em 0.7em;
  border-width: 0 1px 1px 0;
  border-radius: 0;
  text-align: center;
}

.rt-custom-09 :deep(.rt-list) {
  margin: 0;
  padding-left: 1.5em;
}

.rt-custom-09 :deep(.rt-list li) {
  padding-left: 0.25em;
  border-bottom: 1px dotted var(--skin-divider-color);
}
</style>
