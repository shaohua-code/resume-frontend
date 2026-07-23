<!-- AI简历风格模板 40：纸本账册，以横线纸、编号栏和账簿表格表现严谨记录。 -->
<script setup>
// 标准模块提供真实条目和分页语义，本组件只添加账册式排版。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 账册底纹是背景，不取代正文文字且不会阻挡点击定位。 -->
  <div class="resume-template rt rt-custom-40 w-full bg-white">
    <div class="ledger-code" aria-hidden="true">
      <b>LEDGER 40</b><span>NAME / EXPERIENCE / RESULT</span><i></i><em>ARCHIVE</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="40" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 重复横线与左侧账簿边线建立纸本记录感，根节点不裁切内容。 */
.rt-custom-40 {
  word-break: break-word;
  background-color: var(--skin-item-bg);
  background-image: repeating-linear-gradient(0deg, transparent 0 1.8em, var(--skin-divider-color) 1.8em calc(1.8em + 1px));
  border-left: .8em solid var(--skin-top-band-bg);
}
.ledger-code { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: .75em; padding: .7em 1.2em; border-bottom: 3px double var(--skin-header-border); background: var(--skin-header-bg); color: var(--font-content-color); pointer-events: none; }
.ledger-code b,
.ledger-code span,
.ledger-code em { font-size: .65em; font-style: normal; letter-spacing: .13em; }
.ledger-code i { height: 1px; background: var(--skin-header-border); }
.ledger-code em { padding: .25em .5em; border: 1px solid var(--skin-header-border); }

/* 头部模拟账簿封面标签，信息格保持自适应高度。 */
.rt-custom-40 :deep(.rt-body) { counter-reset: ledger-section; padding: 1em 0 1.25em; }
.rt-custom-40 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); gap: 0; margin-bottom: var(--section-gap); border: 2px solid var(--skin-header-border); background: var(--skin-header-bg); }
.rt-custom-40 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .9em; border: 0; border-right: 2px solid var(--skin-header-border); text-align: left; }
.rt-custom-40 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 4.8em; height: 5.8em; margin: 0 .85em 0 0; border: 1px solid var(--skin-header-border); border-radius: 0; object-fit: cover; }
.rt-custom-40 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.2em !important; line-height: 1 !important; letter-spacing: .08em; }
.rt-custom-40 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 700; }
.rt-custom-40 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; }
.rt-custom-40 :deep(.rt-basic-row) { display: block; padding: .45em .55em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; }
.rt-custom-40 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-40 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .08em; }

/* 模块以连续编号和表格行呈现，条目仍保留 rt-item 独立识别。 */
.rt-custom-40 :deep(.rt-section) { counter-increment: ledger-section; display: grid; grid-template-columns: 3.1em minmax(0, 1fr); gap: 0 .7em; margin-bottom: var(--section-gap); padding: .75em; border: 1px solid var(--skin-item-border); background: var(--skin-item-bg); }
.rt-custom-40 :deep(.rt-title) { grid-row: 1 / span 40; display: block; margin: 0; padding: .35em; border-right: 1px solid var(--skin-divider-color); text-align: center; writing-mode: vertical-rl; letter-spacing: .1em; }
.rt-custom-40 :deep(.rt-title)::before { content: counter(ledger-section, decimal-leading-zero); display: block; width: auto; height: auto; margin-bottom: .5em; background: var(--skin-top-band-bg) !important; color: var(--font-basic-content-color); writing-mode: horizontal-tb; }
.rt-custom-40 :deep(.rt-title)::after { display: none; }
.rt-custom-40 :deep(.rt-item),
.rt-custom-40 :deep(.rt-skills),
.rt-custom-40 :deep(.rt-list),
.rt-custom-40 :deep(.rt-text) { grid-column: 2; }
.rt-custom-40 :deep(.rt-item) { margin: 0; padding: .6em .55em; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-40 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; border-top: 1px solid var(--skin-skill-border); border-left: 1px solid var(--skin-skill-border); }
.rt-custom-40 :deep(.rt-skill) { border: 0; border-right: 1px solid var(--skin-skill-border); border-bottom: 1px solid var(--skin-skill-border); border-radius: 0; text-align: center; }
.rt-custom-40 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-40 :deep(.rt-list li) { padding: .35em .5em; border-bottom: 1px solid var(--skin-divider-color); }
</style>
