<!--
  模板 10 - 销售市场（全民简历风格四）
  白色 header + 深灰图标 + 黑色下划线章节标题
  无头像时不显示头像占位区域
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields, skillProgress, skillLevel } from './shared/useResumeFields.js'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  visibleModules: { type: Array, default: () => [] }
})

const f = computed(() => useResumeFields(props.resume))

// 头像地址
const avatarUrl = computed(() => props.resume?.avatar || '')

// 左侧求职信息
const jobInfo = computed(() => {
  const list = []
  if (f.value.targetPosition) list.push({ label: '求职意向', value: f.value.targetPosition })
  if (props.resume?.city) list.push({ label: '意向城市', value: props.resume.city })
  if (props.resume?.salary) list.push({ label: '期望薪资', value: props.resume.salary })
  if (props.resume?.entry_time) list.push({ label: '入职时间', value: props.resume.entry_time })
  return list
})

// 右侧基本信息
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
  <div class="w-full bg-[#f5f7fa] text-slate-800">
    <!-- 顶部白色 header -->
    <header class="bg-white px-8 py-6 border-b border-slate-200">
      <div class="flex items-start justify-between gap-8">
        <!-- 左侧：姓名 + 求职信息 -->
        <div class="flex-1 min-w-0">
          <h1 class="text-3xl font-bold tracking-widest text-slate-900 mb-4">{{ f.name }}</h1>
          <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div v-for="(item, idx) in jobInfo" :key="idx" class="flex items-center gap-2">
              <span class="text-slate-500">{{ item.label }}：</span>
              <span class="text-slate-800">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <!-- 右侧：基本信息 + 头像（有头像才显示） -->
        <div class="flex items-start gap-4 shrink-0">
          <div v-if="basicInfo.length" class="grid grid-cols-1 gap-y-1.5 text-sm text-right">
            <div v-for="(item, idx) in basicInfo" :key="idx" class="flex items-center justify-end gap-2">
              <span class="text-slate-700">{{ item.value }}</span>
              <span class="text-slate-400 text-xs">{{ item.icon }}</span>
            </div>
          </div>
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="avatar"
            class="w-20 h-28 object-cover border-2 border-slate-200 bg-white shadow-sm"
          />
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="px-8 py-6">
      <!-- 教育背景 -->
      <section v-if="f.school" class="mb-5">
        <div class="flex items-center gap-3 mb-3 pb-2 border-b border-slate-900">
          <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
            {{ sectionIcons.education }}
          </div>
          <h2 class="text-base font-bold text-slate-900">教育背景</h2>
        </div>
        <div class="mb-2">
          <div class="flex justify-between items-baseline text-sm mb-1">
            <strong class="text-slate-900">{{ f.school }}</strong>
            <span class="text-slate-600 whitespace-nowrap">2015-09 ~ 2018-07</span>
          </div>
          <p v-if="f.major" class="text-sm text-slate-700">{{ f.major }}</p>
          <p v-if="f.education" class="text-sm text-slate-700">{{ f.education }}</p>
        </div>
      </section>

      <!-- 工作经历 -->
      <section v-if="showModule('internships') && f.internships.length" class="mb-5">
        <div class="flex items-center gap-3 mb-3 pb-2 border-b border-slate-900">
          <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
            {{ sectionIcons.internships }}
          </div>
          <h2 class="text-base font-bold text-slate-900">工作经历</h2>
        </div>
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
      <section v-if="showModule('projects') && f.projects.length" class="mb-5">
        <div class="flex items-center gap-3 mb-3 pb-2 border-b border-slate-900">
          <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
            {{ sectionIcons.projects }}
          </div>
          <h2 class="text-base font-bold text-slate-900">项目经历</h2>
        </div>
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
      <section v-if="showModule('skills') && f.skills.length" class="mb-5">
        <div class="flex items-center gap-3 mb-3 pb-2 border-b border-slate-900">
          <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
            {{ sectionIcons.skills }}
          </div>
          <h2 class="text-base font-bold text-slate-900">技能特长</h2>
        </div>
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
                <div class="h-full bg-slate-700 rounded-full" :style="{ width: skillProgress(idx) + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 荣誉证书 -->
      <section v-if="showModule('awards') && f.honorList.length" class="mb-5">
        <div class="flex items-center gap-3 mb-3 pb-2 border-b border-slate-900">
          <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
            {{ sectionIcons.awards }}
          </div>
          <h2 class="text-base font-bold text-slate-900">荣誉证书</h2>
        </div>
        <div>
          <ul class="list-disc pl-5 text-sm text-slate-700 leading-relaxed space-y-1">
            <li v-for="item in f.honorList" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <!-- 自我评价 -->
      <section v-if="f.summary" class="mb-5">
        <div class="flex items-center gap-3 mb-3 pb-2 border-b border-slate-900">
          <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
            {{ sectionIcons.summary }}
          </div>
          <h2 class="text-base font-bold text-slate-900">自我评价</h2>
        </div>
        <div>
          <p class="text-sm text-slate-700 leading-relaxed">{{ f.summary }}</p>
        </div>
      </section>
    </main>
  </div>
</template>
