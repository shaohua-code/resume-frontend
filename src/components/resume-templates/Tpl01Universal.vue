<!-- AI简历风格模板 1：深靛蓝、朱砂橙与薄荷灰编辑杂志 -->
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
  <div class="resume-template rt rt-custom-01 w-full bg-white">
    <div class="editorial-ribbon" aria-hidden="true"><span></span><span></span><span></span></div>
    <header v-if="showModule('basic')" data-resume-module="basic" class="editorial-header">
      <div class="editorial-issue" aria-hidden="true"><b>PROFILE</b><span>01</span><i>CAREER EDITION</i></div>
      <div class="editorial-identity">
        <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar editorial-avatar">
        <div><p class="rt-label editorial-kicker">THE PROFESSIONAL</p><h1 class="rt-name editorial-name">{{ f.name }}</h1><p v-if="f.targetPosition" class="rt-name-sub editorial-position">{{ f.targetPosition }}</p></div>
      </div>
      <div v-if="f.basicInfoItems.length" class="editorial-contacts">
        <div v-for="(item, index) in f.basicInfoItems" :key="item.key" class="rt-basic-row editorial-contact"><b>{{ String(index + 1).padStart(2, '0') }}</b><span class="rt-label">{{ item.label }}</span><span class="rt-value">{{ item.value }}</span></div>
      </div>
    </header>

    <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section editorial-lead">
      <h2 class="rt-title">人物摘要</h2><p class="rt-text rt-preserve-text">{{ f.summary }}</p>
    </section>

    <main class="editorial-main">
      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section editorial-section">
        <h2 class="rt-title editorial-title"><span>工作经历</span><small>CAREER</small></h2>
        <article v-for="(item, index) in f.workExperiences" :key="index + (item.company || '')" class="rt-item editorial-item">
          <div class="editorial-item-index">{{ String(index + 1).padStart(2, '0') }}</div><div class="editorial-item-body"><div class="editorial-item-head"><strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time></div><p v-if="item.position || item.department" class="rt-text editorial-sub">{{ [item.position, item.department].filter(Boolean).join(' · ') }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p></div>
        </article>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section editorial-section">
        <h2 class="rt-title editorial-title"><span>项目经历</span><small>FEATURES</small></h2>
        <div class="editorial-project-grid">
          <article v-for="(item, index) in f.projects" :key="index + (item.name || '')" class="rt-item editorial-project">
            <div class="editorial-project-head"><strong>{{ item.name }}</strong><time>{{ dateRange(item) }}</time></div><p v-if="item.role || item.tech_stack" class="rt-text editorial-sub">{{ [item.role, item.tech_stack].filter(Boolean).join(' | ') }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section editorial-section">
        <h2 class="rt-title editorial-title"><span>教育背景</span><small>EDUCATION</small></h2>
        <div class="editorial-education-grid"><article v-for="(edu, index) in f.educations" :key="index + (edu.school || '')" class="rt-item editorial-education"><time>{{ formatEducationDateRange(edu) }}</time><strong>{{ edu.school }}</strong><p v-if="formatEducationDetail(edu)" class="rt-text">{{ formatEducationDetail(edu) }}</p></article></div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section editorial-section">
        <h2 class="rt-title editorial-title"><span>实习经历</span><small>INTERNSHIP</small></h2>
        <article v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item editorial-item"><div class="editorial-item-index">IN</div><div class="editorial-item-body"><div class="editorial-item-head"><strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time></div><p v-if="item.position" class="rt-text editorial-sub">{{ item.position }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p></div></article>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section editorial-section">
        <h2 class="rt-title editorial-title"><span>技能特长</span><small>KEYWORDS</small></h2><div class="rt-skills editorial-skills"><span v-for="(skill, index) in f.skills" :key="skill" class="rt-skill"><b>{{ String(index + 1).padStart(2, '0') }}</b>{{ skill }}</span></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section editorial-section">
        <h2 class="rt-title editorial-title"><span>荣誉证书</span><small>RECOGNITION</small></h2><ul class="rt-list editorial-honors"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-01 { word-break: break-word; }
.editorial-ribbon { display: grid; grid-template-columns: 2.8fr .7fr 1.1fr; gap: .35em; height: .65em; pointer-events: none; }
.editorial-ribbon span:first-child { background: var(--skin-title-color); }
.editorial-ribbon span:nth-child(2) { background: var(--skin-top-band-bg); }
.editorial-ribbon span:last-child { background: var(--skin-skill-border); }
.editorial-header { display: grid; grid-template-columns: 5.8em minmax(15em, 1fr) minmax(17em, .95fr); align-items: stretch; margin-bottom: var(--section-gap); border: 1px solid var(--skin-header-border); background: var(--skin-header-bg); }
.editorial-issue { display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 1em .5em; background: var(--skin-top-band-bg); color: var(--skin-title-color); text-align: center; }
.editorial-issue b, .editorial-issue i { font-size: .62em; letter-spacing: .14em; writing-mode: vertical-rl; }
.editorial-issue span { font-size: 2.2em; font-weight: 900; }
.editorial-issue i { font-style: normal; }
.editorial-identity { display: flex; align-items: center; gap: 1em; padding: 1.35em; border-right: 1px solid var(--skin-divider-color); }
.editorial-avatar { width: 6.2em; height: 7.4em; border: 3px solid var(--skin-item-bg); border-radius: 0; box-shadow: 6px 6px 0 var(--skin-skill-border); object-fit: cover; }
.editorial-kicker { margin: 0 0 .25em; color: var(--skin-title-color) !important; font-size: .7em; font-weight: 900; letter-spacing: .18em; }
.editorial-name { margin: 0; font-size: 2.55em !important; line-height: 1.1 !important; letter-spacing: .08em; }
.editorial-position { margin: .4em 0 0; letter-spacing: .13em; }
.editorial-contacts { display: grid; align-content: center; padding: 1em; background: var(--skin-title-color); }
.editorial-contact { display: grid; grid-template-columns: 1.8em 4.2em 1fr; gap: .4em; min-width: 0; padding: .5em 0; border: 0; border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; background: transparent; }
.editorial-contact b { color: var(--skin-top-band-bg); font-size: .72em; }
.editorial-contact .rt-label { font-weight: 800; }
.editorial-lead { display: grid; grid-template-columns: 8em 1fr; gap: 1.1em; padding: 1em 1.15em; border-left: 7px solid var(--skin-top-band-bg); background: var(--skin-skill-bg); }
.editorial-lead .rt-title { margin: 0; padding-right: 1em; border-right: 1px solid var(--skin-skill-border); letter-spacing: .12em; }
.editorial-lead .rt-title::before, .editorial-lead .rt-title::after { display: none; }
.editorial-lead p { margin: 0; }
.editorial-title { display: grid; grid-template-columns: auto auto 1fr; gap: .65em; margin: 0 0 .8em; letter-spacing: .1em; }
.editorial-title::before { width: .9em; height: .9em; border: .25em solid var(--skin-top-band-bg); background: var(--skin-title-color) !important; }
.editorial-title small { align-self: center; color: var(--font-content-color); font-size: .56em; letter-spacing: .16em; opacity: .65; }
.editorial-title::after { height: 5px; background: linear-gradient(90deg, var(--skin-title-color) 0 55%, var(--skin-skill-border) 55% 78%, var(--skin-top-band-bg) 78%) !important; }
.editorial-item { display: grid; grid-template-columns: 3.2em 1fr; gap: .8em; margin-bottom: .75em; padding: 0; border: 1px solid var(--skin-item-border); border-radius: 0; background: var(--skin-item-bg); }
.editorial-item-index { display: grid; place-items: center; background: var(--skin-title-color); color: var(--skin-top-band-bg); font-weight: 900; }
.editorial-item-body { padding: .8em .9em .8em 0; }
.editorial-item-head, .editorial-project-head { display: grid; grid-template-columns: 1fr auto; gap: .8em; color: var(--font-content-color); }
.editorial-item-head time, .editorial-project-head time { white-space: nowrap; font-size: .82em; }
.editorial-sub { margin: .22em 0 .3em; font-weight: 700; }
.editorial-item .rt-desc, .editorial-project .rt-desc { margin: 0; }
.editorial-project-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75em; }
.editorial-project { margin: 0; padding: .9em; border: 1px solid var(--skin-item-border); border-top: 6px solid var(--skin-top-band-bg); border-radius: 0 0 12px 0; background: var(--skin-item-bg); }
.editorial-education-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7em; }
.editorial-education { margin: 0; padding: .85em; border: 1px solid var(--skin-item-border); border-left: 6px solid var(--skin-skill-border); border-radius: 0; background: var(--skin-item-bg); color: var(--font-content-color); }
.editorial-education time, .editorial-education strong { display: block; }
.editorial-education time { font-size: .8em; }
.editorial-education p { margin: .25em 0 0; }
.editorial-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5em; }
.editorial-skills .rt-skill { display: grid; grid-template-columns: 1.8em 1fr; gap: .45em; padding: .55em; border: 1px solid var(--skin-skill-border); border-radius: 0 10px 0 10px; background: var(--skin-skill-bg); }
.editorial-skills b { color: var(--skin-top-band-bg); }
.editorial-honors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55em; padding: 0; list-style: none; }
.editorial-honors li { padding: .65em .8em; border-left: 6px solid var(--skin-top-band-bg); background: var(--skin-basic-row-bg); color: var(--font-content-color); }
</style>
