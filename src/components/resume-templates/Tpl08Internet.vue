<!--
  AI简历风格模板 8（互联网扁平）
  布局：左侧深色边栏 + 右侧主内容区
  参考图一：头像、基本信息、技能进度条、二维码在左栏；求职意向、教育、工作、荣誉、评价、兴趣在右栏
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields, skillProgress, skillLevel } from './shared/useResumeFields.js'

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
  f.value.age || f.value.gender || f.value.origin || f.value.workYears || f.value.phone || f.value.email,
)

// 右侧求职意向区是否有数据
const hasJobIntention = computed(() =>
  f.value.targetPosition || f.value.targetCity || f.value.expectedSalary || f.value.entryTime,
)

// 兴趣爱好复用 skills 数据，以标签形式展示
const hobbies = computed(() => f.value.skills.slice(0, 6))
</script>

<template>
  <div
    class="relative flex min-h-full w-full flex-row overflow-hidden"
    :style="{
      fontFamily: 'var(--font-family, \'Microsoft YaHei\', sans-serif)',
      fontSize: 'var(--font-size, 13px)',
      lineHeight: 'var(--line-height, 1.7)',
      color: 'var(--font-content-color, #334155)',
    }"
  >
    <!-- 左侧边栏：头像、姓名、基本信息、技能、二维码 -->
    <aside
      class="flex w-[32%] flex-col gap-5 px-5 py-6 text-white"
      :style="{ background: 'var(--skin-header-bg, #475569)' }"
    >
      <!-- 头像：有上传才展示 -->
      <div v-if="f.avatar" class="flex flex-col items-center gap-3">
        <div class="h-24 w-24 overflow-hidden rounded-lg border-2 border-white/30">
          <img
            :src="f.avatar"
            alt="头像"
            class="h-full w-full object-cover"
          >
        </div>
        <h1 class="text-xl font-bold tracking-wider text-white" :style="{ color: '#ffffff' }">
          {{ f.name }}
        </h1>
      </div>
      <div v-else class="flex flex-col items-center gap-3">
        <h1 class="text-xl font-bold tracking-wider text-white" :style="{ color: '#ffffff' }">
          {{ f.name }}
        </h1>
      </div>

      <!-- 基本信息 -->
      <section v-if="hasSidebarBasic" class="flex flex-col gap-2 text-sm">
        <div v-if="f.age" class="flex items-center gap-2">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">龄</span>
          <span>{{ f.age }}岁</span>
        </div>
        <div v-if="f.gender" class="flex items-center gap-2">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">性</span>
          <span>{{ f.gender }}</span>
        </div>
        <div v-if="f.origin" class="flex items-center gap-2">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">籍</span>
          <span>{{ f.origin }}</span>
        </div>
        <div v-if="f.workYears" class="flex items-center gap-2">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">历</span>
          <span>{{ f.workYears }}年经验</span>
        </div>
        <div v-if="f.phone" class="flex items-center gap-2">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs">电</span>
          <span>{{ f.phone }}</span>
        </div>
        <div v-if="f.email" class="flex items-center gap-2 break-all">
          <span class="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">邮</span>
          <span>{{ f.email }}</span>
        </div>
      </section>

      <!-- 技能特长 -->
      <section v-if="showModule('skills') && f.skills.length" class="flex flex-col gap-3">
        <h2 class="border-b border-white/20 pb-1 text-base font-bold text-white">技能特长</h2>
        <div class="flex flex-col gap-3">
          <div v-for="(skill, idx) in f.skills" :key="skill" class="flex flex-col gap-1">
            <div class="flex justify-between text-xs text-white/90">
              <span>{{ skill }}</span>
              <span>{{ skillLevel(idx) }}</span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                class="h-full rounded-full"
                :style="{ width: skillProgress(idx) + '%', background: 'var(--skin-title-color, #60a5fa)' }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 个人微信二维码 -->
      <section class="mt-auto flex flex-col items-center gap-2 pt-2">
        <h2 class="text-sm font-bold text-white/90">个人微信</h2>
        <div class="h-24 w-24 overflow-hidden rounded bg-white p-1">
          <img v-if="f.qrCode" :src="f.qrCode" alt="微信二维码" class="h-full w-full object-contain">
          <div v-else class="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
            二维码
          </div>
        </div>
      </section>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="w-[68%] bg-white px-6 py-5">
      <!-- 求职意向 -->
      <section v-if="hasJobIntention" data-resume-module="basic" class="mb-5">
        <div
          class="mb-3 flex items-center gap-2 rounded-r-lg py-2 pr-4"
          :style="{ background: 'var(--skin-title-color, #3b82f6)' }"
        >
          <span class="ml-[-1px] flex h-7 w-7 items-center justify-center rounded bg-white/20 text-sm font-bold text-white">8</span>
          <h2 class="text-base font-bold text-white">求职意向</h2>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div v-if="f.targetPosition" class="flex gap-2">
            <span class="text-slate-500">求职意向：</span>
            <span class="font-medium text-slate-800">{{ f.targetPosition }}</span>
          </div>
          <div v-if="f.targetCity" class="flex gap-2">
            <span class="text-slate-500">意向城市：</span>
            <span class="font-medium text-slate-800">{{ f.targetCity }}</span>
          </div>
          <div v-if="f.expectedSalary" class="flex gap-2">
            <span class="text-slate-500">期望薪资：</span>
            <span class="font-medium text-slate-800">{{ f.expectedSalary }}</span>
          </div>
          <div v-if="f.entryTime" class="flex gap-2">
            <span class="text-slate-500">入职时间：</span>
            <span class="font-medium text-slate-800">{{ f.entryTime }}</span>
          </div>
        </div>
      </section>

      <!-- 教育背景 -->
      <section v-if="f.school" data-resume-module="basic" class="mb-5">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }"
          >教</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">教育背景</h2>
          <div class="ml-auto h-px flex-1 bg-slate-100" />
        </div>
        <div class="flex items-start justify-between gap-4 text-sm">
          <div class="font-bold text-slate-800">{{ f.school }}</div>
          <div class="text-slate-500">{{ f.education }}</div>
        </div>
        <div class="mt-1 text-sm text-slate-600">{{ f.major }}</div>
      </section>

      <!-- 工作经历 -->
      <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="mb-5">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }"
          >工</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">工作经历</h2>
          <div class="ml-auto h-px flex-1 bg-slate-100" />
        </div>
        <div v-for="item in f.internships" :key="item.company + item.start_date" class="mb-3">
          <div class="flex items-start justify-between gap-4 text-sm">
            <div class="font-bold text-slate-800">{{ item.company }}</div>
            <div class="text-nowrap text-slate-500">{{ item.start_date }} ~ {{ item.end_date }}</div>
          </div>
          <div v-if="item.position" class="mt-0.5 text-sm font-medium text-slate-600">{{ item.position }}</div>
          <p class="mt-1 text-sm leading-relaxed text-slate-700">{{ item.description }}</p>
        </div>
      </section>

      <!-- 项目经历 -->
      <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="mb-5">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }"
          >项</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">项目经历</h2>
          <div class="ml-auto h-px flex-1 bg-slate-100" />
        </div>
        <div v-for="item in f.projects" :key="item.name" class="mb-3">
          <div class="flex items-start justify-between gap-4 text-sm">
            <div class="font-bold text-slate-800">{{ item.name }}</div>
            <div class="text-nowrap text-slate-500">{{ item.start_date }} ~ {{ item.end_date }}</div>
          </div>
          <div v-if="item.role || item.tech_stack" class="mt-0.5 text-sm font-medium text-slate-600">
            {{ item.role }}<template v-if="item.tech_stack"> | {{ item.tech_stack }}</template>
          </div>
          <p class="mt-1 text-sm leading-relaxed text-slate-700">{{ item.description }}</p>
        </div>
      </section>

      <!-- 荣誉证书 -->
      <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="mb-5">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }"
          >荣</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">荣誉证书</h2>
          <div class="ml-auto h-px flex-1 bg-slate-100" />
        </div>
        <ul class="list-disc pl-5 text-sm leading-relaxed text-slate-700">
          <li v-for="item in f.honorList" :key="item">{{ item }}</li>
        </ul>
      </section>

      <!-- 自我评价 -->
      <section v-if="f.summary" data-resume-module="basic" class="mb-5">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }"
          >我</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">自我评价</h2>
          <div class="ml-auto h-px flex-1 bg-slate-100" />
        </div>
        <p class="text-sm leading-relaxed text-slate-700">{{ f.summary }}</p>
      </section>

      <!-- 兴趣爱好 -->
      <section v-if="hobbies.length" class="mb-5">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold"
            :style="{ color: 'var(--skin-title-color, #3b82f6)' }"
          >兴</span>
          <h2 class="text-base font-bold" :style="{ color: 'var(--skin-title-color, #1e293b)' }">兴趣爱好</h2>
          <div class="ml-auto h-px flex-1 bg-slate-100" />
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="item in hobbies"
            :key="item"
            class="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {{ item }}
          </span>
        </div>
      </section>
    </main>
  </div>
</template>
