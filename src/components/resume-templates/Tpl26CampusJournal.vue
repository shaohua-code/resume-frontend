<!-- AI简历风格模板 26：应届生校刊档案，强调教育、项目与校园成长记录 -->
<script setup>
// 复用标准字段映射与模块显隐契约，仅由本组件负责校刊式视觉呈现。
import ResumeStandardContent from './shared/ResumeStandardContent.vue'

// 模板只接收简历数据和公共模块开关，不写入任何编辑器状态。
defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- 根节点保持正常文档流，便于编辑器按固定 A4 可用高度直接裁切。 -->
  <div class="resume-template rt rt-custom-26 w-full bg-white">
    <!-- 装饰刊头不承载用户字段，关闭指针事件以免干扰模块点击定位。 -->
    <div class="journal-masthead" aria-hidden="true">
      <span>CAMPUS JOURNAL</span><i></i><b>GRADUATE · 26</b>
    </div>
    <!-- 标准内容提供完整字段、语义类和 data-resume-module 定位标记。 -->
    <ResumeStandardContent :resume="resume" :variant="26" :visible-modules="visibleModules" />
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 米白纸张、学院蓝和暖橙印章构成轻编辑感，应届生内容仍保持单栏顺序阅读。 */
.rt-custom-26 {
  word-break: break-word;
  background: linear-gradient(90deg, var(--skin-basic-row-bg) 0 .65em, #fff 0);
}

/* 刊头只做视觉识别，不使用定位或裁切型布局。 */
.journal-masthead {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: .85em;
  padding: .7em 1.25em .7em 1.65em;
  border-bottom: 1px solid var(--skin-divider-color);
  color: var(--skin-title-color);
  pointer-events: none;
}
.journal-masthead span,
.journal-masthead b { font-size: .72em; letter-spacing: .18em; }
.journal-masthead i { height: 1px; background: var(--skin-divider-color); }
.journal-masthead b { padding: .35em .6em; background: var(--skin-top-band-bg); color: white; }

/* 正文不设置固定高度或 overflow，让长项目和长实习可自然跨页。 */
.rt-custom-26 :deep(.rt-body) { padding: 1.05em 1.3em 1.2em 1.65em; }
.rt-custom-26 :deep(.rt-header) {
  display: grid;
  grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
  gap: 1.1em;
  margin-bottom: var(--section-gap);
  padding: 1em;
  border: 1px solid var(--skin-header-border);
  border-top: 5px solid var(--skin-top-band-bg);
  background: var(--skin-header-bg);
}
.rt-custom-26 :deep(.rt-banner) {
  display: grid;
  grid-template-columns: auto 1fr;
  align-content: center;
  margin: 0;
  padding: 0 1em 0 0;
  border: 0;
  border-right: 1px solid var(--skin-header-border);
  text-align: left;
}
.rt-custom-26 :deep(.rt-banner-avatar) {
  grid-row: 1 / 3;
  width: 5.2em;
  height: 6.2em;
  margin: 0 .9em 0 0;
  border: 3px solid white;
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--skin-skill-border);
  object-fit: cover;
}
.rt-custom-26 :deep(.rt-name) { align-self: end; margin: 0; font-size: 2.25em !important; letter-spacing: .08em; }
.rt-custom-26 :deep(.rt-slogan) { align-self: start; margin: .35em 0 0; font-weight: 700; letter-spacing: .08em; }
.rt-custom-26 :deep(.rt-basic-grid) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .42em; align-content: center; }
.rt-custom-26 :deep(.rt-basic-row) { display: block; padding: .42em .55em; border-radius: 0; }
.rt-custom-26 :deep(.rt-basic-wide) { grid-column: auto; }
.rt-custom-26 :deep(.rt-label) { display: block; min-width: 0; font-size: .68em; letter-spacing: .1em; }

/* 模块使用编号感标题和底线条目，突出校招筛选常看的教育、项目与实习。 */
.rt-custom-26 :deep(.rt-section) { margin-bottom: var(--section-gap); }
.rt-custom-26 :deep(.rt-title) { gap: .65em; margin: 0 0 .6em; letter-spacing: .1em; }
.rt-custom-26 :deep(.rt-title::before) {
  width: 1.1em;
  height: 1.1em;
  border: 3px double var(--skin-title-color);
  border-radius: 50%;
  background: transparent !important;
}
.rt-custom-26 :deep(.rt-title::after) { height: 2px; background: var(--skin-divider-color) !important; }
.rt-custom-26 :deep(.rt-item) {
  margin: 0;
  padding: .65em .25em .7em;
  border: 0;
  border-bottom: 1px dashed var(--skin-item-border);
  border-radius: 0;
  background: transparent !important;
}
.rt-custom-26 :deep(.rt-item-header strong) { color: var(--skin-title-color) !important; }
.rt-custom-26 :deep(.rt-skills) { display: flex; flex-wrap: wrap; gap: .45em; }
.rt-custom-26 :deep(.rt-skill) { border-radius: 0; box-shadow: 2px 2px 0 var(--skin-skill-border); }
.rt-custom-26 :deep(.rt-list) { padding: 0; list-style: none; }
.rt-custom-26 :deep(.rt-list li) { padding: .35em .6em; border-left: 3px solid var(--skin-top-band-bg); }
</style>
