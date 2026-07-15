<!-- AI简历风格模板 17：松石绿能力矩阵 -->
<script setup>
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="resume-template rt rt-custom-17 w-full bg-white">
    <div class="matrix-stripe" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
    <ResumeStandardContent
      :resume="resume"
      :variant="17"
      :visible-modules="visibleModules"
    />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-17 {
  word-break: break-word;
}

.matrix-stripe {
  display: grid;
  grid-template-columns: 2.2fr 0.8fr 1.3fr 0.55fr 0.25fr;
  gap: 0.35em;
  height: 0.55em;
  pointer-events: none;
}

.matrix-stripe span {
  background: var(--skin-top-band-bg);
}

.matrix-stripe span:nth-child(even) {
  background: var(--skin-title-color);
}

.rt-custom-17 :deep(.rt-body) {
  padding: 0;
  counter-reset: matrix-section;
}

.rt-custom-17 :deep(.rt-header) {
  display: grid;
  grid-template-columns: minmax(14em, 0.8fr) minmax(0, 1.2fr);
  gap: 1.25em;
  padding: 1.35em;
  border: 1px solid var(--skin-header-border);
  border-radius: 0 0 14px 14px;
  background: var(--skin-header-bg);
}

.rt-custom-17 :deep(.rt-banner) {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin: 0;
  padding: 0 1.2em 0 0;
  text-align: left;
  border: 0;
  border-right: 1px solid var(--skin-divider-color);
}

.rt-custom-17 :deep(.rt-banner-avatar) {
  width: 5.4em;
  height: 5.4em;
  margin: 0 0 0.8em;
  border-width: 2px;
  border-radius: 50% 50% 50% 12px;
}

.rt-custom-17 :deep(.rt-name) {
  margin: 0;
  letter-spacing: 0.12em;
}

.rt-custom-17 :deep(.rt-slogan) {
  margin: 0.35em 0 0;
  padding: 0.22em 0.75em;
  border-left: 3px solid var(--skin-top-band-bg);
  letter-spacing: 0.08em;
}

.rt-custom-17 :deep(.rt-basic-grid) {
  align-content: center;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55em;
}

.rt-custom-17 :deep(.rt-basic-row) {
  min-width: 0;
  padding: 0.55em 0.7em;
  border-radius: 7px;
}

.rt-custom-17 :deep(.rt-label) {
  min-width: 4.35em;
  font-weight: 700;
}

.rt-custom-17 :deep(.rt-section) {
  counter-increment: matrix-section;
}

.rt-custom-17 :deep(.rt-title) {
  gap: 0.65em;
  margin-bottom: 0.8em;
  letter-spacing: 0.08em;
}

.rt-custom-17 :deep(.rt-title::before) {
  content: counter(matrix-section, decimal-leading-zero);
  display: inline-grid;
  width: 2.1em;
  height: 2.1em;
  flex: 0 0 2.1em;
  place-items: center;
  border: 0;
  border-radius: 7px 7px 7px 1px;
  background: var(--skin-top-band-bg) !important;
  color: var(--skin-item-bg);
  font-size: 0.68em;
  letter-spacing: 0;
}

.rt-custom-17 :deep(.rt-title::after) {
  height: 1px;
}

.rt-custom-17 :deep(.rt-item) {
  position: relative;
  margin-bottom: 0.75em;
  padding: 0.9em 1em 0.9em 1.3em;
  border-width: 1px;
  border-radius: 10px;
}

.rt-custom-17 :deep(.rt-item::before) {
  content: '';
  position: absolute;
  top: 1.05em;
  left: -0.38em;
  width: 0.72em;
  height: 0.72em;
  border: 2px solid var(--skin-item-bg);
  border-radius: 50%;
  background: var(--skin-top-band-bg);
  box-shadow: 0 0 0 1px var(--skin-item-border);
}

.rt-custom-17 :deep(.rt-item-header) {
  margin-bottom: 0.25em !important;
}

.rt-custom-17 :deep(.rt-sub) {
  margin-bottom: 0.35em;
}

.rt-custom-17 :deep(.rt-skill-matrix) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65em;
  counter-reset: capability;
}

.rt-custom-17 :deep(.rt-skill-matrix .rt-skill) {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.7em;
  min-width: 0;
  padding: 0.7em 0.8em;
  border-width: 1px;
  border-radius: 9px;
  counter-increment: capability;
}

.rt-custom-17 :deep(.rt-skill-matrix .rt-skill::before) {
  content: counter(capability, decimal-leading-zero);
  display: inline-grid;
  width: 2em;
  height: 2em;
  place-items: center;
  border-radius: 6px;
  background: var(--skin-top-band-bg);
  color: var(--skin-item-bg);
  font-size: 0.74em;
  font-weight: 800;
}

.rt-custom-17 :deep(.rt-list) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55em;
  padding: 0;
  list-style: none;
}

.rt-custom-17 :deep(.rt-list li) {
  padding: 0.6em 0.75em;
  border-left: 3px solid var(--skin-top-band-bg);
  background: var(--skin-basic-row-bg);
}
</style>
