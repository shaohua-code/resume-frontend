/**
 * 简历分模块 AI 优化组合式函数
 * 提供个人评价、技能特长、项目经历、实习经历的流式优化能力
 * 优化基于完整简历内容与意向岗位信息
 */
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { optimizeResumePartStream } from '@/api/resume'

/**
 * 提取 AI 返回的技能数组
 * @param {string} text SSE 累积文本
 * @returns {string[]} 技能标签数组
 */
function extractSkills(text) {
  if (!text) return []
  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}') + 1
    if (start !== -1 && end > start) {
      const parsed = JSON.parse(text.slice(start, end))
      if (Array.isArray(parsed.optimized)) return parsed.optimized.filter(Boolean)
    }
  } catch (e) {
    /* 流式过程中 JSON 可能不完整，忽略解析错误 */
  }
  return []
}

/**
 * 过滤流式输出中的 JSON 包裹格式，只保留纯文本内容
 * 后端可能发送 {"optimized":"xxx"} 格式，需提取内部纯文本用于实时展示
 * @param {string} raw 原始累积文本
 * @returns {string} 过滤后的纯文本
 */
function filterStreamingJson(raw) {
  if (!raw) return ''
  // 匹配 {"optimized":"..."} 或 {"optimized": "..."} 格式，提取内部值
  const jsonMatch = raw.match(/\{[\s]*"optimized"[\s]*:[\s]*"((?:[^"\\]|\\.)*)"/)
  if (jsonMatch) return jsonMatch[1]
  // 无 JSON 包裹时直接返回原文
  // 移除可能的残留 JSON 结构字符（如 { } " optimized : 等）
  let cleaned = raw
    .replace(/\{[\s]*"optimized"[\s]*:[\s]*"/g, '')
    .replace(/"\s*\}\s*$/g, '')
    .replace(/^\s*"\s*/g, '')
  return cleaned || raw
}

/**
 * 使用简历优化器
 * @param {object} options
 * @param {import('vue').Ref<object>} options.resume 简历响应式对象
 */
export function useResumeOptimizer({ resume }) {
  // 各优化按钮的加载状态 key: `${type}-${index}`
  const optimizingMap = reactive(new Map())
  // 当前流式输出的文本，用于文本类字段实时回填
  const streamingText = ref('')
  // 技能优化时的临时文本，用于打印机效果展示
  const streamingSkillsText = ref('')

  /**
   * 生成优化状态 key
   * @param {string} type 优化类型
   * @param {number} [index] 项目/实习索引
   */
  function getKey(type, index) {
    return index === undefined ? type : `${type}-${index}`
  }

  /**
   * 判断指定优化是否进行中
   */
  function isOptimizing(type, index) {
    return optimizingMap.get(getKey(type, index)) || false
  }

  /**
   * 设置优化状态
   */
  function setOptimizing(type, index, value) {
    optimizingMap.set(getKey(type, index), value)
  }

  /**
   * 触发指定模块的 AI 流式优化
   * @param {'summary'|'skills'|'project'|'internship'} type 优化类型
   * @param {number} [index] 项目或实习索引
   */
  async function optimize(type, index) {
    const targetPosition = resume.value?.target_position || ''
    if (!targetPosition.trim()) {
      message.warning('请先填写意向岗位')
      return
    }

    const key = getKey(type, index)
    if (optimizingMap.get(key)) return

    // 项目/实习需确保目标项存在
    if (type === 'project' || type === 'internship') {
      const list = type === 'project' ? resume.value.projects : resume.value.internships
      if (!list || index < 0 || index >= list.length) {
        message.warning('目标项不存在')
        return
      }
    }

    setOptimizing(type, index, true)
    streamingText.value = ''
    streamingSkillsText.value = ''

    try {
      const payload = { resume: resume.value }
      if (type === 'project' || type === 'internship') {
        payload.index = index
      }

      await optimizeResumePartStream(type, payload, {
        onChunk: (chunk) => {
          // 技能类：累积到临时文本，展示打印机效果
          if (type === 'skills') {
            streamingSkillsText.value += chunk
            return
          }
          // 文本类：累积后过滤 JSON 包裹格式，再回填到对应输入框
          streamingText.value += chunk
          const filtered = filterStreamingJson(streamingText.value)
          if (type === 'summary') {
            resume.value.summary = filtered
          } else if (type === 'project') {
            resume.value.projects[index].description = filtered
          } else if (type === 'internship') {
            resume.value.internships[index].description = filtered
          }
        },
        onDone: (data) => {
          if (type === 'skills') {
            const skills = Array.isArray(data?.optimized) ? data.optimized : extractSkills(streamingSkillsText.value)
            if (skills.length) {
              resume.value.skills = skills
              message.success('技能特长已优化')
            } else {
              message.warning('AI 未返回有效技能，请重试')
            }
            streamingSkillsText.value = ''
          } else {
            const optimized = data?.optimized || ''
            if (type === 'summary') {
              resume.value.summary = optimized
            } else if (type === 'project') {
              resume.value.projects[index].description = optimized
            } else if (type === 'internship') {
              resume.value.internships[index].description = optimized
            }
            streamingText.value = ''
            message.success('优化完成')
          }
        },
        onError: (err) => {
          message.error(err.message || '优化失败，请重试')
        },
      })
    } catch (e) {
      message.error(e.message || '优化失败，请重试')
    } finally {
      setOptimizing(type, index, false)
    }
  }

  return {
    streamingText,
    streamingSkillsText,
    isOptimizing,
    optimize,
  }
}
