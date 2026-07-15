<!-- AI简历风格模板 20：石墨、香槟金与钢蓝高管版 -->
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
  <div class="resume-template rt rt-custom-20 w-full bg-white">
    <header v-if="showModule('basic')" data-resume-module="basic" class="executive-header">
      <div class="executive-overline"><span>EXECUTIVE PROFILE</span><i></i></div>
      <div class="executive-hero">
        <div class="executive-identity"><h1 class="rt-name executive-name">{{ f.name }}</h1><p v-if="f.targetPosition" class="rt-value executive-position">{{ f.targetPosition }}</p></div>
        <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar executive-avatar">
        <div v-if="f.basicInfoItems.length" class="executive-contact-grid">
          <div v-for="item in f.basicInfoItems" :key="item.key" class="rt-basic-row executive-contact"><span class="rt-label">{{ item.label }}</span><span class="rt-value">{{ item.value }}</span></div>
        </div>
      </div>
    </header>

    <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section executive-summary">
      <h2 class="rt-title">管理概述</h2><p class="rt-text rt-preserve-text">{{ f.summary }}</p>
    </section>

    <main class="executive-main">
      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section executive-section">
        <div class="executive-section-label"><span>01</span><h2 class="rt-title">工作经历</h2><small>LEADERSHIP</small></div>
        <div class="executive-section-body">
          <article v-for="(item, index) in f.workExperiences" :key="index + (item.company || '')" class="rt-item executive-item">
            <div class="executive-item-head"><strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time></div>
            <p v-if="item.position || item.department" class="rt-text executive-sub">{{ [item.position, item.department].filter(Boolean).join(' · ') }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section executive-section">
        <div class="executive-section-label"><span>02</span><h2 class="rt-title">项目经历</h2><small>IMPACT</small></div>
        <div class="executive-section-body">
          <article v-for="(item, index) in f.projects" :key="index + (item.name || '')" class="rt-item executive-item executive-project">
            <div class="executive-item-head"><strong>{{ item.name }}</strong><time>{{ dateRange(item) }}</time></div>
            <p v-if="item.role || item.tech_stack" class="rt-text executive-sub">{{ [item.role, item.tech_stack].filter(Boolean).join(' | ') }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section executive-section">
        <div class="executive-section-label"><span>03</span><h2 class="rt-title">教育背景</h2><small>EDUCATION</small></div>
        <div class="executive-section-body executive-education-grid">
          <article v-for="(edu, index) in f.educations" :key="index + (edu.school || '')" class="rt-item executive-education">
            <strong>{{ edu.school }}</strong><time>{{ formatEducationDateRange(edu) }}</time><p v-if="formatEducationDetail(edu)" class="rt-text">{{ formatEducationDetail(edu) }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section executive-section">
        <div class="executive-section-label"><span>04</span><h2 class="rt-title">实习经历</h2><small>EARLY CAREER</small></div>
        <div class="executive-section-body">
          <article v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item executive-item">
            <div class="executive-item-head"><strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time></div><p v-if="item.position" class="rt-text executive-sub">{{ item.position }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section executive-section">
        <div class="executive-section-label"><span>05</span><h2 class="rt-title">核心能力</h2><small>CAPABILITIES</small></div>
        <div class="executive-section-body"><div class="rt-skills executive-skills"><span v-for="skill in f.skills" :key="skill" class="rt-skill">{{ skill }}</span></div></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section executive-section">
        <div class="executive-section-label"><span>06</span><h2 class="rt-title">荣誉认证</h2><small>CREDENTIALS</small></div>
        <div class="executive-section-body"><ul class="rt-list executive-honors"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul></div>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-20 { word-break: break-word; }
.executive-header { margin-bottom: var(--section-gap); padding: 1.1em 1.25em 1.3em; border-top: 6px solid var(--skin-top-band-bg); border-bottom: 1px solid var(--skin-header-border); background: var(--skin-header-bg); }
.executive-overline { display: flex; align-items: center; gap: .8em; margin-bottom: 1em; color: var(--skin-title-color); font-size: .7em; font-weight: 800; letter-spacing: .22em; }
.executive-overline i { height: 1px; flex: 1; background: linear-gradient(90deg, var(--skin-title-color), var(--skin-top-band-bg)); }
.executive-hero { display: grid; grid-template-columns: 1fr auto minmax(18em, .9fr); align-items: center; gap: 1.3em; }
.executive-identity { padding-right: 1.2em; border-right: 1px solid var(--skin-divider-color); }
.executive-name { margin: 0; font-weight: 400; letter-spacing: .22em; }
.executive-position { margin: .35em 0 0; letter-spacing: .14em; }
.executive-avatar { width: 5.2em; height: 5.2em; border: 2px solid var(--skin-top-band-bg); border-radius: 50%; object-fit: cover; }
.executive-contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45em; }
.executive-contact { display: grid; gap: .1em; min-width: 0; padding: .45em .6em; border: 1px solid var(--skin-basic-row-border); border-radius: 2px; background: var(--skin-basic-row-bg); }
.executive-contact .rt-label { font-size: .8em; font-weight: 700; letter-spacing: .05em; }
.executive-summary { display: grid; grid-template-columns: 9em 1fr; gap: 1.1em; padding: 1em 1.1em; border-left: 5px solid var(--skin-top-band-bg); background: var(--skin-skill-bg); }
.executive-summary .rt-title { margin: 0; padding-right: 1em; border-right: 1px solid var(--skin-skill-border); font-weight: 600; letter-spacing: .12em; }
.executive-summary .rt-title::before, .executive-summary .rt-title::after { display: none; }
.executive-summary p { margin: 0; }
.executive-section { display: grid; grid-template-columns: 9.5em minmax(0, 1fr); gap: 1.2em; align-items: start; padding-top: .35em; border-top: 1px solid var(--skin-divider-color); }
.executive-section-label { padding-top: .35em; }
.executive-section-label > span { display: inline-block; margin-bottom: .5em; padding: .25em .5em; background: var(--skin-top-band-bg); color: var(--skin-title-color); font-size: .7em; font-weight: 900; }
.executive-section-label .rt-title { display: block; margin: 0; font-weight: 600; letter-spacing: .12em; }
.executive-section-label .rt-title::before, .executive-section-label .rt-title::after { display: none; }
.executive-section-label small { display: block; margin-top: .35em; color: var(--font-content-color); font-size: .62em; letter-spacing: .15em; opacity: .65; }
.executive-section-body { min-width: 0; }
.executive-item { margin: 0; padding: .7em 0 .8em; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.executive-item-head { display: grid; grid-template-columns: 1fr auto; gap: 1em; color: var(--font-content-color); }
.executive-item-head time { white-space: nowrap; font-size: .84em; }
.executive-sub { margin: .2em 0 .3em; font-weight: 700; }
.executive-item .rt-desc { margin: 0; }
.executive-project { padding-left: .9em; border-left: 3px solid var(--skin-skill-border); }
.executive-education-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7em; }
.executive-education { display: grid; grid-template-columns: 1fr auto; gap: .25em .7em; margin: 0; padding: .75em; border: 1px solid var(--skin-item-border); border-top: 3px solid var(--skin-top-band-bg); border-radius: 2px; background: var(--skin-item-bg); color: var(--font-content-color); }
.executive-education time { white-space: nowrap; font-size: .8em; }
.executive-education p { grid-column: 1 / -1; margin: 0; }
.executive-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5em; }
.executive-skills .rt-skill { padding: .5em .65em; border: 1px solid var(--skin-skill-border); border-left: 4px solid var(--skin-top-band-bg); border-radius: 2px; background: var(--skin-skill-bg); }
.executive-honors { margin: 0; padding: 0; list-style: none; }
.executive-honors li { padding: .48em 0; border-bottom: 1px dotted var(--skin-divider-color); color: var(--font-content-color); }
.executive-honors li::before { content: '—'; margin-right: .6em; color: var(--skin-top-band-bg); }
</style>
