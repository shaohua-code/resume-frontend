<!--
  模板 02 - 商务经典（全民简历风格）
  顶部蓝色 header + 白色主体 + 蓝色章节标题
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields, skillProgress, skillLevel } from './shared/useResumeFields.js'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] }
})

const f = computed(() => useResumeFields(props.resume))

// 头像地址，无头像时显示姓名首字母占位
const avatarUrl = computed(() => props.resume?.avatar || '')
const avatarText = computed(() => (f.value.name || '姓').charAt(0))

// 顶部个人信息行：年龄 / 城市 / 目标岗位 / 工作年限
const infoLine = computed(() => {
  const items = []
  if (props.resume?.age) items.push(`${props.resume.age}岁`)
  if (props.resume?.city) items.push(props.resume.city)
  if (f.value.targetPosition) items.push(f.value.targetPosition)
  if (props.resume?.work_years) items.push(`${props.resume.work_years}年经验`)
  return items.length ? items.join(' | ') : ''
})

// 工作经历描述按换行拆分为 bullet points
function formatDesc(desc) {
  if (!desc) return []
  return String(desc)
    .split(/\n|(?:\d+[\.、])|(?<=[。；;])/)
    .map(s => s.trim())
    .filter(Boolean)
}

// 根据编辑器开关控制模块显隐
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
  <div class="w-full bg-white text-slate-800">
    <!-- 顶部蓝色 header -->
    <header class="flex items-start justify-between gap-6 bg-[#1677ff] px-8 py-7 text-white">
      <div class="flex-1 min-w-0">
        <h1 class="text-3xl font-bold tracking-widest mb-3">{{ f.name }}</h1>
        <p v-if="infoLine" class="text-sm text-white/90 mb-4">{{ infoLine }}</p>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
          <div v-if="f.phone" class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs">📞</span>
            <span>{{ f.phone }}</span>
          </div>
          <div v-if="f.email" class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs">✉️</span>
            <span>{{ f.email }}</span>
          </div>
        </div>
      </div>
      <div class="shrink-0">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="avatar"
          class="w-24 h-32 object-cover border-4 border-white/90 shadow-md bg-white"
        />
     
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="px-8 py-6">
      <!-- 教育背景 -->
      <section v-if="f.school" class="mb-5">
        <h2 class="text-base font-bold text-[#1677ff] border-b-2 border-[#1677ff] pb-1 mb-3">教育背景</h2>
        <div class="mb-2">
          <div class="flex justify-between items-baseline text-sm">
            <strong class="text-slate-900">{{ f.school }}</strong>
            <span v-if="f.education" class="text-slate-700">{{ f.education }}</span>
          </div>
          <p v-if="f.major" class="text-sm text-slate-700 mt-1">{{ f.major }}</p>
        </div>
      </section>

      <!-- 工作经历 -->
      <section v-if="showModule('internships') && f.internships.length" class="mb-5">
        <h2 class="text-base font-bold text-[#1677ff] border-b-2 border-[#1677ff] pb-1 mb-3">工作经历</h2>
        <div v-for="intern in f.internships" :key="intern.company + intern.start_date" class="mb-4">
          <div class="flex justify-between items-baseline text-sm mb-1">
            <strong class="text-slate-900">{{ intern.company }}</strong>
            <span class="text-slate-600 whitespace-nowrap">{{ intern.start_date }} ~ {{ intern.end_date }}</span>
          </div>
          <p v-if="intern.position" class="text-sm text-slate-700 mb-1.5">{{ intern.position }}</p>
          <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-0.5">
            <li v-for="(line, idx) in formatDesc(intern.description)" :key="idx">{{ line }}</li>
          </ul>
        </div>
      </section>

      <!-- 项目经历 -->
      <section v-if="showModule('projects') && f.projects.length" class="mb-5">
        <h2 class="text-base font-bold text-[#1677ff] border-b-2 border-[#1677ff] pb-1 mb-3">项目经历</h2>
        <div v-for="proj in f.projects" :key="proj.name" class="mb-4">
          <div class="flex justify-between items-baseline text-sm mb-1">
            <strong class="text-slate-900">{{ proj.name }}</strong>
            <span class="text-slate-600 whitespace-nowrap">{{ proj.start_date }} ~ {{ proj.end_date }}</span>
          </div>
          <p v-if="proj.role || proj.tech_stack" class="text-sm text-slate-700 mb-1.5">
            {{ proj.role }}<template v-if="proj.tech_stack"> | {{ proj.tech_stack }}</template>
          </p>
          <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-0.5">
            <li v-for="(line, idx) in formatDesc(proj.description)" :key="idx">{{ line }}</li>
          </ul>
        </div>
      </section>

      <!-- 技能特长 -->
      <section v-if="showModule('skills') && f.skills.length" class="mb-5">
        <h2 class="text-base font-bold text-[#1677ff] border-b-2 border-[#1677ff] pb-1 mb-3">技能特长</h2>
        <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-1 mb-3">
          <li v-for="skill in f.skills" :key="skill">{{ skill }}</li>
        </ul>
        <!-- 前两项技能展示进度条 -->
        <div class="grid grid-cols-2 gap-4 mt-3">
          <div v-for="(skill, idx) in f.skills.slice(0, 2)" :key="skill" class="text-sm">
            <div class="flex justify-between mb-1">
              <span class="font-medium text-slate-800">{{ skill }}</span>
              <span class="text-slate-500">{{ skillLevel(idx) }}</span>
            </div>
            <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-[#1677ff] rounded-full"
                :style="{ width: skillProgress(idx) + '%' }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 荣誉证书 -->
      <section v-if="showModule('awards') && f.honorList.length" class="mb-5">
        <h2 class="text-base font-bold text-[#1677ff] border-b-2 border-[#1677ff] pb-1 mb-3">荣誉证书</h2>
        <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-1">
          <li v-for="item in f.honorList" :key="item">{{ item }}</li>
        </ul>
      </section>

      <!-- 自我评价 -->
      <section v-if="f.summary" class="mb-5">
        <h2 class="text-base font-bold text-[#1677ff] border-b-2 border-[#1677ff] pb-1 mb-3">自我评价</h2>
        <p class="text-sm text-slate-700 leading-relaxed">{{ f.summary }}</p>
      </section>
    </main>
  </div>
</template>
