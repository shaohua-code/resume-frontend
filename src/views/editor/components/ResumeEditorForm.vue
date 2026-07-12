<!--
  简历编辑表单：Tab 驱动，仅渲染当前激活模块
-->
<script setup>
import { computed, ref } from 'vue'
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons-vue'
import GradientButton from '@/components/GradientButton.vue'
import { useResumeOptimizer } from '@/composables/useResumeOptimizer'
import ResumeBasicFieldsSection from '@/views/generate/components/ResumeBasicFieldsSection.vue'
import ResumeEducationListSection from '@/views/generate/components/ResumeEducationListSection.vue'
import { normalizeEducations, syncFlatEducationFields } from '@/constants/resumeFieldSchema'

const resume = defineModel({ type: Object, required: true })
const modules = defineModel('modules', { type: Array, required: true })

const props = defineProps({
  activeModule: { type: String, default: 'basic' },
})

const contentRef = ref(null)
const basicFieldsRef = ref(null)

// 简历分模块 AI 优化能力
const { streamingSkillsText, isOptimizing, optimize } = useResumeOptimizer({ resume })

// 过滤技能流式文本中的 JSON 包裹格式（如 {"optimized":["技能1","技能2"]}）
const filteredSkillsText = computed(() => {
  const raw = streamingSkillsText.value
  if (!raw) return ''
  // 尝试匹配 {"optimized": [...]} 格式并提取内部文本
  try {
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']') + 1
    if (start !== -1 && end > start) {
      // 提取数组部分，展示为逗号分隔的文本
      const arrStr = raw.slice(start, end)
      const arr = JSON.parse(arrStr.replace(/,\s*]/g, ']'))
      if (Array.isArray(arr)) return arr.join('、')
    }
    // 匹配 {"optimized":"纯文本"} 格式
    const jsonMatch = raw.match(/\{[\s]*"optimized"[\s]*:[\s]*"((?:[^"\\]|\\.)*)"/)
    if (jsonMatch) return jsonMatch[1]
  } catch (e) {
    /* 流式过程中 JSON 可能不完整 */
  }
  // 移除残留 JSON 结构字符后返回
  return raw.replace(/\{[\s]*"optimized"[\s]*:[\s]*"?/g, '').replace(/"?\s*\}\s*$/g, '')
})

// 聚焦到当前模块内容区（供父组件调用）
function focusModule(key) {
  if (key) {
    contentRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }
}

defineExpose({
  focusModule,
  /** 校验基本信息必填项 */
  validateBasic: () => basicFieldsRef.value?.validate(),
})

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
  // 防止索引越界或重复删除
  if (!resume.value.skills || i < 0 || i >= resume.value.skills.length) return
  resume.value.skills.splice(i, 1)
}

function addProject() {
  resume.value.projects = resume.value.projects || []
  resume.value.projects.push({ name: '', role: '', description: '', tech_stack: '', start_date: '', end_date: '' })
}
function removeProject(i) {
  // 防止索引越界或重复删除
  if (!resume.value.projects || i < 0 || i >= resume.value.projects.length) return
  resume.value.projects.splice(i, 1)
}

function addInternship() {
  resume.value.internships = resume.value.internships || []
  resume.value.internships.push({ company: '', position: '', description: '', start_date: '', end_date: '' })
}
function removeInternship(i) {
  if (!resume.value.internships || i < 0 || i >= resume.value.internships.length) return
  resume.value.internships.splice(i, 1)
}

// 教育背景列表：确保数组存在并同步扁平字段
const educationsModel = computed({
  get: () => {
    if (!Array.isArray(resume.value.educations)) {
      resume.value.educations = normalizeEducations(resume.value)
    }
    return resume.value.educations
  },
  set: (list) => {
    resume.value.educations = list
    syncFlatEducationFields(resume.value)
  },
})
</script>

<template>
  <div ref="contentRef" class="min-h-[120px]">
    <!-- 基本信息（含扩展字段与自定义键值对） -->
    <template v-if="activeModule === 'basic'">
      <ResumeBasicFieldsSection
        ref="basicFieldsRef"
        v-model="resume"
        :show-optimize="true"
        :is-optimizing="isOptimizing"
        :on-optimize="optimize"
      />
    </template>

    <!-- 教育背景 -->
    <template v-else-if="activeModule === 'educations'">
      <ResumeEducationListSection v-model="educationsModel" />
    </template>

    <!-- 技能标签 -->
    <template v-else-if="activeModule === 'skills'">
      <div class="flex flex-wrap gap-2">
        <a-tag
          v-for="(skill, i) in (resume.skills || [])"
          :key="skill + '-' + i"
          closable
          color="#7DD3E8"
          @close.stop="removeSkill(i)"
        >
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
      <!-- 技能优化打印机效果临时输入框（过滤 JSON 后展示） -->
      <div v-if="filteredSkillsText" class="mt-2">
        <a-input :value="filteredSkillsText" size="small" readonly class="w-full input-field" />
      </div>
      <!-- 技能特长 AI 优化按钮 -->
      <div class="mt-2 flex justify-end">
        <GradientButton  :loading="isOptimizing('skills')" @click="optimize('skills')">
          <ThunderboltOutlined /> 优化技能
        </GradientButton>
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
        <!-- 每个项目的 AI 优化按钮 -->
        <div class="flex justify-end">
          <GradientButton  :loading="isOptimizing('project', i)" @click="optimize('project', i)">
            <ThunderboltOutlined /> 优化当前项目
          </GradientButton>
        </div>
      </div>
      <button class="btn-ghost-dashed text-sm" @click="addProject">
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
        <!-- 每个实习的 AI 优化按钮 -->
        <div class="flex justify-end">
          <GradientButton  :loading="isOptimizing('internship', i)" @click="optimize('internship', i)">
            <ThunderboltOutlined /> 优化实习经验
          </GradientButton>
        </div>
      </div>
      <button class="btn-ghost-dashed text-sm" @click="addInternship">
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
