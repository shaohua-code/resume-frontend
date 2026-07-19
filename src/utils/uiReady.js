/**
 * 全局 UI 就绪状态
 * 用于非 lightweight 路由预取完整 Ant Design 时展示友好加载态（无进度条百分比）
 */
import { ref } from 'vue'

/** 完整 ant-design-vue 是否已注册到应用 */
export const antDesignReady = ref(false)
