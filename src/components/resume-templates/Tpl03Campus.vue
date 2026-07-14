<!--
  AI简历风格模板 3 - 校园证件照式
  参考纸质个人简历：大标题、青绿色分组条、右侧头像、紧凑正文。
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields } from './shared/useResumeFields.js'
import { formatEducationDateRange, formatEducationDetail } from '@/constants/resumeFieldSchema'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))

const moduleVisibleMap = computed(() => {
  return props.visibleModules.reduce((map, item) => {
    map[item.key] = item.visible !== false
    return map
  }, {})
})

function showModule(key) {
  return moduleVisibleMap.value[key] !== false
}

function dateRange(item) {
  return [item.start_date, item.end_date].filter(Boolean).join('—')
}

const basicInfoItems = computed(() => {
  const items = [{ key: 'name', label: '姓名', value: f.value.name }, ...(f.value.basicInfoItems || [])]

  if (f.value.targetPosition) {
    items.unshift({ key: 'target_position', label: '意向', value: f.value.targetPosition })
  }

  if (f.value.school) {
    items.push({ key: 'school', label: '院校', value: f.value.school })
  }

  if (f.value.major) {
    items.push({ key: 'major', label: '专业', value: f.value.major })
  }

  if (f.value.education) {
    items.push({ key: 'education', label: '学历', value: f.value.education })
  }

  return items.filter((item, index, arr) => {
    return item.value && arr.findIndex((candidate) => candidate.key === item.key) === index
  })
})
</script>

<template>
  <div class="w-full bg-white resume-template rt-custom-03">
    <header
      v-if="showModule('basic')"
      data-resume-module="basic"
      class="campus-head"
    >
      <div class="campus-title-row">
        <div>
          <h1 class="rt-name campus-title">个人简历</h1>
          <div v-if="f.targetPosition" class="rt-value campus-target">{{ f.targetPosition }}</div>
        </div>

        <div class="campus-badges" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="campus-basic-card mb-[20px]">
        <div class="campus-basic-main">
          <h2 class="rt-title campus-ribbon"><span>基本信息</span></h2>

          <div v-if="basicInfoItems.length" class="campus-basic-grid">
            <div
              v-for="item in basicInfoItems"
              :key="item.key"
              class="rt-basic-row campus-basic-row"
            >
              <span class="rt-label">{{ item.label }}：</span>
              <span class="rt-value">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <div v-if="f.avatar" class="campus-avatar-wrap">
          <img :src="f.avatar" alt="头像" class="rt-avatar campus-avatar">
        </div>
      </div>
    </header>

    <main class="campus-body">
      <section
        v-if="showModule('educations') && f.educations.length"
        data-resume-module="educations"
        class="rt-section campus-section"
      >
        <h2 class="rt-title campus-ribbon"><span>教育背景</span></h2>
        <article
          v-for="(edu, idx) in f.educations"
          :key="idx + (edu.school || '')"
          class="rt-item campus-item"
        >
          <div class="rt-item-header campus-item-line">
            <strong>{{ edu.school || '学校' }}</strong>
            <span v-if="formatEducationDateRange(edu)" class="rt-edu-dates">{{ formatEducationDateRange(edu) }}</span>
          </div>
          <p v-if="formatEducationDetail(edu)" class="rt-text campus-text">{{ formatEducationDetail(edu) }}</p>
          <p v-if="edu.main_course" class="rt-desc rt-preserve-text campus-text">主修课程：{{ edu.main_course }}</p>
        </article>
      </section>

      <section
        v-if="showModule('work_experience') && f.workExperiences.length"
        data-resume-module="work_experience"
        class="rt-section campus-section"
      >
        <h2 class="rt-title campus-ribbon"><span>工作经历</span></h2>
        <article
          v-for="(item, idx) in f.workExperiences"
          :key="idx + (item.company || '')"
          class="rt-item campus-item"
        >
          <div class="rt-item-header campus-item-line">
            <strong>{{ dateRange(item) }}</strong>
            <span>{{ item.company }}<template v-if="item.position">　{{ item.position }}</template></span>
          </div>
          <p v-if="item.department" class="rt-text campus-text">部门：{{ item.department }}</p>
          <p v-if="item.description" class="rt-desc rt-preserve-text campus-text">{{ item.description }}</p>
        </article>
      </section>

      <section
        v-if="showModule('internships') && f.internships.length"
        data-resume-module="internships"
        class="rt-section campus-section"
      >
        <h2 class="rt-title campus-ribbon"><span>实习经历</span></h2>
        <article
          v-for="item in f.internships"
          :key="item.company + item.start_date"
          class="rt-item campus-item"
        >
          <div class="rt-item-header campus-item-line">
            <strong>{{ dateRange(item) }}</strong>
            <span>{{ item.company }}<template v-if="item.position">　{{ item.position }}</template></span>
          </div>
          <p v-if="item.description" class="rt-desc rt-preserve-text campus-text">{{ item.description }}</p>
        </article>
      </section>

      <section
        v-if="showModule('projects') && f.projects.length"
        data-resume-module="projects"
        class="rt-section campus-section"
      >
        <h2 class="rt-title campus-ribbon"><span>项目经历</span></h2>
        <article
          v-for="item in f.projects"
          :key="item.name"
          class="rt-item campus-item"
        >
          <div class="rt-item-header campus-item-line">
            <strong>{{ item.name }}</strong>
            <span v-if="dateRange(item)">{{ dateRange(item) }}</span>
          </div>
          <p v-if="item.role || item.tech_stack" class="rt-text campus-text">
            {{ item.role }}<template v-if="item.tech_stack"> | {{ item.tech_stack }}</template>
          </p>
          <p v-if="item.description" class="rt-desc rt-preserve-text campus-text">{{ item.description }}</p>
        </article>
      </section>

      <section
        v-if="showModule('skills') && f.skills.length"
        data-resume-module="skills"
        class="rt-section campus-section"
      >
        <h2 class="rt-title campus-ribbon"><span>技能证书</span></h2>
        <div class="rt-skills campus-skill-line">
          2323
          <span
            v-for="skill in f.skills"
            :key="skill"
            class="rt-skill"
          >
            {{ skill }}
          </span>
        </div>
      </section>

      <section
        v-if="showModule('awards') && f.honorList.length"
        data-resume-module="awards"
        class="rt-section campus-section"
      >
        <h2 class="rt-title campus-ribbon"><span>荣誉证书</span></h2>
        <ul class="rt-list campus-list">
          <li
            v-for="item in f.honorList"
            :key="item"
            class="rt-preserve-text"
          >
            {{ item }}
          </li>
        </ul>
      </section>

      <section
        v-if="showModule('basic') && f.summary"
        data-resume-module="basic"
        class="rt-section campus-section"
      >
        <h2 class="rt-title campus-ribbon"><span>自我评价</span></h2>
        <p class="rt-text rt-preserve-text campus-text">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>

<style scoped>
.rt-custom-03 {
  color: var(--font-content-color, #374151);
  word-break: break-word;
}

.campus-head,
.campus-body {
  padding: 0 26px;
}

.campus-head {
  padding-top: 20px;
}

.campus-body {
  padding-bottom: 24px;
}

.campus-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 14px;
  border-bottom: 2px solid var(--skin-divider-color, #9aaeb4);
}

.campus-title {
  margin: 0;
  color: var(--font-name-color, #2e6973);
  font-weight: 500;
  letter-spacing: 0;
}

.campus-target {
  margin: 2px 0 8px;
  font-size: 0.95em;
  font-weight: 600;
}

.campus-badges {
  display: flex;
  gap: 10px;
  padding-bottom: 12px;
  pointer-events: none;
}

.campus-badges span {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: var(--skin-top-band-bg, #c09b54);
  box-shadow: inset 0 0 0 5px rgba(255, 255, 255, 0.22);
}

.campus-basic-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 22px;
  align-items: start;
}

.campus-basic-main {
  min-width: 0;
}

.campus-basic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px 28px;
  padding-top: 7px;
}

.campus-basic-row {
  display: flex;
  min-width: 0;
  gap: 4px;
  border: 0;
  background: transparent;
  padding: 0;
}

.campus-basic-row .rt-label {
  flex: 0 0 auto;
  font-weight: 700;
}

.campus-basic-row .rt-value {
  min-width: 0;
  overflow-wrap: anywhere;
}

.campus-avatar-wrap {
  width: 120px;
  height: 158px;
  overflow: hidden;
  border: 1px solid var(--skin-basic-row-border, #aebdc1);
  background: var(--skin-basic-row-bg, #f8fafc);
}

.campus-avatar {
  width: 100%;
  height: 100%;
  border-radius: 0;
  object-fit: cover;
}

.campus-section {
  margin-bottom: var(--section-gap, 14px);
}

.campus-ribbon {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 28px;
  margin: 0 0 8px;
  padding: 0;
  border-bottom: 2px solid var(--skin-divider-color, #9aaeb4);
  color: var(--skin-title-color, #2e6973);
  font-weight: 700;
}

.campus-ribbon::before,
.campus-ribbon::after {
  display: none;
}

.campus-ribbon span {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 102px;
  height: 27px;
  padding: 0 16px 0 14px;
  background: var(--skin-title-color, #2e6973);
  color: #fff;
  line-height: 1;
}

.campus-ribbon span::after {
  content: '';
  position: absolute;
  top: 0;
  right: -25px;
  width: 25px;
  height: 27px;
  background:
    linear-gradient(58deg, transparent 0 41%, rgba(255, 255, 255, 0.95) 42% 50%, transparent 51% 58%, rgba(255, 255, 255, 0.95) 59% 66%, transparent 67%),
    var(--skin-title-color, #2e6973);
  clip-path: polygon(0 0, 66% 0, 100% 100%, 0% 100%);
}

.campus-item {
  border: 0;
  background: transparent;
  padding: 0;
  margin-bottom: 9px;
}

.campus-item-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 3px;
}

.campus-item-line strong {
  color: var(--font-content-color, #111827);
  font-weight: 800;
}

.campus-item-line span {
  color: var(--font-content-color, #111827);
  font-weight: 700;
  text-align: right;
}

.campus-text {
  margin: 0 0 3px;
  color: var(--font-content-color, #374151);
  text-align: justify;
}

.campus-skill-line {
  display: block;
}

.campus-skill-line .rt-skill {
  display: inline;
  margin: 0;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--font-content-color, #374151);
  font-weight: 400;
}

.campus-skill-line .rt-skill + .rt-skill::before {
  content: '、';
}

.campus-list {
  margin: 0;
  padding-left: 20px;
  color: var(--font-content-color, #374151);
}

.campus-list li {
  margin-bottom: 4px;
}
</style>
