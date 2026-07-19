import request from '@/utils/request'

/** 用户任务模型配置（仅选择，不配密钥） */
export function getUserTaskModels() {
  return request.get('/user/task-models')
}

export function saveUserTaskModel(taskType, modelId) {
  return request.put(`/user/task-models/${taskType}`, { model_id: modelId })
}

export function clearUserTaskModel(taskType) {
  return request.delete(`/user/task-models/${taskType}`)
}

/** 用户业务提示词（不含输出格式） */
export function getUserTaskPrompts() {
  return request.get('/user/task-prompts')
}

export function saveUserTaskPrompt(taskType, instruction) {
  return request.put(`/user/task-prompts/${taskType}`, { instruction })
}

export function clearUserTaskPrompt(taskType) {
  return request.delete(`/user/task-prompts/${taskType}`)
}
