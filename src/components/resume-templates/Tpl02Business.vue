<!-- AI简历风格模板 2：钴蓝与陶土红瑞士商务 -->
<script setup>
import { computed } from 'vue'
import { useResumeFields } from './shared/useResumeFields.js'
import { formatEducationDateRange, formatEducationDetail } from '@/constants/resumeFieldSchema'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))
const visibility = computed(() => Object.fromEntries(props.visibleModules.map((item) => [item.key, item.visible !== false])))
const showModule = (key) => visibility.value[key] !== false
const dateRange = (item) => [item.start_date, item.end_date].filter(Boolean).join(' ~ ')
</script>

<template>
  <div class="resume-template rt rt-custom-02 w-full bg-white">
    <div class="business-index" aria-hidden="true"><span>CV / PROFILE</span><i></i></div>

    <header v-if="showModule('basic')" data-resume-module="basic" class="business-header">
      <div class="business-identity">
        <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar business-avatar">
        <div>
          <p class="business-kicker rt-label">PROFESSIONAL RESUME</p>
          <h1 class="rt-name business-name">{{ f.name }}</h1>
          <p v-if="f.targetPosition" class="rt-value business-position">{{ f.targetPosition }}</p>
        </div>
      </div>
      <div v-if="f.basicInfoItems.length" class="business-contact-grid">
        <div v-for="item in f.basicInfoItems" :key="item.key" class="rt-basic-row business-contact">
          <span class="rt-label">{{ item.label }}</span>
          <span class="rt-value">{{ item.value }}</span>
        </div>
      </div>
    </header>

    <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section business-summary">
      <div class="business-summary-label rt-title">职业概览</div>
      <p class="rt-text rt-preserve-text">{{ f.summary }}</p>
    </section>

    <main class="business-main">
      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section business-section">
        <h2 class="rt-title business-title"><span>教育背景</span><small>EDUCATION</small></h2>
        <article v-for="(edu, index) in f.educations" :key="index + (edu.school || '')" class="rt-item business-item">
          <div class="business-item-meta">
            <strong>{{ edu.school }}</strong>
            <time v-if="formatEducationDateRange(edu)">{{ formatEducationDateRange(edu) }}</time>
          </div>
          <p v-if="formatEducationDetail(edu)" class="rt-text business-sub">{{ formatEducationDetail(edu) }}</p>
        </article>
      </section>

      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section business-section">
        <h2 class="rt-title business-title"><span>工作经历</span><small>EXPERIENCE</small></h2>
        <article v-for="(exp, index) in f.workExperiences" :key="index + (exp.company || '')" class="rt-item business-item">
          <div class="business-item-meta"><strong>{{ exp.company }}</strong><time>{{ dateRange(exp) }}</time></div>
          <p v-if="exp.position || exp.department" class="rt-text business-sub">{{ [exp.position, exp.department].filter(Boolean).join(' · ') }}</p>
          <p v-if="exp.description" class="rt-desc rt-preserve-text">{{ exp.description }}</p>
        </article>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section business-section">
        <h2 class="rt-title business-title"><span>项目经历</span><small>PROJECTS</small></h2>
        <article v-for="(project, index) in f.projects" :key="index + (project.name || '')" class="rt-item business-item">
          <div class="business-item-meta"><strong>{{ project.name }}</strong><time>{{ dateRange(project) }}</time></div>
          <p v-if="project.role || project.tech_stack" class="rt-text business-sub">{{ [project.role, project.tech_stack].filter(Boolean).join(' | ') }}</p>
          <p v-if="project.description" class="rt-desc rt-preserve-text">{{ project.description }}</p>
        </article>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section business-section">
        <h2 class="rt-title business-title"><span>实习经历</span><small>INTERNSHIP</small></h2>
        <article v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item business-item">
          <div class="business-item-meta"><strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time></div>
          <p v-if="item.position" class="rt-text business-sub">{{ item.position }}</p>
          <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
        </article>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section business-section">
        <h2 class="rt-title business-title"><span>技能特长</span><small>SKILLS</small></h2>
        <div class="rt-skills business-skills"><span v-for="skill in f.skills" :key="skill" class="rt-skill">{{ skill }}</span></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section business-section">
        <h2 class="rt-title business-title"><span>荣誉证书</span><small>HONORS</small></h2>
        <ul class="rt-list business-honors"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-02 { word-break: break-word; }
.business-index { display: flex; align-items: center; gap: .8em; height: 1.55em; color: var(--skin-title-color); pointer-events: none; }
.business-index span { font-size: .72em; font-weight: 800; letter-spacing: .18em; }
.business-index i { height: 2px; flex: 1; background: linear-gradient(90deg, var(--skin-title-color) 0 82%, var(--skin-top-band-bg) 82%); }
.business-header { display: grid; grid-template-columns: 1fr; gap: 0; margin-bottom: var(--section-gap); border: 0; border-bottom: 6px solid var(--skin-top-band-bg); background: var(--skin-header-bg); box-shadow: 0 8px 22px rgba(15, 23, 42, .08); }
.business-identity { display: flex; align-items: center; gap: 1.15em; padding: 1.45em 1.6em 1.15em; border: 0; }
.business-avatar { width: 5.4em; height: 6.3em; flex: 0 0 auto; border: 3px solid var(--skin-item-bg); border-radius: 10px 10px 10px 2px; box-shadow: 5px 5px 0 var(--skin-top-band-bg); object-fit: cover; }
.business-kicker { margin: 0 0 .25em; font-size: .72em; letter-spacing: .16em; }
.business-name { margin: 0; letter-spacing: .14em; }
.business-position { margin: .35em 0 0; letter-spacing: .1em; }
.business-contact-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5em; padding: .9em 1.6em 1.1em; border-top: 1px solid var(--skin-header-border); }
.business-contact { display: grid; grid-template-columns: 4.2em 1fr; gap: .5em; min-width: 0; padding: .52em .65em; border: 1px solid var(--skin-basic-row-border); border-radius: 8px 8px 8px 2px; background: var(--skin-basic-row-bg); }
.business-contact .rt-label { font-weight: 800; }
.business-summary { display: grid; grid-template-columns: 8em 1fr; gap: 1em; padding: .95em 1.05em; border: 1px solid var(--skin-item-border); border-left: 6px solid var(--skin-top-band-bg); border-radius: 0 12px 12px 0; background: var(--skin-item-bg); }
.business-summary-label { margin: 0; border-right: 1px solid var(--skin-skill-border); }
.business-summary p { margin: 0; }
.business-title { display: grid; grid-template-columns: auto auto 1fr; gap: .65em; margin: 0 0 .75em; letter-spacing: .1em; }
.business-title::before { content: ''; width: .8em; height: .8em; border: 3px solid var(--skin-top-band-bg); border-radius: 50%; background: var(--skin-skill-bg) !important; }
.business-title small { align-self: center; color: var(--font-content-color); font-size: .55em; font-weight: 600; letter-spacing: .16em; opacity: .65; }
.business-title::after { height: 2px; background: linear-gradient(90deg, var(--skin-title-color) 0 86%, var(--skin-top-band-bg) 86%) !important; }
.business-item { position: relative; margin: 0 0 .75em .45em; padding: .3em .3em .8em 1.15em; border: 0; border-left: 2px solid var(--skin-skill-border); border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.business-item::before { content: ''; position: absolute; top: .55em; left: -.38em; width: .68em; height: .68em; border: 2px solid var(--skin-item-bg); border-radius: 50%; background: var(--skin-top-band-bg); box-shadow: 0 0 0 1px var(--skin-skill-border); }
.business-item-meta { display: grid; grid-template-columns: 1fr auto; gap: 1em; margin-bottom: .22em; color: var(--font-content-color); }
.business-item-meta time { white-space: nowrap; font-size: .88em; }
.business-sub { margin: 0 0 .3em; font-weight: 700; }
.business-item .rt-desc { margin: 0; }
.business-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5em; }
.business-skills .rt-skill { padding: .5em .65em; border: 1px solid var(--skin-skill-border); border-radius: 999px; background: var(--skin-skill-bg); text-align: center; }
.business-honors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5em 1.2em; padding: 0; list-style: none; }
.business-honors li { padding-left: 1em; border-left: 3px solid var(--skin-top-band-bg); color: var(--font-content-color); }
</style>
