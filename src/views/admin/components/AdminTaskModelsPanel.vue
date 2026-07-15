<script setup>
/**
 * 任务模型配置页：一个业务任务只绑定一个已启用且能力类型匹配的模型。
 * 真正的类型校验仍由后端执行，前端过滤只用于减少误操作。
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAiTaskModels, saveAiTaskModel } from '@/api/admin'
import { getAiModelTypeLabel } from '@/constants/aiTasks'

const loading = ref(false)
const savingTask = ref('')
const tasks = ref([])
const models = ref([])
const selections = reactive({})

// 仅展示启用模型；类型必须和任务要求完全一致。
const enabledModelsByType = computed(() => {
  const grouped = {}
  for (const model of models.value) {
    if (!model.enabled) continue
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
    const res = await getAiTaskModels()
    tasks.value = res.items || []
    models.value = res.models || []
    for (const task of tasks.value) selections[task.task_type] = task.model_id || undefined
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
    await saveAiTaskModel(task.task_type, modelId)
    message.success(`${task.name}已切换模型`)
    await loadConfig()
  } finally {
    savingTask.value = ''
  }
}

onMounted(loadConfig)
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="rounded-card shadow-card">
      <div>
        <p class="text-base font-semibold text-ink">任务模型配置</p>
        <p class="mt-1 text-xs text-muted">每个 AI 任务独立选择模型；文本任务只能选择文本模型，图片识别只能选择视觉模型。</p>
      </div>
    </a-card>

    <a-spin :spinning="loading">
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <a-card
          v-for="task in tasks"
          :key="task.task_type"
          :bordered="false"
          class="rounded-card shadow-card"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-semibold text-ink">{{ task.name }}</p>
                <span :class="task.required_model_type === 'vision' ? 'badge-success' : 'tag-soft'">
                  {{ getAiModelTypeLabel(task.required_model_type) }}
                </span>
              </div>
              <p class="mt-1 break-all text-xs text-muted">{{ task.task_type }}</p>
              <p class="mt-2 text-xs text-muted">
                当前：{{ task.model ? `${task.model.name} · ${task.model.provider}` : '尚未配置，将使用环境变量回退模型' }}
              </p>
            </div>
            <div class="flex w-full flex-col gap-2 sm:w-[320px]">
              <a-select
                v-model:value="selections[task.task_type]"
                :options="getModelOptions(task)"
                placeholder="选择匹配类型的模型"
                class="w-full"
              />
              <button
                class="btn-primary min-h-11"
                :disabled="savingTask === task.task_type"
                @click="saveTask(task)"
              >
                {{ savingTask === task.task_type ? '保存中...' : '保存配置' }}
              </button>
            </div>
          </div>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>
