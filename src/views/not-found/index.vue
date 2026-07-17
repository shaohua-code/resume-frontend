<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 有可返回历史时沿用浏览器导航，否则回到稳定的首页入口。
function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}
</script>

<template>
  <!-- 未知地址使用轻量公共页，确保用户能快速恢复到有效功能入口。 -->
  <section class="not-found-page" aria-labelledby="not-found-title">
    <div class="not-found-glow not-found-glow--left" aria-hidden="true" />
    <div class="not-found-glow not-found-glow--right" aria-hidden="true" />

    <div class="not-found-card">
      <div class="not-found-code" aria-hidden="true">404</div>
      <p class="not-found-kicker">PAGE NOT FOUND</p>
      <h1 id="not-found-title">页面走丢了</h1>
      <p class="not-found-description">
        你访问的页面可能已被移动、删除，或者链接地址有误。
      </p>

      <div class="not-found-actions">
        <button type="button" class="not-found-button not-found-button--primary" @click="router.push('/')">
          返回首页
        </button>
        <button type="button" class="not-found-button not-found-button--secondary" @click="goBack">
          返回上一页
        </button>
      </div>

      <nav class="not-found-links" aria-label="快捷入口">
        <RouterLink to="/templates">浏览简历模板</RouterLink>
        <span aria-hidden="true">·</span>
        <RouterLink to="/generate">开始创建简历</RouterLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
/* 404 页面仅依赖全局主题变量，不引入额外 UI 组件库。 */
.not-found-page {
  position: relative;
  display: grid;
  min-height: calc(100vh - 4rem);
  place-items: center;
  overflow: hidden;
  padding: 3rem 1rem;
}

.not-found-card {
  position: relative;
  z-index: 1;
  width: min(100%, 40rem);
  padding: 3rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 70px rgba(57, 88, 164, 0.15);
  text-align: center;
  backdrop-filter: blur(22px);
}

.not-found-code {
  background: var(--gradient-primary);
  background-clip: text;
  color: transparent;
  font-size: clamp(5.5rem, 20vw, 10rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.82;
}

.not-found-kicker {
  margin-top: 1.75rem;
  color: var(--color-brand-dark);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.22em;
}

h1 {
  margin-top: 0.65rem;
  color: var(--color-ink);
  font-size: clamp(1.75rem, 5vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.not-found-description {
  max-width: 30rem;
  margin: 0.85rem auto 0;
  color: var(--color-ink-secondary);
  font-size: 0.95rem;
  line-height: 1.8;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.not-found-button {
  min-width: 8.5rem;
  min-height: 2.75rem;
  padding: 0 1.25rem;
  border-radius: 0.8rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.not-found-button:hover {
  transform: translateY(-2px);
}

.not-found-button--primary {
  border: 0;
  background: var(--gradient-primary);
  box-shadow: 0 10px 24px rgba(79, 172, 254, 0.26);
  color: white;
}

.not-found-button--secondary {
  border: 1px solid var(--color-line);
  background: rgba(255, 255, 255, 0.75);
  color: var(--color-ink-secondary);
}

.not-found-button--secondary:hover {
  border-color: rgba(79, 172, 254, 0.45);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.1);
}

.not-found-links {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  color: var(--color-muted);
  font-size: 0.82rem;
}

.not-found-links a {
  color: var(--color-brand-dark);
  font-weight: 600;
}

.not-found-links a:hover {
  text-decoration: underline;
}

.not-found-glow {
  position: absolute;
  width: min(65vw, 30rem);
  aspect-ratio: 1;
  border-radius: 999px;
  filter: blur(15px);
  opacity: 0.55;
}

.not-found-glow--left {
  top: 5%;
  left: -12%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.2), transparent 68%);
}

.not-found-glow--right {
  right: -10%;
  bottom: 0;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.18), transparent 68%);
}

@media (max-width: 640px) {
  .not-found-page {
    min-height: calc(100svh - 4rem);
    padding: 1.5rem 1rem;
  }

  .not-found-card {
    padding: 2.5rem 1.25rem;
    border-radius: 1.5rem;
  }

  .not-found-actions {
    flex-direction: column;
  }

  .not-found-button {
    width: 100%;
  }

  .not-found-links {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found-button {
    transition: none;
  }
}
</style>
