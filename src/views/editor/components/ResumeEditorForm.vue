<!--
  简历编辑表单：Tab 驱动，仅渲染当前激活模块
-->
<script setup>
import { computed, ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const resume = defineModel({ type: Object, required: true })
const modules = defineModel('modules', { type: Array, required: true })

const props = defineProps({
  activeModule: { type: String, default: 'basic' },
})

const contentRef = ref(null)

// 聚焦到当前模块内容区（供父组件调用）
function focusModule(key) {
  if (key) {
    contentRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }
}

defineExpose({ focusModule })

const awardsText = computed({
  get: () => (resume.value.awards || []).join('\n'),
  set: (v) => updateAwards(v),
})
const certificatesText = computed({
  get: () => (resume.value.certificates || []).join('\n'),
  set: (v) => updateCertificates(v),
})

function updateAwards(v) {
  resume.value.awards = v.split('\n').filter((s) => s.trim())
}
function updateCertificates(v) {
  resume.value.certificates = v.split('\n').filter((s) => s.trim())
}

const addingSkill = ref(false)
const newSkill = ref('')

function addSkill() {
  if (newSkill.value.trim()) {
    resume.value.skills = resume.value.skills || []
    resume.value.skills.push(newSkill.value.trim())
  }
  newSkill.value = ''
  addingSkill.value = false
}
function removeSkill(i) {
  resume.value.skills.splice(i, 1)
}

function addProject() {
  resume.value.projects = resume.value.projects || []
  resume.value.projects.push({ name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' })
}
function removeProject(i) {
  resume.value.projects.splice(i, 1)
}

function addInternship() {
  resume.value.internships = resume.value.internships || []
  resume.value.internships.push({ company: '', position: '', description: '', start_date: '', end_date: '' })
}
function removeInternship(i) {
  resume.value.internships.splice(i, 1)
}
</script>

<template>
  <div ref="contentRef" class="min-h-[120px]">
    <!-- 基本信息 -->
    <template v-if="activeModule === 'basic'">
      <a-form layout="vertical" size="small">
        <a-row :gutter="12">
          <a-col :span="8"><a-form-item label="姓名"><a-input v-model:value="resume.name" class="input-field" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="意向岗位"><a-input v-model:value="resume.target_position" placeholder="如：前端开发工程师" class="input-field" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="学校"><a-input v-model:value="resume.school" class="input-field" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="专业"><a-input v-model:value="resume.major" class="input-field" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="学历"><a-input v-model:value="resume.education" class="input-field" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="手机"><a-input v-model:value="resume.phone" class="input-field" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="邮箱"><a-input v-model:value="resume.email" class="input-field" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="个人评价"><a-textarea v-model:value="resume.summary" :rows="3" class="input-field" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </template>

    <!-- 技能标签 -->
    <template v-else-if="activeModule === 'skills'">
      <div class="flex flex-wrap gap-2">
        <a-tag v-for="(skill, i) in (resume.skills || [])" :key="i" closable color="#7DD3E8" @close="removeSkill(i)">
          {{ skill }}
        </a-tag>
        <a-input
          v-if="addingSkill"
          v-model:value="newSkill"
          size="small"
          class="w-[120px] input-field"
          autofocus
          @pressEnter="addSkill"
          @blur="addSkill"
        />
        <a-tag v-else class="cursor-pointer border-dashed border-line bg-cream text-ink-secondary hover:border-brand-lighter hover:bg-brand-lighter hover:text-brand-dark" @click="addingSkill = true">
          <PlusOutlined /> 添加
        </a-tag>
      </div>
    </template>

    <!-- 项目经历 -->
    <template v-else-if="activeModule === 'projects'">
      <div v-for="(proj, i) in (resume.projects || [])" :key="i" class="mb-4 border-b border-dashed border-line/60 pb-4">
        <div class="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
          <span>项目{{ i + 1 }}：{{ proj.name || '未命名' }}</span>
          <button class="text-sm font-medium text-danger transition-colors hover:text-red-500" @click="removeProject(i)">删除</button>
        </div>
        <a-form layout="vertical" size="small">
          <a-row :gutter="12">
            <a-col :span="8"><a-form-item label="项目名"><a-input v-model:value="proj.name" class="input-field" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="角色"><a-input v-model:value="proj.role" class="input-field" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="技术栈"><a-input v-model:value="proj.tech_stack" class="input-field" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item label="开始"><a-input v-model:value="proj.start_date" placeholder="如 2023-01" class="input-field" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item label="结束"><a-input v-model:value="proj.end_date" placeholder="如 2024-06" class="input-field" /></a-form-item></a-col>
            <a-col :span="24"><a-form-item label="描述"><a-textarea v-model:value="proj.description" :rows="3" class="input-field" /></a-form-item></a-col>
          </a-row>
        </a-form>
      </div>
      <button class="btn-ghost w-full border-dashed py-2 text-sm" @click="addProject">
        <PlusOutlined /> 添加项目
      </button>
    </template>

    <!-- 实习经历 -->
    <template v-else-if="activeModule === 'internships'">
      <div v-for="(intern, i) in (resume.internships || [])" :key="i" class="mb-4 border-b border-dashed border-line/60 pb-4">
        <div class="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
          <span>{{ intern.company || `实习${i + 1}` }}</span>
          <button class="text-sm font-medium text-danger transition-colors hover:text-red-500" @click="removeInternship(i)">删除</button>
        </div>
        <a-form layout="vertical" size="small">
          <a-row :gutter="12">
            <a-col :span="8"><a-form-item label="公司"><a-input v-model:value="intern.company" class="input-field" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="岗位"><a-input v-model:value="intern.position" class="input-field" /></a-form-item></a-col>
            <a-col :span="4"><a-form-item label="开始"><a-input v-model:value="intern.start_date" class="input-field" /></a-form-item></a-col>
            <a-col :span="4"><a-form-item label="结束"><a-input v-model:value="intern.end_date" class="input-field" /></a-form-item></a-col>
            <a-col :span="24"><a-form-item label="描述"><a-textarea v-model:value="intern.description" :rows="3" class="input-field" /></a-form-item></a-col>
          </a-row>
        </a-form>
      </div>
      <button class="btn-ghost w-full border-dashed py-2 text-sm" @click="addInternship">
        <PlusOutlined /> 添加实习
      </button>
    </template>

    <!-- 获奖与证书 -->
    <template v-else-if="activeModule === 'awards'">
      <a-form layout="vertical" size="small">
        <a-form-item label="获奖情况">
          <a-textarea :value="awardsText" placeholder="每行一条" :rows="3" class="input-field" @update:value="updateAwards" />
        </a-form-item>
        <a-form-item label="证书">
          <a-textarea :value="certificatesText" placeholder="每行一条" :rows="3" class="input-field" @update:value="updateCertificates" />
        </a-form-item>
      </a-form>
    </template>
  </div>
</template>
