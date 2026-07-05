<!--
  模板 10 - 销售市场（全民简历风格四）
  白色 header + 图标章节 + 皮肤可定制模块标题
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields, skillProgress, skillLevel } from './shared/useResumeFields.js'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))
const avatarUrl = computed(() => props.resume?.avatar || '')

const jobInfo = computed(() => {
  const list = []
  if (f.value.targetPosition) list.push({ label: '求职意向', value: f.value.targetPosition })
  if (props.resume?.city) list.push({ label: '意向城市', value: props.resume.city })
  if (props.resume?.salary) list.push({ label: '期望薪资', value: props.resume.salary })
  if (props.resume?.entry_time) list.push({ label: '入职时间', value: props.resume.entry_time })
  return list
})

const basicInfo = computed(() => {
  const list = []
  if (props.resume?.age) list.push({ label: '年龄', value: `${props.resume.age}岁`, icon: '🎂' })
  if (props.resume?.gender) list.push({ label: '性别', value: props.resume.gender, icon: '♂️' })
  if (props.resume?.city) list.push({ label: '城市', value: props.resume.city, icon: '📍' })
  if (props.resume?.work_years) list.push({ label: '工作年限', value: props.resume.work_years, icon: '💼' })
  if (f.value.phone) list.push({ label: '电话', value: f.value.phone, icon: '📞' })
  if (f.value.email) list.push({ label: '邮箱', value: f.value.email, icon: '✉️' })
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
  <div class="resume-template w-full bg-[#f5f7fa] text-slate-800">
    <header data-resume-module="basic" class="rt-banner border-b border-slate-200 bg-white px-8 py-6">
      <div class="flex items-start justify-between gap-8">
        <div class="min-w-0 flex-1">
          <h1 class="rt-name mb-4 text-3xl font-bold tracking-widest text-slate-900">{{ f.name }}</h1>
          <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div v-for="(item, idx) in jobInfo" :key="idx" class="flex items-center gap-2">
              <span class="text-slate-500">{{ item.label }}：</span>
              <span class="text-slate-800">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 items-start gap-4">
          <div v-if="basicInfo.length" class="grid grid-cols-1 gap-y-1.5 text-right text-sm">
            <div v-for="(item, idx) in basicInfo" :key="idx" class="flex items-center justify-end gap-2">
              <span class="text-slate-700">{{ item.value }}</span>
              <span class="text-xs text-slate-400">{{ item.icon }}</span>
            </div>
          </div>
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="avatar"
            class="h-28 w-20 border-2 border-slate-200 bg-white object-cover shadow-sm"
          />
        </div>
      </div>
    </header>

    <main class="px-8 py-6">
      <section v-if="f.school" data-resume-module="basic" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.education }}
          </div>
          <h2 class="rt-title mb-0"><span>教育背景</span></h2>
        </div>
        <div class="rt-item mb-2">
          <div class="rt-item-header">
            <strong>{{ f.school }}</strong>
            <span class="whitespace-nowrap">2015-09 ~ 2018-07</span>
          </div>
          <p v-if="f.major" class="rt-text text-sm text-slate-700">{{ f.major }}</p>
          <p v-if="f.education" class="text-sm text-slate-700">{{ f.education }}</p>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.internships }}
          </div>
          <h2 class="rt-title mb-0"><span>工作经历</span></h2>
        </div>
        <div class="space-y-3">
          <div v-for="intern in f.internships" :key="intern.company + intern.start_date" class="rt-item">
            <div class="rt-item-header">
              <strong>{{ intern.company }}</strong>
              <span class="whitespace-nowrap">{{ intern.start_date }} ~ {{ intern.end_date }}</span>
            </div>
            <p v-if="intern.position" class="rt-sub">{{ intern.position }}</p>
            <ul class="list-disc space-y-0.5 pl-5 text-sm leading-relaxed text-slate-700">
              <li v-for="(line, idx) in formatDesc(intern.description)" :key="idx">{{ line }}</li>
            </ul>
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
            <ul class="list-disc space-y-0.5 pl-5 text-sm leading-relaxed text-slate-700">
              <li v-for="(line, idx) in formatDesc(proj.description)" :key="idx">{{ line }}</li>
            </ul>
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
        <ul class="mb-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
          <li v-for="skill in f.skills" :key="skill">{{ skill }}</li>
        </ul>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(skill, idx) in f.skills.slice(0, 2)" :key="skill" class="text-sm">
            <div class="mb-1 flex justify-between">
              <span class="font-medium text-slate-800">{{ skill }}</span>
              <span class="text-slate-500">{{ skillLevel(idx) }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-200">
              <div class="rt-skill-bar-fill h-full rounded-full" :style="{ width: skillProgress(idx) + '%' }" />
            </div>
          </div>
        </div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.awards }}
          </div>
          <h2 class="rt-title mb-0"><span>荣誉证书</span></h2>
        </div>
        <ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
          <li v-for="item in f.honorList" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section v-if="f.summary" data-resume-module="basic" class="rt-section mb-5">
        <div class="mb-3 flex items-center gap-3 border-b border-slate-900 pb-2">
          <div class="rt-timeline-dot flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white">
            {{ sectionIcons.summary }}
          </div>
          <h2 class="rt-title mb-0"><span>自我评价</span></h2>
        </div>
        <p class="rt-text text-sm leading-relaxed text-slate-700">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
