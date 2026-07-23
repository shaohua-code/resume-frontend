<!-- AI简历风格模板 38：丝带作品集，以分层绶带和展板结构突出项目叙事。 -->
<script setup>
// 共享标准内容继续承担字段、显隐和定位，本组件只负责作品集式呈现。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 绶带均为不参与交互的流内装饰，不覆盖任何可编辑模块。 -->
  <div class="resume-template rt rt-custom-38 w-full bg-white">
    <div class="ribbon-board" aria-hidden="true">
      <i></i><b>PORTFOLIO</b><span>SELECTED CAREER STORIES</span><em>38</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="38" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 斜切绶带只作用于装饰色块，正文容器不使用 transform 或裁切。 */
.rt-custom-38 { word-break: break-word; background: var(--skin-item-bg); }
.ribbon-board { display: grid; grid-template-columns: 4.5em auto 1fr auto; align-items: center; gap: .8em; padding: .65em 1.3em; background: var(--skin-header-bg); color: var(--font-basic-content-color); pointer-events: none; }
.ribbon-board i { height: 2em; background: var(--skin-top-band-bg); transform: skewX(-24deg); }
.ribbon-board b,
.ribbon-board span { font-size: .68em; letter-spacing: .14em; }
.ribbon-board em { padding: .35em .55em; border: 1px solid var(--skin-header-border); font-style: normal; font-weight: 900; }

/* 头部由人物名片与信息板并置，局部头像框保持固定尺寸。 */
.rt-custom-38 :deep(.rt-body) { padding: 1.05em 0 1.25em; }
.rt-custom-38 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: 1em; margin-bottom: var(--section-gap); padding-bottom: 1em; border-bottom: .55em solid var(--skin-top-band-bg); background: transparent; }
.rt-custom-38 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: 1em; border: 0; background: var(--skin-basic-row-bg); text-align: left; box-shadow: .45em .45em 0 var(--skin-skill-border); }
.rt-custom-38 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.3em; height: 6.3em; margin: 0 .9em 0 0; border: .35em solid var(--skin-item-bg); border-radius: 0; object-fit: cover; }
.rt-custom-38 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: 1 !important; letter-spacing: .06em; }
.rt-custom-38 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 800; letter-spacing: .08em; }
.rt-custom-38 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42em; align-content: center; }
.rt-custom-38 :deep(.rt-basic-row) { display: block; padding: .48em .58em; border: 0; border-left: .45em solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-38 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-38 :deep(.rt-label) { display: block; min-width: 0; font-size: .66em; letter-spacing: .08em; }

/* 模块像独立展板，项目与工作占满行但仍按原始 DOM 顺序渲染。 */
.rt-custom-38 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1em; }
.rt-custom-38 :deep(.rt-header) { grid-column: 1 / -1; }
.rt-custom-38 :deep(.rt-section) { grid-column: span 1; margin-bottom: var(--section-gap); padding: .85em .9em; border: 1px solid var(--skin-item-border); background: var(--skin-item-bg); }
.rt-custom-38 :deep(.rt-section[data-resume-module='work_experience']),
.rt-custom-38 :deep(.rt-section[data-resume-module='projects']),
.rt-custom-38 :deep(.rt-section[data-resume-module='basic']) { grid-column: 1 / -1; }
.rt-custom-38 :deep(.rt-title) { gap: .55em; margin: 0 0 .6em; padding: .25em .55em; background: var(--skin-skill-bg); letter-spacing: .1em; }
.rt-custom-38 :deep(.rt-title)::before { width: .7em; height: 1.4em; border-radius: 0; background: var(--skin-top-band-bg) !important; transform: skewX(-18deg); }
.rt-custom-38 :deep(.rt-title)::after { height: 1px; background: var(--skin-divider-color) !important; }
.rt-custom-38 :deep(.rt-item) { margin: 0; padding: .62em 0; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-38 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4em; }
.rt-custom-38 :deep(.rt-skill) { border-radius: 0; text-align: center; }
.rt-custom-38 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-38 :deep(.rt-list li) { padding: .38em .55em; border-left: .35em solid var(--skin-top-band-bg); }
</style>
