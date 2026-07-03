<!--
  根组件
  包含页面布局：顶部导航栏 + 主内容区 + 底部 Footer
-->
<template>
  <a-config-provider :locale="zhCN" :theme="{ token: antdToken }">
    <div class="relative flex min-h-screen flex-col bg-cream font-sans text-ink antialiased">
      <!-- 全页背景装饰层 -->
      <div class="page-bg pointer-events-none fixed inset-0 z-0" />
      <AppHeader v-if="!$route.meta.hideLayout" />
      <main
        class="relative z-10 flex-1 transition-all duration-300"
        :class="$route.meta.hideLayout ? 'pt-0' : 'pt-16'"
      >
        <router-view />
      </main>
      <AppFooter v-if="!$route.meta.hideLayout && !$route.meta.hideFooter" />
    </div>
  </a-config-provider>
</template>

<script setup>
import { onMounted } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { antdToken } from '@/constants/theme'
import { useTheme } from '@/composables/useTheme'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const { applyCssVariables } = useTheme()

// 挂载时将 theme.js 变量注入 :root
onMounted(() => {
  applyCssVariables()
})
</script>
