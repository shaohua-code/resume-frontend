/**
 * ESLint 配置
 * 适配 Vue 3 + Vite 项目，使用推荐规则
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Vue 相关规则（宽松配置，避免大面积修改现有代码）
    'vue/multi-word-component-names': 'off', // 允许单词组件名
    'vue/no-v-html': 'off', // 允许 v-html（项目中有 Markdown 渲染需求）
    'vue/require-default-prop': 'off', // props 默认值不强制
    'vue/html-self-closing': 'off', // 允许自闭合标签
    'vue/max-attributes-per-line': 'off', // 不限制每行属性数
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-indent': 'off', // 不强制 HTML 缩进
    'vue/multiline-html-element-content-newline': 'off',
    'vue/no-template-shadow': 'off', // 允许模板中的变量遮蔽
    'vue/no-mutating-props': 'off', // 允许通过 reactive 引用修改 props（项目中有意为之）
    'vue/no-side-effects-in-computed-properties': 'off', // 允许 computed 中有副作用
    
    // JavaScript 规则
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-console': ['warn', { 
      allow: ['warn', 'error'],
    }],
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    
    // 代码风格（宽松配置，不强制改写现有代码）
    'semi': 'off',
    'quotes': 'off',
    'comma-dangle': 'off',
    'indent': 'off',
    'no-multiple-empty-lines': 'off',
    'eol-last': 'off',
    'space-before-function-paren': 'off',
  },
  // 忽略特定文件
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.min.js',
  ],
}
