<script setup>
/**
 * 管理员默认业务提示词：仅可编辑业务指令，结果格式由系统锁定
 */
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminTaskPrompts, saveAdminTaskPrompt } from '@/api/admin'
import { getErrorMessage } from '@/utils/errorMessage'

const loading = ref(false)
const savingTask = ref('')
const tasks = ref([])
const drafts = reactive({})

async function loadConfig() {
  loading.value = true
  try {
    const res = await getAdminTaskPrompts()
    tasks.value = res.items || []
    // 同步各任务编辑草稿
    for (const task of tasks.value) {
      drafts[task.task_type] = task.instruction || ''
    }
  } finally {
    loading.value = false
  }
}

async function saveTask(task) {
  const instruction = String(drafts[task.task_type] || '').trim()
  if (!instruction) {
    message.warning('请填写提示词')
    return
  }
  savingTask.value = task.task_type
  try {
    await saveAdminTaskPrompt(task.task_type, instruction)
    message.success(`${task.name}提示词已保存`)
    await loadConfig()
  } catch (e) {
    message.error(getErrorMessage(e))
  } finally {
    savingTask.value = ''
  }
}

/** 来源文案仅展示中文，不暴露程序标识 */
function sourceLabel(source) {
  return source === 'admin' ? '管理员' : '系统默认'
}

onMounted(loadConfig)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="rounded-card shadow-card">
      <p class="text-base font-semibold text-ink">任务提示词配置</p>
      <p class="mt-1 text-xs text-muted">
        只调整各 AI 任务的业务要求（如何处理简历与岗位）。输出 JSON 结构、optimization_notes 亮点总结等结果格式由系统锁定，用户与管理员均不可改写。
      </p>
    </a-card>
    <a-spin :spinning="loading">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <a-card
          v-for="task in tasks"
          :key="task.task_type"
          :bordered="false"
          class="rounded-card shadow-card"
        >
          <div class="space-y-3">
            <div>
              <p class="font-semibold text-ink">{{ task.name }}</p>
              <p class="mt-1 text-xs text-muted">
                来源 {{ sourceLabel(task.source) }}
              </p>
            </div>
            <a-textarea
              v-model:value="drafts[task.task_type]"
              :rows="8"
              class="input-field"
              placeholder="填写业务要求（例如处理原则、真实性边界、岗位相关性等）"
            />
            <button
              class="btn-primary min-h-11 w-full"
              :disabled="savingTask === task.task_type"
              @click="saveTask(task)"
            >
              {{ savingTask === task.task_type ? '保存中...' : '保存提示词' }}
            </button>
          </div>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>
