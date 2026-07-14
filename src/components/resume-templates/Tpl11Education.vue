<!-- AI简历风格模板 11 - 现代学院刊物 -->
<script setup>
import { computed } from 'vue'
import { useResumeFields } from './shared/useResumeFields.js'
import { formatEducationDateRange, formatEducationDetail } from '@/constants/resumeFieldSchema'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))

const moduleVisibleMap = computed(() => props.visibleModules.reduce((map, item) => {
  map[item.key] = item.visible !== false
  return map
}, {}))

function showModule(key) {
  return moduleVisibleMap.value[key] !== false
}

function dateRange(item) {
  return [item.start_date, item.end_date].filter(Boolean).join(' — ')
}
</script>

<template>
  <div class="resume-template rt-custom-11 w-full bg-white">
    <header
      v-if="showModule('basic')"
      data-resume-module="basic"
      class="academy-hero"
    >
      <div class="academy-decor academy-decor-one" aria-hidden="true"></div>
      <div class="academy-decor academy-decor-two" aria-hidden="true"></div>

      <div class="academy-identity">
        <div class="academy-mark" aria-hidden="true">
          <span>{{ (f.name || '简').slice(0, 1) }}</span>
        </div>
        <div class="academy-heading">
          <p class="academy-kicker">CURRICULUM VITAE · 个人履历</p>
          <h1 class="rt-name academy-name">{{ f.name }}</h1>
          <p v-if="f.targetPosition" class="rt-value academy-target">{{ f.targetPosition }}</p>
        </div>
      </div>

      <div v-if="f.avatar" class="academy-avatar-frame">
        <img :src="f.avatar" alt="头像" class="rt-avatar academy-avatar">
      </div>

      <div v-if="f.basicInfoItems.length" class="academy-contact-grid">
        <div
          v-for="item in f.basicInfoItems"
          :key="item.key"
          class="rt-basic-row academy-contact"
        >
          <span class="rt-label academy-contact-label">{{ item.label }}</span>
          <span class="rt-value academy-contact-value">{{ item.value }}</span>
        </div>
      </div>
    </header>

    <main class="academy-body">
      <section
        v-if="showModule('basic') && f.summary"
        data-resume-module="basic"
        class="rt-section academy-section academy-summary"
      >
        <div class="academy-summary-label">
          <span class="academy-summary-no">00</span>
          <h2 class="rt-title">个人简介</h2>
        </div>
        <p class="rt-text rt-preserve-text academy-summary-text">{{ f.summary }}</p>
      </section>

      <section
        v-if="showModule('educations') && f.educations.length"
        data-resume-module="educations"
        class="rt-section academy-section"
      >
        <div class="academy-title-row">
          <span class="academy-section-no" aria-hidden="true">01</span>
          <h2 class="rt-title academy-title"><span>教育背景</span><small>EDUCATION</small></h2>
        </div>
        <div class="academy-timeline">
          <article
            v-for="(edu, index) in f.educations"
            :key="index + (edu.school || '')"
            class="rt-item academy-item"
          >
            <span class="academy-dot" aria-hidden="true"></span>
            <div class="academy-item-meta">
              <strong>{{ edu.school }}</strong>
              <time v-if="formatEducationDateRange(edu)">{{ formatEducationDateRange(edu) }}</time>
            </div>
            <p v-if="formatEducationDetail(edu)" class="rt-text academy-item-sub">{{ formatEducationDetail(edu) }}</p>
            <p v-if="edu.main_course" class="rt-desc rt-preserve-text academy-desc">主修课程：{{ edu.main_course }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="showModule('work_experience') && f.workExperiences.length"
        data-resume-module="work_experience"
        class="rt-section academy-section"
      >
        <div class="academy-title-row">
          <span class="academy-section-no" aria-hidden="true">02</span>
          <h2 class="rt-title academy-title"><span>工作经历</span><small>EXPERIENCE</small></h2>
        </div>
        <div class="academy-timeline">
          <article
            v-for="(item, index) in f.workExperiences"
            :key="index + (item.company || '')"
            class="rt-item academy-item"
          >
            <span class="academy-dot" aria-hidden="true"></span>
            <div class="academy-item-meta">
              <strong>{{ item.company }}</strong>
              <time v-if="dateRange(item)">{{ dateRange(item) }}</time>
            </div>
            <p v-if="item.position || item.department" class="rt-text academy-item-sub">
              {{ item.position }}<template v-if="item.department"> · {{ item.department }}</template>
            </p>
            <p v-if="item.description" class="rt-desc rt-preserve-text academy-desc">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="showModule('internships') && f.internships.length"
        data-resume-module="internships"
        class="rt-section academy-section"
      >
        <div class="academy-title-row">
          <span class="academy-section-no" aria-hidden="true">03</span>
          <h2 class="rt-title academy-title"><span>实习经历</span><small>INTERNSHIP</small></h2>
        </div>
        <div class="academy-timeline">
          <article
            v-for="(item, index) in f.internships"
            :key="index + (item.company || '')"
            class="rt-item academy-item"
          >
            <span class="academy-dot" aria-hidden="true"></span>
            <div class="academy-item-meta">
              <strong>{{ item.company }}</strong>
              <time v-if="dateRange(item)">{{ dateRange(item) }}</time>
            </div>
            <p v-if="item.position" class="rt-text academy-item-sub">{{ item.position }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text academy-desc">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="showModule('projects') && f.projects.length"
        data-resume-module="projects"
        class="rt-section academy-section"
      >
        <div class="academy-title-row">
          <span class="academy-section-no" aria-hidden="true">04</span>
          <h2 class="rt-title academy-title"><span>项目经历</span><small>PROJECTS</small></h2>
        </div>
        <div class="academy-project-grid">
          <article
            v-for="(item, index) in f.projects"
            :key="index + (item.name || '')"
            class="rt-item academy-project"
          >
            <div class="academy-project-accent" aria-hidden="true"></div>
            <div class="academy-item-meta">
              <strong>{{ item.name }}</strong>
              <time v-if="dateRange(item)">{{ dateRange(item) }}</time>
            </div>
            <p v-if="item.role || item.tech_stack" class="rt-text academy-item-sub">
              {{ item.role }}<template v-if="item.tech_stack"> · {{ item.tech_stack }}</template>
            </p>
            <p v-if="item.description" class="rt-desc rt-preserve-text academy-desc">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="showModule('skills') && f.skills.length"
        data-resume-module="skills"
        class="rt-section academy-section"
      >
        <div class="academy-title-row">
          <span class="academy-section-no" aria-hidden="true">05</span>
          <h2 class="rt-title academy-title"><span>专业技能</span><small>SKILLS</small></h2>
        </div>
        <div class="rt-skills academy-skills">
          <span v-for="(skill, index) in f.skills" :key="skill" class="rt-skill academy-skill">
            <b aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</b>{{ skill }}
          </span>
        </div>
      </section>

      <section
        v-if="showModule('awards') && f.honorList.length"
        data-resume-module="awards"
        class="rt-section academy-section academy-awards-section"
      >
        <div class="academy-title-row">
          <span class="academy-section-no" aria-hidden="true">06</span>
          <h2 class="rt-title academy-title"><span>荣誉证书</span><small>HONORS</small></h2>
        </div>
        <ul class="rt-list academy-awards">
          <li v-for="item in f.honorList" :key="item" class="rt-preserve-text">
            <span aria-hidden="true">✦</span>{{ item }}
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>

<style scoped>
.rt-custom-11 {
  color: var(--font-content-color, #25344a);
  word-break: break-word;
}

.academy-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px 26px;
  padding: 32px 34px 24px;
  color: #fff;
  background:
    linear-gradient(118deg, var(--skin-header-bg, #183153) 0 72%, var(--skin-top-band-bg, #e0a43a) 72% 100%);
  border-bottom: 6px solid var(--skin-header-border, #e9c46a);
}

.academy-decor {
  position: absolute;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.22);
  transform: rotate(45deg);
}

.academy-decor-one {
  top: -42px;
  right: 168px;
  width: 116px;
  height: 116px;
}

.academy-decor-two {
  bottom: 24px;
  right: 210px;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.08);
}

.academy-identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 18px;
}

.academy-mark {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 64px;
  height: 64px;
  border: 2px solid rgba(255, 255, 255, 0.72);
  transform: rotate(45deg);
}

.academy-mark span {
  color: #fff;
  font-size: 1.55em;
  font-weight: 800;
  transform: rotate(-45deg);
}

.academy-heading {
  min-width: 0;
}

.academy-kicker {
  margin: 0 0 4px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72em;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.academy-name {
  margin: 0;
  color: var(--font-name-color, #fff);
  font-weight: 800;
  letter-spacing: 0.12em;
}

.academy-target {
  margin: 4px 0 0;
  color: var(--font-basic-content-color, #f8fafc);
  font-size: 1.05em;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.academy-avatar-frame {
  position: relative;
  z-index: 1;
  width: 104px;
  height: 128px;
  padding: 5px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 10px 10px 0 rgba(15, 23, 42, 0.18);
}

.academy-avatar {
  width: 100%;
  height: 100%;
  border-radius: 0;
  object-fit: cover;
}

.academy-contact-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.24);
}

.academy-contact {
  display: flex;
  align-items: baseline;
  min-width: 0;
  gap: 7px;
  padding: 5px 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.07);
}

.academy-contact-label {
  flex: 0 0 auto;
  color: var(--font-label-color, #e9c46a);
  font-size: 0.82em;
  font-weight: 700;
}

.academy-contact-value {
  min-width: 0;
  color: var(--font-basic-content-color, #fff);
  overflow-wrap: anywhere;
}

.academy-body {
  padding: 24px 34px 30px;
  background:
    linear-gradient(90deg, transparent 0 22px, color-mix(in srgb, var(--skin-divider-color, #d9e1ea) 38%, transparent) 22px 23px, transparent 23px),
    #fff;
}

.academy-section {
  margin-bottom: var(--section-gap, 18px);
}

.academy-summary {
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr);
  gap: 18px;
  padding: 16px 18px;
  border-left: 5px solid var(--skin-top-band-bg, #e0a43a);
  background: var(--skin-item-bg, #f3f6fa);
  box-shadow: inset 0 0 0 1px var(--skin-item-border, #dce4ec);
}

.academy-summary-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.academy-summary-no {
  color: var(--skin-top-band-bg, #e0a43a);
  font-size: 1.6em;
  font-weight: 900;
  line-height: 1;
}

.academy-summary .rt-title {
  margin: 0;
  color: var(--skin-title-color, #183153);
  font-size: 1.05em;
  white-space: nowrap;
}

.academy-summary-text {
  margin: 0;
  color: var(--font-content-color, #25344a);
  text-align: justify;
}

.academy-title-row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: end;
  gap: 12px;
  margin-bottom: 12px;
}

.academy-section-no {
  color: var(--skin-top-band-bg, #e0a43a);
  font-size: 1.85em;
  font-weight: 900;
  line-height: 0.9;
}

.academy-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  padding: 0 0 6px;
  border-bottom: 2px solid var(--skin-divider-color, #ccd7e2);
  color: var(--skin-title-color, #183153);
  font-size: 1.22em;
  font-weight: 800;
}

.academy-title::before,
.academy-title::after {
  display: none;
}

.academy-title small {
  color: var(--font-content-color, #718096);
  font-size: 0.48em;
  font-weight: 700;
  letter-spacing: 0.16em;
  opacity: 0.58;
}

.academy-timeline {
  position: relative;
  margin-left: 25px;
  padding-left: 38px;
}

.academy-timeline::before {
  content: '';
  position: absolute;
  top: 5px;
  bottom: 5px;
  left: 7px;
  width: 2px;
  background: var(--skin-divider-color, #ccd7e2);
  pointer-events: none;
}

.academy-item {
  position: relative;
  margin-bottom: 13px;
  padding: 11px 14px;
  border: 1px solid var(--skin-item-border, #dce4ec);
  border-left: 3px solid var(--skin-title-color, #183153);
  background: var(--skin-item-bg, #fbfcfe);
}

.academy-dot {
  position: absolute;
  top: 16px;
  left: -38px;
  width: 15px;
  height: 15px;
  border: 4px solid #fff;
  border-radius: 50%;
  background: var(--skin-top-band-bg, #e0a43a);
  box-shadow: 0 0 0 2px var(--skin-top-band-bg, #e0a43a);
  pointer-events: none;
}

.academy-item-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 3px;
}

.academy-item-meta strong {
  color: var(--skin-title-color, #183153);
  font-size: 1.03em;
  font-weight: 800;
}

.academy-item-meta time {
  flex: 0 0 auto;
  color: var(--font-content-color, #5f6f82);
  font-size: 0.84em;
  font-weight: 700;
}

.academy-item-sub {
  margin: 0 0 5px;
  color: var(--font-content-color, #46566a);
  font-weight: 700;
}

.academy-desc {
  margin: 0;
  color: var(--font-content-color, #25344a);
  text-align: justify;
}

.academy-project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-left: 64px;
}

.academy-project {
  position: relative;
  min-width: 0;
  padding: 14px 15px 13px;
  border: 1px solid var(--skin-item-border, #dce4ec);
  background: var(--skin-item-bg, #fbfcfe);
}

.academy-project-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 4px;
  background: var(--skin-top-band-bg, #e0a43a);
  pointer-events: none;
}

.academy-project .academy-item-meta {
  display: block;
}

.academy-project .academy-item-meta time {
  display: block;
  margin-top: 3px;
}

.academy-skills {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-left: 64px;
}

.academy-skill {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 9px;
  margin: 0;
  padding: 8px 10px;
  border: 1px solid var(--skin-skill-border, #cbd8e5);
  border-radius: 0;
  background: var(--skin-skill-bg, #eef3f8);
  color: var(--font-content-color, #25344a);
  overflow-wrap: anywhere;
}

.academy-skill b {
  flex: 0 0 auto;
  color: var(--skin-top-band-bg, #d79728);
  font-size: 0.75em;
  font-weight: 900;
}

.academy-awards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 14px;
  margin: 0 0 0 64px;
  padding: 0;
  list-style: none;
}

.academy-awards li {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px dashed var(--skin-divider-color, #ccd7e2);
  color: var(--font-content-color, #25344a);
}

.academy-awards li span {
  color: var(--skin-top-band-bg, #d79728);
  pointer-events: none;
}
</style>
