<!--
  根组件
  包含页面布局：顶部导航栏 + 主内容区
  根据路由是否需要导航栏来动态显示
-->
<template>
  <a-config-provider :locale="zhCN">
    <div class="app-container">
      <AppHeader v-if="!$route.meta.hideLayout" />
      <main class="main-content" :class="{ 'no-header': $route.meta.hideLayout }">
        <router-view />
      </main>
    </div>
  </a-config-provider>
</template>

<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import AppHeader from '@/components/AppHeader.vue'


</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}
.main-content {
  padding-top: 64px;
  min-height: 100vh;
}
.main-content.no-header {
  padding-top: 0;
}
</style>
