/**
 * 用户中心模板名称映射
 */
import { TEMPLATE_LIST, getTemplateName } from '@/constants/templateRegistry'

export const templateMap = Object.fromEntries(
  TEMPLATE_LIST.map((t) => [t.id, t.name])
)

export { getTemplateName }
