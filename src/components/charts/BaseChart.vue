<script setup>
/**
 * ECharts 基础封装组件
 * 按需注册图表类型和渲染器，统一对外暴露 option 配置和高度。
 */
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

// 按需注册，避免打包整个 echarts 体积；DataZoom 支持图表数据缩放
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
])

defineProps({
  option: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: String,
    default: '280px',
  },
  // 透传 loading 态，配合骨架屏外的图表内置加载动画
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <v-chart
    :option="option"
    :loading="loading"
    autoresize
    :style="{ height, width: '100%' }"
  />
</template>
