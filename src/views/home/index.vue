<script setup>
/**
 * 首页 - Hero + 使用流程 + 功能卡 + 模板预览 + 信任背书
 */
import { defineAsyncComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  CloudUploadOutlined,
  EditOutlined,
  FileDoneOutlined,
  ChromeOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons-vue";
import { useUserStore } from "@/stores/user";
import PageHero from "@/components/PageHero.vue";
import GlassCard from "@/components/GlassCard.vue";
import LazyRender from "@/components/LazyRender.vue";
import HeroActions from "./components/HeroActions.vue";
import FeatureGrid from "./components/FeatureGrid.vue";
import { HOME_FEATURES } from "./utils/features";
import { createHomeNavigator } from "./utils/navigate";
import { emitProductEvent } from "@/utils/productEvents";
import { getWorkspaceSummary } from "@/api/workspace";

// 首屏以下的模板注册表与轮播组件在接近视口时再请求。
const TemplatePreview = defineAsyncComponent(() => import("./components/TemplatePreview.vue"));
const TrustOfferWall = defineAsyncComponent(() => import("./components/TrustOfferWall.vue"));

const router = useRouter();
const userStore = useUserStore();
const navTo = createHomeNavigator(router, userStore);
const nextAction = ref(null);

const HOME_FLOW = [
  {
    icon: CloudUploadOutlined,
    title: "识别或直接填写",
    description: "PDF、文字识别与统一表单在同一页完成",
  },
  {
    icon: ThunderboltOutlined,
    title: "AI 生成优化",
    description: "提炼亮点，自动优化专业表达",
  },
  {
    icon: EditOutlined,
    title: "在线编辑排版",
    description: "50 套模板，内容与样式随心调整",
  },
  {
    icon: FileDoneOutlined,
    title: "导出开始投递",
    description: "支持 PDF / Word，一键保存使用",
  },
];

// 首页只展示用户能直接感知的 Agent 结果，避免暴露插件内部技术步骤。
const AGENT_OUTCOMES = [
  { index: "01", title: "识别当前岗位", description: "岗位、公司、薪资与要求自动归位" },
  { index: "02", title: "判断真实匹配", description: "只依据你选中的真实简历给出证据" },
  { index: "03", title: "收藏继续准备", description: "回到我的求职，材料和岗位不再散落" },
];

function handleFeatureClick(item) {
  navTo(item.path);
}

function startPrimaryAction() {
  const isLoggedIn = userStore.isLoggedIn
  void emitProductEvent('home_primary_cta_clicked', {
    visitor_state: isLoggedIn ? 'logged_in' : 'anonymous',
    cta_id: isLoggedIn && nextAction.value?.type !== 'create_resume' ? 'continue_work' : 'start_resume',
  })
  navTo(isLoggedIn ? (nextAction.value?.path || '/user') : '/generate')
}

onMounted(async () => {
  if (!userStore.isLoggedIn) return
  try {
    const summary = await getWorkspaceSummary()
    nextAction.value = summary?.next_action || null
  } catch {
    // 首页 CTA 保持可用；工作台摘要不可用时回退到用户中心。
  }
})

function openExtension() {
  router.push('/extension');
}

// 收藏入口沿用首页登录拦截，未登录用户先完成账号连接。
function openSavedJobs() {
  navTo('/user?tab=saved-jobs');
}
</script>

<template>
  <div class="home-page animate-fade-in">
    <PageHero
      variant="home"
      eyebrow="AI 简历 · 求职准备工作台"
      title="让每段经历，都为下一份工作加分"
      subtitle="AI 协助提炼表达和对照岗位要求；内容由你确认，进度留在自己的工作台里。"
    >
      <template #actions>
        <HeroActions
          :is-logged-in="userStore.isLoggedIn"
          :action-label="userStore.isLoggedIn ? (nextAction?.label || '继续求职准备') : '免费开始整理简历'"
          @start="startPrimaryAction"
        />
        <button type="button" class="home-secondary-action" @click="router.push('/templates')">
          先浏览适合我的模板 <ArrowRightOutlined />
        </button>
      </template>
      <template #default>
        <!-- 收费与内容确认边界留在首屏内，让用户行动前就能安心了解规则。 -->
        <p class="home-trust-note"><SafetyCertificateOutlined /> AI 建议由你确认 · 使用收费功能前会清楚说明规则</p>
      </template>
      <template #visual>
        <!-- 用简历纸张示意替代空白色块，让首屏直接说明产品成果。 -->
        <div class="resume-hero-art" aria-label="简历样式预览示意">
          <div class="resume-hero-orbit resume-hero-orbit--one"></div>
          <div class="resume-hero-orbit resume-hero-orbit--two"></div>
          <article class="resume-hero-sheet">
            <header class="resume-hero-person">
              <span class="resume-hero-monogram">林</span>
              <div><strong>林知夏</strong><small>产品设计师 · 杭州</small></div>
              <span class="resume-hero-ready"><CheckCircleFilled /> 已整理</span>
            </header>
            <div class="resume-hero-tags"><span>用户研究</span><span>体验策略</span><span>Figma</span></div>
            <section class="resume-hero-section">
              <b>工作经历</b>
              <strong>澄野科技 <i>产品设计师</i></strong>
              <span>梳理核心流程，将新用户关键任务完成率提升 28%</span>
              <span>与产品、研发协作，推动设计规范落地至 3 条业务线</span>
            </section>
            <section class="resume-hero-section resume-hero-section--last">
              <b>项目亮点</b>
              <div class="resume-hero-bars"><i></i><i></i><i></i></div>
            </section>
          </article>
          <div class="resume-hero-note"><span><ThunderboltOutlined /></span><div><b>为目标岗位优化</b><small>重点与表达一目了然</small></div></div>
          <div class="resume-hero-spark" aria-hidden="true">✳</div>
        </div>
      </template>
    </PageHero>

    <section class="feature-section">
      <div class="page-container !py-8 sm:!py-12">
        <div class="mb-5 text-center sm:mb-8">
          <span class="section-kicker">AI TOOLKIT</span>
          <h2 class="section-title">核心功能</h2>
          <p class="mt-2 section-subtitle">
            从生成、优化到导出，把复杂的简历工作变简单
          </p>
        </div>
        <FeatureGrid :features="HOME_FEATURES" @click="handleFeatureClick" />
      </div>
    </section>

    <!-- Browser Agent 作为首页差异化核心场景，展示结果而不是只罗列功能。 -->
    <section class="browser-agent-feature" aria-labelledby="browser-agent-title">
      <div class="page-container browser-agent-container">
        <div class="browser-agent-layout">
          <div class="browser-agent-copy">
            <span class="browser-agent-kicker">
              <ChromeOutlined /> AI 求职副驾
            </span>
            <h2 id="browser-agent-title">看到岗位的这一刻，准备就已经开始</h2>
            <p class="browser-agent-lead">
              无需复制整页 JD。主动打开插件，即可识别当前岗位，用选定简历判断机会与缺口，并保存到“我的求职”。
            </p>

            <div class="browser-agent-outcomes" aria-label="浏览器 Agent 工作结果">
              <article v-for="item in AGENT_OUTCOMES" :key="item.index" class="browser-agent-outcome">
                <span>{{ item.index }}</span>
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </article>
            </div>

            <div class="browser-agent-actions">
              <button type="button" class="browser-agent-primary" @click="openExtension">
                安装浏览器 Agent <ArrowRightOutlined />
              </button>
              <button type="button" class="browser-agent-secondary" @click="openSavedJobs">
                <FolderOpenOutlined /> 查看我的收藏
              </button>
            </div>

            <p class="browser-agent-privacy">
              <SafetyCertificateOutlined />
              只处理你主动触发的岗位与选定简历，不会自动提交申请。
            </p>
          </div>

          <!-- 产品场景预览复用扩展真实三步流程，示例数据仅用于解释结果形态。 -->
          <div class="browser-agent-showcase" aria-label="浏览器 Agent 岗位准备效果预览">
            <div class="agent-browser-bar" aria-hidden="true">
              <span></span><span></span><span></span>
              <div>界面演示 · 示例岗位</div>
            </div>
            <div class="agent-browser-body">
              <div class="agent-job-page" aria-hidden="true">
                <div class="agent-job-eyebrow">当前查看</div>
                <div class="agent-job-heading">
                  <div>
                    <h3>高级产品运营</h3>
                    <p>星云科技 · 杭州</p>
                  </div>
                  <strong>18-25K</strong>
                </div>
                <div class="agent-job-tags">
                  <span>增长策略</span><span>数据分析</span><span>用户运营</span>
                </div>
                <div class="agent-job-lines"><i></i><i></i><i></i><i></i></div>
              </div>

              <aside class="agent-side-panel">
                <div class="agent-panel-brand">
                  <span><ThunderboltOutlined /></span>
                  <div><strong>AI 简历</strong><small>投递副驾 Agent</small></div>
                  <CheckCircleFilled />
                </div>
                <div class="agent-panel-steps" aria-label="准备进度">
                  <div class="is-done"><b>1</b><span>识别岗位</span></div>
                  <div class="is-done"><b>2</b><span>真实经历判断</span></div>
                  <div class="is-done"><b>3</b><span>收藏并准备</span></div>
                </div>
                <div class="agent-result-heading">
                  <div><small>当前岗位</small><strong>高级产品运营</strong></div>
                  <span>匹配 82</span>
                </div>
                <div class="agent-result-list">
                  <p><CheckCircleFilled /> 3 项岗位要求已有经历支持</p>
                  <p><CheckCircleFilled /> 2 项优势可在简历中更清楚呈现</p>
                </div>
                <div class="agent-saved-state">
                  <FolderOpenOutlined /> 已收藏到“我的求职”
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>

    <LazyRender min-height="38rem">
      <TemplatePreview />
    </LazyRender>

    <LazyRender min-height="36rem" root-margin="200px 0px">
      <TrustOfferWall />
    </LazyRender>
    <section
      class="relative w-full px-4 py-8 pt-0 mx-auto max-w-7xl sm:px-6 sm:py-12 sm:pt-0 lg:px-8"
    >
      <div class="mb-5 text-center sm:mb-8">
        <span class="section-kicker">HOW IT WORKS</span>
        <h2 class="section-title">使用流程</h2>
        <p class="mt-2 section-subtitle">清晰四步，从经历素材到可投递简历</p>
      </div>
      <GlassCard class="flow-panel">
        <div class="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <article
            v-for="(step, index) in HOME_FLOW"
            :key="step.title"
            class="flow-card"
          >
            <div class="flow-icon-wrap">
              <component :is="step.icon" />
            </div>
            <div class="flex-1 min-w-0 lg:text-center">
              <div class="flex items-center gap-2 lg:justify-center">
                <span class="flow-number">0{{ index + 1 }}</span>
                <h3 class="text-sm font-semibold text-ink sm:text-base">
                  {{ step.title }}
                </h3>
              </div>
              <p
                class="mt-1 text-xs leading-relaxed text-ink-secondary sm:text-sm"
              >
                {{ step.description }}
              </p>
            </div>
          </article>
        </div>
      </GlassCard>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  background: var(--color-cream);
}

/* 首页用完成态简历做视觉主角，说明产品结果与使用边界。 */
.home-trust-note {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 18px 0 0;
  color: rgb(255 255 255 / .68);
  font-size: 12px;
  line-height: 1.6;
}

.resume-hero-art {
  position: relative;
  display: grid;
  min-height: 340px;
  place-items: center;
  isolation: isolate;
}

.resume-hero-orbit {
  position: absolute;
  z-index: -1;
  border: 1px solid rgb(255 255 255 / .16);
  border-radius: 50%;
}

.resume-hero-orbit--one { width: 330px; height: 330px; }
.resume-hero-orbit--two { width: 410px; height: 410px; border-color: rgb(255 255 255 / .09); }

.resume-hero-sheet {
  position: relative;
  width: min(100%, 350px);
  min-height: 310px;
  padding: 25px 27px;
  transform: rotate(2deg);
  border: 1px solid rgb(255 255 255 / .8);
  border-radius: 14px;
  background: #fffefa;
  box-shadow: 0 28px 70px rgb(15 12 42 / .28);
  color: #26213a;
}

.resume-hero-person { display: flex; align-items: center; gap: 11px; }
.resume-hero-monogram { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 13px; background: #eee9ff; color: #5945c5; font-size: 18px; font-weight: 800; }
.resume-hero-person strong,.resume-hero-person small { display: block; }
.resume-hero-person strong { font-size: 16px; }
.resume-hero-person small { margin-top: 3px; color: #817c90; font-size: 10px; }
.resume-hero-ready { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; padding: 5px 8px; border-radius: 99px; background: #e7f6ed; color: #268752; font-size: 9px; font-weight: 700; }
.resume-hero-tags { display: flex; gap: 6px; margin: 16px 0 17px; }
.resume-hero-tags span { padding: 5px 8px; border-radius: 99px; background: #f2eff8; color: #655c7c; font-size: 9px; }
.resume-hero-section { display: grid; gap: 7px; margin-top: 13px; }
.resume-hero-section > b { padding-bottom: 6px; border-bottom: 1px solid #eae7ef; color: #5847a9; font-size: 10px; }
.resume-hero-section > strong { font-size: 10px; }
.resume-hero-section > strong i { margin-left: 6px; color: #817c90; font-size: 9px; font-style: normal; font-weight: 500; }
.resume-hero-section > span { color: #777286; font-size: 8px; line-height: 1.5; }
.resume-hero-section--last { margin-top: 16px; }
.resume-hero-bars { display: grid; gap: 5px; }
.resume-hero-bars i { width: 100%; height: 4px; border-radius: 5px; background: #ebe8f0; }
.resume-hero-bars i:nth-child(2) { width: 88%; }
.resume-hero-bars i:nth-child(3) { width: 63%; }

.resume-hero-note {
  position: absolute;
  right: -8px;
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 15px 12px 12px;
  border: 1px solid rgb(255 255 255 / .76);
  border-radius: 14px;
  background: rgb(255 255 255 / .96);
  box-shadow: 0 12px 34px rgb(15 12 42 / .2);
  color: #28243a;
}

.resume-hero-note > span { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 10px; background: #faeddf; color: #b56836; }
.resume-hero-note b,.resume-hero-note small { display: block; }
.resume-hero-note b { font-size: 10px; }
.resume-hero-note small { margin-top: 3px; color: #807b8d; font-size: 9px; }
.resume-hero-spark { position: absolute; top: 18px; right: 16px; color: #f3c075; font-size: 28px; }

.home-secondary-action {
  min-height: 42px;
  padding: 8px 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-button);
  background: var(--color-surface);
  color: var(--color-ink-secondary);
  font-size: 14px;
  font-weight: 700;
  transition: border-color .2s ease, color .2s ease, background .2s ease;
}

.home-secondary-action:hover { border-color: var(--color-brand-light); color: var(--color-brand-dark); }
.home-secondary-action:focus-visible { outline: 3px solid var(--color-focus-ring); outline-offset: 2px; }

.section-kicker {
  @apply mb-2 inline-block text-[10px] font-bold tracking-[0.22em] text-brand-dark sm:text-xs;
}

.flow-panel {
  @apply relative overflow-hidden;
}

.flow-panel::before {
  content: "";
  @apply pointer-events-none absolute inset-x-0 top-0 h-1;
  background: var(--gradient-primary);
}

.flow-card {
  @apply relative flex items-center gap-3 rounded-card border border-line/50 bg-surface/60 p-3.5 sm:p-4 lg:flex-col lg:items-center lg:px-3 lg:py-5;
}

.flow-icon-wrap {
  @apply flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-lighter text-lg text-brand-dark shadow-sm sm:h-12 sm:w-12 sm:text-xl;
}

.flow-number {
  @apply text-[10px] font-bold tracking-wider text-brand-dark/70;
}

.feature-section {
  @apply border-y border-line/40 bg-surface/35;
}

/* Browser Agent 使用主题令牌构建真实产品场景，五套系统主题下均保持信息层级。 */
.browser-agent-feature {
  @apply border-y border-line/60;
  background: color-mix(in srgb, var(--color-surface-soft) 78%, var(--color-canvas));
}

.browser-agent-container {
  @apply py-10 sm:py-14 lg:py-16;
}

.browser-agent-layout {
  @apply grid min-w-0 items-center gap-9 lg:grid-cols-[minmax(0,0.82fr)_minmax(34rem,1.18fr)] lg:gap-12;
}

.browser-agent-copy {
  @apply min-w-0;
}

.browser-agent-kicker {
  @apply inline-flex items-center gap-2 text-xs font-bold text-brand-dark;
  letter-spacing: 0;
}

.browser-agent-kicker :deep(svg) {
  @apply text-base;
}

.browser-agent-copy h2 {
  @apply mt-4 max-w-xl text-[28px] font-bold leading-tight text-ink sm:text-4xl;
  letter-spacing: 0;
}

.browser-agent-lead {
  @apply mt-4 max-w-xl text-sm leading-7 text-ink-secondary sm:text-base;
}

.browser-agent-outcomes {
  @apply mt-7 grid gap-0 border-y border-line/70;
}

.browser-agent-outcome {
  @apply grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-b border-line/60 py-3.5 last:border-b-0;
}

.browser-agent-outcome > span {
  @apply pt-0.5 text-xs font-bold text-brand-dark;
}

.browser-agent-outcome h3 {
  @apply text-sm font-semibold text-ink;
}

.browser-agent-outcome p {
  @apply mt-1 text-xs leading-5 text-ink-secondary sm:text-sm;
}

.browser-agent-actions {
  @apply mt-7 flex flex-col gap-3 sm:flex-row;
}

.browser-agent-primary,
.browser-agent-secondary {
  @apply inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-bold transition;
  border-radius: 8px;
}

.browser-agent-primary {
  @apply border border-brand bg-brand text-white shadow-soft hover:bg-brand-dark;
}

.browser-agent-secondary {
  @apply border border-line bg-surface text-ink hover:border-brand/40 hover:text-brand-dark;
}

.browser-agent-privacy {
  @apply mt-4 flex items-start gap-2 text-xs leading-5 text-muted;
}

.browser-agent-privacy :deep(svg) {
  @apply mt-0.5 shrink-0 text-brand-dark;
}

.browser-agent-showcase {
  @apply min-w-0 overflow-hidden border border-line bg-surface shadow-float;
  border-radius: 8px;
}

.agent-browser-bar {
  @apply grid h-11 grid-cols-[auto_auto_auto_minmax(0,1fr)] items-center gap-2 border-b border-line/70 px-4;
  background: var(--color-surface-soft);
}

.agent-browser-bar > span {
  @apply block h-2 w-2 rounded-full bg-line;
}

.agent-browser-bar > span:nth-child(2) {
  background: color-mix(in srgb, var(--color-warning) 55%, var(--color-line));
}

.agent-browser-bar > span:nth-child(3) {
  background: color-mix(in srgb, var(--color-success) 55%, var(--color-line));
}

.agent-browser-bar > div {
  @apply ml-2 truncate border border-line/70 bg-surface px-3 py-1.5 text-[11px] text-muted;
  border-radius: 6px;
}

.agent-browser-body {
  @apply grid min-h-[410px] grid-cols-[minmax(0,1fr)_minmax(17rem,0.78fr)];
}

.agent-job-page {
  @apply min-w-0 border-r border-line/70 p-7;
  background: color-mix(in srgb, var(--color-canvas) 88%, var(--color-surface));
}

.agent-job-eyebrow {
  @apply text-[10px] font-bold text-brand-dark;
  letter-spacing: 0;
}

.agent-job-heading {
  @apply mt-5 flex items-start justify-between gap-4;
}

.agent-job-heading h3 {
  @apply text-xl font-bold text-ink;
}

.agent-job-heading p {
  @apply mt-1 text-xs text-ink-secondary;
}

.agent-job-heading strong {
  @apply shrink-0 text-base text-warning;
}

.agent-job-tags {
  @apply mt-5 flex flex-wrap gap-2;
}

.agent-job-tags span {
  @apply bg-surface px-2 py-1 text-[11px] text-ink-secondary;
  border-radius: 5px;
}

.agent-job-lines {
  @apply mt-7 grid gap-3;
}

.agent-job-lines i {
  @apply block h-2 bg-line/70;
  border-radius: 2px;
}

.agent-job-lines i:nth-child(2) { width: 88%; }
.agent-job-lines i:nth-child(3) { width: 94%; }
.agent-job-lines i:nth-child(4) { width: 72%; }

.agent-side-panel {
  @apply min-w-0 bg-surface p-4;
}

.agent-panel-brand {
  @apply grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-line/70 pb-3;
}

.agent-panel-brand > span {
  @apply grid h-9 w-9 place-items-center bg-brand text-white;
  border-radius: 7px;
}

.agent-panel-brand strong,
.agent-panel-brand small {
  @apply block;
}

.agent-panel-brand strong {
  @apply text-sm text-ink;
}

.agent-panel-brand small {
  @apply mt-0.5 text-[10px] text-muted;
}

.agent-panel-brand > :deep(svg:last-child) {
  @apply text-base text-success;
}

.agent-panel-steps {
  @apply grid grid-cols-3 gap-1 border-b border-line/70 py-4;
}

.agent-panel-steps > div {
  @apply grid justify-items-center gap-1 text-center text-[9px] leading-3 text-muted;
}

.agent-panel-steps b {
  @apply grid h-5 w-5 place-items-center border border-line bg-surface text-[9px] text-muted;
  border-radius: 50%;
}

.agent-panel-steps .is-done {
  @apply text-brand-dark;
}

.agent-panel-steps .is-done b {
  @apply border-brand/40 bg-brand-lighter text-brand-dark;
}

.agent-result-heading {
  @apply mt-4 flex items-start justify-between gap-3;
}

.agent-result-heading small,
.agent-result-heading strong {
  @apply block;
}

.agent-result-heading small {
  @apply text-[10px] text-muted;
}

.agent-result-heading strong {
  @apply mt-1 text-sm text-ink;
}

.agent-result-heading > span {
  @apply shrink-0 bg-brand-lighter px-2 py-1 text-xs font-bold text-brand-dark;
  border-radius: 5px;
}

.agent-result-list {
  @apply mt-4 grid gap-2.5 border-y border-line/70 py-3;
}

.agent-result-list p {
  @apply flex items-start gap-2 text-[11px] leading-4 text-ink-secondary;
}

.agent-result-list :deep(svg) {
  @apply mt-0.5 shrink-0 text-success;
}

.agent-saved-state {
  @apply mt-4 flex items-center gap-2 bg-brand-lighter px-3 py-2.5 text-[11px] font-semibold text-brand-dark;
  border-radius: 6px;
}

@media (max-width: 639px) {
  .resume-hero-art { min-height: 258px; }
  .resume-hero-orbit--one { width: 230px; height: 230px; }
  .resume-hero-orbit--two { width: 288px; height: 288px; }
  .resume-hero-sheet { width: min(100% - 20px, 320px); min-height: 252px; padding: 17px 19px; }
  .resume-hero-tags { margin: 11px 0; }
  .resume-hero-section { gap: 5px; margin-top: 9px; }
  .resume-hero-section--last { margin-top: 11px; }
  .resume-hero-note { right: -2px; bottom: 2px; }
  .resume-hero-spark { top: 0; right: 10px; }
  .agent-browser-body {
    @apply min-h-0 grid-cols-1;
  }

  .agent-job-page {
    @apply hidden;
  }

  .agent-side-panel {
    @apply p-5;
  }
}

@media (min-width: 1024px) {
  .flow-card:not(:last-child)::after {
    content: "";
    @apply absolute -right-3 top-1/2 z-10 h-px w-5 bg-brand/40;
  }
}
</style>
