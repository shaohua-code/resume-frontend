/**
 * 用户中心：账户资料与改密
 */
import request from '@/utils/request'

/** 获取当前登录用户资料 */
export function getUserProfile() {
  return request.get('/user/profile')
}

/** 更新昵称等自助资料 */
export function updateUserProfile(payload) {
  return request.patch('/user/profile', payload)
}

/** 使用旧密码修改密码（成功后返回新会话令牌） */
export function changeUserPassword(oldPassword, newPassword) {
  return request.post('/user/password', {
    old_password: oldPassword,
    new_password: newPassword,
  })
}
