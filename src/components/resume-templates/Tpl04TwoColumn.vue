<!--
  模板 04 - 左右时间轴（全民简历风格三）
  顶栏色带 + 左侧时间轴 + 皮肤可定制模块标题
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields, skillProgress, skillLevel } from './shared/useResumeFields.js'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))
const avatarUrl = computed(() => f.value.avatar)

// 顶栏岗位行：单独展示，颜色跟随姓名（rt-name-sub）
const positionLine = computed(() =>
  f.value.targetPosition ? `求职意向：${f.value.targetPosition}` : '',
)

// 顶栏其他求职信息：城市/薪资等，不走姓名色
const jobMetaLine = computed(() => {
  const items = []
  if (props.resume?.city) items.push(props.resume.city)
  if (props.resume?.salary) items.push(props.resume.salary)
  if (props.resume?.entry_time) items.push(props.resume.entry_time)
  return items.length ? items.join(' | ') : ''
})

const basicGrid = computed(() => {
  const list = []
  if (props.resume?.age) list.push({ label: '年龄', value: `${props.resume.age}岁` })
  if (props.resume?.gender) list.push({ label: '性别', value: props.resume.gender })
  if (props.resume?.hometown) list.push({ label: '籍贯', value: props.resume.hometown })
  if (props.resume?.work_years) list.push({ label: '工作年限', value: props.resume.work_years })
  if (f.value.phone) list.push({ label: '电话', value: f.value.phone })
  if (f.value.email) list.push({ label: '邮箱', value: f.value.email })
  return list
})

function formatDesc(desc) {
  if (!desc) return []
  return String(desc)
    .split(/\n|(?:\d+[\.、])|(?<=[。；;])/)
    .map((s) => s.trim())
    .filter(Boolean)
}

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
  <div class="resume-template rt-custom-04 w-full bg-white">
    <header data-resume-module="basic" class="rt-top-band px-8 py-7">
      <div class="mb-5 flex items-start justify-between gap-6">
        <div class="min-w-0 flex-1">
          <h1 class="rt-name mb-3 text-3xl font-bold tracking-widest">{{ f.name }}</h1>
          <p v-if="positionLine" class="rt-slogan rt-name-sub text-sm">{{ positionLine }}</p>
          <p v-if="jobMetaLine" class="rt-slogan mt-1 text-sm">{{ jobMetaLine }}</p>
        </div>
        <div v-if="avatarUrl" class="shrink-0">
          <img
            :src="avatarUrl"
            alt="avatar"
            class="h-32 w-24 border-4 border-white/90 bg-white object-cover shadow-md"
          />
        </div>
      </div>
      <div v-if="basicGrid.length" class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div v-for="(item, idx) in basicGrid" :key="idx" class="flex items-center gap-2">
          <span class="rt-label">{{ item.label }}：</span>
          <span class="rt-value">{{ item.value }}</span>
        </div>
      </div>
    </header>

    <main class="px-8 py-6">
      <section v-if="f.school" data-resume-module="basic" class="rt-timeline-line relative mb-5 border-l-2 pl-10">
        <div class="rt-timeline-dot absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">
          {{ sectionIcons.education }}
        </div>
        <h2 class="rt-title"><span>教育背景</span></h2>
        <div class="rt-item mb-2">
          <div class="rt-item-header">
            <strong>{{ f.school }}</strong>
            <span class="whitespace-nowrap">2012-09 ~ 2016-07</span>
          </div>
          <p v-if="f.major" class="rt-text text-sm">{{ f.major }}</p>
          <p v-if="f.education" class="rt-text text-sm">{{ f.education }}</p>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-timeline-line relative mb-5 border-l-2 pl-10">
        <div class="rt-timeline-dot absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">
          {{ sectionIcons.internships }}
        </div>
        <h2 class="rt-title"><span>工作经历</span></h2>
        <div class="space-y-3">
          <div v-for="intern in f.internships" :key="intern.company + intern.start_date" class="rt-item">
            <div class="rt-item-header">
              <strong>{{ intern.company }}</strong>
              <span class="whitespace-nowrap">{{ intern.start_date }} ~ {{ intern.end_date }}</span>
            </div>
            <p v-if="intern.position" class="rt-sub">{{ intern.position }}</p>
            <ul class="rt-list list-disc space-y-0.5 pl-5 text-sm leading-relaxed">
              <li v-for="(line, idx) in formatDesc(intern.description)" :key="idx">{{ line }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-timeline-line relative mb-5 border-l-2 pl-10">
        <div class="rt-timeline-dot absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">
          {{ sectionIcons.projects }}
        </div>
        <h2 class="rt-title"><span>项目经历</span></h2>
        <div class="space-y-3">
          <div v-for="proj in f.projects" :key="proj.name" class="rt-item">
            <div class="rt-item-header">
              <strong>{{ proj.name }}</strong>
              <span class="whitespace-nowrap">{{ proj.start_date }} ~ {{ proj.end_date }}</span>
            </div>
            <p v-if="proj.role || proj.tech_stack" class="rt-sub">
              {{ proj.role }}<template v-if="proj.tech_stack"> | {{ proj.tech_stack }}</template>
            </p>
            <ul class="rt-list list-disc space-y-0.5 pl-5 text-sm leading-relaxed">
              <li v-for="(line, idx) in formatDesc(proj.description)" :key="idx">{{ line }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-timeline-line relative mb-5 border-l-2 pl-10">
        <div class="rt-timeline-dot absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">
          {{ sectionIcons.skills }}
        </div>
        <h2 class="rt-title"><span>技能特长</span></h2>
        <ul class="rt-list mb-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li v-for="skill in f.skills" :key="skill">{{ skill }}</li>
        </ul>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(skill, idx) in f.skills.slice(0, 2)" :key="skill" class="text-sm">
            <div class="mb-1 flex justify-between">
              <span class="font-medium">{{ skill }}</span>
              <span class="rt-sub">{{ skillLevel(idx) }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-200">
              <div class="rt-skill-bar-fill h-full rounded-full" :style="{ width: skillProgress(idx) + '%' }" />
            </div>
          </div>
        </div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-timeline-line relative mb-5 border-l-2 pl-10">
        <div class="rt-timeline-dot absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">
          {{ sectionIcons.awards }}
        </div>
        <h2 class="rt-title"><span>荣誉证书</span></h2>
        <ul class="rt-list list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li v-for="item in f.honorList" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section v-if="f.summary" data-resume-module="basic" class="rt-timeline-line relative mb-5 border-l-2 pl-10">
        <div class="rt-timeline-dot absolute left-0 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white">
          {{ sectionIcons.summary }}
        </div>
        <h2 class="rt-title"><span>自我评价</span></h2>
        <p class="rt-text text-sm leading-relaxed">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style src="./shared/templateCustom.css"></style>
