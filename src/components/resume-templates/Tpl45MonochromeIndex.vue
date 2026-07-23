<!-- AI简历风格模板 45：黑白索引，以极端对比、目录编号和横向档案条组织内容。 -->
<script setup>
// 标准 DOM 继续负责用户数据与定位，本组件只塑造黑白索引视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 目录栏不含真实字段且关闭点击，正文仍由 data-resume-module 标记。 -->
  <div class="resume-template rt rt-custom-45 w-full bg-white">
    <div class="mono-index" aria-hidden="true">
      <b>45</b><span>INDEX</span><i></i><em>PERSON / WORK / VALUE</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="45" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 黑白块、粗线和目录编号形成编辑索引页的强烈识别。 */
.rt-custom-45 { word-break: break-word; background: var(--skin-item-bg); border: 3px solid var(--skin-header-border); }
.mono-index { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: .8em; padding: .55em 1.1em; border-bottom: 3px solid var(--skin-header-border); color: var(--font-content-color); pointer-events: none; }
.mono-index b { padding: .45em .7em; background: var(--skin-top-band-bg); color: var(--font-basic-content-color); font-size: 1em; }
.mono-index span,
.mono-index em { font-size: .67em; font-style: normal; font-weight: 900; letter-spacing: .15em; }
.mono-index i { height: 3px; background: var(--skin-header-border); }

/* 头部将姓名黑块与白色信息表对置，头像保留固定方框。 */
.rt-custom-45 :deep(.rt-body) { counter-reset: mono-section; padding: 1em 0 1.25em; }
.rt-custom-45 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); gap: 0; margin-bottom: var(--section-gap); border: 3px solid var(--skin-header-border); background: var(--skin-header-bg); }
.rt-custom-45 :deep(.rt-banner) { display: grid; grid-template-columns: 1fr auto; align-content: center; margin: 0; padding: 1em; border: 0; border-right: 3px solid var(--skin-header-border); background: var(--skin-top-band-bg); text-align: left; }
.rt-custom-45 :deep(.rt-banner-avatar) { grid-column: 2; grid-row: 1 / 3; width: 4.8em; height: 5.8em; margin: 0 0 0 .8em; border: 3px solid var(--skin-header-border); border-radius: 0; object-fit: cover; }
.rt-custom-45 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.35em !important; line-height: .95 !important; letter-spacing: .02em; }
.rt-custom-45 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 900; letter-spacing: .1em; }
.rt-custom-45 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; }
.rt-custom-45 :deep(.rt-basic-row) { display: block; padding: .47em .55em; border: 0; border-right: 2px solid var(--skin-basic-row-border); border-bottom: 2px solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-45 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-45 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .1em; }

/* 模块转为目录编号与横向内容区，未对条目设置分页规避。 */
.rt-custom-45 :deep(.rt-section) { counter-increment: mono-section; display: grid; grid-template-columns: 6.5em minmax(0, 1fr); gap: 0 1em; margin-bottom: var(--section-gap); border-top: 3px solid var(--skin-header-border); }
.rt-custom-45 :deep(.rt-title) { grid-row: 1 / span 40; display: block; margin: 0; padding: .55em .4em; background: var(--skin-basic-row-bg); letter-spacing: .08em; }
.rt-custom-45 :deep(.rt-title)::before { content: counter(mono-section, decimal-leading-zero); display: block; width: auto; height: auto; margin-bottom: .35em; background: transparent !important; font-size: 1.6em; }
.rt-custom-45 :deep(.rt-title)::after { display: none; }
.rt-custom-45 :deep(.rt-item),
.rt-custom-45 :deep(.rt-skills),
.rt-custom-45 :deep(.rt-list),
.rt-custom-45 :deep(.rt-text) { grid-column: 2; }
.rt-custom-45 :deep(.rt-item) { margin: 0; padding: .62em 0; border: 0; border-bottom: 2px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-45 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border: 2px solid var(--skin-skill-border); }
.rt-custom-45 :deep(.rt-skill) { border: 0; border-right: 2px solid var(--skin-skill-border); border-radius: 0; text-align: center; }
.rt-custom-45 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-45 :deep(.rt-list li) { padding: .38em .55em; border-bottom: 2px solid var(--skin-divider-color); }
</style>
