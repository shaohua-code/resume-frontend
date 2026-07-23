<!-- AI简历风格模板 30：海岸波纹，以层叠色带和圆润信息岛呈现轻盈专业感。 -->
<script setup>
// 共享标准 DOM 维持字段与定位契约，本组件仅负责海岸主题样式。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 根容器不裁切正文，波纹色带作为普通流内装饰。 -->
  <div class="resume-template rt rt-custom-30 w-full bg-white">
    <div class="ocean-tide" aria-hidden="true">
      <i></i><i></i><i></i><b>OCEAN / 30</b>
    </div>
    <ResumeStandardContent :resume="resume" :variant="30" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 三段自然色带形成海岸层次，所有颜色均来自模板皮肤变量。 */
.rt-custom-30 { word-break: break-word; background: var(--skin-item-bg); }
.ocean-tide {
  display: grid;
  grid-template-columns: 1fr 1.6fr 2.3fr auto;
  align-items: stretch;
  height: 2.5em;
  background: var(--skin-header-bg);
  pointer-events: none;
}
.ocean-tide i:nth-child(1) { background: var(--skin-top-band-bg); border-radius: 0 2em 2em 0; }
.ocean-tide i:nth-child(2) { background: var(--skin-skill-border); border-radius: 0 2em 2em 0; }
.ocean-tide i:nth-child(3) { background: var(--skin-divider-color); border-radius: 0 2em 2em 0; }
.ocean-tide b { align-self: center; padding: 0 1em; color: var(--font-basic-content-color); font-size: .68em; letter-spacing: .14em; }

/* 头部像一张沿海名片，头像仅在圆形媒体框中裁切。 */
.rt-custom-30 :deep(.rt-body) { padding: 1.05em 0 1.25em; }
.rt-custom-30 :deep(.rt-header) { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); gap: 1em; margin-bottom: var(--section-gap); padding: 1em; border: 1px solid var(--skin-header-border); border-radius: 2em .45em 2em .45em; background: var(--skin-header-bg); }
.rt-custom-30 :deep(.rt-banner) { display: grid; grid-template-columns: auto 1fr; align-content: center; margin: 0; padding: .8em; border: 0; border-radius: 1.5em .35em 1.5em .35em; background: var(--skin-basic-row-bg); text-align: left; }
.rt-custom-30 :deep(.rt-banner-avatar) { grid-row: 1 / 3; width: 5em; height: 5em; margin: 0 .85em 0 0; border: 4px solid var(--skin-top-band-bg); border-radius: 50%; object-fit: cover; }
.rt-custom-30 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; line-height: 1 !important; letter-spacing: .04em; }
.rt-custom-30 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; font-weight: 700; }
.rt-custom-30 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42em; align-content: center; }
.rt-custom-30 :deep(.rt-basic-row) { display: block; padding: .46em .6em; border: 0; border-bottom: 1px solid var(--skin-basic-row-border); border-radius: .8em .15em .8em .15em; }
.rt-custom-30 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-30 :deep(.rt-label) { display: block; min-width: 0; font-size: .67em; letter-spacing: .08em; }

/* 模块以柔和信息岛串联，未使用分页规避或固定高度。 */
.rt-custom-30 :deep(.rt-section) { margin-bottom: var(--section-gap); padding: .85em 1em; border: 1px solid var(--skin-item-border); border-radius: 1.2em .25em 1.2em .25em; background: var(--skin-item-bg); }
.rt-custom-30 :deep(.rt-title) { gap: .55em; margin: 0 0 .55em; letter-spacing: .08em; }
.rt-custom-30 :deep(.rt-title::before) { width: 1.25em; height: .65em; border-radius: 0 100% 0 100%; background: var(--skin-top-band-bg) !important; }
.rt-custom-30 :deep(.rt-title::after) { height: .35em; border-radius: 100%; background: linear-gradient(90deg, var(--skin-divider-color), transparent) !important; }
.rt-custom-30 :deep(.rt-item) { margin: 0; padding: .62em .25em; border: 0; border-bottom: 1px dashed var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-30 :deep(.rt-skills) { gap: .45em; }
.rt-custom-30 :deep(.rt-skill) { border-radius: 1em .2em 1em .2em; }
.rt-custom-30 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-30 :deep(.rt-list li) { padding: .38em .6em; border-left: 4px solid var(--skin-top-band-bg); }
</style>
