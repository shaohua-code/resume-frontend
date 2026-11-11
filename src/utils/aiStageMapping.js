/**
 * AI 生成阶段映射工具
 * 将后端 SSE 返回的 stage 值映射到前端进度组件使用的阶段
 */

/**
 * 后端 stage 值到前端进度阶段的映射
 * 后端 stage: preparing | connecting | analyzing | generating | optimizing | extracting | validating | completed
 * 前端 stage: connecting | analyzing | generating | optimizing
 * @param {string} backendStage 后端返回的 stage 值
 * @param {string} taskType 任务类型：generate | optimize | recognize | jd-optimize
 * @returns {string} 前端进度组件使用的阶段值
 */
export function mapBackendStage(backendStage, taskType = 'generate') {
  const stageMap = {
    preparing: 'connecting',
    connecting: 'connecting',
    analyzing: 'analyzing',
    generating: 'generating',
    optimizing: 'optimizing',
    // extracting 在识别任务中对应 generating（提取字段阶段）
    extracting: taskType === 'recognize' ? 'generating' : 'analyzing',
    validating: 'optimizing',
    completed: 'completed',
  }
  return stageMap[backendStage] || backendStage || 'connecting'
}

/**
 * 判断是否为有效的后端 stage 值
 * @param {string} stage 待检查的 stage 值
 * @returns {boolean}
 */
export function isValidBackendStage(stage) {
  const validStages = [
    'preparing',
    'connecting',
    'analyzing',
    'generating',
    'optimizing',
    'extracting',
    'validating',
    'completed',
  ]
  return validStages.includes(stage)
}

/**
 * 判断是否为心跳事件
 * @param {object} event SSE 解析后的事件对象
 * @returns {boolean}
 */
export function isHeartbeatEvent(event) {
  return event?.type === 'heartbeat'
}
