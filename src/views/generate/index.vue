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
    <!-- 使用独立标题区，确保页面标题与下方工作台共享完全一致的对齐规则。 -->
    <header class="generate-hero">
      <div class="generate-hero__inner">
        <div class="generate-hero__copy">
          <p class="generate-hero__eyebrow">简历工作室 <span>·</span> AI 辅助整理</p>
          <h1>把真实经历，变成一份好简历</h1>
          <p class="generate-hero__subtitle">填写基础资料，AI 帮你组织表达；生成后由你核对每项内容。</p>
        </div>
        <!-- 仅说明产品流程，不代表任务状态，生成进度仍以结果区为准。 -->
        <ol class="generate-workflow" aria-label="简历生成流程">
          <li><span>01</span><div><strong>补充资料</strong><small>先填姓名与岗位</small></div></li>
          <li><span>02</span><div><strong>AI 整理</strong><small>组织简历表达</small></div></li>
          <li><span>03</span><div><strong>核对并完善</strong><small>确认后再保存</small></div></li>
        </ol>
      </div>
    </header>
    <!-- 标题与工作区使用同一内容宽度，避免宽屏时模块横向摊开。 -->
    <div class="generate-page__content relative z-10 mx-auto mt-3 max-w-[1200px] px-[18px] sm:px-6">
      <FormPanel />
    </div>
  </div>
</template>

<style scoped>
/* 让 ToC 用户先看见操作入口，同时保留标题与内容区一致的对齐线。 */
.generate-page {
  background:
    radial-gradient(ellipse at 9% 0%, color-mix(in srgb, var(--color-brand-lighter) 42%, transparent), transparent 31rem),
    linear-gradient(180deg, color-mix(in srgb, var(--color-cream) 70%, white) 0%, var(--color-cream) 38rem);
}

.generate-hero__inner {
  width: min(100%, 1200px);
  margin-inline: auto;
  padding: 24px 24px 12px;
}

.generate-hero__copy { min-width: 0; }

.generate-hero__eyebrow {
  margin: 0 0 10px;
  color: var(--color-brand-dark);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .16em;
}

.generate-hero__eyebrow span {
  padding-inline: 3px;
  color: var(--color-muted);
}

.generate-hero h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(30px, 3.1vw, 40px);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -.045em;
}

.generate-hero__subtitle {
  max-width: 620px;
  margin: 11px 0 0;
  color: var(--color-ink-secondary);
  font-size: 14px;
  line-height: 1.7;
  text-wrap: pretty;
}

.generate-workflow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.generate-workflow li {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  padding: 11px 10px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 12%, var(--color-line));
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-surface) 76%, var(--color-brand-lighter));
}

.generate-workflow li > span {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  background: var(--color-surface);
  color: var(--color-brand-dark);
  font-size: 10px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.generate-workflow li > div { display: grid; min-width: 0; gap: 3px; }
.generate-workflow strong { overflow: hidden; color: var(--color-ink); font-size: 12px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.generate-workflow small { color: var(--color-ink-secondary); font-size: 10px; line-height: 1.4; white-space: nowrap; }

@media (min-width: 1100px) {
  .generate-hero__inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(400px, 460px); align-items: center; gap: 28px; }
  .generate-workflow { margin-top: 0; }
}

@media (max-width: 640px) {
  .generate-hero__inner {
    padding: 22px 18px 12px;
  }

  .generate-hero h1 {
    font-size: clamp(23px, 6.4vw, 28px);
    letter-spacing: -.04em;
    text-wrap: balance;
  }

  .generate-hero__subtitle {
    max-width: 34rem;
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.65;
  }

  .generate-workflow { gap: 6px; margin-top: 14px; }
  .generate-workflow li { gap: 6px; padding: 9px 7px; border-radius: 12px; }
  .generate-workflow li > span { width: 23px; height: 23px; border-radius: 7px; font-size: 9px; }
  .generate-workflow strong { font-size: 10px; }
  .generate-workflow small { display: none; }
}
</style>
