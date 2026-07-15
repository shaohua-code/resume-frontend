<!-- AI简历风格模板 18：墨蓝与杏色极简线条 -->
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
  <div class="resume-template rt rt-custom-18 w-full bg-white">
    <header v-if="showModule('basic')" data-resume-module="basic" class="minimal-header">
      <div class="minimal-name-block">
        <span class="minimal-accent" aria-hidden="true"></span>
        <div><h1 class="rt-name minimal-name">{{ f.name }}</h1><p v-if="f.targetPosition" class="rt-value minimal-position">{{ f.targetPosition }}</p></div>
      </div>
      <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar minimal-avatar">
      <div v-if="f.basicInfoItems.length" class="minimal-contact-line">
        <div v-for="item in f.basicInfoItems" :key="item.key" class="rt-basic-row minimal-contact"><span class="rt-label">{{ item.label }}</span><span class="rt-value">{{ item.value }}</span></div>
      </div>
    </header>

    <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section minimal-section minimal-summary">
      <h2 class="rt-title minimal-title">简介</h2><div class="minimal-content"><p class="rt-text rt-preserve-text">{{ f.summary }}</p></div>
    </section>

    <main>
      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section minimal-section">
        <h2 class="rt-title minimal-title">经历</h2><div class="minimal-content">
          <article v-for="(item, index) in f.workExperiences" :key="index + (item.company || '')" class="rt-item minimal-item">
            <div class="minimal-item-head"><strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time></div>
            <p v-if="item.position || item.department" class="rt-text minimal-sub">{{ [item.position, item.department].filter(Boolean).join(' · ') }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section minimal-section">
        <h2 class="rt-title minimal-title">项目</h2><div class="minimal-content">
          <article v-for="(item, index) in f.projects" :key="index + (item.name || '')" class="rt-item minimal-item">
            <div class="minimal-item-head"><strong>{{ item.name }}</strong><time>{{ dateRange(item) }}</time></div>
            <p v-if="item.role || item.tech_stack" class="rt-text minimal-sub">{{ [item.role, item.tech_stack].filter(Boolean).join(' / ') }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section minimal-section">
        <h2 class="rt-title minimal-title">教育</h2><div class="minimal-content">
          <article v-for="(edu, index) in f.educations" :key="index + (edu.school || '')" class="rt-item minimal-item">
            <div class="minimal-item-head"><strong>{{ edu.school }}</strong><time>{{ formatEducationDateRange(edu) }}</time></div>
            <p v-if="formatEducationDetail(edu)" class="rt-text minimal-sub">{{ formatEducationDetail(edu) }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section minimal-section">
        <h2 class="rt-title minimal-title">实习</h2><div class="minimal-content">
          <article v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item minimal-item">
            <div class="minimal-item-head"><strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time></div>
            <p v-if="item.position" class="rt-text minimal-sub">{{ item.position }}</p><p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section minimal-section">
        <h2 class="rt-title minimal-title">技能</h2><div class="minimal-content"><div class="rt-skills minimal-skills"><span v-for="skill in f.skills" :key="skill" class="rt-skill">{{ skill }}</span></div></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section minimal-section">
        <h2 class="rt-title minimal-title">荣誉</h2><div class="minimal-content"><ul class="rt-list minimal-honors"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul></div>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-18 { word-break: break-word; }
.minimal-header { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 1em; margin-bottom: var(--section-gap); padding: 1.1em 0 1.25em; border-top: 5px solid var(--skin-top-band-bg); border-bottom: 1px solid var(--skin-header-border); }
.minimal-name-block { display: flex; align-items: stretch; gap: .85em; }
.minimal-accent { width: .8em; background: linear-gradient(180deg, var(--skin-title-color) 0 65%, var(--skin-top-band-bg) 65%); }
.minimal-name { margin: 0; font-weight: 500; letter-spacing: .24em; }
.minimal-position { margin: .2em 0 0; letter-spacing: .12em; }
.minimal-avatar { width: 4.8em; height: 4.8em; border: 1px solid var(--skin-header-border); border-radius: 0; object-fit: cover; }
.minimal-contact-line { grid-column: 1 / -1; display: flex; flex-wrap: wrap; border-top: 1px solid var(--skin-basic-row-border); }
.minimal-contact { display: flex; gap: .45em; min-width: 12em; padding: .45em 1em .45em 0; border: 0; border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; background: transparent; }
.minimal-contact .rt-label { font-weight: 700; }
.minimal-section { display: grid; grid-template-columns: 7.5em minmax(0, 1fr); gap: 1.2em; align-items: start; padding-top: .35em; border-top: 1px solid var(--skin-divider-color); }
.minimal-title { display: block; margin: 0; padding-top: .2em; letter-spacing: .18em; }
.minimal-title::before { display: none; }
.minimal-title::after { display: block; width: 2.4em; height: 4px; margin-top: .55em; background: var(--skin-top-band-bg) !important; }
.minimal-content { min-width: 0; }
.minimal-summary .minimal-content { padding: .65em 0; border-bottom: 1px solid var(--skin-divider-color); }
.minimal-summary p { margin: 0; }
.minimal-item { margin: 0; padding: .65em 0 .75em; border: 0; border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: transparent !important; }
.minimal-item-head { display: grid; grid-template-columns: 1fr auto; gap: 1em; color: var(--font-content-color); }
.minimal-item-head time { white-space: nowrap; font-size: .84em; }
.minimal-sub { margin: .2em 0 .3em; font-weight: 700; }
.minimal-item .rt-desc { margin: 0; }
.minimal-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .45em 1em; }
.minimal-skills .rt-skill { padding: .35em 0; border: 0; border-bottom: 2px solid var(--skin-skill-border); border-radius: 0; background: transparent !important; }
.minimal-skills .rt-skill::before { content: '—'; margin-right: .4em; color: var(--skin-top-band-bg); }
.minimal-honors { margin: 0; padding: 0; list-style: none; }
.minimal-honors li { padding: .42em 0; border-bottom: 1px dotted var(--skin-divider-color); color: var(--font-content-color); }
.minimal-honors li::before { content: '◆'; margin-right: .6em; color: var(--skin-top-band-bg); font-size: .68em; }
</style>
