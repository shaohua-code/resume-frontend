/**
 * 简历状态管理
 * 管理当前编辑的简历数据、AI生成结果、模板选择等
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  generateResume as generateApi,
  optimizeProject as optimizeApi,
  matchJd as matchApi,
  scoreResume as scoreApi,
  saveResume as saveApi,
  createResume as createApi,
  getResumeList as getListApi,
  getResumeDetail as getDetailApi,
  deleteResume as deleteApi,
} from '@/api/resume'
import { message } from 'ant-design-vue'
import { clampTemplateId } from '@/constants/templateRegistry'

export const useResumeStore = defineStore('resume', () => {
  // 当前简历数据（AI生成后的完整内容）
  const currentResume = ref({})
  // 当前简历ID（编辑已有简历时使用，新建时为 null）
  const currentResumeId = ref(null)
  // 当前选中的模板ID
  const currentTemplateId = ref(1)
  // 简历列表
  const resumeList = ref([])
  // 简历总数
  const resumeTotal = ref(0)
  // AI生成加载状态
  const generating = ref(false)
  // AI优化加载状态
  const optimizing = ref(false)
  // JD匹配加载状态
  const matching = ref(false)
  // 评分加载状态
  const scoring = ref(false)

  // AI生成简历
  // 行为：调用 AI 接口 → 拿到结构化 JSON → 立即落库为一份新简历并记录 ID
  // 这样后续在 Editor 中点保存时，永远走 update 路径
  async function generateResume(formData) {
    generating.value = true
    try {
      const res = await generateApi(formData)
      if (res.success) {
        currentResume.value = res.data

        // AI 生成成功后立即创建数据库记录，确保后续保存是 update
        try {
          const createRes = await createApi({
            title: (res.data && res.data.name ? `${res.data.name}的简历` : '未命名简历'),
            resume_json: res.data,
            template_id: currentTemplateId.value || 1,
            score: 0,
          })
          if (createRes.success && createRes.data?.id) {
            currentResumeId.value = createRes.data.id
          }
        } catch (createErr) {
          console.warn('[generateResume] 自动创建简历失败，保存时将无法更新:', createErr)
        }

        message.success('简历生成成功')
        return res.data
      }
    } catch (e) {
      message.error('生成失败，请重试')
    } finally {
      generating.value = false
    }
  }

  // AI优化项目描述
  async function optimizeProject(description, targetPosition) {
    optimizing.value = true
    try {
      const res = await optimizeApi(description, targetPosition)
      if (res.success) {
        message.success('优化完成')
        return res.data
      }
    } catch (e) {
      message.error('优化失败，请重试')
    } finally {
      optimizing.value = false
    }
  }

  // JD岗位匹配
  async function matchJd(resumeId, jdText) {
    matching.value = true
    try {
      const res = await matchApi(resumeId, jdText)
      return res
    } catch (e) {
      message.error('匹配分析失败')
    } finally {
      matching.value = false
    }
  }

  // AI简历评分
  async function scoreResume(resumeId) {
    scoring.value = true
    try {
      const res = await scoreApi(resumeId)
      return res
    } catch (e) {
      message.error('评分失败')
    } finally {
      scoring.value = false
    }
  }

  // 保存简历：始终走 update 路径
  // 要求调用前已存在 currentResumeId（由 AI 生成 / 详情加载 / 列表点编辑 写入）
  // options.silent = true 时不弹 toast（用于自动保存、评分/JD 预保存等场景）
  async function saveResume(data, { silent = false } = {}) {
    if (!currentResumeId.value) {
      const msg = '当前简历尚未落库，无法保存。请先经过 AI 生成或从列表选择已有简历进入编辑。'
      if (!silent) message.error(msg)
      throw new Error(msg)
    }
    data.id = currentResumeId.value
    const res = await saveApi(data)
    if (res.success) {
      if (!silent) message.success('保存成功')
      return res.data
    }
  }

  // 获取简历列表
  async function fetchResumeList(page = 1, size = 10) {
    const res = await getListApi(page, size)
    resumeList.value = res.items
    resumeTotal.value = res.total
    return res
  }

  // 获取简历详情
  async function fetchResumeDetail(resumeId) {
    const res = await getDetailApi(resumeId)
    currentResume.value = JSON.parse(res.resume_json || '{}')
    currentTemplateId.value = clampTemplateId(res.template_id)
    currentResumeId.value = resumeId
    return res
  }

  // 删除简历
  async function removeResume(resumeId) {
    const res = await deleteApi(resumeId)
    if (res.success) {
      message.success('删除成功')
      await fetchResumeList()
    }
  }

  return {
    currentResume,
    currentResumeId,
    currentTemplateId,
    resumeList,
    resumeTotal,
    generating,
    optimizing,
    matching,
    scoring,
    generateResume,
    optimizeProject,
    matchJd,
    scoreResume,
    saveResume,
    fetchResumeList,
    fetchResumeDetail,
    removeResume,
  }
})
