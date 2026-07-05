<!--
  模板 04 - 左右时间轴（全民简历风格三）
  深蓝 header + 左侧时间轴竖线 + 圆形图标章节标题
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

// 顶部求职意向信息行
const jobLine = computed(() => {
  const items = []
  if (f.value.targetPosition) items.push(`求职意向：${f.value.targetPosition}`)
  if (props.resume?.city) items.push(props.resume.city)
  if (props.resume?.salary) items.push(props.resume.salary)
  if (props.resume?.entry_time) items.push(props.resume.entry_time)
  return items.length ? items.join(' | ') : ''
})

// 顶部基本信息网格
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

// 章节图标映射
const sectionIcons = {
  education: '🎓',
  internships: '💼',
  projects: '🏫',
  skills: '⚙️',
  awards: '🏅',
  summary: '👤'
}
</script>

<template>
  <div class="w-full bg-[#eef2f6] text-slate-800">
    <!-- 顶部深蓝 header -->
    <header class="bg-[#2c5f8e] px-8 py-7 text-white">
      <div class="flex items-start justify-between gap-6 mb-5">
        <div class="flex-1 min-w-0">
          <h1 class="text-3xl font-bold tracking-widest mb-3">{{ f.name }}</h1>
          <p v-if="jobLine" class="text-sm text-white/90">{{ jobLine }}</p>
        </div>
        <div class="shrink-0">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="avatar"
            class="w-24 h-32 object-cover border-4 border-white/90 shadow-md bg-white"
          />
         
        </div>
      </div>
      <!-- 基本信息网格 -->
      <div v-if="basicGrid.length" class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-white/90">
        <div v-for="(item, idx) in basicGrid" :key="idx" class="flex items-center gap-2">
          <span class="text-white/70">{{ item.label }}：</span>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </header>

    <!-- 主体内容：带时间轴竖线 -->
    <main class="px-8 py-6">
      <!-- 教育背景 -->
      <section v-if="f.school" class="relative mb-5 pl-10 border-l-2 border-[#2c5f8e]/30">
        <div class="absolute left-0 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-[#2c5f8e] flex items-center justify-center text-white text-sm font-bold">
          {{ sectionIcons.education }}
        </div>
        <h2 class="text-base font-bold text-[#2c5f8e] mb-3">教育背景</h2>
        <div class="mb-2">
          <div class="flex justify-between items-baseline text-sm mb-1">
            <strong class="text-slate-900">{{ f.school }}</strong>
            <span class="text-slate-600 whitespace-nowrap">2012-09 ~ 2016-07</span>
          </div>
          <p v-if="f.major" class="text-sm text-slate-700">{{ f.major }}</p>
          <p v-if="f.education" class="text-sm text-slate-700">{{ f.education }}</p>
        </div>
      </section>

      <!-- 工作经历 -->
      <section v-if="showModule('internships') && f.internships.length" class="relative mb-5 pl-10 border-l-2 border-[#2c5f8e]/30">
        <div class="absolute left-0 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-[#2c5f8e] flex items-center justify-center text-white text-sm font-bold">
          {{ sectionIcons.internships }}
        </div>
        <h2 class="text-base font-bold text-[#2c5f8e] mb-3">工作经历</h2>
        <div class="space-y-3">
          <div v-for="intern in f.internships" :key="intern.company + intern.start_date">
            <div class="flex justify-between items-baseline text-sm mb-1">
              <strong class="text-slate-900">{{ intern.company }}</strong>
              <span class="text-slate-600 whitespace-nowrap">{{ intern.start_date }} ~ {{ intern.end_date }}</span>
            </div>
            <p v-if="intern.position" class="text-sm text-slate-700 mb-1.5">{{ intern.position }}</p>
            <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-0.5">
              <li v-for="(line, idx) in formatDesc(intern.description)" :key="idx">{{ line }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 项目经历 -->
      <section v-if="showModule('projects') && f.projects.length" class="relative mb-5 pl-10 border-l-2 border-[#2c5f8e]/30">
        <div class="absolute left-0 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-[#2c5f8e] flex items-center justify-center text-white text-sm font-bold">
          {{ sectionIcons.projects }}
        </div>
        <h2 class="text-base font-bold text-[#2c5f8e] mb-3">项目经历</h2>
        <div class="space-y-3">
          <div v-for="proj in f.projects" :key="proj.name">
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
        </div>
      </section>

      <!-- 技能特长 -->
      <section v-if="showModule('skills') && f.skills.length" class="relative mb-5 pl-10 border-l-2 border-[#2c5f8e]/30">
        <div class="absolute left-0 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-[#2c5f8e] flex items-center justify-center text-white text-sm font-bold">
          {{ sectionIcons.skills }}
        </div>
        <h2 class="text-base font-bold text-[#2c5f8e] mb-3">技能特长</h2>
        <div>
          <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-1 mb-3">
            <li v-for="skill in f.skills" :key="skill">{{ skill }}</li>
          </ul>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(skill, idx) in f.skills.slice(0, 2)" :key="skill" class="text-sm">
              <div class="flex justify-between mb-1">
                <span class="font-medium text-slate-800">{{ skill }}</span>
                <span class="text-slate-500">{{ skillLevel(idx) }}</span>
              </div>
              <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-[#2c5f8e] rounded-full" :style="{ width: skillProgress(idx) + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 荣誉证书 -->
      <section v-if="showModule('awards') && f.honorList.length" class="relative mb-5 pl-10 border-l-2 border-[#2c5f8e]/30">
        <div class="absolute left-0 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-[#2c5f8e] flex items-center justify-center text-white text-sm font-bold">
          {{ sectionIcons.awards }}
        </div>
        <h2 class="text-base font-bold text-[#2c5f8e] mb-3">荣誉证书</h2>
        <div>
          <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-1">
            <li v-for="item in f.honorList" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <!-- 自我评价 -->
      <section v-if="f.summary" class="relative mb-5 pl-10 border-l-2 border-[#2c5f8e]/30">
        <div class="absolute left-0 top-0 -translate-x-1/2 w-7 h-7 rounded-full bg-[#2c5f8e] flex items-center justify-center text-white text-sm font-bold">
          {{ sectionIcons.summary }}
        </div>
        <h2 class="text-base font-bold text-[#2c5f8e] mb-3">自我评价</h2>
        <div>
          <p class="text-sm text-slate-700 leading-relaxed">{{ f.summary }}</p>
        </div>
      </section>
    </main>
  </div>
</template>
