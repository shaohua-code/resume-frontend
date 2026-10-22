/**
 * 公开应用配置（默认模板等）
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPublicAppSettings } from '@/api/app'
import { clampTemplateId, DEFAULT_TEMPLATE_ID } from '@/constants/templateRegistry'

export const useAppSettingsStore = defineStore('appSettings', () => {
  const defaultTemplateId = ref(DEFAULT_TEMPLATE_ID)
  const loaded = ref(false)

  /** 拉取默认模板等公开配置 */
  async function fetchPublicSettings() {
    try {
      const res = await getPublicAppSettings()
      defaultTemplateId.value = clampTemplateId(res.data?.default_template_id, DEFAULT_TEMPLATE_ID)
    } catch {
      defaultTemplateId.value = DEFAULT_TEMPLATE_ID
    } finally {
      loaded.value = true
    }
  }

  /** 超级管理员保存默认模板后同步本地缓存 */
  function setDefaultTemplateId(id) {
    defaultTemplateId.value = clampTemplateId(id, DEFAULT_TEMPLATE_ID)
  }

  return {
    defaultTemplateId,
    loaded,
    fetchPublicSettings,
    setDefaultTemplateId,
  }
})
