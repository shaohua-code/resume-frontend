/**
 * 简历状态管理
 * 管理当前编辑的简历数据、AI生成结果、模板选择等
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  generateResume as generateApi,
  generateResumeStream as generateStreamApi,
  matchJd as matchApi,
  scoreResume as scoreApi,
  scoreResumeStream as scoreStreamApi,
  saveResume as saveApi,
  createResume as createApi,
  getResumeList as getListApi,
  getResumeDetail as getDetailApi,
  deleteResume as deleteApi,
  batchDeleteResume as batchDeleteApi,
  getResumeCount as getCountApi,
} from '@/api/resume'
import { message } from 'ant-design-vue'
import { clampTemplateId } from '@/constants/templateRegistry'
import { useWalletStore } from '@/stores/wallet'

// AI 调用成功后刷新账户余额
async function refreshWalletBalance() {
  try {
    await useWalletStore().fetchBalance()
  } catch {
    // 忽略余额刷新失败
  }
}

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
  // 简历数量上限（每人最多 5 份）
  const resumeMaxCount = ref(5)
  // AI生成加载状态
  const generating = ref(false)
  // 流式生成过程中的实时文本（用于打字机 UI）
  const streamText = ref('')
  // JD匹配加载状态
  const matching = ref(false)
  // 评分加载状态
  const scoring = ref(false)

  // AI生成简历（流式优先，失败时回退同步接口）
  async function generateResume(formData, { onChunk } = {}) {
    generating.value = true
    streamText.value = ''
    try {
      let resumeData = null

      const persistResume = async (data) => {
        currentResume.value = data
        try {
          const createRes = await createApi({
            title: data?.name ? `${data.name}的简历` : '未命名简历',
            resume_json: data,
            template_id: currentTemplateId.value || 1,
            score: 0,
          })
          if (createRes.success && createRes.data?.id) {
            currentResumeId.value = createRes.data.id
          }
        } catch (createErr) {
          console.warn('[generateResume] 自动创建简历失败，保存时将无法更新:', createErr)
        }
      }

      try {
        resumeData = await generateStreamApi(formData, {
          onChunk: (chunk) => {
            streamText.value += chunk
            onChunk?.(chunk)
          },
        })
      } catch (streamErr) {
        // 余额不足等业务错误不再回退同步接口，避免重复弹窗
        const streamMsg = streamErr?.message || ''
        if (streamMsg.includes('余额不足')) {
          throw streamErr
        }
        console.warn('[generateResume] 流式生成失败，回退同步接口:', streamErr)
        const res = await generateApi(formData)
        if (res.success) resumeData = res.data
      }

      if (resumeData && Object.keys(resumeData).length) {
        // 兜底：确保 target_position 不丢失（AI 可能不返回该字段）
        if (!resumeData.target_position && formData?.target_position) {
          console.warn('[generateResume] AI 未返回 target_position，已从输入回填:', formData.target_position)
          resumeData.target_position = formData.target_position
        }
        // 兜底：确保姓名不丢失
        if (!resumeData.name && formData?.name) {
          resumeData.name = formData.name
        }
        await persistResume(resumeData)
        await refreshWalletBalance()
        message.success('简历生成成功')
        return resumeData
      }
      message.error('生成失败，请重试')
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || '生成失败，请重试'
      // 拦截器已提示过的 axios 错误不再重复弹窗
      if (!e?.response?.data?.detail) {
        message.error(msg)
      }
    } finally {
      generating.value = false
    }
  }

  // JD岗位匹配
  async function matchJd(resumeId, jdText) {
    matching.value = true
    try {
      const res = await matchApi(resumeId, jdText)
      if (res?.success) {
        await refreshWalletBalance()
      }
      return res
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || '匹配分析失败'
      if (!e?.response?.data?.detail) {
        message.error(msg)
      }
    } finally {
      matching.value = false
    }
  }

  // AI简历评分
  async function scoreResume(resumeId) {
    scoring.value = true
    try {
      const res = await scoreApi(resumeId)
      if (res?.success) {
        await refreshWalletBalance()
      }
      return res
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || '评分失败'
      if (!e?.response?.data?.detail) {
        message.error(msg)
      }
    } finally {
      scoring.value = false
    }
  }

  async function scoreResumeStream(resumeId, handlers = {}) {
    scoring.value = true
    try {
      const data = await scoreStreamApi(resumeId, handlers)
      if (data) {
        await refreshWalletBalance()
        return { success: true, data }
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || '评分失败'
      if (!e?.response?.data?.detail) {
        message.error(msg)
      }
      return { success: false, error: msg }
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
    // 后端 detail 接口通过 success() 包装，实际数据在 res.data 中
    const detailData = res.data || res
    currentResume.value = JSON.parse(detailData.resume_json || '{}')
    currentTemplateId.value = clampTemplateId(detailData.template_id)
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

  // 批量删除简历
  async function batchRemoveResume(ids) {
    const res = await batchDeleteApi(ids)
    if (res.success) {
      message.success(res.data?.message || '批量删除成功')
      await fetchResumeList()
    }
    return res
  }

  // 获取当前用户简历数量与上限
  async function fetchResumeCount() {
    const res = await getCountApi()
    if (res.success) {
      resumeMaxCount.value = res.data.max
    }
    return res
  }

  return {
    currentResume,
    currentResumeId,
    currentTemplateId,
    resumeList,
    resumeTotal,
    resumeMaxCount,
    generating,
    streamText,
    matching,
    scoring,
    generateResume,
    matchJd,
    scoreResume,
    scoreResumeStream,
    saveResume,
    fetchResumeList,
    fetchResumeCount,
    fetchResumeDetail,
    removeResume,
    batchRemoveResume,
  }
})
