/**
 * 简历分模块 AI 优化组合式函数
 * 流式结果先进入对比面板，确认后再写回简历；禁止边流式边覆盖原文
 */
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { optimizeResumePartStream } from '@/api/resume'
import { validateRequiredBasicFields } from '@/constants/resumeFieldSchema'
import {
  applyModuleOptimizeResult,
  snapshotResume,
  snapshotField,
} from '@/utils/optimizeDiff'
import { getErrorMessage } from '@/utils/errorMessage'

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
 * @param {string} raw 原始累积文本
 * @returns {string} 过滤后的纯文本
 */
function filterStreamingJson(raw) {
  if (!raw) return ''
  const jsonMatch = raw.match(/\{[\s]*"optimized"[\s]*:[\s]*"((?:[^"\\]|\\.)*)"/)
  if (jsonMatch) return jsonMatch[1]
  let cleaned = raw
    .replace(/\{[\s]*"optimized"[\s]*:[\s]*"/g, '')
    .replace(/"\s*\}\s*$/g, '')
    .replace(/^\s*"\s*/g, '')
  return cleaned || raw
}

/**
 * @param {object} options
 * @param {import('vue').Ref<object>} options.resume
 */
export function useResumeOptimizer({ resume }) {
  const optimizingMap = reactive(new Map())
  const streamingText = ref('')
  const streamingSkillsText = ref('')

  // 对比面板状态：不直接改 resume，等用户应用
  const diffOpen = ref(false)
  const diffLoading = ref(false)
  const pendingDiff = ref(null)

  function getKey(type, index) {
    return index === undefined ? type : `${type}-${index}`
  }

  function isOptimizing(type, index) {
    return optimizingMap.get(getKey(type, index)) || false
  }

  function setOptimizing(type, index, value) {
    optimizingMap.set(getKey(type, index), value)
  }

  function formatAfterText(type, value) {
    if (type === 'skills') {
      return Array.isArray(value) ? value.join('、') : String(value || '')
    }
    return String(value || '')
  }

  function formatBeforeText(type, value) {
    if (type === 'skills') {
      return Array.isArray(value) ? value.join('、') : String(value || '')
    }
    return String(value || '')
  }

  /**
   * 触发指定模块的 AI 流式优化
   * @param {'summary'|'skills'|'project'|'internship'|'work_experience'} type
   * @param {number} [index]
   */
  async function optimize(type, index) {
    const basicCheck = validateRequiredBasicFields(resume.value || {})
    if (!basicCheck.ok) {
      message.warning(basicCheck.message)
      return
    }

    const key = getKey(type, index)
    if (optimizingMap.get(key)) return

    if (type === 'project' || type === 'internship' || type === 'work_experience') {
      const listMap = { project: 'projects', internship: 'internships', work_experience: 'work_experiences' }
      const list = resume.value[listMap[type]]
      if (!list || index < 0 || index >= list.length) {
        message.warning('目标项不存在')
        return
      }
    }

    // 冻结优化前原文，流式过程只更新 pending.after
    const beforeValue = snapshotField(resume.value, type, index)
    pendingDiff.value = {
      type,
      index,
      // 冻结整份简历，模板对比左侧始终展示优化前版本。
      beforeResume: snapshotResume(resume.value),
      beforeText: formatBeforeText(type, beforeValue),
      afterText: '',
      afterValue: type === 'skills' ? [] : '',
    }
    diffOpen.value = true
    diffLoading.value = true
    setOptimizing(type, index, true)
    streamingText.value = ''
    streamingSkillsText.value = ''

    try {
      const payload = { resume: resume.value }
      if (type === 'project' || type === 'internship' || type === 'work_experience') {
        payload.index = index
      }

      await optimizeResumePartStream(type, payload, {
        onChunk: (chunk) => {
          if (type === 'skills') {
            streamingSkillsText.value += chunk
            const skills = extractSkills(streamingSkillsText.value)
            pendingDiff.value = {
              ...pendingDiff.value,
              afterValue: skills.length ? skills : pendingDiff.value.afterValue,
              afterText: skills.length
                ? skills.join('、')
                : formatAfterText('skills', extractSkillsPreview(streamingSkillsText.value)),
            }
            return
          }
          streamingText.value += chunk
          const filtered = filterStreamingJson(streamingText.value)
          pendingDiff.value = {
            ...pendingDiff.value,
            afterValue: filtered,
            afterText: filtered,
          }
        },
        onDone: (data) => {
          if (type === 'skills') {
            const skills = Array.isArray(data?.optimized)
              ? data.optimized
              : extractSkills(streamingSkillsText.value)
            if (!skills.length) {
              message.warning('AI 未返回有效技能，请重试')
              discardDiff()
              return
            }
            pendingDiff.value = {
              ...pendingDiff.value,
              afterValue: skills,
              afterText: skills.join('、'),
            }
          } else {
            const optimized = data?.optimized || pendingDiff.value?.afterValue || ''
            if (!String(optimized || '').trim()) {
              message.warning('AI 未返回有效内容，请重试')
              discardDiff()
              return
            }
            pendingDiff.value = {
              ...pendingDiff.value,
              afterValue: optimized,
              afterText: String(optimized),
            }
          }
          streamingText.value = ''
          streamingSkillsText.value = ''
          message.success('优化完成，请对比后选择应用或放弃')
        },
      })
    } catch (e) {
      message.error(getErrorMessage(e) || '优化失败，请重试')
      discardDiff()
    } finally {
      setOptimizing(type, index, false)
      diffLoading.value = false
    }
  }

  /** 技能流式过程中尽量展示可读预览 */
  function extractSkillsPreview(raw) {
    if (!raw) return ''
    try {
      const start = raw.indexOf('[')
      const end = raw.lastIndexOf(']') + 1
      if (start !== -1 && end > start) {
        const arr = JSON.parse(raw.slice(start, end).replace(/,\s*]/g, ']'))
        if (Array.isArray(arr)) return arr.join('、')
      }
    } catch {
      /* ignore */
    }
    return raw.replace(/\{[\s]*"optimized"[\s]*:[\s]*"?/g, '').replace(/"?\s*\}\s*$/g, '')
  }

  /** 一键应用当前模块优化结果 */
  function applyPendingDiff() {
    const pending = pendingDiff.value
    if (!pending) return
    applyModuleOptimizeResult(resume.value, pending.type, pending.index, pending.afterValue)
    message.success('已应用优化结果，记得保存简历')
    pendingDiff.value = null
    diffOpen.value = false
  }

  function discardDiff() {
    pendingDiff.value = null
    streamingText.value = ''
    streamingSkillsText.value = ''
    diffOpen.value = false
    diffLoading.value = false
  }

  return {
    streamingText,
    streamingSkillsText,
    isOptimizing,
    optimize,
    diffOpen,
    diffLoading,
    pendingDiff,
    applyPendingDiff,
    discardDiff,
  }
}
