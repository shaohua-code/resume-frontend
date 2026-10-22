/**
 * 公开应用配置（无需登录）
 */
import request from '@/utils/request'

export function getPublicAppSettings() {
  return request.get('/app/public-settings')
}
