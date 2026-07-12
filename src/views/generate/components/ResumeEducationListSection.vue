<!--
  教育背景列表表单（支持多条）
-->
<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { createEmptyEducation, DEGREE_OPTIONS } from '@/constants/resumeFieldSchema'

const educations = defineModel({ type: Array, default: () => [] })

function addEducation() {
  if (!Array.isArray(educations.value)) {
    educations.value = []
  }
  educations.value.push(createEmptyEducation())
}

function removeEducation(index) {
  if (!educations.value) return
  educations.value.splice(index, 1)
}
</script>

<template>
  <div>
    <div
      v-for="(edu, index) in educations"
      :key="index"
      class="mb-4 rounded-card border border-line/60 bg-cream/30 p-4"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm font-semibold text-ink">教育经历 {{ index + 1 }}</span>
        <button type="button" class="text-sm font-medium text-danger hover:text-red-500" @click="removeEducation(index)">
          删除
        </button>
      </div>
      <a-form layout="vertical" size="small">
        <a-row :gutter="12">
          <a-col :xs="24" :sm="12">
            <a-form-item label="就读开始时间">
              <a-input v-model:value="edu.start_date" placeholder="如：2018-09" class="input-field" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="毕业时间">
              <a-input v-model:value="edu.end_date" placeholder="如：2022-06" class="input-field" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="学校">
              <a-input v-model:value="edu.school" placeholder="如：清华大学" class="input-field" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="学历">
              <a-select v-model:value="edu.degree" allow-clear placeholder="请选择学历" class="input-field w-full">
                <a-select-option v-for="opt in DEGREE_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="专业">
              <a-input v-model:value="edu.major" placeholder="如：计算机科学与技术" class="input-field" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <button type="button" class="btn-ghost-dashed text-sm" @click="addEducation">
      <PlusOutlined /> 添加教育经历
    </button>
  </div>
</template>
