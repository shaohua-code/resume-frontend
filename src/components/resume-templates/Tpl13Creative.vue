<!-- AI简历风格模板 13：紫罗兰、珊瑚与松石几何作品集 -->
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
  <div class="resume-template rt rt-custom-13 w-full bg-white">
    <div class="creative-geometry" aria-hidden="true"><span class="geo-circle"></span><span class="geo-square"></span><span class="geo-pill"></span></div>

    <header v-if="showModule('basic')" data-resume-module="basic" class="creative-header">
      <div class="creative-portrait">
        <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar creative-avatar">
        <span v-else class="creative-monogram rt-name">{{ f.name.slice(0, 1) }}</span>
      </div>
      <div class="creative-identity">
        <p class="rt-label creative-kicker">IDEAS · STORIES · IMPACT</p>
        <h1 class="rt-name creative-name">{{ f.name }}</h1>
        <p v-if="f.targetPosition" class="rt-value creative-position">{{ f.targetPosition }}</p>
      </div>
      <div v-if="f.basicInfoItems.length" class="creative-contacts">
        <div v-for="item in f.basicInfoItems" :key="item.key" class="rt-basic-row creative-contact">
          <span class="rt-label">{{ item.label }}</span><span class="rt-value">{{ item.value }}</span>
        </div>
      </div>
    </header>

    <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section creative-intro">
      <span class="creative-intro-mark" aria-hidden="true">“</span>
      <div><h2 class="rt-title">创意自述</h2><p class="rt-text rt-preserve-text">{{ f.summary }}</p></div>
    </section>

    <main class="creative-main">
      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section creative-section creative-projects">
        <h2 class="rt-title creative-title"><span>精选项目</span><small>SELECTED WORK</small></h2>
        <div class="creative-project-grid">
          <article v-for="(item, index) in f.projects" :key="index + (item.name || '')" class="rt-item creative-project-card">
            <div class="creative-card-no">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="creative-card-body">
              <div class="creative-card-meta"><strong>{{ item.name }}</strong><time>{{ dateRange(item) }}</time></div>
              <p v-if="item.role || item.tech_stack" class="rt-text creative-sub">{{ [item.role, item.tech_stack].filter(Boolean).join(' · ') }}</p>
              <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section creative-section">
        <h2 class="rt-title creative-title"><span>职业经历</span><small>EXPERIENCE</small></h2>
        <article v-for="(item, index) in f.workExperiences" :key="index + (item.company || '')" class="rt-item creative-story">
          <aside><span>{{ String(index + 1).padStart(2, '0') }}</span><time>{{ dateRange(item) }}</time></aside>
          <div><strong>{{ item.company }}</strong><p v-if="item.position || item.department" class="rt-text creative-sub">{{ [item.position, item.department].filter(Boolean).join(' · ') }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p></div>
        </article>
      </section>

      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section creative-section">
        <h2 class="rt-title creative-title"><span>教育背景</span><small>EDUCATION</small></h2>
        <div class="creative-education-grid">
          <article v-for="(edu, index) in f.educations" :key="index + (edu.school || '')" class="rt-item creative-education">
            <time>{{ formatEducationDateRange(edu) }}</time><strong>{{ edu.school }}</strong><p v-if="formatEducationDetail(edu)" class="rt-text">{{ formatEducationDetail(edu) }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section creative-section">
        <h2 class="rt-title creative-title"><span>实习经历</span><small>INTERNSHIP</small></h2>
        <article v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item creative-story">
          <aside><span>IN</span><time>{{ dateRange(item) }}</time></aside>
          <div><strong>{{ item.company }}</strong><p v-if="item.position" class="rt-text creative-sub">{{ item.position }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p></div>
        </article>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section creative-section">
        <h2 class="rt-title creative-title"><span>能力工具箱</span><small>TOOLKIT</small></h2>
        <div class="rt-skills creative-skills"><span v-for="(skill, index) in f.skills" :key="skill" class="rt-skill"><b>{{ String(index + 1).padStart(2, '0') }}</b>{{ skill }}</span></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section creative-section">
        <h2 class="rt-title creative-title"><span>荣誉与认证</span><small>HONORS</small></h2>
        <ul class="rt-list creative-honors"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-13 { position: relative; word-break: break-word; }
.creative-geometry { position: absolute; z-index: 0; inset: 0 0 auto 0; height: 14em; pointer-events: none; }
.creative-geometry span { position: absolute; display: block; opacity: .2; }
.geo-circle { top: .8em; right: 1em; width: 7em; height: 7em; border-radius: 50%; background: var(--skin-top-band-bg); }
.geo-square { top: 5.6em; right: 6em; width: 4.4em; height: 4.4em; border: .7em solid var(--skin-skill-border); transform: rotate(18deg); }
.geo-pill { top: 1.4em; right: 8.3em; width: 6em; height: 1.2em; border-radius: 999px; background: var(--skin-header-border); transform: rotate(-12deg); }
.creative-header { position: relative; z-index: 1; display: grid; grid-template-columns: auto 1fr minmax(16em, 1fr); align-items: center; gap: 1.15em; margin-bottom: var(--section-gap); padding: 1.4em; border: 1px solid var(--skin-header-border); border-radius: 22px 22px 22px 4px; background: var(--skin-header-bg); box-shadow: 8px 8px 0 var(--skin-basic-row-bg); }
.creative-portrait { display: grid; width: 6em; height: 6em; place-items: center; }
.creative-avatar, .creative-monogram { width: 6em; height: 6em; border: 3px solid var(--skin-skill-border); border-radius: 50% 50% 8px 50%; box-shadow: 5px 5px 0 var(--skin-top-band-bg); object-fit: cover; }
.creative-monogram { display: grid; place-items: center; background: var(--skin-item-bg); }
.creative-identity { padding-right: 1em; border-right: 3px solid var(--skin-top-band-bg); }
.creative-kicker { margin: 0 0 .25em; font-size: .7em; font-weight: 800; letter-spacing: .15em; }
.creative-name { margin: 0; letter-spacing: .08em; }
.creative-position { display: inline-block; margin: .35em 0 0; padding: .24em .7em; border-radius: 999px; background: var(--skin-skill-bg); }
.creative-contacts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5em; }
.creative-contact { display: grid; gap: .12em; min-width: 0; padding: .5em .65em; border: 1px solid var(--skin-basic-row-border); border-radius: 9px 9px 9px 2px; background: var(--skin-basic-row-bg); }
.creative-contact .rt-label { font-size: .8em; font-weight: 800; }
.creative-intro { display: grid; grid-template-columns: 4.4em 1fr; gap: 1em; padding: 1em 1.1em; border-radius: 16px 16px 4px 16px; background: var(--skin-skill-bg); }
.creative-intro-mark { color: var(--skin-header-border); font-size: 4.6em; line-height: .8; }
.creative-intro .rt-title, .creative-intro p { margin: 0; }
.creative-title { display: grid; grid-template-columns: auto auto 1fr; gap: .65em; margin: 0 0 .8em; letter-spacing: .08em; }
.creative-title::before { width: 1.05em; height: 1.05em; border: .3em solid var(--skin-top-band-bg); border-radius: 50% 50% 3px 50%; background: var(--skin-header-border) !important; }
.creative-title small { align-self: center; color: var(--font-content-color); font-size: .56em; letter-spacing: .15em; opacity: .68; }
.creative-title::after { height: .55em; border-radius: 999px; background: linear-gradient(90deg, var(--skin-header-border) 0 38%, var(--skin-skill-border) 38% 68%, var(--skin-title-color) 68%) !important; opacity: .72; }
.creative-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8em; }
.creative-project-card { display: grid; grid-template-columns: 2.6em 1fr; gap: .7em; margin: 0; padding: .9em; border: 1px solid var(--skin-item-border); border-radius: 14px 14px 14px 3px; background: var(--skin-item-bg); box-shadow: 4px 4px 0 var(--skin-basic-row-bg); }
.creative-card-no { display: grid; width: 2.3em; height: 2.3em; place-items: center; border-radius: 50% 50% 4px 50%; background: var(--skin-top-band-bg); color: var(--font-content-color); font-size: .78em; font-weight: 800; }
.creative-card-meta { display: grid; grid-template-columns: 1fr auto; gap: .6em; color: var(--font-content-color); }
.creative-card-meta time { white-space: nowrap; font-size: .82em; }
.creative-sub { margin: .22em 0 .3em; font-weight: 700; }
.creative-project-card .rt-desc { margin: 0; }
.creative-story { display: grid; grid-template-columns: 7em 1fr; gap: 1em; margin-bottom: .8em; padding: .9em 1em; border: 1px solid var(--skin-item-border); border-radius: 3px 14px 14px 14px; background: var(--skin-item-bg); }
.creative-story aside { display: flex; flex-direction: column; gap: .35em; padding-right: .8em; border-right: 3px solid var(--skin-skill-border); color: var(--font-content-color); }
.creative-story aside span { color: var(--skin-title-color); font-weight: 900; }
.creative-story aside time { font-size: .8em; }
.creative-story strong { color: var(--font-content-color); }
.creative-story .rt-desc { margin: 0; }
.creative-education-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75em; }
.creative-education { margin: 0; padding: .9em; border: 1px solid var(--skin-item-border); border-top: 5px solid var(--skin-header-border); border-radius: 4px 4px 12px 12px; background: var(--skin-item-bg); }
.creative-education time { display: block; color: var(--font-content-color); font-size: .82em; }
.creative-education strong { display: block; margin: .2em 0; color: var(--font-content-color); }
.creative-education p { margin: 0; }
.creative-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .65em; }
.creative-skills .rt-skill { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .55em; padding: .6em .7em; border: 1px solid var(--skin-skill-border); border-radius: 12px 12px 12px 2px; background: var(--skin-skill-bg); }
.creative-skills .rt-skill b { color: var(--skin-header-border); font-size: .76em; }
.creative-skills .rt-skill:nth-child(3n+2) { background: var(--skin-basic-row-bg); border-color: var(--skin-header-border); }
.creative-skills .rt-skill:nth-child(3n+3) { background: var(--skin-item-bg); border-color: var(--skin-top-band-bg); }
.creative-honors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6em; padding: 0; list-style: none; }
.creative-honors li { padding: .65em .8em; border: 1px solid var(--skin-item-border); border-left: 5px solid var(--skin-header-border); border-radius: 8px; background: var(--skin-item-bg); color: var(--font-content-color); }
.creative-honors li:nth-child(even) { border-left-color: var(--skin-skill-border); }
</style>
