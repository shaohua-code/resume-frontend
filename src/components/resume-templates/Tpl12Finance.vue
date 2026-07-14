<!--
  AI简历风格模板 12（金融会计）
  布局：顶部蓝色头部 + 下方时间轴内容区
  参考图二：圆形头像、姓名、双行基本信息；教育/实习/技能/荣誉/评价以左侧图标时间轴展示
-->
<script setup>
import { computed } from 'vue'
import { GraduationCap, Briefcase, Wrench, Award, User } from 'lucide-vue-next'
import { useResumeFields } from './shared/useResumeFields.js'
import { formatEducationDateRange, formatEducationDetail } from '@/constants/resumeFieldSchema'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))

// 根据编辑器顶部开关控制预览模块显隐，未配置时默认显示
const moduleVisibleMap = computed(() => {
  return props.visibleModules.reduce((map, item) => {
    map[item.key] = item.visible !== false
    return map
  }, {})
})

function showModule(key) {
  return moduleVisibleMap.value[key] !== false
}

// 顶部第一行：岗位、意向城市、期望薪资、入职时间
const headerLine1 = computed(() =>
  [f.value.targetPosition, f.value.targetCity, f.value.expectedSalary, f.value.entryTime].filter(Boolean).join('  |  '),
)

// 顶部第二行：扩展基本信息（电话、邮箱、工作年限等）
const headerLine2 = computed(() => {
  const parts = []
  if (f.value.age) parts.push(`${f.value.age}岁`)
  if (f.value.gender) parts.push(f.value.gender)
  f.value.basicInfoItems.forEach((item) => parts.push(item.value))
  return parts.filter(Boolean).join('  |  ')
})

// 时间轴模块配置：图标 + 标题 + 数据
const timelineModules = computed(() => [
  {
    key: 'education',
    title: '教育背景',
    icon: GraduationCap,
    show: showModule('educations') && f.value.educations.length,
    data: 'education',
  },
  {
    key: 'work_experience',
    title: '工作经历',
    icon: Briefcase,
    show: showModule('work_experience') && f.value.workExperiences.length,
    data: 'work_experience',
  },
  {
    key: 'internships',
    title: '实习经历',
    icon: Briefcase,
    show: showModule('internships') && f.value.internships.length,
    data: 'internships',
  },
  {
    key: 'projects',
    title: '项目经历',
    icon: Briefcase,
    show: showModule('projects') && f.value.projects.length,
    data: 'projects',
  },
  {
    key: 'skills',
    title: '技能特长',
    icon: Wrench,
    show: showModule('skills') && f.value.skills.length,
    data: 'skills',
  },
  {
    key: 'awards',
    title: '荣誉证书',
    icon: Award,
    show: showModule('awards') && f.value.honorList.length,
    data: 'awards',
  },
  {
    key: 'summary',
    title: '自我评价',
    icon: User,
    show: !!f.value.summary,
    data: 'summary',
  },
])
</script>

<template>
  <div
    class="resume-template rt-custom-12 relative flex min-h-full w-full flex-col bg-white"
    :style="{
      fontFamily: 'var(--font-family, \'Microsoft YaHei\', sans-serif)',
      fontSize: 'var(--font-size, 13px)',
      lineHeight: 'var(--line-height, 1.7)',
      color: 'var(--font-content-color, #334155)',
    }"
  >
    <!-- 顶部蓝色头部 -->
    <header
      data-resume-module="basic"
      class="flex flex-col items-center gap-3 px-6 py-8 text-center text-white"
      :style="{ background: 'var(--skin-header-bg, #5b9bd5)' }"
    >
      <!-- 圆形头像：有上传才展示 -->
      <div
        v-if="f.avatar"
        class="h-20 w-20 overflow-hidden rounded-full border-4 border-white/30"
      >
        <img
          :src="f.avatar"
          alt="头像"
          class="h-full w-full object-cover"
        >
      </div>

      <!-- 姓名 -->
      <h1 class="rt-name text-2xl font-bold tracking-widest">
        {{ f.name }}
      </h1>

      <!-- 基本信息行：内容值跟随基本信息内容颜色 -->
      <p v-if="headerLine1" class="rt-value text-sm font-medium">{{ headerLine1 }}</p>
      <p v-if="headerLine2" class="rt-value text-xs">{{ headerLine2 }}</p>
    </header>

    <!-- 下方时间轴内容区 -->
    <main class="flex-1 px-8 py-6">
      <div
        v-for="mod in timelineModules"
        :key="mod.key"
        v-show="mod.show"
        :data-resume-module="mod.key === 'education' ? 'educations' : mod.key === 'summary' ? 'basic' : mod.key"
        class="rt-section relative flex gap-4 pb-5"
      >
        <!-- 左侧时间轴：图标 + 竖线 -->
        <div class="relative flex flex-col items-center">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full text-white"
            :style="{ background: 'var(--skin-title-color, #5b9bd5)' }"
          >
            <component :is="mod.icon" class="h-4 w-4" />
          </div>
          <div
            v-if="mod.key !== 'summary'"
            class="mt-1 w-px flex-1"
            :style="{ background: 'var(--skin-divider-color, #e2e8f0)' }"
          />
        </div>

        <!-- 右侧内容 -->
        <div class="flex-1 pt-0.5">
          <h2
            class="mb-2 text-base font-bold"
            :style="{ color: 'var(--skin-title-color, #1e293b)' }"
          >
            {{ mod.title }}
          </h2>

          <!-- 教育背景 -->
          <template v-if="mod.key === 'education'">
            <div v-for="(edu, idx) in f.educations" :key="idx" class="rt-item mb-3">
              <div class="flex items-start justify-between gap-4 text-sm">
                <div class="font-bold text-slate-800">{{ edu.school }}</div>
                <div v-if="formatEducationDateRange(edu)" class="text-nowrap text-slate-500">{{ formatEducationDateRange(edu) }}</div>
              </div>
              <div v-if="formatEducationDetail(edu)" class="mt-0.5 text-sm text-slate-600">{{ formatEducationDetail(edu) }}</div>
            </div>
          </template>

          <!-- 实习经历 -->
          <template v-else-if="mod.key === 'internships'">
            <div v-for="item in f.internships" :key="item.company + item.start_date" class="rt-item mb-3">
              <div class="flex items-start justify-between gap-4 text-sm">
                <div class="font-bold text-slate-800">{{ item.company }}</div>
                <div class="text-nowrap text-slate-500">{{ item.start_date }} ~ {{ item.end_date }}</div>
              </div>
              <div v-if="item.position" class="mt-0.5 text-sm font-medium text-slate-600">{{ item.position }}</div>
              <p class="rt-desc rt-preserve-text break-all mt-1 text-sm leading-relaxed text-slate-700">{{ item.description }}</p>
            </div>
          </template>

          <!-- 正式工作经历 -->
          <template v-else-if="mod.key === 'work_experience'">
            <div v-for="(item, idx) in f.workExperiences" :key="idx + (item.company || '')" class="rt-item mb-3">
              <div class="flex items-start justify-between gap-4 text-sm">
                <div class="font-bold text-slate-800">{{ item.company }}</div>
                <div class="text-nowrap text-slate-500">{{ item.start_date }} ~ {{ item.end_date }}</div>
              </div>
              <div v-if="item.position || item.department" class="mt-0.5 text-sm font-medium text-slate-600">
                {{ item.position }}<template v-if="item.department"> · {{ item.department }}</template>
              </div>
              <p v-if="item.description" class="rt-desc rt-preserve-text mt-1 break-all text-sm leading-relaxed text-slate-700">{{ item.description }}</p>
            </div>
          </template>

          <!-- 项目经历 -->
          <template v-else-if="mod.key === 'projects'">
            <div v-for="item in f.projects" :key="item.name" class="rt-item mb-3">
              <div class="flex items-start justify-between gap-4 text-sm">
                <div class="font-bold text-slate-800">{{ item.name }}</div>
                <div class="text-nowrap text-slate-500">{{ item.start_date }} ~ {{ item.end_date }}</div>
              </div>
              <div v-if="item.role || item.tech_stack" class="mt-0.5 text-sm font-medium text-slate-600">
                {{ item.role }}<template v-if="item.tech_stack"> | {{ item.tech_stack }}</template>
              </div>
              <p class="rt-desc rt-preserve-text break-all mt-1 text-sm leading-relaxed text-slate-700">{{ item.description }}</p>
            </div>
          </template>

          <!-- 技能特长 -->
          <template v-else-if="mod.key === 'skills'">
            <div class="flex flex-wrap gap-2">
              <span v-for="skill in f.skills" :key="skill" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                {{ skill }}
              </span>
            </div>
          </template>

          <!-- 荣誉证书 -->
          <template v-else-if="mod.key === 'awards'">
            <ul class="rt-list list-disc pl-5 text-sm leading-relaxed text-slate-700">
              <li v-for="item in f.honorList" :key="item" class="rt-preserve-text break-all">{{ item }}</li>
            </ul>
          </template>

          <!-- 自我评价 -->
          <template v-else-if="mod.key === 'summary'">
            <p class="rt-text rt-preserve-text break-all text-sm leading-relaxed text-slate-700">{{ f.summary }}</p>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style src="./shared/templateCustom.css"></style>
