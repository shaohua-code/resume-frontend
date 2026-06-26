<!--
  首页
  Banner + 产品介绍 + 功能亮点 + 开始使用按钮
-->
<template>
  <div class="home-page">
    <!-- Banner区域 -->
    <section class="banner">
      <div class="banner-content">
        <h1 class="banner-title">AI简历助手 · 校园版</h1>
        <p class="banner-desc">不会写简历？10分钟拥有一份专业校招简历</p>
        <div class="banner-actions">
          <a-button type="primary" size="large" @click="handleStart">
            <RocketOutlined /> {{ userStore.isLoggedIn ? '开始生成简历' : '立即开始（去登录）' }}
          </a-button>
          <a-button size="large" ghost @click="handleUpload">
            <CloudUploadOutlined /> 上传PDF优化
          </a-button>
          <a-button v-if="!userStore.isLoggedIn" size="large" ghost @click="$router.push('/login')">
            登录账号
          </a-button>
          <a-button v-else size="large" ghost @click="$router.push('/user')">
            <UserOutlined /> 我的简历
          </a-button>
        </div>
        <div class="banner-stats">
          <div class="stat-item">
            <span class="stat-num">10</span>
            <span class="stat-label">分钟生成简历</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">3</span>
            <span class="stat-label">套专业模板</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">100</span>
            <span class="stat-label">分AI评分</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能介绍 -->
    <section class="features">
      <h2 class="section-title" style="text-align: center">核心功能</h2>
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :md="6" v-for="item in features" :key="item.title">
          <a-card class="feature-card" hoverable @click="handleFeatureClick(item.path)">
            <div class="feature-icon">{{ item.icon }}</div>
            <h3 class="feature-title">{{ item.title }}</h3>
            <p class="feature-desc">{{ item.desc }}</p>
          </a-card>
        </a-col>
      </a-row>
    </section>

    <!-- 使用流程 -->
    <section class="steps-section">
      <h2 class="section-title" style="text-align: center">使用流程</h2>
      <a-steps :current="0" class="flow-steps">
        <a-step title="填写信息" description="输入基本信息和项目经历" />
        <a-step title="AI生成" description="AI自动生成专业简历" />
        <a-step title="编辑修改" description="在线编辑和优化内容" />
        <a-step title="导出PDF" description="一键导出投递简历" />
      </a-steps>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { RocketOutlined, UserOutlined, CloudUploadOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const features = [
  { icon: '🤖', title: 'AI生成简历', path: '/generate', desc: '填写信息后AI自动生成专业校招简历，使用STAR法则优化' },
  { icon: '📄', title: '上传PDF优化', path: '/upload-optimize', desc: '上传现有PDF简历，AI自动提取并整体优化重写' },
  { icon: '✨', title: 'AI优化项目', path: '/generate', desc: '智能优化项目经历描述，突出技术亮点和量化成果' },
  { icon: '🎯', title: 'JD岗位匹配', path: '/generate', desc: '分析简历与岗位JD的匹配度，给出优化建议' },
]

function handleStart() {
  navTo('/generate')
}

function handleUpload() {
  navTo('/upload-optimize')
}

function handleFeatureClick(path) {
  navTo(path)
}

function navTo(path) {
  if (userStore.isLoggedIn) {
    router.push(path)
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.banner {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  padding: 80px 24px 60px;
  text-align: center;
  color: #fff;
}
.banner-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
}
.banner-desc {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
}
.banner-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 40px;
}
.banner-actions .ant-btn-background-ghost {
  color: #fff;
  border-color: #fff;
}
.banner-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 36px;
  font-weight: 700;
}
.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}
.features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px;
}
.feature-card {
  text-align: center;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}
.feature-card:hover {
  transform: translateY(-4px);
  border-color: #1677ff;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.12);
}
.feature-card:hover .feature-title {
  color: #1677ff;
}
.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}
.feature-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}
.steps-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}
.flow-steps {
  margin-top: 24px;
}
</style>
