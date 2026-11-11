<!--
  AI 生成进度指示器组件
  展示流式生成过程中的阶段状态，让用户清楚了解当前进展
-->
<script setup>
import { computed } from 'vue'
import {
  LoadingOutlined,
  CheckCircleFilled,
  CloudOutlined,
  FileTextOutlined,
  EditOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue'
import { mapBackendStage } from '@/utils/aiStageMapping'

const props = defineProps({
  // 当前阶段，支持后端返回的 stage 值和前端内部值
  // 后端值：preparing | connecting | analyzing | generating | optimizing | extracting | validating | completed
  // 前端值：connecting | analyzing | generating | optimizing | completed | error
  stage: {
    type: String,
    default: 'connecting',
  },
  // 是否正在加载
  loading: {
    type: Boolean,
    default: true,
  },
  // 任务类型：'generate' | 'optimize' | 'recognize' | 'jd-optimize'
  taskType: {
    type: String,
    default: 'generate',
  },
  // 是否为紧凑模式（仅显示当前阶段）
  compact: {
    type: Boolean,
    default: false,
  },
})

// 规范化后的当前阶段（映射后端 stage 值到前端进度阶段）
const normalizedStage = computed(() => mapBackendStage(props.stage, props.taskType))

// 根据任务类型定义不同的阶段配置
const stageConfigs = computed(() => {
  const baseStages = {
    generate: [
      { key: 'connecting', label: '连接 AI', icon: CloudOutlined },
      { key: 'analyzing', label: '分析资料', icon: FileTextOutlined },
      { key: 'generating', label: '生成简历', icon: EditOutlined },
      { key: 'optimizing', label: '优化润色', icon: RocketOutlined },
    ],
    optimize: [
      { key: 'connecting', label: '连接 AI', icon: CloudOutlined },
      { key: 'analyzing', label: '解析内容', icon: FileTextOutlined },
      { key: 'generating', label: '优化生成', icon: EditOutlined },
    ],
    recognize: [
      { key: 'connecting', label: '连接服务', icon: CloudOutlined },
      { key: 'analyzing', label: '识别内容', icon: FileTextOutlined },
      { key: 'generating', label: '提取字段', icon: EditOutlined },
    ],
    'jd-optimize': [
      { key: 'connecting', label: '连接 AI', icon: CloudOutlined },
      { key: 'analyzing', label: '分析岗位', icon: FileTextOutlined },
      { key: 'generating', label: '匹配优化', icon: EditOutlined },
      { key: 'optimizing', label: '润色输出', icon: RocketOutlined },
    ],
  }
  return baseStages[props.taskType] || baseStages.generate
})

// 当前阶段索引（使用规范化后的阶段值）
const currentStageIndex = computed(() => {
  const idx = stageConfigs.value.findIndex((s) => s.key === normalizedStage.value)
  return idx >= 0 ? idx : 0
})

// 进度百分比
const progressPercent = computed(() => {
  const total = stageConfigs.value.length
  if (!props.loading && normalizedStage.value !== 'error') return 100
  return Math.round(((currentStageIndex.value + 0.5) / total) * 100)
})

// 当前阶段配置
const currentStageConfig = computed(() => {
  return stageConfigs.value[currentStageIndex.value] || stageConfigs.value[0]
})

// 判断阶段状态：'completed' | 'active' | 'pending'
function getStageStatus(stageKey) {
  const stageIdx = stageConfigs.value.findIndex((s) => s.key === stageKey)
  if (stageIdx < currentStageIndex.value) return 'completed'
  if (stageIdx === currentStageIndex.value) return 'active'
  return 'pending'
}
</script>

<template>
  <!-- 紧凑模式：仅显示当前阶段文本 -->
  <div v-if="compact" class="ai-progress-compact">
    <span class="ai-progress-compact__icon">
      <LoadingOutlined v-if="loading" spin />
      <CheckCircleFilled v-else class="text-emerald-500" />
    </span>
    <span class="ai-progress-compact__text">
      {{ loading ? currentStageConfig.label + '中...' : '已完成' }}
    </span>
  </div>

  <!-- 完整模式：进度条 + 阶段指示器 -->
  <div v-else class="ai-progress">
    <!-- 进度条 -->
    <div class="ai-progress__bar">
      <div
        class="ai-progress__bar-fill"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- 阶段指示器 -->
    <div class="ai-progress__stages">
      <div
        v-for="(stage, idx) in stageConfigs"
        :key="stage.key"
        class="ai-progress__stage"
        :class="{
          'is-completed': getStageStatus(stage.key) === 'completed',
          'is-active': getStageStatus(stage.key) === 'active',
          'is-pending': getStageStatus(stage.key) === 'pending',
        }"
      >
        <span class="ai-progress__stage-icon">
          <CheckCircleFilled v-if="getStageStatus(stage.key) === 'completed'" />
          <LoadingOutlined v-else-if="getStageStatus(stage.key) === 'active' && loading" spin />
          <component :is="stage.icon" v-else />
        </span>
        <span class="ai-progress__stage-label">{{ stage.label }}</span>
        <!-- 连接线（除最后一个） -->
        <span
          v-if="idx < stageConfigs.length - 1"
          class="ai-progress__connector"
          :class="{ 'is-filled': getStageStatus(stage.key) === 'completed' }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 紧凑模式样式 */
.ai-progress-compact {
  @apply inline-flex items-center gap-1.5 rounded-full bg-brand-lighter/60 px-3 py-1.5 text-xs font-medium text-brand-dark;
}

.ai-progress-compact__icon {
  @apply text-sm;
}

/* 完整模式样式 */
.ai-progress {
  @apply w-full max-w-md space-y-3;
}

/* 进度条 */
.ai-progress__bar {
  @apply h-1.5 w-full overflow-hidden rounded-full bg-line/60;
}

.ai-progress__bar-fill {
  @apply h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500 ease-out;
}

/* 阶段容器 */
.ai-progress__stages {
  @apply flex items-start justify-between gap-1;
}

/* 单个阶段 */
.ai-progress__stage {
  @apply relative flex flex-1 flex-col items-center gap-1 text-center;
}

.ai-progress__stage-icon {
  @apply flex h-7 w-7 items-center justify-center rounded-full text-sm transition-all duration-300;
}

.ai-progress__stage-label {
  @apply text-[10px] font-medium leading-tight transition-colors duration-300 sm:text-xs;
}

/* 阶段状态样式 */
.ai-progress__stage.is-completed .ai-progress__stage-icon {
  @apply bg-emerald-500 text-white;
}

.ai-progress__stage.is-completed .ai-progress__stage-label {
  @apply text-emerald-600;
}

.ai-progress__stage.is-active .ai-progress__stage-icon {
  @apply bg-brand text-white shadow-md shadow-brand/30;
}

.ai-progress__stage.is-active .ai-progress__stage-label {
  @apply font-semibold text-brand-dark;
}

.ai-progress__stage.is-pending .ai-progress__stage-icon {
  @apply bg-line/80 text-muted;
}

.ai-progress__stage.is-pending .ai-progress__stage-label {
  @apply text-muted;
}

/* 连接线 */
.ai-progress__connector {
  @apply absolute left-[calc(50%+14px)] top-3.5 h-0.5 w-[calc(100%-28px)] bg-line/60 transition-colors duration-300;
}

.ai-progress__connector.is-filled {
  @apply bg-emerald-400;
}
</style>
