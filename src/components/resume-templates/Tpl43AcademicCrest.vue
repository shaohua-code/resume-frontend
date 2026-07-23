<!-- AI简历风格模板 43：学院徽章，以院刊规则、徽章和对称线条呈现学术气质。 -->
<script setup>
// 复用标准字段与模块定位，本组件只定义学院档案视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 院徽刊头为无交互装饰，全部用户字段仍在标准语义模块内。 -->
  <div class="resume-template rt rt-custom-43 w-full bg-white">
    <div class="academy-crest" aria-hidden="true">
      <i></i><span>ACADEMIC &amp; PROFESSIONAL RECORD</span><b>43</b><i></i>
    </div>
    <ResumeStandardContent :resume="resume" :variant="43" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 对称横线与盾形编号形成学院年鉴式的庄重秩序。 */
.rt-custom-43 { word-break: break-word; background: var(--skin-item-bg); }
.academy-crest { display: grid; grid-template-columns: 1fr auto auto 1fr; align-items: center; gap: .75em; padding: .75em 1.4em; color: var(--font-content-color); pointer-events: none; }
.academy-crest i { height: 3px; background: var(--skin-divider-color); }
.academy-crest span { font-size: .65em; font-weight: 800; letter-spacing: .17em; }
.academy-crest b { width: 2.7em; padding: .45em .2em .65em; border: 2px solid var(--skin-header-border); border-radius: 50% 50% .25em .25em; background: var(--skin-top-band-bg); color: var(--font-basic-content-color); text-align: center; }

/* 姓名头部保持居中典礼感，头像为固定徽章式媒体框。 */
.rt-custom-43 :deep(.rt-body) { padding: .35em 0 1.35em; }
.rt-custom-43 :deep(.rt-header) { margin-bottom: var(--section-gap); padding: 1em; border-top: 4px double var(--skin-header-border); border-bottom: 4px double var(--skin-header-border); background: var(--skin-header-bg); }
.rt-custom-43 :deep(.rt-banner) { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin: 0 0 .8em; padding: .4em 1em .9em; border: 0; border-bottom: 1px solid var(--skin-header-border); text-align: center; }
.rt-custom-43 :deep(.rt-banner-avatar) { grid-column: 1; grid-row: 1 / 3; justify-self: end; width: 5.1em; height: 5.1em; margin: 0 1.1em 0 0; border: 4px double var(--skin-top-band-bg); border-radius: 50%; object-fit: cover; }
.rt-custom-43 :deep(.rt-name) { grid-column: 2; align-self: end; margin: 0; font-size: 2.45em !important; line-height: 1 !important; letter-spacing: .14em; }
.rt-custom-43 :deep(.rt-slogan) { grid-column: 2; align-self: start; margin: .45em 0 0; font-weight: 700; letter-spacing: .16em; }
.rt-custom-43 :deep(.rt-basic-grid) { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; }
.rt-custom-43 :deep(.rt-basic-row) { display: block; padding: .45em .55em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-radius: 0; text-align: center; background: transparent !important; }
.rt-custom-43 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-43 :deep(.rt-label) { display: block; min-width: 0; font-size: .64em; letter-spacing: .1em; }

/* 模块采用院刊对称标题和细线条目，保持全部 rt-item 独立。 */
.rt-custom-43 :deep(.rt-section) { margin-bottom: var(--section-gap); }
.rt-custom-43 :deep(.rt-title) { display: grid; grid-template-columns: 1fr auto 1fr; gap: .75em; margin: 0 0 .65em; text-align: center; letter-spacing: .14em; }
.rt-custom-43 :deep(.rt-title)::before,
.rt-custom-43 :deep(.rt-title)::after { width: auto; height: 2px; border-radius: 0; background: var(--skin-divider-color) !important; }
.rt-custom-43 :deep(.rt-title span) { padding: .18em .7em; border-top: 1px solid var(--skin-title-color); border-bottom: 1px solid var(--skin-title-color); }
.rt-custom-43 :deep(.rt-item) { margin: 0; padding: .65em .3em; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-43 :deep(.rt-skills) { justify-content: center; gap: .45em; }
.rt-custom-43 :deep(.rt-skill) { border-radius: .2em; border-style: double; }
.rt-custom-43 :deep(.rt-list) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4em 1em; padding: 0; list-style: none; }
.rt-custom-43 :deep(.rt-list li) { padding: .38em .55em; border-bottom: 1px solid var(--skin-divider-color); text-align: center; }
</style>
