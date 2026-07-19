import request from '@/utils/request'

/** 当前时间窗内已启用的版本公告 */
export function getActiveAnnouncements() {
  return request.get('/announcements/active')
}
