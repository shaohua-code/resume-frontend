<!--
  AI简历风格模板 8（现代扁平）
  布局：左侧深色边栏 + 右侧主内容区
  参考图一：头像、基本信息、技能进度条、二维码在左栏；求职意向、教育、工作、荣誉、评价、兴趣在右栏
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields } from './shared/useResumeFields.js'
import { formatEducationDateRange } from '@/constants/resumeFieldSchema'

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

// 左侧边栏至少有一项基本信息才渲染列表
const hasSidebarBasic = computed(() =>
  f.value.basicInfoItems.length > 0 || f.value.age || f.value.gender,
)

// 右侧求职意向区是否有数据
const hasJobIntention = computed(() =>
  f.value.targetPosition || f.value.targetCity || f.value.expectedSalary || f.value.entryTime,
)

// 兴趣爱好复用 skills 数据，以标签形式展示
const hobbies = computed(() => [])
</script>

<template>
  <div class="relative flex flex-row w-full min-h-full resume-template rt-custom-08" :style="{
    fontFamily: 'var(--font-family, \'Microsoft YaHei\', sans-serif)',
    fontSize: 'var(--font-size, 13px)',
    lineHeight: 'var(--line-height, 1.7)',
    color: 'var(--font-content-color, #334155)',
  }">
    <!-- 左侧边栏：头像、姓名、基本信息、技能、二维码 -->
    <aside
      class="flex w-[33%] pl-[20px] flex-col gap-5 px-[var(--preview-padding,20px)] py-[calc(var(--page-top-gap,0px)+24px)] text-white"
      :style="{ background: 'var(--skin-header-bg, #475569)' }">
      <!-- 头像：有上传才展示 -->
      <div v-if="f.avatar" class="flex flex-col items-center gap-3">
        <div class="w-24 h-24 overflow-hidden border-2 rounded-lg border-white/30">
          <img :src="f.avatar" alt="头像" class="object-cover w-full h-full">
        </div>
        <h1 class="text-xl font-bold tracking-wider rt-name">
          {{ f.name }}
        </h1>
      </div>
      <div v-else class="flex flex-col items-center gap-3">
        <h1 class="text-xl font-bold tracking-wider rt-name">
          {{ f.name }}
        </h1>
      </div>

      <!-- 基本信息 -->
      <section v-if="hasSidebarBasic" data-resume-module="basic" class="flex flex-col gap-2 text-sm">
        <div v-if="f.age" class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/15">龄</span>
          <span class="rt-value">{{ f.age }}岁</span>
        </div>
        <div v-if="f.gender" class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/15">性</span>
          <span class="rt-value">{{ f.gender }}</span>
        </div>
        <div v-for="item in f.basicInfoItems" :key="item.key" class="flex items-center gap-2 break-all">
          <span
            class="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs rounded-full bg-white/15">{{
              item.label.slice(0, 1) }}</span>
          <span class="rt-value">{{ item.value }}</span>
        </div>
      </section>

      <!-- 技能特长 -->
      <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="flex flex-col gap-3">
        <h2 class="pb-1 text-base font-bold text-white border-b border-white/20">技能特长</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="skill in f.skills" :key="skill"
            class="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/90">
            {{ skill }}
          </span>
        </div>
      </section>



    </aside>

    <!-- 右侧主内容区 -->
    <main
      class="w-[67%] pl-[10px] bg-white px-[var(--preview-padding,16px)] pt-[var(--page-top-gap,0px)] pb-[var(--page-bottom-gap,0px)]">
      <!-- 求职意向 -->
      <section v-if="hasJobIntention" data-resume-module="basic" class="mb-5">
        <!-- 修复：添加 w-full 占满容器 + rounded 统一圆角 + pl-4 左内边距 -->
        <div class="flex items-center w-full gap-2 px-[var(--preview-padding,16px)] py-2 mb-3"
          :style="{ background: 'var(--skin-title-color, #3b82f6)' }">
          <span
            class="flex ml-[10px] items-center justify-center text-sm font-bold text-white rounded h-7 w-7 bg-white/20">基</span>
          <h2 class="text-base font-bold text-white">基础信息</h2>
        </div>
        <div class="grid grid-cols-2 text-sm gap-x-4 gap-y-2">
          <div v-if="f.targetPosition" class="flex gap-2">

            <span>求职意向：</span>
            <span>{{ f.targetPosition }}</span>
          </div>
          <div v-if="f.targetCity" class="flex gap-2">
            <span>意向城市：</span>
            <span>{{ f.targetCity }}</span>
          </div>
          <div v-if="f.expectedSalary" class="flex gap-2">
            <span>期望薪资：</span>
            <span>{{ f.expectedSalary }}</span>
          </div>
          <div v-if="f.entryTime" class="flex gap-2">
            <span>入职时间：</span>
            <span>{{ f.entryTime }}</span>
          </div>
        </div>
      </section>

      <!-- 教育背景 -->
      <section v-if="showModule('educations') && f.educations.length" data-resume-module="educations" class="mb-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="flex items-center justify-center w-6 h-6 text-sm font-bold rounded bg-slate-100"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }">教</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">教育背景</h2>
          <div class="flex-1 h-px ml-auto bg-slate-100" />
        </div>
        <div v-for="(edu, idx) in f.educations" :key="idx" class="mb-3">
          <div class="flex items-start justify-between gap-4 text-sm">
            <div class="font-bold text-slate-800">{{ edu.school }}</div>
            <div v-if="formatEducationDateRange(edu)" class="text-slate-500">{{ formatEducationDateRange(edu) }}</div>
          </div>
          <div v-if="edu.degree || edu.major" class="mt-1 text-sm text-slate-600">{{ [edu.degree,
          edu.major].filter(Boolean).join(' · ') }}</div>
        </div>
      </section>

      <!-- 实习经历（学生兼职/实习） -->
      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="mb-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="flex items-center justify-center w-6 h-6 text-sm font-bold rounded bg-slate-100"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }">实</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">实习经历</h2>
          <div class="flex-1 h-px ml-auto bg-slate-100" />
        </div>
        <div v-for="item in f.internships" :key="item.company + item.start_date" class="mb-3">
          <div class="flex items-start justify-between gap-4 text-sm">
            <div class="font-bold text-slate-800">{{ item.company }}</div>
            <div class="text-nowrap text-slate-500">{{ item.start_date }} ~ {{ item.end_date }}</div>
          </div>
          <div v-if="item.position" class="mt-0.5 text-sm font-medium text-slate-600">{{ item.position }}</div>
          <p class="mt-1 text-sm leading-relaxed break-all rt-desc rt-preserve-text text-slate-700">{{ item.description
            }}</p>
        </div>
      </section>

      <!-- 工作经历（正式全职工作） -->
      <section v-if="showModule('work_experience') && f.workExperiences.length" data-resume-module="work_experience"
        class="mb-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="flex items-center justify-center w-6 h-6 text-sm font-bold rounded bg-slate-100"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }">工</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">工作经历</h2>
          <div class="flex-1 h-px ml-auto bg-slate-100" />
        </div>
        <div v-for="(exp, idx) in f.workExperiences" :key="idx + (exp.company || '')" class="mb-3">
          <div class="flex items-start justify-between gap-4 text-sm">
            <div class="font-bold text-slate-800">{{ exp.company }}</div>
            <div class="text-nowrap text-slate-500">{{ exp.start_date }} ~ {{ exp.end_date }}</div>
          </div>
          <div v-if="exp.position || exp.department" class="mt-0.5 text-sm font-medium text-slate-600">
            {{ exp.position }}<template v-if="exp.department"> · {{ exp.department }}</template>
          </div>
          <p class="mt-1 text-sm leading-relaxed break-all rt-desc rt-preserve-text text-slate-700">{{ exp.description
          }}</p>
        </div>
      </section>

      <!-- 项目经历 -->
      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="mb-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="flex items-center justify-center w-6 h-6 text-sm font-bold rounded bg-slate-100"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }">项</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">项目经历</h2>
          <div class="flex-1 h-px ml-auto bg-slate-100" />
        </div>
        <div v-for="item in f.projects" :key="item.name" class="mb-3">
          <div class="flex items-start justify-between gap-4 text-sm">
            <div class="font-bold text-slate-800">{{ item.name }}</div>
            <div class="text-nowrap text-slate-500">{{ item.start_date }} ~ {{ item.end_date }}</div>
          </div>
          <div v-if="item.role || item.tech_stack" class="mt-0.5 text-sm font-medium text-slate-600">
            {{ item.role }}<template v-if="item.tech_stack"> | {{ item.tech_stack }}</template>
          </div>
          <p class="mt-1 text-sm leading-relaxed break-all rt-desc rt-preserve-text text-slate-700">{{ item.description
            }}</p>
        </div>
      </section>

      <!-- 荣誉证书 -->
      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="mb-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="flex items-center justify-center w-6 h-6 text-sm font-bold rounded bg-slate-100"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }">荣</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">荣誉证书</h2>
          <div class="flex-1 h-px ml-auto bg-slate-100" />
        </div>
        <ul class="pl-5 text-sm leading-relaxed list-disc text-slate-700">
          <li v-for="item in f.honorList" :key="item" class="break-all rt-preserve-text">{{ item }}</li>
        </ul>
      </section>

      <!-- 自我评价 -->
      <section v-if="f.summary" data-resume-module="basic" class="mb-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="flex items-center justify-center w-6 h-6 text-sm font-bold rounded bg-slate-100"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }">我</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">自我评价</h2>
          <div class="flex-1 h-px ml-auto bg-slate-100" />
        </div>
        <p class="text-sm leading-relaxed break-all rt-text rt-preserve-text text-slate-700">{{ f.summary }}</p>
      </section>

      <!-- 兴趣爱好 -->
      <section v-if="showModule('skills') && hobbies.length" data-resume-module="skills" class="mb-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="flex items-center justify-center w-6 h-6 text-sm font-bold rounded bg-slate-100"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }">兴</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">兴趣爱好</h2>
          <div class="flex-1 h-px ml-auto bg-slate-100" />
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="item in hobbies" :key="item"
            class="px-3 py-1 text-xs font-medium border rounded-full border-slate-200 text-slate-600">
            {{ item }}
          </span>
        </div>
      </section>
    </main>
  </div>
</template>

<style src="./shared/resumeTemplateBase.css"></style>
<style src="./shared/templateCustom.css"></style>
<style scoped>
.rt-custom-08::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 33%;
  height: 100000px;
  background: var(--skin-header-bg, #475569);
  pointer-events: none;
}

.rt-custom-08>aside,
.rt-custom-08>main {
  position: relative;
  z-index: 1;
}

.rt-custom-08>aside {
  background: transparent !important;
}
</style>
