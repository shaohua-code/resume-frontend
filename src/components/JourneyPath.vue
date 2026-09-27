<script setup>
import { useRouter } from 'vue-router'

// 统一呈现简历准备到岗位跟进的真实产品路径，页面通过 current 标出用户当前位置。
const props = defineProps({
  current: { type: String, default: 'create' },
})

const router = useRouter()
const steps = [
  { key: 'discover', number: '01', label: '明确方向', detail: '选目标岗位', path: '/user?tab=career-goals' },
  { key: 'create', number: '02', label: '准备简历', detail: '整理与表达经历', path: '/generate' },
  { key: 'match', number: '03', label: '看懂岗位', detail: '对照要求与优势', path: '/user?tab=saved-jobs' },
  { key: 'follow', number: '04', label: '持续跟进', detail: '更新下一步计划', path: '/user?tab=saved-jobs' },
]

// 让阶段节点直达已有页面，登录拦截由路由守卫保留原始目标地址。
function openStep(step) {
  void router.push(step.path)
}
</script>

<template>
  <nav class="journey-path" aria-label="求职准备流程">
    <button
      v-for="(step, index) in steps"
      :key="step.key"
      type="button"
      class="journey-step"
      :class="{ 'journey-step--current': props.current === step.key }"
      :aria-current="props.current === step.key ? 'step' : undefined"
      @click="openStep(step)"
    >
      <span class="journey-step-number">{{ step.number }}</span>
      <span class="journey-step-copy">
        <strong>{{ step.label }}</strong>
        <small>{{ step.detail }}</small>
      </span>
      <span v-if="index < steps.length - 1" class="journey-step-arrow" aria-hidden="true">→</span>
    </button>
  </nav>
</template>

<style scoped>
/* 跨页路径收敛成轻量步骤条，当前步骤醒目但不与页面主操作争视觉层级。 */
.journey-path {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: min(1120px, calc(100% - 32px));
  margin: 16px auto;
  padding: 6px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: 0 1px 3px rgb(var(--color-ink-rgb) / .04);
}

.journey-step {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 56px;
  align-items: center;
  gap: 10px;
  padding: 8px 13px;
  border: 0;
  border-radius: calc(var(--radius-button) + 2px);
  background: transparent;
  color: var(--color-ink-secondary);
  text-align: left;
  cursor: pointer;
}

.journey-step--current {
  background: var(--color-brand-lighter);
  color: var(--color-brand-dark);
}

.journey-step-number {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
}

.journey-step--current .journey-step-number {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: white;
}

.journey-step-copy { display: grid; min-width: 0; gap: 3px; }
.journey-step-copy strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.journey-step-copy small { overflow: hidden; color: var(--color-ink-secondary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.journey-step-arrow { margin-left: auto; color: var(--color-line); }
.journey-step:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

@media (max-width: 640px) {
  .journey-path { width: calc(100% - 24px); margin: 12px auto; padding: 5px; }
  .journey-step { min-height: 58px; justify-content: center; padding: 6px 3px; }
  .journey-step-number { width: 29px; height: 29px; font-size: 10px; }
  .journey-step-copy { gap: 1px; }
  .journey-step-copy strong { font-size: 11px; }
  .journey-step-copy small, .journey-step-arrow { display: none; }
}
</style>
