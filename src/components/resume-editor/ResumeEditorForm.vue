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
  <div ref="contentRef" class="resume-editor-form">
    <!-- 基本信息 -->
    <template v-if="activeModule === 'basic'">
      <a-form layout="vertical" size="small">
        <a-row :gutter="12">
          <a-col :span="8"><a-form-item label="姓名"><a-input v-model:value="resume.name" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="学校"><a-input v-model:value="resume.school" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="专业"><a-input v-model:value="resume.major" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="学历"><a-input v-model:value="resume.education" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="手机"><a-input v-model:value="resume.phone" /></a-form-item></a-col>
          <a-col :span="8"><a-form-item label="邮箱"><a-input v-model:value="resume.email" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="个人评价"><a-textarea v-model:value="resume.summary" :rows="3" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </template>

    <!-- 技能标签 -->
    <template v-else-if="activeModule === 'skills'">
      <div class="skills-editor">
        <a-tag v-for="(skill, i) in (resume.skills || [])" :key="i" closable color="blue" @close="removeSkill(i)">
          {{ skill }}
        </a-tag>
        <a-input
          v-if="addingSkill"
          size="small"
          style="width: 120px"
          v-model:value="newSkill"
          autofocus
          @pressEnter="addSkill"
          @blur="addSkill"
        />
        <a-tag v-else style="cursor: pointer; border-style: dashed" @click="addingSkill = true">
          <PlusOutlined /> 添加
        </a-tag>
      </div>
    </template>

    <!-- 项目经历 -->
    <template v-else-if="activeModule === 'projects'">
      <div v-for="(proj, i) in (resume.projects || [])" :key="i" class="edit-section">
        <div class="section-header">
          <span>项目{{ i + 1 }}：{{ proj.name || '未命名' }}</span>
          <a-button type="link" danger size="small" @click="removeProject(i)">删除</a-button>
        </div>
        <a-form layout="vertical" size="small">
          <a-row :gutter="12">
            <a-col :span="8"><a-form-item label="项目名"><a-input v-model:value="proj.name" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="角色"><a-input v-model:value="proj.role" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="技术栈"><a-input v-model:value="proj.tech_stack" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item label="开始"><a-input v-model:value="proj.start_date" placeholder="如 2023-01" /></a-form-item></a-col>
            <a-col :span="12"><a-form-item label="结束"><a-input v-model:value="proj.end_date" placeholder="如 2024-06" /></a-form-item></a-col>
            <a-col :span="24"><a-form-item label="描述"><a-textarea v-model:value="proj.description" :rows="3" /></a-form-item></a-col>
          </a-row>
        </a-form>
      </div>
      <a-button type="dashed" block @click="addProject">
        <PlusOutlined /> 添加项目
      </a-button>
    </template>

    <!-- 实习经历 -->
    <template v-else-if="activeModule === 'internships'">
      <div v-for="(intern, i) in (resume.internships || [])" :key="i" class="edit-section">
        <div class="section-header">
          <span>{{ intern.company || `实习${i + 1}` }}</span>
          <a-button type="link" danger size="small" @click="removeInternship(i)">删除</a-button>
        </div>
        <a-form layout="vertical" size="small">
          <a-row :gutter="12">
            <a-col :span="8"><a-form-item label="公司"><a-input v-model:value="intern.company" /></a-form-item></a-col>
            <a-col :span="8"><a-form-item label="岗位"><a-input v-model:value="intern.position" /></a-form-item></a-col>
            <a-col :span="4"><a-form-item label="开始"><a-input v-model:value="intern.start_date" /></a-form-item></a-col>
            <a-col :span="4"><a-form-item label="结束"><a-input v-model:value="intern.end_date" /></a-form-item></a-col>
            <a-col :span="24"><a-form-item label="描述"><a-textarea v-model:value="intern.description" :rows="3" /></a-form-item></a-col>
          </a-row>
        </a-form>
      </div>
      <a-button type="dashed" block @click="addInternship">
        <PlusOutlined /> 添加实习
      </a-button>
    </template>

    <!-- 获奖与证书 -->
    <template v-else-if="activeModule === 'awards'">
      <a-form layout="vertical" size="small">
        <a-form-item label="获奖情况">
          <a-textarea :value="awardsText" placeholder="每行一条" :rows="3" @update:value="updateAwards" />
        </a-form-item>
        <a-form-item label="证书">
          <a-textarea :value="certificatesText" placeholder="每行一条" :rows="3" @update:value="updateCertificates" />
        </a-form-item>
      </a-form>
    </template>
  </div>
</template>

<style scoped>
.resume-editor-form {
  min-height: 120px;
}
.edit-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e8e8e8;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1f1f1f;
}
.skills-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
