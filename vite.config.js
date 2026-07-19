import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host:'0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 只拆 vue 运行时；antd 按需 es/ 留在业务包，全量 import('ant-design-vue') 由 Vite 自成动态 chunk，避免首页 preload 1MB+
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (
            id.includes('vue-router')
            || id.includes('/pinia/')
            || id.includes('\\pinia\\')
            || id.includes('/vue/dist/')
            || id.includes('\\vue\\dist\\')
            || id.includes('@vue/reactivity')
            || id.includes('@vue/runtime')
            || id.includes('@vue/shared')
          ) {
            return 'vue-vendor'
          }
          return undefined
        },
      },
    },
  },
})
