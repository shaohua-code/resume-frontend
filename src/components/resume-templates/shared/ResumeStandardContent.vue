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

// 基本信息项：有值才展示，顺序固定
const basicInfoItems = computed(() => {
  const fields = f.value
  return [
    { key: 'name', label: '姓名', value: fields.name },
    { key: 'targetPosition', label: '岗位', value: fields.targetPosition },
    { key: 'phone', label: '电话', value: fields.phone },
    { key: 'email', label: '邮箱', value: fields.email },
    { key: 'eduLine', label: '教育', value: fields.eduLine },
  ].filter((item) => item.value)
})

// 总数为奇数时，最后一项独占整行
function isBasicRowWide(index) {
  const total = basicInfoItems.value.length
  return total % 2 === 1 && index === total - 1
}
</script>

<template>
  <div class="rt-body">
    <!-- 顶栏：对照AI简历 1004 -->
    <header data-resume-module="basic" class="rt-header">
      <div class="rt-banner">
        <img
          v-if="f.avatar"
          :src="f.avatar"
          alt="头像"
          class="rt-avatar rt-banner-avatar"
        >
        <h1 class="rt-name">{{ f.name }}</h1>
        <p v-if="f.targetPosition" class="rt-slogan rt-name-sub">{{ f.targetPosition }}</p>
       
       
      </div>
      <div class="rt-basic-grid">
        <div
          v-for="(item, index) in basicInfoItems"
          :key="item.key"
          class="rt-basic-row"
          :class="{ 'rt-basic-wide': isBasicRowWide(index) }"
        >
          <span class="rt-label">{{ item.label }}</span>
          <span class="rt-value">{{ item.value }}</span>
        </div>
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
        <p v-if="intern.description" class="rt-desc rt-preserve-text">{{ intern.description }}</p>
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
        <p v-if="proj.description" class="rt-desc rt-preserve-text">{{ proj.description }}</p>
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
        <li v-for="item in f.honorList" :key="item" class="rt-preserve-text">{{ item }}</li>
      </ul>
    </section>

    <!-- 自我评价 -->
    <section v-if="f.summary" data-resume-module="basic" class="rt-section">
      <h2 class="rt-title"><span>自我评价</span></h2>
      <p class="rt-text rt-preserve-text">{{ f.summary }}</p>
    </section>
  </div>
</template>

<style scoped>
.rt-body { word-break: break-word; }
.rt-header { margin-bottom: 22px; }
.rt-banner { text-align: center; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 2px solid; }
.rt-name { font-size: 28px; font-weight: 800; margin: 0 0 6px; letter-spacing: 4px; }
.rt-slogan { margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 1px; }
.rt-sub-en { margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
.rt-basic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; font-size: 13px; }
.rt-basic-row { display: flex; gap: 8px; align-items: center; min-width: 0; padding: 6px 10px; border-radius: 6px; border-width: 1px; border-style: solid; }
.rt-basic-wide { grid-column: 1 / -1; }
.rt-label { flex-shrink: 0; min-width: 34px; font-weight: 700; }
.rt-section { margin-bottom: 22px; }
.rt-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 800; margin: 0 0 12px; padding: 0; background: transparent; border: none; }
.rt-title::before { content: ''; width: 4px; height: 16px; border-radius: 4px; }
.rt-title::after { content: ''; flex: 1; height: 1px; }
.rt-title span { flex-shrink: 0; }
.rt-item { margin-bottom: 14px; padding: 12px 14px; border-radius: 8px; border-width: 1px; border-style: solid; }
.rt-item-header { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 4px; font-size: 14px; }
.rt-item-header strong { font-weight: 800; }
.rt-item-header span { font-size: 12px; white-space: nowrap; }
.rt-sub { margin: 0 0 6px; font-size: 12px; font-weight: 600; }
.rt-text, .rt-desc { margin: 0; font-size: 13px; line-height: 1.78; text-indent: 2em; }
.rt-desc { text-indent: 0; }
.rt-skills { display: flex; flex-wrap: wrap; gap: 8px; }
.rt-skill { padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; border-width: 1px; border-style: solid; }
.rt-list { margin: 0; padding-left: 20px; }
.rt-list li { margin-bottom: 5px; font-size: 13px; line-height: 1.7; }
.rt-skill-bar-item { margin-bottom: 12px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; }
.rt-skill-bar-head { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; font-weight: 700; }
.rt-skill-bar-track { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.rt-skill-bar-fill { height: 100%; background: linear-gradient(90deg, #1677ff, #69b1ff); border-radius: 4px; }
</style>
