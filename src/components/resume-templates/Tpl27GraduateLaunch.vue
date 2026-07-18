<!-- AI简历风格模板 27：应届生起跑线，突出目标岗位、技能标签与实践成果 -->
<script setup>
// 使用共享标准内容维持字段、分页和点击定位契约，本文件仅定义起跑线视觉。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

// 声明公共只读输入，避免模板引入保存、路由或分页状态。
defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 根节点保持正常文档流和全宽，支持屏幕预览与 PDF 使用同一切片。 -->
  <div class="resume-template rt rt-custom-27 w-full bg-white">
    <!-- 顶部进度装饰表达从校园到职场，不承载或遮挡可编辑字段。 -->
    <div class="launch-track" aria-hidden="true">
      <b>READY</b><i></i><span>PROJECT</span><i></i><span>PRACTICE</span><i></i><em>CAREER</em>
    </div>
    <!-- 共享 DOM 负责空数据过滤、模块显隐和全部定位标记。 -->
    <ResumeStandardContent :resume="resume" :variant="27" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 清爽青蓝轨道与圆角卡片营造数字化校招作品集气质。 */
.rt-custom-27 { word-break: break-word; background: #fff; }
.launch-track {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr auto 1fr auto;
  align-items: center;
  gap: .55em;
  padding: .7em 1.25em;
  background: var(--skin-header-bg);
  color: var(--font-basic-content-color);
  pointer-events: none;
}
.launch-track b,
.launch-track span,
.launch-track em { font-size: .66em; font-style: normal; letter-spacing: .12em; }
.launch-track span { color: white; }
.launch-track b,
.launch-track em { padding: .3em .55em; border-radius: 999px; background: var(--skin-top-band-bg); color: white; }
.launch-track i { height: 2px; background: var(--skin-header-border); }

/* 头部采用名片与信息面板组合，头像仅在自身固定媒体框内裁切。 */
.rt-custom-27 :deep(.rt-body) { padding: 1.15em 1.3em; }
.rt-custom-27 :deep(.rt-header) {
  display: grid;
  grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr);
  gap: 1em;
  margin-bottom: var(--section-gap);
  padding: 1em;
  border: 1px solid var(--skin-header-border);
  border-radius: 1.1em .25em 1.1em .25em;
  background: var(--skin-basic-row-bg);
  box-shadow: .45em .45em 0 var(--skin-skill-bg);
}
.rt-custom-27 :deep(.rt-banner) {
  display: grid;
  grid-template-columns: auto 1fr;
  align-content: center;
  margin: 0;
  padding: .8em;
  border: 0;
  border-radius: .8em .2em .8em .2em;
  background: var(--skin-header-bg);
  text-align: left;
}
.rt-custom-27 :deep(.rt-banner-avatar) {
  grid-row: 1 / 3;
  width: 4.8em;
  height: 4.8em;
  margin: 0 .8em 0 0;
  border: 3px solid var(--skin-top-band-bg);
  border-radius: 50%;
  object-fit: cover;
}
.rt-custom-27 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.1em !important; letter-spacing: .04em; }
.rt-custom-27 :deep(.rt-slogan) {
  align-self: start;
  justify-self: start;
  margin: .3em 0 0;
  padding: .18em .55em;
  border-radius: 999px;
  background: var(--skin-skill-bg);
  font-weight: 800;
}
.rt-custom-27 :deep(.rt-basic-grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45em; align-content: center; }
.rt-custom-27 :deep(.rt-basic-row) { display: block; padding: .48em .55em; border-radius: .65em .15em .65em .15em; background: var(--skin-item-bg); }
.rt-custom-27 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-27 :deep(.rt-label) { display: block; min-width: 0; font-size: .66em; letter-spacing: .08em; }

/* 单栏模块按成长步骤排列，不设置 keep-together，使超长实践描述可直接跨页。 */
.rt-custom-27 :deep(.rt-section) {
  position: relative;
  margin-bottom: var(--section-gap);
  padding: .85em .95em .85em 1.15em;
  border: 1px solid var(--skin-item-border);
  border-left: 6px solid var(--skin-top-band-bg);
  border-radius: 0 .8em .8em 0;
  background: var(--skin-item-bg);
}
.rt-custom-27 :deep(.rt-title) { gap: .55em; margin: 0 0 .55em; letter-spacing: .08em; }
.rt-custom-27 :deep(.rt-title::before) { width: .75em; height: .75em; border-radius: 50%; box-shadow: 0 0 0 4px var(--skin-skill-bg); }
.rt-custom-27 :deep(.rt-title::after) { height: 1px; background: var(--skin-divider-color) !important; }
.rt-custom-27 :deep(.rt-item) {
  margin: 0;
  padding: .65em 0;
  border: 0;
  border-bottom: 1px solid var(--skin-item-border);
  border-radius: 0;
  background: transparent !important;
}
.rt-custom-27 :deep(.rt-item-header strong) { color: var(--skin-title-color) !important; }
.rt-custom-27 :deep(.rt-skills) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45em; }
.rt-custom-27 :deep(.rt-skill) { border-radius: .7em .15em .7em .15em; text-align: center; }
.rt-custom-27 :deep(.rt-list) { display: grid; gap: .4em; padding: 0; list-style: none; }
.rt-custom-27 :deep(.rt-list li) { padding: .4em .55em; border: 1px solid var(--skin-basic-row-border); background: var(--skin-basic-row-bg); }
</style>
