<script setup>
/**
 * 用户业务提示词：只编辑 instruction，不展示输出格式/Schema
 */
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { clearUserTaskPrompt, getUserTaskPrompts, saveUserTaskPrompt } from '@/api/userAi'
import { getErrorMessage } from '@/utils/errorMessage'

const loading = ref(false)
const savingTask = ref('')
const customizationEnabled = ref(false)
const tasks = ref([])
const drafts = reactive({})

async function loadConfig() {
  loading.value = true
  try {
    const res = await getUserTaskPrompts()
    customizationEnabled.value = Boolean(res.customization_enabled)
    tasks.value = res.items || []
    for (const task of tasks.value) {
      drafts[task.task_type] = task.editable_instruction || ''
    }
  } catch (e) {
    message.error(getErrorMessage(e))
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
    await saveUserTaskPrompt(task.task_type, instruction)
    message.success(`${task.name}提示词已保存`)
    await loadConfig()
  } catch (e) {
    message.error(getErrorMessage(e))
  } finally {
    savingTask.value = ''
  }
}

async function resetTask(task) {
  savingTask.value = task.task_type
  try {
    await clearUserTaskPrompt(task.task_type)
    message.success('已恢复默认提示词')
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
      <p class="text-base font-semibold text-ink">提示词配置</p>
      <p class="mt-1 text-xs text-muted">
        可调整各 AI 功能的业务指令；输出格式由系统固定，界面不会展示也不可修改。
      </p>
    </a-card>

    <a-alert
      v-if="!loading && !customizationEnabled"
      type="info"
      show-icon
      message="管理员尚未开放用户自定义提示词"
      description="当前将使用管理员或系统默认业务指令。"
    />

    <a-spin :spinning="loading">
      <div v-if="customizationEnabled" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
                {{ task.task_type }}
                ·
                {{ task.has_override ? '个人覆盖' : `默认（${task.source === 'admin' ? '管理员' : '系统'}）` }}
              </p>
            </div>
            <a-textarea
              v-model:value="drafts[task.task_type]"
              :rows="6"
              class="input-field"
              placeholder="业务指令"
            />
            <div class="flex flex-col gap-2 sm:flex-row">
              <button
                class="btn-primary min-h-11 flex-1"
                :disabled="savingTask === task.task_type"
                @click="saveTask(task)"
              >
                保存
              </button>
              <button
                class="btn-ghost min-h-11 flex-1"
                :disabled="savingTask === task.task_type || !task.has_override"
                @click="resetTask(task)"
              >
                恢复默认
              </button>
            </div>
          </div>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>
