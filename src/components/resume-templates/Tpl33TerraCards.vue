<!-- AI简历风格模板 33：陶土卡片，用暖色块和错落卡片呈现沉稳的人文气质。 -->
<script setup>
// 复用共享字段和定位语义，当前文件只负责陶土卡片视觉层次。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 根节点与全部正文维持正常流，色块均为普通装饰元素。 -->
  <div class="resume-template rt rt-custom-33 w-full bg-white">
    <div class="terra-mark" aria-hidden="true">
      <b>33</b><span>EARTH · CRAFT · CAREER</span><i></i><em>PROFILE</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="33" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 陶土色章、柔和纸张与厚底卡片构成有手作温度的专业版式。 */
.rt-custom-33 { word-break: break-word; background: var(--skin-basic-row-bg); }
.terra-mark { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: .75em; padding: .65em 1.25em; color: var(--font-content-color); pointer-events: none; }
.terra-mark b { width: 2.5em; height: 2.5em; border-radius: 50% 50% .4em .4em; background: var(--skin-top-band-bg); color: var(--font-basic-content-color); line-height: 2.5em; text-align: center; }
.terra-mark span,
.terra-mark em { font-size: .66em; font-style: normal; font-weight: 800; letter-spacing: .14em; }
.terra-mark i { height: 2px; background: var(--skin-divider-color); }

/* 头部为左右拼接名片，头像只在局部方圆媒体框内裁切。 */
.rt-custom-33 :deep(.rt-body) { padding: .4em 0 1.25em; }
.rt-custom-33 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: .9em; margin-bottom: var(--section-gap); padding: 1em; border: 0; border-radius: 1.1em; background: var(--skin-header-bg); box-shadow: 0 .5em 0 var(--skin-header-border); }
.rt-custom-33 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 0; border-radius: .8em; background: var(--skin-item-bg); text-align: left; }
.rt-custom-33 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5.2em; height: 5.8em; margin: 0 .9em 0 0; border: 4px solid var(--skin-top-band-bg); border-radius: 50% 50% .8em .8em; object-fit: cover; }
.rt-custom-33 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; line-height: 1 !important; letter-spacing: .05em; }
.rt-custom-33 :deep(.rt-slogan) { align-self: start; margin: .4em 0 0; font-weight: 800; }
.rt-custom-33 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em; align-content: center; }
.rt-custom-33 :deep(.rt-basic-row) { display: block; padding: .46em .58em; border: 0; border-radius: .65em; }
.rt-custom-33 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-33 :deep(.rt-label) { display: block; min-width: 0; font-size: .68em; letter-spacing: .06em; }

/* 模块卡片可自然增长，交替边框只改变视觉节奏而不改变数据顺序。 */
.rt-custom-33 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .9em 1em; border: 1px solid var(--skin-item-border); border-radius: .85em; background: var(--skin-item-bg); box-shadow: .35em .35em 0 var(--skin-divider-color); }
.rt-custom-33 :deep(.rt-section:nth-of-type(even)) { border-left: .55em solid var(--skin-top-band-bg); }
.rt-custom-33 :deep(.rt-section:nth-of-type(odd)) { border-left: .55em solid var(--skin-skill-border); }
.rt-custom-33 :deep(.rt-title) { gap: .55em; margin: 0 0 .6em; letter-spacing: .08em; }
.rt-custom-33 :deep(.rt-title::before) { width: 1em; height: 1em; border-radius: 50% 50% .2em .2em; }
.rt-custom-33 :deep(.rt-title::after) { height: 1px; background: var(--skin-divider-color) !important; }
.rt-custom-33 :deep(.rt-item) { margin: 0; padding: .62em .2em; border: 0; border-bottom: 1px dashed var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-33 :deep(.rt-skills) { gap: .5em; }
.rt-custom-33 :deep(.rt-skill) { border-radius: .2em 1em .2em 1em; }
.rt-custom-33 :deep(.rt-list) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em; padding: 0; list-style: none; }
.rt-custom-33 :deep(.rt-list li) { padding: .4em .55em; border-radius: .5em; background: var(--skin-basic-row-bg); }
</style>
