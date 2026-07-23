<!-- AI简历风格模板 34：城市路线，用站点、线路与导向牌串联职业轨迹。 -->
<script setup>
// 共享标准 DOM 负责真实字段、模块显隐与点击定位，本组件仅绘制路线视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 路线导览是无交互装饰，正文仍按标准模块顺序处于正常流。 -->
  <div class="resume-template rt rt-custom-34 w-full bg-white">
    <div class="metro-line" aria-hidden="true">
      <b>M34</b><i></i><span>EDU</span><i></i><span>WORK</span><i></i><em>NEXT STOP</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="34" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 彩色线路与站点圆牌建立城市导向系统，装饰不使用绝对定位。 */
.rt-custom-34 { word-break: break-word; background: var(--skin-item-bg); }
.metro-line { display: grid; grid-template-columns: auto 1fr auto 1fr auto 1fr auto; align-items: center; gap: .45em; padding: .7em 1.25em; background: var(--skin-header-bg); color: var(--font-basic-content-color); pointer-events: none; }
.metro-line b { width: 2.7em; height: 2.7em; border-radius: 50%; background: var(--skin-top-band-bg); line-height: 2.7em; text-align: center; }
.metro-line span,
.metro-line em { font-size: .65em; font-style: normal; font-weight: 800; letter-spacing: .1em; }
.metro-line span { padding: .25em .5em; border: 1px solid var(--skin-header-border); border-radius: 999px; }
.metro-line i { height: .28em; background: var(--skin-skill-border); }

/* 头部模仿站牌信息面板，头像固定尺寸避免加载抖动。 */
.rt-custom-34 :deep(.rt-body) { padding: 1.05em 0 1.25em; }
.rt-custom-34 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .78fr) minmax(0, 1.22fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1em; border: 2px solid var(--skin-header-border); border-radius: .4em; background: var(--skin-basic-row-bg); }
.rt-custom-34 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 0; border-left: .7em solid var(--skin-top-band-bg); background: var(--skin-header-bg); text-align: left; }
.rt-custom-34 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 4.8em; height: 4.8em; margin: 0 .8em 0 0; border: 3px solid var(--skin-skill-border); border-radius: 50%; object-fit: cover; }
.rt-custom-34 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.15em !important; line-height: 1 !important; letter-spacing: .04em; }
.rt-custom-34 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; padding: .2em .5em; background: var(--skin-skill-bg); font-weight: 800; }
.rt-custom-34 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4em; align-content: center; }
.rt-custom-34 :deep(.rt-basic-row) { display: block; padding: .43em .5em; border-radius: .3em; }
.rt-custom-34 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-34 :deep(.rt-label) { display: block; min-width: 0; font-size: .65em; }

/* 模块采用左侧线路轨道，语义条目保持逐条独立并允许跨页。 */
.rt-custom-34 :deep(.rt-section) { display: grid; grid-template-columns: 2.8em minmax(0, 1fr); gap: 0 .85em; margin-bottom: var(--section-gap); }
.rt-custom-34 :deep(.rt-title) { grid-row: 1 / span 40; display: block; margin: 0; padding: .5em .2em; border-right: .35em solid var(--skin-divider-color); text-align: center; writing-mode: vertical-rl; letter-spacing: .12em; }
.rt-custom-34 :deep(.rt-title::before) { display: block; width: 1.15em; height: 1.15em; margin: 0 auto .45em; border: .28em solid var(--skin-skill-border); border-radius: 50%; }
.rt-custom-34 :deep(.rt-title::after) { display: none; }
.rt-custom-34 :deep(.rt-item),
.rt-custom-34 :deep(.rt-skills),
.rt-custom-34 :deep(.rt-list),
.rt-custom-34 :deep(.rt-text) { grid-column: 2; }
.rt-custom-34 :deep(.rt-item) { margin: 0 0 .5em; padding: .65em .75em; border: 1px solid var(--skin-item-border); border-left: .45em solid var(--skin-top-band-bg); border-radius: .35em; }
.rt-custom-34 :deep(.rt-skills) { gap: .4em; }
.rt-custom-34 :deep(.rt-skill) { border-radius: 999px; }
.rt-custom-34 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-34 :deep(.rt-list li) { padding: .35em .55em; border-left: .45em solid var(--skin-skill-border); background: var(--skin-basic-row-bg); }
</style>
