<!-- AI 简历模板 56：轻简通用，以编辑式主视觉、经历时间线和柔和卡片建立明确层次。 -->
<script setup>
import { computed } from 'vue'
import { formatEducationDateRange, formatEducationDetail } from '@/constants/resumeFieldSchema'
import { useResumeFields } from './shared/useResumeFields.js'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

// 仅计算展示字段和模块开关，正文保持可被编辑器分页器识别的普通文档流。
const f = computed(() => useResumeFields(props.resume))
const visibleMap = computed(() => Object.fromEntries(props.visibleModules.map((item) => [item.key, item.visible !== false])))
function showModule(key) { return visibleMap.value[key] !== false }
function dateRange(item = {}) { return [item.start_date, item.end_date].filter(Boolean).join(' ~ ') }
</script>

<template>
  <article class="resume-template rt rt-custom-56 w-full bg-white">
    <!-- 编辑式刊头建立视觉焦点；所有信息仍来自真实简历字段。 -->
    <div class="template-kicker" aria-hidden="true"><span>PROFILE / 个人履历</span><i></i><small>RESUME&nbsp; · &nbsp;CV</small></div>
    <div class="rt-body">
      <header data-resume-module="basic" class="profile-header">
        <div class="profile-topline"><span>PERSONAL PROFILE</span><span class="profile-chip">职业简历</span></div>
        <div class="profile-main">
          <div class="profile-heading">
            <h1 class="rt-name">{{ f.name }}</h1>
            <p v-if="f.targetPosition" class="rt-slogan rt-value"><i></i>{{ f.targetPosition }}</p>
          </div>
          <img v-if="f.avatar" :src="f.avatar" alt="头像" class="rt-avatar profile-avatar">
          <div v-else class="profile-mark" aria-hidden="true">CV</div>
        </div>
        <div v-if="f.basicInfoItems.length" class="contact-grid">
          <div v-for="item in f.basicInfoItems" :key="item.key" class="contact-item">
            <span class="rt-label">{{ item.label }}</span><span class="rt-value">{{ item.value }}</span>
          </div>
        </div>
      </header>

      <section v-if="showModule('basic') && f.summary" data-resume-module="basic" class="rt-section summary-section">
        <h2 class="rt-title"><span>个人简介</span><small>PROFILE</small></h2>
        <p class="rt-text rt-preserve-text">{{ f.summary }}</p>
      </section>

      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience" class="rt-section work-history">
        <h2 class="rt-title"><span>工作经历</span><small>EXPERIENCE</small></h2>
        <div v-for="(item, index) in f.workExperiences" :key="index + (item.company || '')" class="rt-item">
          <div class="rt-item-header"><strong>{{ item.company }}</strong><span v-if="dateRange(item)">{{ dateRange(item) }}</span></div>
          <p v-if="item.position || item.department" class="rt-sub">{{ item.position }}<template v-if="item.department"> · {{ item.department }}</template></p>
          <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
        </div>
      </section>

      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section">
        <h2 class="rt-title"><span>教育背景</span><small>EDUCATION</small></h2>
        <div v-for="(item, index) in f.educations" :key="index + (item.school || '')" class="rt-item">
          <div class="rt-item-header"><strong>{{ item.school || '学校' }}</strong><span v-if="formatEducationDateRange(item)">{{ formatEducationDateRange(item) }}</span></div>
          <p v-if="formatEducationDetail(item)" class="rt-sub">{{ formatEducationDetail(item) }}</p>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section">
        <h2 class="rt-title"><span>实习经历</span><small>INTERNSHIP</small></h2>
        <div v-for="(item, index) in f.internships" :key="index + (item.company || '')" class="rt-item">
          <div class="rt-item-header"><strong>{{ item.company }}</strong><span v-if="dateRange(item)">{{ dateRange(item) }}</span></div>
          <p v-if="item.position" class="rt-sub">{{ item.position }}</p>
          <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
        </div>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section">
        <h2 class="rt-title"><span>项目经历</span><small>PROJECTS</small></h2>
        <div v-for="(item, index) in f.projects" :key="index + (item.name || '')" class="rt-item">
          <div class="rt-item-header"><strong>{{ item.name }}</strong><span v-if="dateRange(item)">{{ dateRange(item) }}</span></div>
          <p v-if="item.role || item.tech_stack" class="rt-sub">{{ item.role }}<template v-if="item.tech_stack"> · {{ item.tech_stack }}</template></p>
          <p v-if="item.description" class="rt-desc rt-preserve-text">{{ item.description }}</p>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section">
        <h2 class="rt-title"><span>技能特长</span><small>SKILLS</small></h2>
        <div class="rt-skills"><span v-for="skill in f.skills" :key="skill" class="rt-skill">{{ skill }}</span></div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section">
        <h2 class="rt-title"><span>荣誉与证书</span><small>HONORS</small></h2>
        <ul class="rt-list"><li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li></ul>
      </section>
    </div>
  </article>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style scoped>
/* 蓝灰、暖铜与纸白卡片增加版面层次；内容顺序和尺寸仍交由现有分页契约处理。 */
.rt-custom-56 { color:var(--font-content-color); background:#fff; counter-reset:resume-section; }
.template-kicker { display:flex; align-items:center; gap:.75em; padding:.95em 2.35em .7em; color:var(--font-label-color); font-size:.64em; font-weight:800; letter-spacing:.13em; }
.template-kicker span { color:var(--skin-title-color); }
.template-kicker i { flex:1; height:1px; background:var(--skin-divider-color); }
.template-kicker small { color:var(--skin-top-band-bg); font-size:.9em; letter-spacing:.18em; }
.rt-body { padding:1.05em 2.35em 2em; }
.profile-header { position:relative; margin-bottom:var(--section-gap); padding:1.25em 1.4em 1.15em; border:1px solid var(--skin-header-border); border-left:.42em solid var(--skin-top-band-bg); border-radius:.55em; background:linear-gradient(120deg,var(--skin-header-bg) 0%,#fff 82%); }
.profile-topline { display:flex; align-items:center; justify-content:space-between; margin-bottom:.8em; color:var(--font-label-color); font-size:.62em; font-weight:800; letter-spacing:.2em; }
.profile-chip { padding:.3em .7em; border:1px solid var(--skin-divider-color); border-radius:99px; color:var(--skin-title-color); letter-spacing:.08em; }
.profile-main { display:flex; align-items:center; gap:1.1em; min-height:5.3em; }
.profile-heading { flex:1; min-width:0; }
.rt-name { margin:0; color:var(--font-name-color); font-size:2.65em !important; font-weight:800; letter-spacing:.09em; line-height:1.08 !important; }
.rt-slogan { display:flex; align-items:center; gap:.5em; margin:.55em 0 0; color:var(--font-label-color); font-size:1.02em; font-weight:650; }
.rt-slogan i { width:.42em; height:.42em; border-radius:50%; background:var(--skin-top-band-bg); }
.profile-avatar { flex:none; width:5.6em; height:6.8em; border:3px solid #fff; border-radius:.5em; box-shadow:0 0 0 1px var(--skin-header-border); object-fit:cover; }
.profile-mark { display:grid; flex:none; place-items:center; width:4.8em; height:4.8em; border:1px solid var(--skin-divider-color); border-radius:50%; color:var(--skin-top-band-bg); font-family:Georgia,serif; font-size:1.2em; font-weight:700; letter-spacing:.08em; }
.contact-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.45em; margin-top:1.1em; padding-top:.85em; border-top:1px solid var(--skin-divider-color); }
.contact-item { display:flex; flex-direction:column; min-width:0; gap:.18em; padding:.45em .6em; border:1px solid var(--skin-basic-row-border); border-radius:.35em; background:var(--skin-basic-row-bg); font-size:.82em; }
.contact-item .rt-label { color:var(--font-label-color); font-size:.88em; letter-spacing:.04em; }
.contact-item .rt-value { min-width:0; color:var(--font-basic-content-color); font-weight:650; overflow-wrap:anywhere; }
.rt-section { margin-bottom:var(--section-gap); counter-increment:resume-section; }
.rt-title { display:flex; align-items:center; gap:.55em; margin:0 0 .72em; color:var(--skin-title-color); font-size:1.12em; font-weight:800; }
.rt-title::before { display:grid; flex:none; place-items:center; width:1.8em; height:1.8em; border-radius:.38em; color:#fff; content:counter(resume-section,decimal-leading-zero); font-size:.68em; font-weight:800; letter-spacing:.04em; background:var(--skin-top-band-bg) !important; }
.rt-title span { flex:none; }
.rt-title small { padding:.22em .45em; border-radius:.25em; color:var(--font-label-color); background:var(--skin-basic-row-bg); font-size:.55em; font-weight:700; letter-spacing:.12em; }
.rt-title::after { height:1px; background:linear-gradient(90deg,var(--skin-divider-color),transparent) !important; }
.rt-item { position:relative; margin:.55em 0 0; padding:.78em .9em; border:1px solid var(--skin-item-border) !important; border-left:.22em solid var(--skin-top-band-bg) !important; border-radius:.4em; background:var(--skin-item-bg) !important; }
.rt-item-header { display:flex; justify-content:space-between; align-items:baseline; gap:1em; }
.rt-item-header strong { color:var(--font-content-color); font-weight:800; }
.rt-item-header span { flex:none; color:var(--font-label-color); font-size:.88em; }
.rt-sub { margin:.28em 0 .35em; color:var(--font-label-color); font-size:.92em; font-weight:650; }
.rt-desc,.rt-text { color:var(--font-content-color); }
.rt-desc { margin-top:.4em; }
.summary-section .rt-text { margin:0; padding:.9em 1.05em; border-left:.28em solid var(--skin-top-band-bg); border-radius:.25em .45em .45em .25em; background:var(--skin-basic-row-bg); }
.work-history .rt-item { margin-left:.65em; padding-left:1.15em; border-top:0 !important; border-right:0 !important; border-bottom:1px solid var(--skin-item-border) !important; border-left:1px solid var(--skin-divider-color) !important; border-radius:0; background:transparent !important; }
.work-history .rt-item::before { position:absolute; top:1.05em; left:-.31em; width:.58em; height:.58em; border:2px solid #fff; border-radius:50%; background:var(--skin-top-band-bg); box-shadow:0 0 0 1px var(--skin-header-border); content:''; }
.rt-skills { display:flex; flex-wrap:wrap; gap:.52em; }
.rt-skill { padding:.32em .7em; border:1px solid var(--skin-skill-border) !important; border-radius:99px; color:var(--font-content-color); background:var(--skin-skill-bg) !important; font-weight:650; }
.rt-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.45em .7em; padding-left:1.2em; }
.rt-list li { padding:.25em .2em; }
</style>
