<!--
  模板 02 - 商务经典（全民简历风格）
  顶部色带 + 白色主体 + 皮肤可定制模块标题
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields, skillProgress, skillLevel } from './shared/useResumeFields.js'
import { formatEducationDateRange } from '@/constants/resumeFieldSchema'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))
const avatarUrl = computed(() => f.value.avatar)

// 顶栏岗位行：单独展示，颜色跟随姓名（rt-name-sub）
const positionLine = computed(() => f.value.targetPosition || '')

// 顶栏其他信息：年龄/城市/经验等，不走姓名色
const metaLine = computed(() => {
  const items = []
  if (props.resume?.age) items.push(`${props.resume.age}岁`)
  if (f.value.workYears) items.push(`${f.value.workYears}年经验`)
  if (f.value.nativePlace) items.push(f.value.nativePlace)
  if (f.value.maritalStatus) items.push(f.value.maritalStatus)
  return items.length ? items.join(' | ') : ''
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

// 顶栏已单独展示电话/邮箱，此处过滤避免重复
const extendedBasicItems = computed(() =>
  f.value.basicInfoItems.filter((item) => !['phone', 'email'].includes(item.key)),
)
</script>

<template>
  <div class="resume-template rt-custom-02 w-full bg-white">
    <header data-resume-module="basic" class="rt-top-band flex items-start justify-between gap-6 px-8 py-7">
      <div class="min-w-0 flex-1">
        <h1 class="rt-name mb-3 text-3xl font-bold tracking-widest">{{ f.name }}</h1>
        <p v-if="positionLine" class="rt-slogan rt-name-sub mb-2 text-sm">{{ positionLine }}</p>
        <p v-if="metaLine" class="rt-slogan mb-4 text-sm">{{ metaLine }}</p>
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
        <div v-if="extendedBasicItems.length" class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div v-for="item in extendedBasicItems" :key="item.key" class="flex gap-1">
            <span class="rt-label shrink-0">{{ item.label }}：</span>
            <span class="rt-value">{{ item.value }}</span>
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
      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="rt-section mb-5">
        <h2 class="rt-title"><span>教育背景</span></h2>
        <div v-for="(edu, idx) in f.educations" :key="idx" class="rt-item mb-2">
          <div class="rt-item-header">
            <strong>{{ edu.school }}</strong>
            <span v-if="formatEducationDateRange(edu)">{{ formatEducationDateRange(edu) }}</span>
          </div>
          <p v-if="edu.degree || edu.major" class="rt-text">{{ [edu.degree, edu.major].filter(Boolean).join(' · ') }}</p>
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
          <p v-if="intern.description" class="rt-desc rt-preserve-text">{{ intern.description }}</p>
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
          <p v-if="proj.description" class="rt-desc rt-preserve-text">{{ proj.description }}</p>
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
          <li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li>
        </ul>
      </section>

      <section v-if="f.summary" data-resume-module="basic" class="rt-section mb-5">
        <h2 class="rt-title"><span>自我评价</span></h2>
        <p class="rt-text rt-preserve-text text-sm leading-relaxed">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style src="./shared/templateCustom.css"></style>
