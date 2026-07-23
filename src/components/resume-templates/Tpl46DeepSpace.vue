<!-- AI简历风格模板 46：深空坐标，以星点网格、坐标标签和舱体面板表达探索精神。 -->
<script setup>
// 共享标准内容维持真实字段与定位，本组件只提供深空主题样式。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 星图导航不承载用户内容，普通流渲染且不截断正文。 -->
  <div class="resume-template rt rt-custom-46 w-full bg-white">
    <div class="space-nav" aria-hidden="true">
      <b>ORBIT 46</b><i></i><span>LAT 31.2304</span><span>LON 121.4737</span><em>ONLINE</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="46" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 星点、坐标和舱体边框营造深空探索感，装饰背景不替代任何文字。 */
.rt-custom-46 {
  word-break: break-word;
  background-color: var(--skin-header-bg);
  background-image:
    radial-gradient(var(--skin-top-band-bg) 1px, transparent 1px),
    radial-gradient(var(--skin-divider-color) 1px, transparent 1px);
  background-position: 0 0, .8em .8em;
  background-size: 1.6em 1.6em;
}
.space-nav { display: grid; grid-template-columns: auto 1fr auto auto auto; gap: .7em; align-items: center; padding: .65em 1.1em; border-bottom: 1px solid var(--skin-header-border); color: var(--font-basic-content-color); pointer-events: none; }
.space-nav b,
.space-nav span,
.space-nav em { font-size: .64em; font-style: normal; letter-spacing: .12em; }
.space-nav i { height: 1px; background: var(--skin-header-border); }
.space-nav em { padding: .25em .5em; border: 1px solid var(--skin-top-band-bg); color: var(--skin-top-band-bg); }

/* 头部为导航舱面板，头像固定为圆形观察窗。 */
.rt-custom-46 :deep(.rt-body) { padding: 1em 0 1.25em; }
.rt-custom-46 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); gap: .8em; margin-bottom: var(--section-gap); padding: .9em; border: 1px solid var(--skin-header-border); border-radius: 1.2em .2em 1.2em .2em; background: var(--skin-basic-row-bg); box-shadow: 0 0 0 .3em var(--skin-divider-color); }
.rt-custom-46 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 1px solid var(--skin-header-border); border-radius: 999px .4em .4em 999px; background: var(--skin-header-bg); text-align: left; }
.rt-custom-46 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 5em; margin: 0 .85em 0 0; border: .4em double var(--skin-top-band-bg); border-radius: 50%; object-fit: cover; }
.rt-custom-46 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.2em !important; line-height: 1 !important; letter-spacing: .06em; }
.rt-custom-46 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 700; letter-spacing: .08em; }
.rt-custom-46 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35em; align-content: center; }
.rt-custom-46 :deep(.rt-basic-row) { display: block; padding: .42em .48em; border-radius: .25em; }
.rt-custom-46 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-46 :deep(.rt-label) { display: block; min-width: 0; font-size: .62em; letter-spacing: .08em; }

/* 模块如独立任务舱，自然高度支持长描述跨页切片。 */
.rt-custom-46 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .82em .9em; border: 1px solid var(--skin-item-border); border-radius: .35em; background: var(--skin-item-bg); box-shadow: .3em .3em 0 var(--skin-divider-color); }
.rt-custom-46 :deep(.rt-title) { gap: .55em; margin: 0 0 .55em; letter-spacing: .09em; }
.rt-custom-46 :deep(.rt-title)::before { width: 1em; height: 1em; border: .25em double var(--skin-title-color); border-radius: 50%; background: transparent !important; }
.rt-custom-46 :deep(.rt-title)::after { height: 1px; background: repeating-linear-gradient(90deg, var(--skin-divider-color) 0 .5em, transparent .5em .8em) !important; }
.rt-custom-46 :deep(.rt-item) { margin: 0; padding: .62em .7em; border: 0; border-left: .35em solid var(--skin-top-band-bg); border-radius: .2em; background: var(--skin-basic-row-bg) !important; }
.rt-custom-46 :deep(.rt-item + .rt-item) { margin-top: .5em; }
.rt-custom-46 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .4em; }
.rt-custom-46 :deep(.rt-skill) { border-radius: 999px; text-align: center; }
.rt-custom-46 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-46 :deep(.rt-list li) { padding: .35em .55em; border-left: .35em solid var(--skin-skill-border); background: var(--skin-basic-row-bg); }
</style>
