<!--
  模板 02 - 商务经典（全民简历风格）
  顶部色带 + 白色主体 + 皮肤可定制模块标题
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

const infoLine = computed(() => {
  const items = []
  if (props.resume?.age) items.push(`${props.resume.age}岁`)
  if (props.resume?.city) items.push(props.resume.city)
  if (f.value.targetPosition) items.push(f.value.targetPosition)
  if (props.resume?.work_years) items.push(`${props.resume.work_years}年经验`)
  return items.length ? items.join(' | ') : ''
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
</script>

<template>
  <div class="resume-template rt-custom-02 w-full bg-white">
    <header data-resume-module="basic" class="rt-top-band flex items-start justify-between gap-6 px-8 py-7">
      <div class="min-w-0 flex-1">
        <h1 class="rt-name mb-3 text-3xl font-bold tracking-widest">{{ f.name }}</h1>
        <p v-if="infoLine" class="rt-slogan mb-4 text-sm">{{ infoLine }}</p>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div v-if="f.phone" class="flex items-center gap-1.5">
            <span class="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-xs">📞</span>
            <span class="rt-value">{{ f.phone }}</span>
          </div>
          <div v-if="f.email" class="flex items-center gap-1.5">
            <span class="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-xs">✉️</span>
            <span class="rt-value">{{ f.email }}</span>
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
    </header>

    <main class="px-8 py-6">
      <section v-if="f.school" data-resume-module="basic" class="rt-section mb-5">
        <h2 class="rt-title"><span>教育背景</span></h2>
        <div class="rt-item mb-2">
          <div class="rt-item-header">
            <strong>{{ f.school }}</strong>
            <span v-if="f.education">{{ f.education }}</span>
          </div>
          <p v-if="f.major" class="rt-text">{{ f.major }}</p>
        </div>
      </section>

      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section mb-5">
        <h2 class="rt-title"><span>工作经历</span></h2>
        <div v-for="intern in f.internships" :key="intern.company + intern.start_date" class="rt-item mb-4">
          <div class="rt-item-header">
            <strong>{{ intern.company }}</strong>
            <span>{{ intern.start_date }} ~ {{ intern.end_date }}</span>
          </div>
          <p v-if="intern.position" class="rt-sub">{{ intern.position }}</p>
          <ul class="rt-list list-disc space-y-0.5 pl-5 text-sm leading-relaxed">
            <li v-for="(line, idx) in formatDesc(intern.description)" :key="idx">{{ line }}</li>
          </ul>
        </div>
      </section>

      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section mb-5">
        <h2 class="rt-title"><span>项目经历</span></h2>
        <div v-for="proj in f.projects" :key="proj.name" class="rt-item mb-4">
          <div class="rt-item-header">
            <strong>{{ proj.name }}</strong>
            <span>{{ proj.start_date }} ~ {{ proj.end_date }}</span>
          </div>
          <p v-if="proj.role || proj.tech_stack" class="rt-sub">
            {{ proj.role }}<template v-if="proj.tech_stack"> | {{ proj.tech_stack }}</template>
          </p>
          <ul class="rt-list list-disc space-y-0.5 pl-5 text-sm leading-relaxed">
            <li v-for="(line, idx) in formatDesc(proj.description)" :key="idx">{{ line }}</li>
          </ul>
        </div>
      </section>

      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section mb-5">
        <h2 class="rt-title"><span>技能特长</span></h2>
        <ul class="rt-list mb-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li v-for="skill in f.skills" :key="skill">{{ skill }}</li>
        </ul>
        <div class="mt-3 grid grid-cols-2 gap-4">
          <div v-for="(skill, idx) in f.skills.slice(0, 2)" :key="skill" class="text-sm">
            <div class="mb-1 flex justify-between">
              <span class="font-medium">{{ skill }}</span>
              <span class="rt-sub">{{ skillLevel(idx) }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                class="rt-skill-bar-fill h-full rounded-full"
                :style="{ width: skillProgress(idx) + '%' }"
              />
            </div>
          </div>
        </div>
      </section>

      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section mb-5">
        <h2 class="rt-title"><span>荣誉证书</span></h2>
        <ul class="rt-list list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li v-for="item in f.honorList" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section v-if="f.summary" data-resume-module="basic" class="rt-section mb-5">
        <h2 class="rt-title"><span>自我评价</span></h2>
        <p class="rt-text text-sm leading-relaxed">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style src="./shared/templateCustom.css"></style>
