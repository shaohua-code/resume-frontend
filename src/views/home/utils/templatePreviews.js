/**
 * 首页模板预览配置 - 复用 demoResume 与 templateRegistry
 */
import { DEMO_RESUME, FEATURED_TEMPLATE_IDS } from './demoResume'
import { TEMPLATE_LIST, getTemplateName } from '@/constants/templateRegistry'

export { DEMO_RESUME, FEATURED_TEMPLATE_IDS }

/** 获取首页轮播模板项 */
export function getFeaturedTemplates() {
  return FEATURED_TEMPLATE_IDS
    .map((id) => {
      const meta = TEMPLATE_LIST.find((t) => t.id === id)
      if (!meta) return null
      return {
        id: meta.id,
        name: getTemplateName(meta.id),
        desc: meta.desc,
        color: meta.color,
      }
    })
    .filter(Boolean)
}

/** 全部模板预览列表 */
export function getAllTemplatePreviews() {
  return TEMPLATE_LIST.map((t) => ({
    id: t.id,
    name: t.name,
    desc: t.desc,
    color: t.color,
  }))
}
