<script setup>
/**
 * 页面标题区统一承担标题、说明、行动和统计信息，背景留给页面本身形成呼吸感。
 */
defineProps({
  title: { type: String, default: 'AI简历' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  variant: { type: String, default: 'default' },
  stats: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="page-hero" :class="[`page-hero--${variant}`, { 'page-hero--compact': compact }]">
    <div class="page-hero__inner">
      <div class="page-hero__copy">
        <p v-if="eyebrow" class="page-hero__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="page-hero__subtitle">{{ subtitle }}</p>

        <div v-if="$slots.actions" class="page-hero__actions">
          <slot name="actions" />
        </div>

        <div v-if="stats.length" class="page-hero__stats">
          <div v-for="stat in stats" :key="stat.label" class="page-hero__stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>

        <div v-if="$slots.default" class="page-hero__extra"><slot /></div>
      </div>

      <div v-if="$slots.visual" class="page-hero__visual"><slot name="visual" /></div>
    </div>
  </section>
</template>

<style scoped>
/* 标题区用短文案和可选的真实产品预览形成首屏焦点，普通内容页仍保持轻量。 */
.page-hero {
  position: relative;
  padding: 26px 24px 8px;
  color: var(--color-ink);
}

.page-hero__inner {
  width: min(100%, 1216px);
  margin: 0 auto;
}

.page-hero__copy { min-width: 0; }

.page-hero__eyebrow {
  margin: 0 0 9px;
  color: var(--color-brand-dark);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .14em;
}

.page-hero h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -.035em;
}

.page-hero__subtitle {
  max-width: 680px;
  margin: 9px 0 0;
  color: var(--color-ink-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.page-hero__stats {
  display: grid;
  width: min(100%, 480px);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 22px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}

.page-hero__stat {
  display: grid;
  min-height: 70px;
  align-content: center;
  gap: 4px;
  padding: 10px 14px;
  text-align: left;
}

.page-hero__stat + .page-hero__stat { border-left: 1px solid var(--color-line); }
.page-hero__stat strong { color: var(--color-ink); font-size: 19px; line-height: 1.1; }
.page-hero__stat span { color: var(--color-ink-secondary); font-size: 11px; }
.page-hero__extra { margin-top: 20px; }

.page-hero--home {
  width: min(100% - 48px, 1320px);
  margin: 26px auto 0;
  padding: 50px 56px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-brand-light) 22%, transparent);
  border-radius: 30px;
  background:
    radial-gradient(ellipse at 84% 16%, color-mix(in srgb, var(--color-accent) 45%, transparent), transparent 34%),
    radial-gradient(ellipse at 8% 100%, color-mix(in srgb, var(--color-brand) 44%, transparent), transparent 42%),
    linear-gradient(116deg, color-mix(in srgb, var(--color-ink) 96%, var(--color-brand-dark)) 0%, var(--color-brand-dark) 58%, color-mix(in srgb, var(--color-brand-dark) 72%, var(--color-accent)) 100%);
  box-shadow: 0 26px 65px color-mix(in srgb, var(--color-brand-dark) 22%, transparent);
  color: #fff;
}

.page-hero--home .page-hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(300px, .94fr);
  align-items: center;
  gap: 48px;
}

.page-hero--home h1 {
  max-width: 620px;
  color: #fff;
  font-size: clamp(38px, 4.3vw, 58px);
  line-height: 1.12;
  letter-spacing: -.045em;
}

.page-hero--home .page-hero__eyebrow { color: color-mix(in srgb, var(--color-accent-light) 78%, white); }
.page-hero--home .page-hero__subtitle {
  max-width: 560px;
  margin-top: 18px;
  color: rgb(255 255 255 / .76);
  font-size: 16px;
}

.page-hero--home .page-hero__actions { margin-top: 23px; }
.page-hero--home :deep(.btn-hero-primary) { border-color:#fff; background:#fff; color:var(--color-brand-dark); box-shadow:0 10px 28px rgb(13 10 38 / .2); }
.page-hero--home :deep(.btn-hero-primary:hover) { border-color:#f3e9ff; background:#f3e9ff; color:var(--color-brand-dark); }
.page-hero--home :deep(.btn-hero-primary span),.page-hero--home :deep(.btn-hero-primary svg) { color:var(--color-brand-dark); }
.page-hero--home .page-hero__extra { color: rgb(255 255 255 / .65); }
.page-hero--home .home-trust-note { width: auto; margin: 18px 0 0; color: rgb(255 255 255 / .62); font-size: 12px; text-align: left; }
.page-hero--compact { padding-top: 22px; padding-bottom: 4px; }

.page-hero--compact .page-hero__inner { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
.page-hero--compact h1 { font-size: clamp(28px, 3.2vw, 40px); }

.page-hero__visual { min-width: 0; }

@media (max-width: 640px) {
  /* 小屏保持左对齐和完整按钮文案，标题区不给主任务表单让出过多首屏高度。 */
  .page-hero { padding: 20px 18px 4px; }
  .page-hero--home { width: calc(100% - 24px); margin-top: 12px; padding: 30px 22px 24px; border-radius: 23px; }
  .page-hero--home .page-hero__inner { grid-template-columns: minmax(0, 1fr); gap: 26px; }
  .page-hero--home h1 { font-size: clamp(34px, 9vw, 44px); }
  .page-hero--home .page-hero__subtitle { font-size: 14px; }
  .page-hero__actions { align-items: stretch; gap: 8px; margin-top: 16px; }
  .page-hero__stats { margin-top: 17px; }
  .page-hero__stat { min-height: 62px; padding: 8px; }
  .page-hero--compact { padding-top: 22px; padding-bottom: 5px; }
  .page-hero--compact .page-hero__inner { display: block; }
}

@media (min-width: 641px) and (max-width: 900px) {
  .page-hero--home { padding: 40px 36px; }
  .page-hero--home .page-hero__inner { grid-template-columns: minmax(0, 1fr) minmax(250px, .8fr); gap: 24px; }
  .page-hero--home h1 { font-size: 40px; }
}
</style>
