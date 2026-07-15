<!-- AI简历风格模板 6：石板灰与琥珀数据账页 -->
<script setup>
import { computed } from 'vue'
import { useResumeFields } from './shared/useResumeFields.js'
import { formatEducationDateRange, formatEducationDetail } from '@/constants/resumeFieldSchema'

const props = defineProps({ resume: { type: Object, default: () => ({}) }, visibleModules: { type: Array, default: () => [] } })
const f = computed(() => useResumeFields(props.resume))
const visibility = computed(() => Object.fromEntries(props.visibleModules.map((item) => [item.key, item.visible !== false])))
const showModule = (key) => visibility.value[key] !== false
const dateRange = (item) => [item.start_date, item.end_date].filter(Boolean).join(' ~ ')
</script>

<template>
  <div class="resume-template rt rt-custom-06 w-full bg-white">
    <div class="ledger-rule" aria-hidden="true"><b></b><span></span><b></b></div>
    <header v-if="showModule('basic')" data-resume-module="basic" class="ledger-header">
      <div class="ledger-heading">
        <div>
          <p class="rt-label ledger-code">PERSONNEL / PROFILE</p>
          <h1 class="rt-name ledger-name">{{ f.name }}</h1>
          <p v-if="f.targetPosition" class="rt-value ledger-position">{{ f.targetPosition }}</p>
        </div>
        <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar ledger-avatar">
      </div>
      <div v-if="f.basicInfoItems.length" class="ledger-info-table">
        <div v-for="item in f.basicInfoItems" :key="item.key" class="rt-basic-row ledger-info-cell">
          <span class="rt-label">{{ item.label }}</span><span class="rt-value">{{ item.value }}</span>
        </div>
      </div>
    </header>

    <main class="ledger-main">
      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section ledger-section">
        <h2 class="rt-title ledger-title"><span>教育背景</span><small>EDU</small></h2>
        <div class="ledger-table">
          <article v-for="(edu, index) in f.educations" :key="index + (edu.school || '')" class="rt-item ledger-row">
            <strong>{{ edu.school }}</strong><time>{{ formatEducationDateRange(edu) }}</time>
            <p v-if="formatEducationDetail(edu)" class="rt-text ledger-detail">{{ formatEducationDetail(edu) }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section ledger-section">
        <h2 class="rt-title ledger-title"><span>工作经历</span><small>EXP</small></h2>
        <div class="ledger-table">
          <article v-for="(item, index) in f.workExperiences" :key="index + (item.company || '')" class="rt-item ledger-row">
            <strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time>
            <p v-if="item.position || item.department" class="rt-text ledger-detail">{{ [item.position, item.department].filter(Boolean).join(' · ') }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text ledger-description">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section ledger-section">
        <h2 class="rt-title ledger-title"><span>实习经历</span><small>INT</small></h2>
        <div class="ledger-table">
          <article v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item ledger-row">
            <strong>{{ item.company }}</strong><time>{{ dateRange(item) }}</time>
            <p v-if="item.position" class="rt-text ledger-detail">{{ item.position }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text ledger-description">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section ledger-section">
        <h2 class="rt-title ledger-title"><span>项目经历</span><small>PRJ</small></h2>
        <div class="ledger-table">
          <article v-for="(item, index) in f.projects" :key="index + (item.name || '')" class="rt-item ledger-row">
            <strong>{{ item.name }}</strong><time>{{ dateRange(item) }}</time>
            <p v-if="item.role || item.tech_stack" class="rt-text ledger-detail">{{ [item.role, item.tech_stack].filter(Boolean).join(' | ') }}</p>
            <p v-if="item.description" class="rt-desc rt-preserve-text ledger-description">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section ledger-section">
        <h2 class="rt-title ledger-title"><span>技能特长</span><small>SKL</small></h2>
        <div class="rt-skills ledger-skills"><span v-for="skill in f.skills" :key="skill" class="rt-skill">{{ skill }}</span></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section ledger-section">
        <h2 class="rt-title ledger-title"><span>荣誉证书</span><small>HON</small></h2>
        <ul class="rt-list ledger-honors"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul>
      </section>

      <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section ledger-section ledger-summary">
        <h2 class="rt-title ledger-title"><span>自我评价</span><small>SUM</small></h2>
        <p class="rt-text rt-preserve-text">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
.rt-custom-06 { word-break: break-word; }
.ledger-rule { display: grid; grid-template-columns: 1.4em 1fr 3.8em; gap: .35em; height: .5em; pointer-events: none; }
.ledger-rule b { background: var(--skin-top-band-bg); }
.ledger-rule span { background: var(--skin-header-border); }
.ledger-header { margin-bottom: var(--section-gap); padding: 1.2em 0 1.35em; border-bottom: 2px solid var(--skin-header-border); background: var(--skin-header-bg); }
.ledger-heading { display: flex; align-items: center; justify-content: space-between; gap: 1.5em; margin-bottom: .9em; padding: .9em 1em; border: 1px solid var(--skin-header-border); border-left: 5px solid var(--skin-top-band-bg); }
.ledger-code { margin: 0 0 .2em; font-size: .72em; font-weight: 800; letter-spacing: .16em; }
.ledger-name { margin: 0; letter-spacing: .18em; }
.ledger-position { margin: .2em 0 0; letter-spacing: .08em; }
.ledger-avatar { width: 5.2em; height: 5.2em; border: 1px solid var(--skin-header-border); border-radius: 2px; object-fit: cover; }
.ledger-info-table { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--skin-basic-row-border); border-left: 1px solid var(--skin-basic-row-border); }
.ledger-info-cell { display: grid; gap: .12em; min-width: 0; padding: .52em .65em; border: 0; border-right: 1px solid var(--skin-basic-row-border); border-bottom: 1px solid var(--skin-basic-row-border); border-radius: 0; background: var(--skin-basic-row-bg); }
.ledger-info-cell .rt-label { font-size: .8em; font-weight: 800; letter-spacing: .05em; }
.ledger-title { display: grid; grid-template-columns: auto 1fr auto; gap: .65em; margin: 0; padding: .5em .7em; border: 1px solid var(--skin-header-border); background: var(--skin-basic-row-bg); letter-spacing: .08em; }
.ledger-title::before { width: .62em; height: .62em; border: 2px solid var(--skin-top-band-bg); background: transparent !important; }
.ledger-title::after { grid-column: 2; height: 1px; }
.ledger-title small { grid-column: 3; grid-row: 1; align-self: center; color: var(--font-content-color); font-size: .56em; letter-spacing: .16em; }
.ledger-table { border-left: 1px solid var(--skin-item-border); }
.ledger-row { display: grid; grid-template-columns: 1fr auto; margin: 0; padding: .7em .8em; border: 0; border-right: 1px solid var(--skin-item-border); border-bottom: 1px solid var(--skin-item-border); border-radius: 0; background: var(--skin-item-bg); color: var(--font-content-color); }
.ledger-row time { padding-left: 1em; border-left: 1px solid var(--skin-divider-color); white-space: nowrap; font-size: .86em; }
.ledger-detail, .ledger-description { grid-column: 1 / -1; margin: .25em 0 0; }
.ledger-detail { font-weight: 700; }
.ledger-skills { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--skin-skill-border); border-left: 1px solid var(--skin-skill-border); }
.ledger-skills .rt-skill { padding: .52em .6em; border: 0; border-right: 1px solid var(--skin-skill-border); border-bottom: 1px solid var(--skin-skill-border); border-radius: 0; background: var(--skin-skill-bg); text-align: center; }
.ledger-honors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; padding: 0; border-top: 1px solid var(--skin-item-border); border-left: 1px solid var(--skin-item-border); list-style: none; }
.ledger-honors li { padding: .5em .7em; border-right: 1px solid var(--skin-item-border); border-bottom: 1px solid var(--skin-item-border); color: var(--font-content-color); }
.ledger-summary > p { margin: 0; padding: .8em; border: 1px solid var(--skin-item-border); border-top: 0; background: var(--skin-item-bg); }
</style>
