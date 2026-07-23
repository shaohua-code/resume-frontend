<!-- AI简历风格模板 36：霓虹终端，以命令行窗口和状态标签呈现数字技术气质。 -->
<script setup>
// 共享标准内容保证真实技能和经历语义，本组件不生成伪造进度或数据。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 终端状态栏处于普通流且不可点击，正文模块定位保持完整。 -->
  <div class="resume-template rt rt-custom-36 w-full bg-white">
    <div class="terminal-bar" aria-hidden="true">
      <span>●</span><span>●</span><span>●</span><b>~/career/profile</b><em>RUN 36</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="36" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 深色终端壳、荧光边线和状态码形成技术控制台视觉。 */
.rt-custom-36 { word-break: break-word; background: var(--skin-header-bg); border: 2px solid var(--skin-header-border); }
.terminal-bar { display: grid; grid-template-columns: repeat(3, auto) 1fr auto; gap: .45em; align-items: center; padding: .65em 1em; border-bottom: 1px solid var(--skin-header-border); color: var(--font-basic-content-color); pointer-events: none; }
.terminal-bar span { color: var(--skin-top-band-bg); }
.terminal-bar b,
.terminal-bar em { font-size: .67em; font-style: normal; letter-spacing: .1em; }
.terminal-bar em { padding: .25em .55em; border: 1px solid var(--skin-skill-border); }

/* 头部像终端欢迎面板，头像媒体框固定尺寸避免分页抖动。 */
.rt-custom-36 :deep(.rt-body) { padding: 1em 0 1.25em; }
.rt-custom-36 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr); gap: .8em; margin-bottom: var(--section-gap); padding: .85em; border: 1px solid var(--skin-header-border); background: var(--skin-basic-row-bg); }
.rt-custom-36 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .75em; border: 1px dashed var(--skin-header-border); text-align: left; }
.rt-custom-36 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 4.7em; height: 4.7em; margin: 0 .8em 0 0; border: 2px solid var(--skin-top-band-bg); border-radius: .25em; object-fit: cover; }
.rt-custom-36 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.15em !important; line-height: 1 !important; letter-spacing: .03em; }
.rt-custom-36 :deep(.rt-name)::before { content: '> '; color: var(--skin-top-band-bg); }
.rt-custom-36 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; font-weight: 700; }
.rt-custom-36 :deep(.rt-slogan)::before { content: '$ role: '; color: var(--skin-title-color); }
.rt-custom-36 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .35em; align-content: center; }
.rt-custom-36 :deep(.rt-basic-row) { display: block; padding: .4em .5em; border: 1px solid var(--skin-basic-row-border); border-radius: .2em; }
.rt-custom-36 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-36 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .08em; }

/* 模块按终端命令块展示，不使用 fixed 或 overflow 裁切正文。 */
.rt-custom-36 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .8em .9em; border: 1px solid var(--skin-item-border); background: var(--skin-item-bg); box-shadow: .3em .3em 0 var(--skin-divider-color); }
.rt-custom-36 :deep(.rt-title) { gap: .55em; margin: 0 0 .55em; letter-spacing: .08em; }
.rt-custom-36 :deep(.rt-title)::before { content: '#'; width: auto; height: auto; background: transparent !important; color: var(--skin-top-band-bg); }
.rt-custom-36 :deep(.rt-title)::after { height: 1px; background: repeating-linear-gradient(90deg, var(--skin-divider-color) 0 .35em, transparent .35em .65em) !important; }
.rt-custom-36 :deep(.rt-item) { margin: 0; padding: .6em .7em; border: 0; border-left: 3px solid var(--skin-top-band-bg); border-radius: 0; background: var(--skin-basic-row-bg) !important; }
.rt-custom-36 :deep(.rt-item + .rt-item) { margin-top: .5em; }
.rt-custom-36 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .38em; }
.rt-custom-36 :deep(.rt-skill) { border-radius: .2em; text-align: center; }
.rt-custom-36 :deep(.rt-skill)::before { content: './'; color: var(--skin-title-color); }
.rt-custom-36 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-36 :deep(.rt-list li) { padding: .35em .55em; border-bottom: 1px dashed var(--skin-divider-color); }
</style>
