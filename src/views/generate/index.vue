<!-- 统一生成页：两种辅助识别方式共享下方唯一表单。 -->
<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { clampTemplateId } from '@/constants/templateRegistry'
import { useResumeStore } from '@/stores/resume'
import FormPanel from './components/FormPanel.vue'

const route = useRoute()
const resumeStore = useResumeStore()

onMounted(() => {
  // 从模板中心进入时继续使用用户已选模板。
  if (route.query.template_id) {
    resumeStore.currentTemplateId = clampTemplateId(Number(route.query.template_id))
  }
})
</script>

<template>
  <div class="generate-page min-h-[calc(100vh-64px)] animate-fade-in pb-16">
    <!-- 首屏以内容任务为主轴，流程说明收为一条导引线，不用三张卡片重复争夺注意力。 -->
    <header class="generate-hero">
      <div class="generate-hero__inner">
        <div class="generate-hero__copy">
          <p class="generate-hero__eyebrow"><span aria-hidden="true" />AI 简历创作</p>
          <h1>把真实经历，<span>写成一份好简历</span></h1>
          <p class="generate-hero__subtitle">先填写基本信息，再补充经历。AI 帮你整理表达，生成后由你逐项核对。</p>
        </div>
        <!-- 数字仅说明操作顺序，不冒充实际生成进度。 -->
        <ol class="generate-workflow" aria-label="简历生成流程">
          <li><span>01</span><div><strong>填写资料</strong><small>姓名与岗位必填</small></div></li>
          <li><span>02</span><div><strong>AI 整理</strong><small>将经历组织成简历</small></div></li>
          <li><span>03</span><div><strong>核对完善</strong><small>确认内容再保存</small></div></li>
        </ol>
      </div>
    </header>
    <!-- 工作区与标题同宽，紧接流程导引开始填写。 -->
    <div class="generate-page__content relative z-10 mx-auto max-w-[1328px] px-4 sm:px-6">
      <FormPanel />
    </div>
  </div>
</template>

<style scoped>
/* 页面采用纸面式轻背景，把输入内容与状态作为视觉中心。 */
.generate-page {
  background:
    radial-gradient(ellipse at 86% -12%, color-mix(in srgb, var(--color-brand-lighter) 40%, transparent), transparent 34rem),
    var(--color-cream);
}

.generate-hero { border-bottom: 1px solid color-mix(in srgb, var(--color-brand) 9%, var(--color-line)); background: color-mix(in srgb, var(--color-surface) 86%, var(--color-cream)); }
.generate-page__content { padding-top: 22px; }
.generate-hero__inner {
  width: min(100%, 1328px);
  margin-inline: auto;
  padding: 32px 24px 27px;
}

.generate-hero__copy { max-width: 820px; min-width: 0; }

.generate-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: var(--color-brand-dark);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .12em;
}

.generate-hero__eyebrow span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-brand);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-brand) 11%, transparent);
}

.generate-hero h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(34px, 3.7vw, 48px);
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: -.045em;
  text-wrap: balance;
}
/* 第二个短语在极窄屏整体换行，避免单字悬在行尾。 */
.generate-hero h1 span { display: inline-block; color: var(--color-brand-dark); white-space: nowrap; }

.generate-hero__subtitle {
  margin: 12px 0 0;
  color: var(--color-ink-secondary);
  font-size: 15px;
  line-height: 1.7;
  text-wrap: pretty;
}

/* 流程是阅读导引，细线与数字代替大量边框和填充块。 */
.generate-workflow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin: 26px 0 0;
  padding: 0;
  border-top: 1px solid var(--color-line);
  list-style: none;
}

.generate-workflow li {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 0 0;
}

.generate-workflow li > span {
  flex: 0 0 auto;
  color: var(--color-brand-dark);
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.generate-workflow li > div { display: grid; min-width: 0; gap: 2px; }
.generate-workflow strong { color: var(--color-ink); font-size: 13px; line-height: 1.4; }
.generate-workflow small { color: var(--color-ink-secondary); font-size: 11px; line-height: 1.4; }

@media (max-width: 640px) {
  .generate-page__content { padding-top: 14px; }
  .generate-hero__inner { padding: 25px 16px 19px; }
  .generate-hero h1 span { display: block; }
  .generate-hero h1 {
    font-size: clamp(28px, 7.2vw, 34px);
    letter-spacing: -.04em;
  }
  .generate-hero__subtitle { margin-top: 9px; font-size: 13px; line-height: 1.6; }
  .generate-workflow { gap: 10px; margin-top: 18px; }
  .generate-workflow li { display: grid; gap: 4px; padding-top: 11px; }
  .generate-workflow li > span { font-size: 10px; }
  .generate-workflow strong { font-size: 11px; white-space: nowrap; }
  .generate-workflow small { display: none; }
}
</style>
