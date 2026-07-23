<!-- AI简历风格模板 49：实践冲刺，以冲刺看板和成果赛道突出实习与项目贡献。 -->
<script setup>
// 共享标准 DOM 保留真实项目和实习字段，本组件不虚构成绩或熟练度。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 冲刺状态栏只作无交互装饰，全部正文仍按标准模块顺序渲染。 -->
  <div class="resume-template rt rt-custom-49 w-full bg-white">
    <div class="sprint-board" aria-hidden="true">
      <b>SPRINT 49</b><span>IDEA</span><i></i><span>ACTION</span><i></i><em>DELIVERED</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="49" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 深蓝看板、活力橙和状态青形成强调行动与成果的冲刺视觉。 */
.rt-custom-49 { word-break: break-word; background: var(--skin-item-bg); }
.sprint-board { display: grid; grid-template-columns: auto auto 1fr auto 1fr auto; align-items: center; gap: .55em; padding: .65em 1.2em; background: var(--skin-header-bg); color: var(--font-basic-content-color); pointer-events: none; }
.sprint-board b,
.sprint-board span,
.sprint-board em { font-size: .65em; font-style: normal; font-weight: 900; letter-spacing: .12em; }
.sprint-board b,
.sprint-board em { padding: .3em .55em; border-radius: .25em; background: var(--skin-top-band-bg); }
.sprint-board span { padding: .25em .5em; border: 1px solid var(--skin-header-border); }
.sprint-board i { height: .35em; border-radius: 999px; background: var(--skin-skill-border); }

/* 头部是冲刺任务卡，头像固定尺寸以避免加载引起分页抖动。 */
.rt-custom-49 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1em; padding: 1em 0 1.3em; }
.rt-custom-49 :deep(.rt-header) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); gap: .8em; margin-bottom: var(--section-gap); padding: .9em; border: 1px solid var(--skin-header-border); border-radius: .7em; background: var(--skin-basic-row-bg); box-shadow: .42em .42em 0 var(--skin-top-band-bg); }
.rt-custom-49 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 0; border-radius: .5em; background: var(--skin-header-bg); text-align: left; }
.rt-custom-49 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 4.8em; height: 4.8em; margin: 0 .8em 0 0; border: .35em solid var(--skin-top-band-bg); border-radius: .5em; object-fit: cover; }
.rt-custom-49 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.2em !important; line-height: 1 !important; letter-spacing: .04em; }
.rt-custom-49 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 800; letter-spacing: .08em; }
.rt-custom-49 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .38em; align-content: center; }
.rt-custom-49 :deep(.rt-basic-row) { display: block; padding: .42em .48em; border-radius: .35em; }
.rt-custom-49 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-49 :deep(.rt-label) { display: block; min-width: 0; font-size: .62em; letter-spacing: .07em; }

/* 双栏看板中实习、项目和工作占满整行，叙事重点明显但不改变字段含义。 */
.rt-custom-49 :deep(.rt-section) { grid-column: span 1; margin-bottom: var(--section-gap); padding: .82em .9em; border: 1px solid var(--skin-item-border); border-radius: .55em; background: var(--skin-item-bg); }
.rt-custom-49 :deep(.rt-section[data-resume-module='internships']),
.rt-custom-49 :deep(.rt-section[data-resume-module='projects']),
.rt-custom-49 :deep(.rt-section[data-resume-module='work_experience']),
.rt-custom-49 :deep(.rt-section[data-resume-module='basic']) { grid-column: 1 / -1; }
.rt-custom-49 :deep(.rt-section[data-resume-module='internships']) { border-top: .6em solid var(--skin-top-band-bg); }
.rt-custom-49 :deep(.rt-section[data-resume-module='projects']) { border-top: .6em solid var(--skin-skill-border); }
.rt-custom-49 :deep(.rt-title) { gap: .55em; margin: 0 0 .55em; letter-spacing: .08em; }
.rt-custom-49 :deep(.rt-title)::before { width: .95em; height: .95em; border: .25em solid var(--skin-title-color); border-radius: .2em; background: var(--skin-skill-bg) !important; }
.rt-custom-49 :deep(.rt-title)::after { height: .35em; border-radius: 999px; background: var(--skin-divider-color) !important; }
.rt-custom-49 :deep(.rt-item) { margin: 0; padding: .62em .7em; border: 0; border-left: .45em solid var(--skin-item-border); border-radius: .25em; background: var(--skin-basic-row-bg) !important; }
.rt-custom-49 :deep(.rt-item + .rt-item) { margin-top: .5em; }
.rt-custom-49 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4em; }
.rt-custom-49 :deep(.rt-skill) { border-radius: .3em; text-align: center; }
.rt-custom-49 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-49 :deep(.rt-list li) { padding: .4em .55em; border-radius: .25em; background: var(--skin-basic-row-bg); }
</style>
