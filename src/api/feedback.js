/**
 * 用户反馈 API
 */
import request from '@/utils/request'

/** 提交用户反馈（富文本 HTML） */
export function submitFeedback(contentHtml) {
  return request.post('/feedback', { content_html: contentHtml })
}
