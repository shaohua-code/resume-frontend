<!--
  模板 10 - 销售市场（全民简历风格四）
  白色 header + 图标章节 + 皮肤可定制模块标题
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
const avatarUrl = computed(() => f.value.avatar)

// 顶栏基本信息：左侧网格展示，合并求职字段与 basicInfoItems，避免期望薪资等重复
const headerBasicItems = computed(() => {
  const items = []
  if (f.value.targetPosition) {
    items.push({ key: 'target_position', label: '求职意向', value: f.value.targetPosition })
  }
  if (f.value.targetCity) {
    items.push({ key: 'target_city', label: '意向城市', value: f.value.targetCity })
  }
  if (f.value.entryTime) {
    items.push({ key: 'entry_time', label: '入职时间', value: f.value.entryTime })
  }
  const usedKeys = new Set(items.map((item) => item.key))
  f.value.basicInfoItems.forEach((item) => {
    if (!usedKeys.has(item.key)) {
      items.push(item)
    }
  })
  return items
})

const moduleVisibleMap = computed(() => {
  return props.visibleModules.reduce((map, item) => {
    map[item.key] = item.visible !== false
    return map
  }, {})
})

function showModule(key) {
  return moduleVisibleMap.value[key] !== false
}

const sectionIcons = {
  education: '🎓',
  internships: '💼',
  projects: '🏫',
  skills: '⚙️',
  awards: '🏅',
  summary: '👤',
}
</script>

<template>
  <div class="resume-template rt-custom-10 w-full bg-white">
    <header data-resume-module="basic" class="rt-top-band px-8 py-7">
      <div class="flex items-center justify-between gap-8">
        <div class="min-w-0 flex-1">
          <h1 class="rt-name mb-4 text-3xl font-bold tracking-widest">{{ f.name }}</h1>
          <div v-if="headerBasicItems.length" class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div
              v-for="item in headerBasicItems"
              :key="item.key"
              class="flex min-w-0 items-start gap-1"
            >
              <span class="rt-label shrink-0">{{ item.label }}：</span>
              <span class="rt-value break-all">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <div v-if="avatarUrl" class="shrink-0">
          <img
            :src="avatarUrl"
            alt="avatar"
            class="h-32 w-24 border-4 border-white/90 bg-white object-cover shadow-md"
          />
        </div>
      </div>
    </header>

    <main class="px-8 py-6">
      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.education }}
          </div>
          <h2 class="rt-title mb-0"><span>教育背景</span></h2>
        </div>
        <div v-for="(edu, idx) in f.educations" :key="idx" class="rt-item mb-2">
          <div class="rt-item-header">
            <strong>{{ edu.school }}</strong>
            <span class="whitespace-nowrap">{{ formatEducationDateRange(edu) }}</span>
          </div>
          <p v-if="formatEducationDetail(edu)" class="rt-text text-sm">{{ formatEducationDetail(edu) }}</p>
        </div>
      </section>

      <!-- 实习经历（学生兼职/实习） -->
      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.internships }}
          </div>
          <h2 class="rt-title mb-0"><span>实习经历</span></h2>
        </div>
        <div class="space-y-3">
          <div v-for="intern in f.internships" :key="intern.company + intern.start_date" class="rt-item">
            <div class="rt-item-header">
              <strong>{{ intern.company }}</strong>
              <span class="whitespace-nowrap">{{ intern.start_date }} ~ {{ intern.end_date }}</span>
            </div>
            <p v-if="intern.position" class="rt-sub">{{ intern.position }}</p>
            <p v-if="intern.description" class="rt-desc rt-preserve-text">{{ intern.description }}</p>
          </div>
        </div>
      </section>

      <!-- 工作经历（正式全职工作） -->
      <section v-if="showModule('work_experience') && f.workExperiences.length"
               data-resume-module="work_experience" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.internships }}
          </div>
          <h2 class="rt-title mb-0"><span>工作经历</span></h2>
        </div>
        <div class="space-y-3">
          <div v-for="(exp, idx) in f.workExperiences" :key="idx + (exp.company || '')" class="rt-item">
            <div class="rt-item-header">
              <strong>{{ exp.company }}</strong>
              <span class="whitespace-nowrap">{{ exp.start_date }} ~ {{ exp.end_date }}</span>
            </div>
            <p v-if="exp.position || exp.department" class="rt-sub">
              {{ exp.position }}<template v-if="exp.department"> · {{ exp.department }}</template>
            </p>
            <p v-if="exp.description" class="rt-desc rt-preserve-text">{{ exp.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.projects }}
          </div>
          <h2 class="rt-title mb-0"><span>项目经历</span></h2>
        </div>
        <div class="space-y-3">
          <div v-for="proj in f.projects" :key="proj.name" class="rt-item">
            <div class="rt-item-header">
              <strong>{{ proj.name }}</strong>
              <span class="whitespace-nowrap">{{ proj.start_date }} ~ {{ proj.end_date }}</span>
            </div>
            <p v-if="proj.role || proj.tech_stack" class="rt-sub">
              {{ proj.role }}<template v-if="proj.tech_stack"> | {{ proj.tech_stack }}</template>
            </p>
            <p v-if="proj.description" class="rt-desc rt-preserve-text">{{ proj.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.skills }}
          </div>
          <h2 class="rt-title mb-0"><span>技能特长</span></h2>
        </div>
        <div class="rt-skills">
          <span v-for="skill in f.skills" :key="skill" class="rt-skill">{{ skill }}</span>
        </div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.awards }}
          </div>
          <h2 class="rt-title mb-0"><span>荣誉证书</span></h2>
        </div>
        <ul class="rt-list list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li>
        </ul>
      </section>

      <section v-if="f.summary" data-resume-module="basic" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.summary }}
          </div>
          <h2 class="rt-title mb-0"><span>自我评价</span></h2>
        </div>
        <p class="rt-text rt-preserve-text text-sm leading-relaxed">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style src="./shared/templateCustom.css"></style>
