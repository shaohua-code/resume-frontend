<!-- AI简历风格模板 29：黑金社论，用报章头版和粗细线对比强化资深感。 -->
<script setup>
// 标准内容负责字段、空数据过滤和定位，本组件只呈现社论式版面。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 保持单一连续文档流，避免社论装饰影响分页测量。 -->
  <div class="resume-template rt rt-custom-29 w-full bg-white">
    <div class="noir-folio" aria-hidden="true">
      <span>THE PROFESSIONAL EDITION</span><b>VOL. 29</b><em>SELECTED PROFILE</em>
    </div>
    <ResumeStandardContent :resume="resume" :variant="29" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 深色刊头、双线边框和中央姓名构成正式的报章头版。 */
.rt-custom-29 { word-break: break-word; background: var(--skin-item-bg); }
.noir-folio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;
  padding: .65em 1.35em;
  background: var(--skin-top-band-bg);
  color: var(--font-basic-content-color);
  pointer-events: none;
}
.noir-folio span,
.noir-folio b,
.noir-folio em { font-size: .67em; font-style: normal; letter-spacing: .16em; }
.noir-folio b { padding: .25em .55em; border: 1px solid var(--skin-header-border); }

/* 头部按上下阅读，头像裁切仅限固定媒体框。 */
.rt-custom-29 :deep(.rt-body) { padding: 1em 0 1.25em; }
.rt-custom-29 :deep(.rt-header) { margin-bottom: var(--section-gap); padding: .9em 0 1em; border-top: 4px double var(--skin-header-border); border-bottom: 4px double var(--skin-header-border); background: var(--skin-header-bg); }
.rt-custom-29 :deep(.rt-banner) { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin: 0 0 .8em; padding: 0 1em .8em; border: 0; border-bottom: 1px solid var(--skin-header-border); text-align: center; }
.rt-custom-29 :deep(.rt-banner-avatar) { grid-column: 1; grid-row: 1 / 3; justify-self: start; width: 5.2em; height: 5.2em; margin: 0; border: 2px solid var(--skin-header-border); border-radius: 50%; object-fit: cover; }
.rt-custom-29 :deep(.rt-name) { grid-column: 2; align-self: end; margin: 0; font-size: 2.55em !important; line-height: 1 !important; letter-spacing: .12em; }
.rt-custom-29 :deep(.rt-slogan) { grid-column: 2; align-self: start; margin: .45em 0 0; font-weight: 700; letter-spacing: .2em; }
.rt-custom-29 :deep(.rt-basic-grid) { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; }
.rt-custom-29 :deep(.rt-basic-row) { display: block; padding: .45em .6em; border: 0; border-left: 1px solid var(--skin-basic-row-border); border-radius: 0; text-align: center; background: transparent !important; }
.rt-custom-29 :deep(.rt-basic-row:last-child) { border-right: 1px solid var(--skin-basic-row-border); }
.rt-custom-29 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-29 :deep(.rt-label) { display: block; min-width: 0; font-size: .66em; letter-spacing: .08em; }

/* 模块标题像报纸栏目签，条目接受长描述跨页切片。 */
.rt-custom-29 :deep(.rt-section) { margin-bottom: var(--section-gap); }
.rt-custom-29 :deep(.rt-title) { display: grid; grid-template-columns: 1fr auto 1fr; gap: .8em; margin: 0 0 .7em; text-align: center; letter-spacing: .15em; }
.rt-custom-29 :deep(.rt-title::before),
.rt-custom-29 :deep(.rt-title::after) { width: auto; height: 2px; border-radius: 0; background: var(--skin-divider-color) !important; }
.rt-custom-29 :deep(.rt-item) { margin: 0; padding: .7em .8em; border: 0; border-left: 3px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.rt-custom-29 :deep(.rt-item + .rt-item) { border-top: 1px dotted var(--skin-divider-color); }
.rt-custom-29 :deep(.rt-skills) { justify-content: center; gap: .45em; }
.rt-custom-29 :deep(.rt-skill) { border-radius: 0; border-width: 0 0 2px; background: transparent !important; }
.rt-custom-29 :deep(.rt-list) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em 1.2em; padding: 0; list-style: none; }
.rt-custom-29 :deep(.rt-list li) { padding: .35em .45em; border-top: 1px solid var(--skin-divider-color); }
</style>
