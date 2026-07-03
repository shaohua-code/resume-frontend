/**
 * 首页导航辅助 - 未登录时拦截跳转
 */
export function createHomeNavigator(router, userStore) {
  return function navTo(path) {
    if (userStore.isLoggedIn || path === '/') {
      router.push(path)
    } else {
      router.push('/login')
    }
  }
}
