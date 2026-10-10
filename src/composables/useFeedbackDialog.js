import { ref } from 'vue'

// 顶栏和反馈组件共享打开状态，移动端入口无需依赖悬浮按钮是否已延迟挂载。
export const feedbackDialogOpen = ref(false)
