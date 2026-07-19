<script setup>
/**
 * 管理员默认业务提示词：仅 instruction，不含输出 Schema
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

onMounted(loadConfig)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="rounded-card shadow-card">
      <p class="text-base font-semibold text-ink">任务提示词配置</p>
      <p class="mt-1 text-xs text-muted">
        仅配置各 AI 任务的业务指令；JSON Schema / 输出格式由系统锁定，不会展示给用户。
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
                {{ task.task_type }} · 来源 {{ task.source === 'admin' ? '管理员' : '代码默认' }}
              </p>
            </div>
            <a-textarea
              v-model:value="drafts[task.task_type]"
              :rows="6"
              class="input-field"
              placeholder="业务指令（不含输出格式）"
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
