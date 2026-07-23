<script setup>
/**
 * 用户任务模型选择：交互对齐管理端 task-models，不可配置密钥
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { clearUserTaskModel, getUserTaskModels, saveUserTaskModel } from '@/api/userAi'
// 用户侧任务名称统一使用前端中文映射，避免接口标识直接暴露到界面。
import { getAiModelTypeLabel, getAiTaskLabel } from '@/constants/aiTasks'
import { getErrorMessage } from '@/utils/errorMessage'

const loading = ref(false)
const savingTask = ref('')
const customizationEnabled = ref(false)
const tasks = ref([])
const models = ref([])
const selections = reactive({})

const enabledModelsByType = computed(() => {
  const grouped = {}
  for (const model of models.value) {
    if (!grouped[model.model_type]) grouped[model.model_type] = []
    grouped[model.model_type].push(model)
  }
  return grouped
})

function getModelOptions(task) {
  return (enabledModelsByType.value[task.required_model_type] || []).map((model) => ({
    value: model.id,
    label: `${model.name}（${model.model_key}）`,
  }))
}

async function loadConfig() {
  loading.value = true
  try {
    const res = await getUserTaskModels()
    customizationEnabled.value = Boolean(res.customization_enabled)
    tasks.value = res.items || []
    models.value = res.models || []
    for (const task of tasks.value) {
      selections[task.task_type] = task.override_model_id || task.global_model_id || undefined
    }
  } catch (e) {
    message.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

async function saveTask(task) {
  const modelId = selections[task.task_type]
  if (!modelId) {
    message.warning('请选择模型')
    return
  }
  savingTask.value = task.task_type
  try {
    await saveUserTaskModel(task.task_type, modelId)
    message.success(`${getAiTaskLabel(task.task_type)}已切换模型`)
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
    await clearUserTaskModel(task.task_type)
    message.success('已恢复管理员默认')
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
      <p class="text-base font-semibold text-ink">模型配置</p>
      <p class="mt-1 text-xs text-muted">
        按 AI 任务选择平台已启用的模型；未设置时使用管理员默认配置。
      </p>
    </a-card>

    <a-alert
      v-if="!loading && !customizationEnabled"
      type="info"
      show-icon
      message="管理员尚未开放用户自定义模型"
      description="当前所有 AI 任务将继续使用管理员在后台配置的默认模型。"
    />

    <a-spin :spinning="loading">
      <div v-if="customizationEnabled" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <a-card
          v-for="task in tasks"
          :key="task.task_type"
          :bordered="false"
          class="rounded-card shadow-card"
        >
          <div class="flex flex-col gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <!-- 识别任务等标题统一从任务映射读取，避免遗漏单个新增任务。 -->
                <p class="font-semibold text-ink">{{ getAiTaskLabel(task.task_type) }}</p>
                <span :class="task.required_model_type === 'vision' ? 'badge-success' : 'tag-soft'">
                  {{ getAiModelTypeLabel(task.required_model_type) }}
                </span>
              </div>
              <p class="mt-2 text-xs text-muted">
                当前：{{ task.model ? `${task.model.name} · ${task.model.provider}` : '管理员默认 / 环境回退' }}
                <span v-if="task.has_override">（个人覆盖）</span>
              </p>
            </div>
            <a-select
              v-model:value="selections[task.task_type]"
              :options="getModelOptions(task)"
              placeholder="选择匹配类型的模型"
              class="w-full"
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
