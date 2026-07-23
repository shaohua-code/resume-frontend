<!-- AI简历风格模板 35：北欧留白，以克制线条、宽松呼吸和清晰字阶突出内容。 -->
<script setup>
// 继续使用标准字段和模块 DOM，本组件只提供极简排版而不修改数据。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 极简根节点不增加额外高度约束，长内容可顺序跨页。 -->
  <div class="resume-template rt rt-custom-35 w-full bg-white">
    <div class="nordic-sign" aria-hidden="true">
      <span>NORD / PROFILE</span><i></i><b>35</b>
    </div>
    <ResumeStandardContent :resume="resume" :variant="35" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 大面积留白与短线标记形成安静的北欧编辑感。 */
.rt-custom-35 { word-break: break-word; background: var(--skin-item-bg); }
.nordic-sign { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1em; padding: .9em 1.6em .2em; color: var(--font-content-color); pointer-events: none; }
.nordic-sign span { font-size: .62em; letter-spacing: .2em; }
.nordic-sign i { height: 1px; background: var(--skin-divider-color); }
.nordic-sign b { font-size: .78em; }

/* 头部采用横向留白布局，信息行尽量不使用块面装饰。 */
.rt-custom-35 :deep(.rt-body) { padding: 1.2em 0 1.5em; }
.rt-custom-35 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .85fr); gap: 2em; margin-bottom: var(--section-gap); padding: 1.1em 0; border-top: 1px solid var(--skin-header-border); border-bottom: 1px solid var(--skin-header-border); background: transparent; }
.rt-custom-35 :deep(.rt-banner) { display: grid; grid-template-columns: 1fr auto; align-content: center; margin: 0; padding: 0; border: 0; text-align: left; }
.rt-custom-35 :deep(.rt-banner-avatar) { grid-column: 2; grid-row: 1 / 3; width: 4.6em; height: 5.5em; margin: 0 0 0 1em; border: 1px solid var(--skin-header-border); border-radius: 0; object-fit: cover; }
.rt-custom-35 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.7em !important; line-height: .95 !important; letter-spacing: -.03em; }
.rt-custom-35 :deep(.rt-slogan) { align-self: start; margin: .55em 0 0; font-weight: 500; letter-spacing: .08em; }
.rt-custom-35 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5em 1em; align-content: center; }
.rt-custom-35 :deep(.rt-basic-row) { display: block; padding: .3em 0; border: 0; border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; background: transparent !important; }
.rt-custom-35 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-35 :deep(.rt-label) { display: block; min-width: 0; font-size: .62em; letter-spacing: .12em; }

/* 模块取消卡片包围，用字阶和细线保持内容阅读优先。 */
.rt-custom-35 :deep(.rt-section) { margin-bottom: var(--section-gap); }
.rt-custom-35 :deep(.rt-title) { gap: .8em; margin: 0 0 .7em; font-weight: 600; letter-spacing: .16em; }
.rt-custom-35 :deep(.rt-title::before) { width: 2.8em; height: 1px; border-radius: 0; }
.rt-custom-35 :deep(.rt-title::after) { display: none; }
.rt-custom-35 :deep(.rt-item) { margin: 0; padding: .65em 0; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-35 :deep(.rt-skills) { gap: .35em 1em; }
.rt-custom-35 :deep(.rt-skill) { padding: .3em 0; border: 0; border-bottom: 2px solid var(--skin-skill-border); border-radius: 0; background: transparent !important; }
.rt-custom-35 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-35 :deep(.rt-list li) { padding: .35em 0; border-bottom: 1px solid var(--skin-divider-color); }
</style>
