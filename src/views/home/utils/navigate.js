/**
 * 首页导航辅助 - 未登录时拦截跳转（模板预览页除外）
 */
const PUBLIC_PATHS = ['/', '/templates']

export function createHomeNavigator(router, userStore) {
  return function navTo(path) {
    const pathname = path.split('?')[0]
    if (userStore.isLoggedIn || PUBLIC_PATHS.includes(pathname)) {
      router.push(path)
    } else {
      // 直接跳登录会丢失目标页；经受保护路由让守卫保存原始任务位置。
      router.push(path)
    }
  }
}
