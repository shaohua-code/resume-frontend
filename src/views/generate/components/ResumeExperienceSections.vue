<!-- 统一生成表单的项目、实习与正式工作经历区块（无多余外层卡片边框） -->
<script setup>
import {
  BankOutlined,
  CodeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'

const projects = defineModel('projects', { type: Array, required: true })
const internships = defineModel('internships', { type: Array, required: true })
const workExperiences = defineModel('workExperiences', { type: Array, required: true })

function addProject() {
  projects.value.push({ name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' })
}

function addInternship() {
  internships.value.push({ company: '', position: '', description: '', start_date: '', end_date: '' })
}

function addWorkExperience() {
  workExperiences.value.push({ company: '', position: '', department: '', description: '', start_date: '', end_date: '' })
}
</script>

<template>
  <div class="space-y-8">
    <section>
      <!-- 区块标题一行，不用外层卡片 -->
      <div class="mb-5 flex flex-wrap items-center gap-2">
        <CodeOutlined class="text-brand-dark" />
        <h3 class="text-base font-semibold text-ink">项目经历（选填）</h3>
        <span class="badge">{{ projects.filter((item) => item.name || item.description).length }} 个项目</span>
      </div>
      <div class="divide-y divide-line/40">
        <div
          v-for="(project, index) in projects"
          :key="index"
          class="py-5 first:pt-0 last:pb-0"
        >
          <div class="mb-4 flex items-center justify-between">
            <h4 class="font-semibold text-ink">项目 {{ index + 1 }}</h4>
            <button
              v-if="projects.length > 1"
              type="button"
              class="text-xs text-danger"
              @click="projects.splice(index, 1)"
            >
              <DeleteOutlined /> 删除
            </button>
          </div>
          <a-form layout="vertical">
            <a-row :gutter="[16, 0]">
              <a-col :xs="24" :sm="12"><a-form-item label="项目名称"><a-input v-model:value="project.name" class="input-field" placeholder="如：校园二手交易平台" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="你的角色"><a-input v-model:value="project.role" class="input-field" placeholder="如：前端负责人" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="开始时间"><a-date-picker v-model:value="project.start_date" picker="month" value-format="YYYY.MM" class="input-field w-full" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="结束时间"><a-date-picker v-model:value="project.end_date" picker="month" value-format="YYYY.MM" class="input-field w-full" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="专业技能 / 工具"><a-input v-model:value="project.tech_stack" class="input-field" placeholder="如：Vue3、Pinia、Ant Design Vue" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="项目描述"><a-textarea v-model:value="project.description" :auto-size="{ minRows: 4, maxRows: 8 }" :maxlength="500" show-count class="experience-description" placeholder="简单描述项目背景、行动与成果，AI 会进一步优化表达" /></a-form-item></a-col>
            </a-row>
          </a-form>
        </div>
      </div>
      <button type="button" class="btn-ghost mt-4 w-full border-dashed py-2.5" @click="addProject">
        <PlusOutlined /> 添加项目
      </button>
    </section>

    <section class="border-t border-line/30 pt-8">
      <div class="mb-5 flex flex-wrap items-center gap-2">
        <BankOutlined class="text-brand-dark" />
        <h3 class="text-base font-semibold text-ink">实习经历（选填）</h3>
        <span class="badge">{{ internships.filter((item) => item.company || item.description).length }} 段实习</span>
      </div>
      <div class="divide-y divide-line/40">
        <div
          v-for="(item, index) in internships"
          :key="index"
          class="py-5 first:pt-0 last:pb-0"
        >
          <div class="mb-4 flex items-center justify-between">
            <h4 class="font-semibold text-ink">实习 {{ index + 1 }}</h4>
            <button v-if="internships.length > 1" type="button" class="text-xs text-danger" @click="internships.splice(index, 1)"><DeleteOutlined /> 删除</button>
          </div>
          <a-form layout="vertical">
            <a-row :gutter="[16, 0]">
              <a-col :xs="24" :sm="12"><a-form-item label="公司名称"><a-input v-model:value="item.company" class="input-field" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="岗位"><a-input v-model:value="item.position" class="input-field" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="开始时间"><a-date-picker v-model:value="item.start_date" picker="month" value-format="YYYY.MM" class="input-field w-full" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="结束时间"><a-date-picker v-model:value="item.end_date" picker="month" value-format="YYYY.MM" class="input-field w-full" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="工作描述"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 3, maxRows: 7 }" class="input-field" /></a-form-item></a-col>
            </a-row>
          </a-form>
        </div>
      </div>
      <button type="button" class="btn-ghost mt-4 w-full border-dashed py-2.5" @click="addInternship"><PlusOutlined /> 添加实习</button>
    </section>

    <section class="border-t border-line/30 pt-8">
      <div class="mb-5 flex flex-wrap items-center gap-2">
        <BankOutlined class="text-brand-dark" />
        <h3 class="text-base font-semibold text-ink">工作经历（选填）</h3>
        <span class="badge">{{ workExperiences.filter((item) => item.company || item.description).length }} 段工作</span>
      </div>
      <div class="divide-y divide-line/40">
        <div
          v-for="(item, index) in workExperiences"
          :key="index"
          class="py-5 first:pt-0 last:pb-0"
        >
          <div class="mb-4 flex items-center justify-between">
            <h4 class="font-semibold text-ink">工作 {{ index + 1 }}</h4>
            <button v-if="workExperiences.length > 1" type="button" class="text-xs text-danger" @click="workExperiences.splice(index, 1)"><DeleteOutlined /> 删除</button>
          </div>
          <a-form layout="vertical">
            <a-row :gutter="[16, 0]">
              <a-col :xs="24" :sm="12"><a-form-item label="公司名称"><a-input v-model:value="item.company" class="input-field" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="岗位"><a-input v-model:value="item.position" class="input-field" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="部门"><a-input v-model:value="item.department" class="input-field" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="开始时间"><a-date-picker v-model:value="item.start_date" picker="month" value-format="YYYY.MM" class="input-field w-full" /></a-form-item></a-col>
              <a-col :xs="24" :sm="12"><a-form-item label="结束时间"><a-date-picker v-model:value="item.end_date" picker="month" value-format="YYYY.MM" class="input-field w-full" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item label="工作描述"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 4, maxRows: 8 }" :maxlength="500" show-count class="experience-description" placeholder="简单描述职责、行动与成果，AI 会进一步优化表达" /></a-form-item></a-col>
            </a-row>
          </a-form>
        </div>
      </div>
      <button type="button" class="btn-ghost mt-4 w-full border-dashed py-2.5" @click="addWorkExperience"><PlusOutlined /> 添加工作经历</button>
    </section>
  </div>
</template>

<style scoped>
:deep(.experience-description.ant-input-textarea-show-count) {
  @apply relative border-0 bg-transparent p-0 shadow-none;
}

:deep(.experience-description textarea.ant-input) {
  @apply min-h-[110px] resize-y rounded-button border border-line bg-white/80 px-4 py-2.5 pb-8;
}

:deep(.experience-description.ant-input-textarea-show-count::after) {
  @apply absolute bottom-3 right-3 text-xs text-muted;
}
</style>
