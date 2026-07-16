/**
 * 基于岗位 JD 流式优化简历 — 组合式函数
 * 负责 SSE 调用与状态管理；流式过程中仅累积预览文本，不写入父级 resume
 */
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { optimizeResumeByJdStream } from '@/api/resume'

export function useJdResumeOptimize() {
  // 流式 SSE 累积文本，供 StreamResumePreview 增量解析
  const streamText = ref('')
  // 是否正在优化中
  const loading = ref(false)
  // 优化完成后的最终结果 { resume, optimization_notes }
  const optimizeResult = ref(null)
  // 最近一次错误信息
  const errorMsg = ref('')

  /**
   * 重置所有状态（关闭弹窗时调用）
   */
  function reset() {
    streamText.value = ''
    loading.value = false
    optimizeResult.value = null
    errorMsg.value = ''
  }

  /**
   * 开始基于 JD 流式优化简历
   * @param {object} resume 当前待优化的简历快照
   * @param {object} options 选项 { jdText, skipBasicCheck, successMessage }
   */
  async function startOptimize(resume, options = {}) {
    const trimmedJd = String(options.jdText || '').trim()
    if (!trimmedJd) {
      message.warning('请先粘贴岗位 JD 内容')
      return false
    }

    if (loading.value) return false

    loading.value = true
    streamText.value = ''
    optimizeResult.value = null
    errorMsg.value = ''

    try {
      const result = await optimizeResumeByJdStream(resume || {}, trimmedJd, {
        onChunk: (chunk) => {
          // 仅累积流式文本用于预览，禁止在此处修改父级 resume
          streamText.value += chunk
        },
        onDone: (data) => {
          optimizeResult.value = {
            resume: data?.resume || {},
            optimization_notes: data?.optimization_notes || [],
          }
        },
      })

      // onDone 未触发时兜底使用返回值
      if (!optimizeResult.value && result) {
        optimizeResult.value = {
          resume: result.resume || {},
          optimization_notes: result.optimization_notes || [],
        }
      }

      if (!optimizeResult.value?.resume || !Object.keys(optimizeResult.value.resume).length) {
        message.warning('AI 未返回有效简历，请重试')
        return false
      }

      const successMsg = options.successMessage
        || (options.inputOnly === false ? '岗位优化完成，请预览后点击「应用替换」' : '岗位优化完成')
      message.success(successMsg)
      return true
    } catch (e) {
      errorMsg.value = e.message || '岗位优化失败，请重试'
      message.error(errorMsg.value)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取可应用的优化后简历（供父组件合并）
   * @returns {object|null}
   */
  function getOptimizedResume() {
    return optimizeResult.value?.resume || null
  }

  return {
    streamText,
    loading,
    optimizeResult,
    errorMsg,
    reset,
    startOptimize,
    getOptimizedResume,
  }
}
