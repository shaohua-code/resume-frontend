<!-- AI简历风格模板 44：柑橘工作室，以明快圆点、果瓣图形和轻卡片表达创意活力。 -->
<script setup>
// 共享标准内容处理完整字段和可见模块，本组件只添加工作室视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 果瓣装饰均在普通文档流且 pointer-events 关闭，不影响模块点击。 -->
  <div class="resume-template rt rt-custom-44 w-full bg-white">
    <div class="citrus-stamp" aria-hidden="true">
      <i></i><b>CITRUS STUDIO</b><span>FRESH IDEAS · REAL RESULTS</span><em>44</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="44" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 点状纸张、果瓣标识和高亮边框营造明快创意工作室气质。 */
.rt-custom-44 {
  word-break: break-word;
  background-color: var(--skin-item-bg);
  background-image: radial-gradient(var(--skin-divider-color) 1px, transparent 1px);
  background-size: 1.2em 1.2em;
}
.citrus-stamp { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: .75em; padding: .7em 1.25em; color: var(--font-content-color); pointer-events: none; }
.citrus-stamp i { width: 2.5em; height: 2.5em; border: .55em double var(--skin-top-band-bg); border-radius: 50% 0 50% 50%; background: var(--skin-skill-bg); }
.citrus-stamp b,
.citrus-stamp span { font-size: .67em; letter-spacing: .14em; }
.citrus-stamp em { padding: .35em .55em; border-radius: 50%; background: var(--skin-top-band-bg); color: var(--font-basic-content-color); font-style: normal; font-weight: 900; }

/* 头部像品牌工作室名片，头像只在果瓣形媒体框内裁切。 */
.rt-custom-44 :deep(.rt-body) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1em; padding: .45em 0 1.25em; }
.rt-custom-44 :deep(.rt-header) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1em; border: 2px solid var(--skin-header-border); border-radius: 1.5em .3em 1.5em .3em; background: var(--skin-header-bg); box-shadow: .45em .45em 0 var(--skin-top-band-bg); }
.rt-custom-44 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .75em; border: 0; border-radius: 1.2em .2em 1.2em .2em; background: var(--skin-basic-row-bg); text-align: left; }
.rt-custom-44 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 5.4em; margin: 0 .85em 0 0; border: .4em solid var(--skin-top-band-bg); border-radius: 50% 0 50% 50%; object-fit: cover; }
.rt-custom-44 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.3em !important; line-height: 1 !important; letter-spacing: .03em; }
.rt-custom-44 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 800; }
.rt-custom-44 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4em; align-content: center; }
.rt-custom-44 :deep(.rt-basic-row) { display: block; padding: .43em .5em; border-radius: .75em .15em .75em .15em; }
.rt-custom-44 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-44 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .06em; }

/* 模块双列卡片突出作品感，关键长模块占满整行并保留正常流。 */
.rt-custom-44 :deep(.rt-section) { grid-column: span 1; margin-bottom: var(--section-gap); padding: .85em .9em; border: 2px solid var(--skin-item-border); border-radius: .9em .2em .9em .2em; background: var(--skin-item-bg); }
.rt-custom-44 :deep(.rt-section[data-resume-module='work_experience']),
.rt-custom-44 :deep(.rt-section[data-resume-module='projects']),
.rt-custom-44 :deep(.rt-section[data-resume-module='basic']) { grid-column: 1 / -1; }
.rt-custom-44 :deep(.rt-title) { gap: .5em; margin: 0 0 .55em; letter-spacing: .08em; }
.rt-custom-44 :deep(.rt-title)::before { width: 1em; height: 1em; border: .25em double var(--skin-title-color); border-radius: 50% 0 50% 50%; background: var(--skin-top-band-bg) !important; }
.rt-custom-44 :deep(.rt-title)::after { height: .35em; border-radius: 999px; background: var(--skin-divider-color) !important; }
.rt-custom-44 :deep(.rt-item) { margin: 0; padding: .6em .2em; border: 0; border-bottom: 1px dashed var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-44 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4em; }
.rt-custom-44 :deep(.rt-skill) { border-radius: 999px; text-align: center; }
.rt-custom-44 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-44 :deep(.rt-list li) { padding: .38em .55em; border-radius: .65em; background: var(--skin-basic-row-bg); }
</style>
