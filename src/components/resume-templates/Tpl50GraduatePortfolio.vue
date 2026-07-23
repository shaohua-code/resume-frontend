<!-- AI简历风格模板 50：新星作品集，以作品票签、能力证明和成果展墙呈现应届潜力。 -->
<script setup>
// 标准内容维持字段和模块语义，本组件只建立应届作品与能力证明的展示体系。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 展览票签是无交互装饰，所有可点击内容仍位于标准模块标记内。 -->
  <div class="resume-template rt rt-custom-50 w-full bg-white">
    <div class="graduate-ticket" aria-hidden="true">
      <b>NEW TALENT SHOWCASE</b><i></i><span>WORKS · SKILLS · PROOF</span><em>NO. 050</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="50" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 紫蓝展墙、荧光黄票签和薄荷证明卡形成年轻作品集气质。 */
.rt-custom-50 { word-break: break-word; background: var(--skin-basic-row-bg); }
.graduate-ticket { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: .8em; padding: .7em 1.25em; background: var(--skin-header-bg); color: var(--font-basic-content-color); pointer-events: none; }
.graduate-ticket b,
.graduate-ticket span,
.graduate-ticket em { font-size: .66em; font-style: normal; font-weight: 900; letter-spacing: .14em; }
.graduate-ticket i { height: 1px; background: var(--skin-header-border); }
.graduate-ticket em { padding: .35em .6em; border: 2px dashed var(--skin-top-band-bg); color: var(--skin-top-band-bg); }

/* 个人头部像展览主视觉，头像仅在固定海报框内裁切。 */
.rt-custom-50 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1em; padding: 1em 0 1.3em; }
.rt-custom-50 :deep(.rt-header) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .95fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1em; border: 2px solid var(--skin-header-border); background: var(--skin-header-bg); box-shadow: .5em .5em 0 var(--skin-top-band-bg); }
.rt-custom-50 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .9em; border: 2px solid var(--skin-header-border); background: var(--skin-top-band-bg); text-align: left; }
.rt-custom-50 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.2em; height: 6.2em; margin: 0 .9em 0 0; border: .35em solid var(--skin-item-bg); border-radius: 0; box-shadow: .3em .3em 0 var(--skin-skill-border); object-fit: cover; }
.rt-custom-50 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: .96 !important; letter-spacing: .04em; }
.rt-custom-50 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 900; letter-spacing: .09em; }
.rt-custom-50 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42em; align-content: center; }
.rt-custom-50 :deep(.rt-basic-row) { display: block; padding: .45em .52em; border: 1px solid var(--skin-basic-row-border); border-radius: 0; background: var(--skin-item-bg); }
.rt-custom-50 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-50 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .08em; }

/* 作品展墙采用双栏卡片，项目占满行，技能与荣誉形成能力证明区。 */
.rt-custom-50 :deep(.rt-section) { grid-column: span 1; margin-bottom: var(--section-gap); padding: .85em .9em; border: 2px solid var(--skin-item-border); background: var(--skin-item-bg); box-shadow: .32em .32em 0 var(--skin-divider-color); }
.rt-custom-50 :deep(.rt-section[data-resume-module='projects']),
.rt-custom-50 :deep(.rt-section[data-resume-module='work_experience']),
.rt-custom-50 :deep(.rt-section[data-resume-module='internships']),
.rt-custom-50 :deep(.rt-section[data-resume-module='basic']) { grid-column: 1 / -1; }
.rt-custom-50 :deep(.rt-section[data-resume-module='skills']) { border-top: .65em solid var(--skin-skill-border); }
.rt-custom-50 :deep(.rt-section[data-resume-module='awards']) { border-top: .65em solid var(--skin-top-band-bg); }
.rt-custom-50 :deep(.rt-title) { gap: .55em; margin: 0 0 .6em; letter-spacing: .1em; }
.rt-custom-50 :deep(.rt-title)::before { width: 1.1em; height: 1.1em; border: 2px dashed var(--skin-title-color); border-radius: 50% 0 50% 50%; background: var(--skin-top-band-bg) !important; }
.rt-custom-50 :deep(.rt-title)::after { height: 2px; background: var(--skin-divider-color) !important; }
.rt-custom-50 :deep(.rt-item) { margin: 0; padding: .65em .25em; border: 0; border-bottom: 1px dashed var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-50 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42em; }
.rt-custom-50 :deep(.rt-skill) { border: 2px solid var(--skin-skill-border); border-radius: 0; text-align: center; box-shadow: .2em .2em 0 var(--skin-skill-border); }
.rt-custom-50 :deep(.rt-list) { display: grid; gap: .4em; padding: 0; list-style: none; }
.rt-custom-50 :deep(.rt-list li) { padding: .4em .55em; border: 2px dashed var(--skin-top-band-bg); background: var(--skin-basic-row-bg); }
</style>
