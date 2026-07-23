<!-- AI简历风格模板 48：校园成长档案，以学期索引、成长刻度和档案卡记录应届路径。 -->
<script setup>
// 共享标准内容提供完整字段、模块显隐和点击定位，本组件只呈现校园成长档案。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 学期索引只作普通流装饰，不承载字段也不遮挡模块点击。 -->
  <div class="resume-template rt rt-custom-48 w-full bg-white">
    <div class="campus-archive-index" aria-hidden="true">
      <b>YEAR 01</b><i></i><span>LEARN</span><i></i><span>GROW</span><i></i><em>48 / ARCHIVE</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="48" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 学院绿、成长黄和档案纸色组合成连续的校园成长记录。 */
.rt-custom-48 { word-break: break-word; background: linear-gradient(90deg, var(--skin-basic-row-bg) 0 .8em, var(--skin-item-bg) .8em); }
.campus-archive-index { display: grid; grid-template-columns: auto 1fr auto 1fr auto 1fr auto; align-items: center; gap: .5em; padding: .7em 1.25em .7em 1.65em; border-bottom: 1px solid var(--skin-divider-color); color: var(--font-content-color); pointer-events: none; }
.campus-archive-index b,
.campus-archive-index span,
.campus-archive-index em { font-size: .65em; font-style: normal; font-weight: 800; letter-spacing: .12em; }
.campus-archive-index b,
.campus-archive-index em { padding: .3em .55em; background: var(--skin-top-band-bg); color: var(--font-basic-content-color); }
.campus-archive-index i { height: .25em; border-radius: 999px; background: var(--skin-skill-border); }

/* 头部采用学生档案封面与资料表组合，头像仅在固定证件框内裁切。 */
.rt-custom-48 :deep(.rt-body) { counter-reset: campus-step; padding: 1em 0 1.3em; }
.rt-custom-48 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1em; border: 1px solid var(--skin-header-border); border-top: .55em solid var(--skin-top-band-bg); background: var(--skin-header-bg); box-shadow: .4em .4em 0 var(--skin-divider-color); }
.rt-custom-48 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 0; border-right: 2px solid var(--skin-header-border); background: var(--skin-basic-row-bg); text-align: left; }
.rt-custom-48 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 6em; margin: 0 .85em 0 0; border: .35em solid var(--skin-item-bg); border-radius: 0; box-shadow: .3em .3em 0 var(--skin-skill-border); object-fit: cover; }
.rt-custom-48 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; line-height: 1 !important; letter-spacing: .08em; }
.rt-custom-48 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; padding: .18em .45em; background: var(--skin-skill-bg); font-weight: 800; }
.rt-custom-48 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4em; align-content: center; }
.rt-custom-48 :deep(.rt-basic-row) { display: block; padding: .44em .52em; border-radius: .2em; }
.rt-custom-48 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-48 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .08em; }

/* 模块用连续成长刻度串联，教育和项目卡片保留独立条目语义。 */
.rt-custom-48 :deep(.rt-section) { counter-increment: campus-step; display: grid; grid-template-columns: 3.2em minmax(0, 1fr); gap: 0 .8em; margin-bottom: var(--section-gap); }
.rt-custom-48 :deep(.rt-title) { grid-row: 1 / span 40; display: block; margin: 0; padding: .45em .25em; border-right: .35em solid var(--skin-divider-color); text-align: center; writing-mode: vertical-rl; letter-spacing: .1em; }
.rt-custom-48 :deep(.rt-title)::before { content: counter(campus-step, decimal-leading-zero); display: block; width: auto; height: auto; margin: 0 auto .45em; padding: .25em; border-radius: 50%; background: var(--skin-top-band-bg) !important; color: var(--font-basic-content-color); writing-mode: horizontal-tb; }
.rt-custom-48 :deep(.rt-title)::after { display: none; }
.rt-custom-48 :deep(.rt-item),
.rt-custom-48 :deep(.rt-skills),
.rt-custom-48 :deep(.rt-list),
.rt-custom-48 :deep(.rt-text) { grid-column: 2; }
.rt-custom-48 :deep(.rt-item) { margin: 0 0 .5em; padding: .65em .75em; border: 1px solid var(--skin-item-border); border-radius: .35em; background: var(--skin-item-bg); }
.rt-custom-48 :deep(.rt-section[data-resume-module='educations'] .rt-item) { border-left: .5em solid var(--skin-top-band-bg); }
.rt-custom-48 :deep(.rt-section[data-resume-module='projects'] .rt-item) { border-left: .5em solid var(--skin-skill-border); }
.rt-custom-48 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .4em; }
.rt-custom-48 :deep(.rt-skill) { border-radius: .25em; text-align: center; }
.rt-custom-48 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-48 :deep(.rt-list li) { padding: .38em .55em; border-left: .4em solid var(--skin-top-band-bg); background: var(--skin-basic-row-bg); }
</style>
