<!-- AI简历风格模板 41：极光流线，以柔和渐变、弧形边界和轻卡片表达活力。 -->
<script setup>
// 共享内容负责字段、模块显隐和点击区域，本组件只提供极光主题视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 极光色带是普通流内装饰，不使用绝对覆盖或正文裁切。 -->
  <div class="resume-template rt rt-custom-41 w-full bg-white">
    <div class="aurora-flow" aria-hidden="true">
      <i></i><span>AURORA CAREER FLOW</span><i></i><b>41</b>
    </div>
    <ResumeStandardContent :resume="resume" :variant="41" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 渐变流线与柔和圆角构成轻盈极光气质，色值由皮肤变量驱动。 */
.rt-custom-41 { word-break: break-word; background: linear-gradient(145deg, var(--skin-basic-row-bg), var(--skin-item-bg) 55%, var(--skin-skill-bg)); }
.aurora-flow { display: grid; grid-template-columns: 1fr auto 1.5fr auto; align-items: center; gap: .7em; padding: .7em 1.25em; color: var(--font-content-color); pointer-events: none; }
.aurora-flow i { height: 1.2em; border-radius: 999px; background: linear-gradient(90deg, transparent, var(--skin-top-band-bg), var(--skin-skill-border)); }
.aurora-flow i:nth-of-type(2) { background: linear-gradient(90deg, var(--skin-skill-border), var(--skin-top-band-bg), transparent); }
.aurora-flow span { font-size: .66em; font-weight: 800; letter-spacing: .16em; }
.aurora-flow b { padding: .3em .55em; border-radius: 999px; background: var(--skin-top-band-bg); color: var(--font-basic-content-color); }

/* 头部以弧形双色面板承载姓名和信息，头像固定为圆形媒体框。 */
.rt-custom-41 :deep(.rt-body) { padding: .45em 0 1.25em; }
.rt-custom-41 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); gap: .9em; margin-bottom: var(--section-gap); padding: 1em; border: 1px solid var(--skin-header-border); border-radius: 2.4em .5em 2.4em .5em; background: var(--skin-header-bg); box-shadow: 0 .65em 1.3em var(--skin-divider-color); }
.rt-custom-41 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 0; border-radius: 2em .35em 2em .35em; background: linear-gradient(135deg, var(--skin-skill-bg), var(--skin-basic-row-bg)); text-align: left; }
.rt-custom-41 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 5em; margin: 0 .85em 0 0; border: .35em solid var(--skin-top-band-bg); border-radius: 50%; object-fit: cover; }
.rt-custom-41 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; line-height: 1 !important; letter-spacing: .04em; }
.rt-custom-41 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 700; }
.rt-custom-41 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42em; align-content: center; }
.rt-custom-41 :deep(.rt-basic-row) { display: block; padding: .46em .56em; border-radius: 1em .15em 1em .15em; }
.rt-custom-41 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-41 :deep(.rt-label) { display: block; min-width: 0; font-size: .66em; letter-spacing: .06em; }

/* 模块使用交替弧角但保持连续文档顺序与真实内容高度。 */
.rt-custom-41 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .88em 1em; border: 1px solid var(--skin-item-border); border-radius: 1.5em .25em 1.5em .25em; background: var(--skin-item-bg); }
.rt-custom-41 :deep(.rt-section:nth-of-type(even)) { border-radius: .25em 1.5em .25em 1.5em; }
.rt-custom-41 :deep(.rt-title) { gap: .55em; margin: 0 0 .6em; letter-spacing: .08em; }
.rt-custom-41 :deep(.rt-title)::before { width: 1.4em; height: .65em; border-radius: 100% 0 100% 0; background: linear-gradient(90deg, var(--skin-top-band-bg), var(--skin-skill-border)) !important; }
.rt-custom-41 :deep(.rt-title)::after { height: .35em; border-radius: 999px; background: linear-gradient(90deg, var(--skin-divider-color), transparent) !important; }
.rt-custom-41 :deep(.rt-item) { margin: 0; padding: .62em .25em; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-41 :deep(.rt-skills) { gap: .45em; }
.rt-custom-41 :deep(.rt-skill) { border-radius: 999px; box-shadow: 0 .22em 0 var(--skin-skill-border); }
.rt-custom-41 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-41 :deep(.rt-list li) { padding: .38em .6em; border-radius: 999px; background: var(--skin-basic-row-bg); }
</style>
