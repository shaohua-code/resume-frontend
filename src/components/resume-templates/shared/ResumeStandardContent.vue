<!--
  AI简历风格标准模块（20 套模板共用 DOM 结构，样式由 variant 区分）
-->
<script setup>
import { computed } from 'vue'
import { useResumeFields, skillProgress, skillLevel } from './useResumeFields.js'

const props = defineProps({
  resume: { type: Object, default: () => ({}) },
  variant: { type: Number, default: 1 },
  visibleModules: { type: Array, default: () => [] },
})

const f = computed(() => useResumeFields(props.resume))
const showProgress = computed(() => props.variant === 17)
const moduleVisibleMap = computed(() => {
  return props.visibleModules.reduce((map, item) => {
    map[item.key] = item.visible !== false
    return map
  }, {})
})

// 根据编辑器顶部开关控制预览模块显隐，未配置时默认显示
function showModule(key) {
  return moduleVisibleMap.value[key] !== false
}
</script>

<template>
  <div class="rt-body">
    <!-- 顶栏：对照AI简历 1004 -->
    <header data-resume-module="basic" class="rt-header">
      <div class="rt-banner">
        <h1 class="rt-name">{{ f.name }}</h1>
        <p v-if="f.targetPosition" class="rt-slogan">{{ f.targetPosition }}</p>
        <p v-else class="rt-slogan">细心从每一个细节开始</p>
        <p class="rt-sub-en">Personal resume</p>
      </div>
      <div class="rt-basic-grid">
        <div v-if="f.name" class="rt-basic-row"><span class="rt-label">姓名</span><span>{{ f.name }}</span></div>
        <div v-if="f.targetPosition" class="rt-basic-row"><span class="rt-label">岗位</span><span>{{ f.targetPosition }}</span></div>
        <div v-if="f.phone" class="rt-basic-row"><span class="rt-label">电话</span><span>{{ f.phone }}</span></div>
        <div v-if="f.email" class="rt-basic-row"><span class="rt-label">邮箱</span><span>{{ f.email }}</span></div>
        <div v-if="f.eduLine" class="rt-basic-row rt-basic-wide"><span class="rt-label">教育</span><span>{{ f.eduLine }}</span></div>
      </div>
    </header>

    <!-- 教育背景 -->
    <section v-if="f.school" data-resume-module="basic" class="rt-section">
      <h2 class="rt-title"><span>教育背景</span></h2>
      <div class="rt-item">
        <div class="rt-item-header">
          <strong>{{ f.school }}</strong>
          <span v-if="f.education">{{ f.education }}</span>
        </div>
        <p v-if="f.major" class="rt-text">{{ f.major }}</p>
      </div>
    </section>

    <!-- 工作经历 / 实习 -->
    <section v-if="showModule('internships') && f.internships.length" data-resume-module="internships" class="rt-section">
      <h2 class="rt-title"><span>工作经历</span></h2>
      <div v-for="intern in f.internships" :key="intern.company + intern.start_date" class="rt-item">
        <div class="rt-item-header">
          <strong>{{ intern.company }}</strong>
          <span>{{ intern.start_date }} ~ {{ intern.end_date }}</span>
        </div>
        <p v-if="intern.position" class="rt-sub">{{ intern.position }}</p>
        <p class="rt-desc">{{ intern.description }}</p>
      </div>
    </section>

    <!-- 项目经历 -->
    <section v-if="showModule('projects') && f.projects.length" data-resume-module="projects" class="rt-section">
      <h2 class="rt-title"><span>项目经历</span></h2>
      <div v-for="proj in f.projects" :key="proj.name" class="rt-item">
        <div class="rt-item-header">
          <strong>{{ proj.name }}</strong>
          <span>{{ proj.start_date }} ~ {{ proj.end_date }}</span>
        </div>
        <p v-if="proj.role || proj.tech_stack" class="rt-sub">{{ proj.role }}<template v-if="proj.tech_stack"> | {{ proj.tech_stack }}</template></p>
        <p class="rt-desc">{{ proj.description }}</p>
      </div>
    </section>

    <!-- 技能特长 -->
    <section v-if="showModule('skills') && f.skills.length" data-resume-module="skills" class="rt-section">
      <h2 class="rt-title"><span>技能特长</span></h2>
      <template v-if="showProgress">
        <div v-for="(skill, idx) in f.skills" :key="skill" class="rt-skill-bar-item">
          <div class="rt-skill-bar-head">
            <span>{{ skill }}</span>
            <span>{{ skillProgress(idx) }}% · {{ skillLevel(idx) }}</span>
          </div>
          <div class="rt-skill-bar-track"><div class="rt-skill-bar-fill" :style="{ width: skillProgress(idx) + '%' }" /></div>
        </div>
      </template>
      <template v-else>
        <div class="rt-skills">
          <span v-for="skill in f.skills" :key="skill" class="rt-skill">{{ skill }}</span>
        </div>
      </template>
    </section>

    <!-- 荣誉证书 -->
    <section v-if="showModule('awards') && f.honorList.length" data-resume-module="awards" class="rt-section">
      <h2 class="rt-title"><span>荣誉证书</span></h2>
      <ul class="rt-list">
        <li v-for="item in f.honorList" :key="item">{{ item }}</li>
      </ul>
    </section>

    <!-- 自我评价 -->
    <section v-if="f.summary" data-resume-module="basic" class="rt-section">
      <h2 class="rt-title"><span>自我评价</span></h2>
      <p class="rt-text">{{ f.summary }}</p>
    </section>
  </div>
</template>

<style scoped>
.rt-body { word-break: break-word; color: #1f2937; }
.rt-header { margin-bottom: 22px; }
.rt-banner { text-align: center; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 2px solid #1f2937; }
.rt-name { font-size: 28px; font-weight: 800; margin: 0 0 6px; color: #111827; letter-spacing: 4px; }
.rt-slogan { margin: 0; font-size: 13px; color: #4b5563; font-weight: 600; letter-spacing: 1px; }
.rt-sub-en { margin: 4px 0 0; font-size: 11px; color: #9ca3af; letter-spacing: 2px; text-transform: uppercase; }
.rt-basic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; font-size: 13px; }
.rt-basic-row { display: flex; gap: 8px; align-items: center; min-width: 0; padding: 6px 10px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; }
.rt-basic-wide { grid-column: 1 / -1; }
.rt-label { color: #6b7280; flex-shrink: 0; min-width: 34px; font-weight: 700; }
.rt-section { margin-bottom: 22px; }
.rt-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 800; margin: 0 0 12px; padding: 0; color: #111827; background: transparent; border: none; }
.rt-title::before { content: ''; width: 4px; height: 16px; background: currentColor; border-radius: 4px; }
.rt-title::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
.rt-title span { flex-shrink: 0; }
.rt-item { margin-bottom: 14px; padding: 12px 14px; background: #fff; border: 1px solid #edf0f5; border-radius: 8px; }
.rt-item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 4px; font-size: 14px; }
.rt-item-header strong { color: #111827; font-weight: 800; }
.rt-item-header span { color: #6b7280; font-size: 12px; white-space: nowrap; }
.rt-sub { margin: 0 0 6px; font-size: 12px; color: #4b5563; font-weight: 600; }
.rt-text, .rt-desc { margin: 0; font-size: 13px; color: #374151; line-height: 1.78; text-indent: 2em; }
.rt-desc { text-indent: 0; }
.rt-skills { display: flex; flex-wrap: wrap; gap: 8px; }
.rt-skill { padding: 5px 12px; background: #eef4ff; border: 1px solid #cfe0ff; border-radius: 999px; font-size: 12px; color: #1f3a5f; font-weight: 600; }
.rt-list { margin: 0; padding-left: 20px; }
.rt-list li { margin-bottom: 5px; font-size: 13px; color: #374151; line-height: 1.7; }
.rt-skill-bar-item { margin-bottom: 12px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; }
.rt-skill-bar-head { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #374151; font-weight: 700; }
.rt-skill-bar-track { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.rt-skill-bar-fill { height: 100%; background: linear-gradient(90deg, #1677ff, #69b1ff); border-radius: 4px; }
</style>
