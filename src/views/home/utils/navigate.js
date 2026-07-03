/**
 * 首页导航辅助 - 未登录时拦截跳转（模板预览页除外）
 */
const PUBLIC_PATHS = ['/', '/templates']

export function createHomeNavigator(router, userStore) {
  return function navTo(path) {
    if (userStore.isLoggedIn || PUBLIC_PATHS.includes(path)) {
      router.push(path)
    } else {
      router.push('/login')
    }
  }
}
