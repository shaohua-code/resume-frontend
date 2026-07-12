<!--
  移动端简历卡片列表
  替代 a-table，提供更适合 H5 的浏览与操作体验
-->
<script setup>
import { useRouter } from 'vue-router'
import { DeleteOutlined } from '@ant-design/icons-vue'
import THEME from '@/constants/theme'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  /** 简历列表数据 */
  list: {
    type: Array,
    default: () => [],
  },
  /** 加载状态 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 已选中的简历 ID 列表 */
  selectedKeys: {
    type: Array,
    default: () => [],
  },
  /** 根据 template_id 获取模板名称 */
  getTemplateName: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:selectedKeys', 'delete'])

const router = useRouter()

/** 根据评分返回进度条颜色 */
function getScoreColor(score) {
  if (score >= 80) return THEME.chart.success
  if (score >= 60) return THEME.chart.warning
  return THEME.chart.danger
}

/** 切换单条简历的选中状态 */
function toggleSelect(id, checked) {
  const nextKeys = checked
    ? [...props.selectedKeys, id]
    : props.selectedKeys.filter((key) => key !== id)
  emit('update:selectedKeys', nextKeys)
}

/** 跳转编辑页 */
function handleEdit(id) {
  router.push(`/editor/${id}`)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="record in list"
      :key="record.id"
      class="rounded-card border border-line/60 bg-white p-4 shadow-sm"
    >
      <div class="flex items-start gap-3">
        <!-- 批量选择复选框 -->
        <a-checkbox
          :checked="selectedKeys.includes(record.id)"
          class="mt-1 shrink-0"
          @change="(e) => toggleSelect(record.id, e.target.checked)"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <p class="truncate text-base font-semibold text-ink">{{ record.title }}</p>
            <span class="tag-soft shrink-0">{{ getTemplateName(record.template_id) }}</span>
          </div>
          <div class="mt-3">
            <a-progress
              :percent="record.score || 0"
              size="small"
              :stroke-color="getScoreColor(record.score)"
            />
          </div>
          <p class="mt-2 text-xs text-muted">{{ formatDateTime(record.update_time) }}</p>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="btn-primary-sm min-h-[44px] flex-1"
          @click="handleEdit(record.id)"
        >
          编辑
        </button>
        <a-popconfirm title="确定删除？" @confirm="emit('delete', record.id)">
          <button
            type="button"
            class="btn-ghost-sm min-h-[44px] flex-1 border-danger/30 text-danger hover:bg-red-50"
          >
            <DeleteOutlined /> 删除
          </button>
        </a-popconfirm>
      </div>
    </div>

    <!-- 空状态由父组件处理，此处仅展示加载占位 -->
    <div v-if="loading && !list.length" class="py-8 text-center text-sm text-muted">
      加载中...
    </div>
  </div>
</template>
