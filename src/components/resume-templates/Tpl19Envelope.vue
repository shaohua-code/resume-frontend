<!-- AI简历风格模板 19：大胆杂志封面个人品牌 -->
<script setup>
import { computed } from 'vue'
import { useResumeFields } from './shared/useResumeFields.js'
import { formatEducationDateRange, formatEducationDetail } from '@/constants/resumeFieldSchema'

const props = defineProps({ resume: { type: Object, default: () => ({}) }, visibleModules: { type: Array, default: () => [] } })
const f = computed(() => useResumeFields(props.resume))
const visibility = computed(() => Object.fromEntries(props.visibleModules.map((item) => [item.key, item.visible !== false])))
const showModule = (key) => visibility.value[key] !== false
const dateRange = (item) => [item.start_date, item.end_date].filter(Boolean).join(' — ')
</script>

<template>
  <div class="resume-template rt rt-custom-19 w-full bg-white">
    <header v-if="showModule('basic')" data-resume-module="basic" class="brand-cover">
      <div class="brand-cover-main">
        <div class="brand-cover-code" aria-hidden="true">19 / PERSONAL BRAND</div>
        <div class="brand-identity">
          <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar brand-avatar">
          <div>
            <p class="rt-label brand-kicker">CURRICULUM VITAE</p>
            <h1 class="rt-name brand-name">{{ f.name }}</h1>
            <p v-if="f.targetPosition" class="rt-name-sub brand-position">{{ f.targetPosition }}</p>
          </div>
        </div>
        <span class="brand-orbit" aria-hidden="true"></span>
      </div>
      <div class="brand-contact-panel">
        <p class="brand-panel-title rt-label">CONTACT / INFO</p>
        <div v-if="f.basicInfoItems.length" class="brand-contact-list">
          <div v-for="(item, index) in f.basicInfoItems" :key="item.key" class="rt-basic-row brand-contact">
            <b>{{ String(index + 1).padStart(2, '0') }}</b><span class="rt-label">{{ item.label }}</span><span class="rt-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <span class="brand-fold" aria-hidden="true"></span>
    </header>

    <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section brand-manifesto">
      <b aria-hidden="true">ABOUT</b><p class="rt-text rt-preserve-text">{{ f.summary }}</p>
    </section>

    <main class="brand-main">
      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section brand-section brand-featured">
        <h2 class="rt-title brand-vertical-title">项目</h2>
        <div class="brand-section-content brand-project-grid">
          <article v-for="(item, index) in f.projects" :key="index + (item.name || '')" class="rt-item brand-project">
            <span class="brand-project-no">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="brand-item-head"><strong>{{ item.name }}</strong><time>{{ dateRange(item) }}</time></div>
            <p v-if="item.role || item.tech_stack" class="rt-text brand-sub">{{ [item.role, item.tech_stack].filter(Boolean).join(' · ') }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section brand-section">
        <h2 class="rt-title brand-vertical-title">经历</h2>
        <div class="brand-section-content brand-story-list">
          <article v-for="(item, index) in f.workExperiences" :key="index + (item.company || '')" class="rt-item brand-story">
            <aside><span>{{ dateRange(item) }}</span></aside><div><strong>{{ item.company }}</strong><p v-if="item.position || item.department" class="rt-text brand-sub">{{ [item.position, item.department].filter(Boolean).join(' · ') }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p></div>
          </article>
        </div>
      </section>

      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section brand-section">
        <h2 class="rt-title brand-vertical-title">教育</h2>
        <div class="brand-section-content brand-education-list">
          <article v-for="(edu, index) in f.educations" :key="index + (edu.school || '')" class="rt-item brand-education">
            <time>{{ formatEducationDateRange(edu) }}</time><strong>{{ edu.school }}</strong><p v-if="formatEducationDetail(edu)" class="rt-text">{{ formatEducationDetail(edu) }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section brand-section">
        <h2 class="rt-title brand-vertical-title">实习</h2>
        <div class="brand-section-content brand-story-list">
          <article v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item brand-story">
            <aside><span>{{ dateRange(item) }}</span></aside><div><strong>{{ item.company }}</strong><p v-if="item.position" class="rt-text brand-sub">{{ item.position }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p></div>
          </article>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section brand-section">
        <h2 class="rt-title brand-vertical-title">能力</h2>
        <div class="brand-section-content"><div class="rt-skills brand-skills"><span v-for="(skill, index) in f.skills" :key="skill" class="rt-skill"><i>{{ index + 1 }}</i>{{ skill }}</span></div></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section brand-section">
        <h2 class="rt-title brand-vertical-title">荣誉</h2>
        <div class="brand-section-content"><ul class="rt-list brand-honors"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul></div>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-19 { word-break: break-word; }
.brand-cover { position: relative; display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(15em, .85fr); margin-bottom: var(--section-gap); border: 1px solid var(--skin-header-border); }
.brand-cover-main { position: relative; min-height: 15em; padding: 1.4em 1.6em; background: var(--skin-header-bg); }
.brand-cover-code { color: var(--skin-title-color); font-size: .72em; font-weight: 900; letter-spacing: .2em; }
.brand-identity { position: relative; z-index: 1; display: flex; align-items: flex-end; gap: 1.25em; min-height: 11em; }
.brand-avatar { width: 7em; height: 9em; border: 4px solid var(--skin-item-bg); border-radius: 0; box-shadow: 7px 7px 0 var(--skin-top-band-bg); object-fit: cover; }
.brand-kicker { margin: 0 0 .4em; font-size: .75em; font-weight: 900; letter-spacing: .22em; }
.brand-name { margin: 0; font-size: 3.25em !important; line-height: 1.05 !important; letter-spacing: .08em; }
.brand-position { margin: .45em 0 0; font-size: 1.08em; letter-spacing: .16em; }
.brand-orbit { position: absolute; right: 1.4em; bottom: 1.2em; width: 6em; height: 6em; border: 1.1em solid var(--skin-skill-border); border-radius: 50%; opacity: .38; pointer-events: none; }
.brand-contact-panel { padding: 1.4em 1.2em; background: var(--skin-title-color); }
.brand-panel-title { margin: 0 0 1em; padding-bottom: .7em; border-bottom: 1px solid var(--skin-skill-border); font-size: .74em; font-weight: 900; letter-spacing: .2em; }
.brand-contact-list { display: grid; gap: .55em; }
.brand-contact { display: grid; grid-template-columns: 1.8em 4.2em 1fr; gap: .45em; min-width: 0; padding: .55em 0; border: 0; border-bottom: 1px solid var(--skin-skill-border); border-radius: 0; background: transparent !important; }
.brand-contact b { color: var(--skin-top-band-bg); font-size: .72em; }
.brand-contact .rt-label { font-weight: 800; }
.brand-fold { position: absolute; right: 0; bottom: 0; width: 0; height: 0; border-width: 0 0 3.8em 3.8em; border-style: solid; border-color: transparent transparent var(--skin-top-band-bg) transparent; pointer-events: none; }
.brand-manifesto { display: grid; grid-template-columns: 6em 1fr; gap: 1em; padding: 1em 1.2em; background: var(--skin-top-band-bg); }
.brand-manifesto b { padding-right: 1em; border-right: 1px solid var(--skin-header-border); color: var(--skin-title-color); letter-spacing: .15em; }
.brand-manifesto p { margin: 0; }
.brand-section { display: grid; grid-template-columns: 3.2em minmax(0, 1fr); gap: 1em; }
.brand-vertical-title { display: block; margin: 0; padding: .65em .45em; background: var(--skin-title-color); color: var(--font-basic-content-color) !important; text-align: center; writing-mode: vertical-rl; letter-spacing: .3em; }
.brand-vertical-title::before, .brand-vertical-title::after { display: none; }
.brand-section-content { min-width: 0; }
.brand-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8em; }
.brand-project { position: relative; margin: 0; padding: 1em; border: 1px solid var(--skin-item-border); border-radius: 0 18px 0 18px; background: var(--skin-item-bg); }
.brand-project-no { position: absolute; top: -.45em; right: .8em; display: grid; width: 2.3em; height: 2.3em; place-items: center; border-radius: 50%; background: var(--skin-top-band-bg); color: var(--skin-title-color); font-size: .75em; font-weight: 900; }
.brand-item-head { display: grid; grid-template-columns: 1fr auto; gap: .6em; color: var(--font-content-color); }
.brand-item-head time { white-space: nowrap; font-size: .78em; }
.brand-sub { margin: .24em 0 .3em; font-weight: 700; }
.brand-project .rt-desc { margin: 0; }
.brand-story-list { border-left: 4px solid var(--skin-skill-border); }
.brand-story { display: grid; grid-template-columns: 7.5em 1fr; gap: 1em; margin: 0 0 .7em; padding: .8em 1em; border: 1px solid var(--skin-item-border); border-left: 0; border-radius: 0 12px 12px 0; background: var(--skin-item-bg); }
.brand-story aside { color: var(--skin-title-color); font-size: .82em; font-weight: 800; }
.brand-story strong { color: var(--font-content-color); }
.brand-story .rt-desc { margin: 0; }
.brand-education-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7em; }
.brand-education { margin: 0; padding: .9em; border: 1px solid var(--skin-item-border); border-top: 6px solid var(--skin-top-band-bg); border-radius: 0; background: var(--skin-item-bg); }
.brand-education time, .brand-education strong { display: block; color: var(--font-content-color); }
.brand-education time { font-size: .8em; }
.brand-education p { margin: .25em 0 0; }
.brand-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55em; }
.brand-skills .rt-skill { display: grid; grid-template-columns: 1.7em 1fr; align-items: center; gap: .45em; padding: .55em; border: 1px solid var(--skin-skill-border); border-radius: 0 10px 0 10px; background: var(--skin-skill-bg); }
.brand-skills .rt-skill i { display: grid; width: 1.7em; height: 1.7em; place-items: center; border-radius: 50%; background: var(--skin-top-band-bg); color: var(--skin-title-color); font-style: normal; font-size: .75em; }
.brand-honors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55em; padding: 0; list-style: none; }
.brand-honors li { padding: .65em .8em; border-left: 6px solid var(--skin-skill-border); background: var(--skin-basic-row-bg); color: var(--font-content-color); }
</style>
