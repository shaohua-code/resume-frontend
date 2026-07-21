<script setup>
/**
 * 优化前后对比面板
 * - 桌面 sm+：左右分栏
 * - 移动端（<640px）：Tab 切换，不做窄屏双栏
 * - inline=true：嵌在已有弹窗内，不套 Modal
 */
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import GradientButton from '@/components/GradientButton.vue'

const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  mode: { type: String, default: 'field' },
  title: { type: String, default: '优化对比' },
  loading: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  beforeText: { type: String, default: '' },
  afterText: { type: String, default: '' },
  sections: { type: Array, default: () => [] },
  beforeSummary: { type: String, default: '' },
  afterSummary: { type: String, default: '' },
  notes: { type: Array, default: () => [] },
  applyAllLabel: { type: String, default: '一键应用' },
  // 流式阶段右侧用插槽展示预览
  showAfterSlot: { type: Boolean, default: false },
})

const emit = defineEmits(['apply-all', 'apply-section', 'discard', 'close'])

const isNarrow = useMediaQuery('(max-width: 639px)')
const mobileTab = ref('after')
const appliedKeys = ref([])

watch(() => open.value, (visible) => {
  if (visible) {
    mobileTab.value = 'after'
    appliedKeys.value = []
  }
})

watch(() => props.loading, (loading, prev) => {
  if (loading && !prev) appliedKeys.value = []
})

const changedSections = computed(() => (props.sections || []).filter((item) => item.changed))

const canApplyAll = computed(() => {
  if (props.loading) return false
  if (props.mode === 'field') return Boolean(String(props.afterText || '').trim())
  return changedSections.value.length > 0 || Boolean(String(props.afterSummary || '').trim())
})

const displayBefore = computed(() => {
  if (props.mode === 'field') return props.beforeText || '（空）'
  return props.beforeSummary || '（空）'
})

const displayAfter = computed(() => {
  if (props.mode === 'field') {
    return props.afterText || (props.loading ? '（生成中…）' : '（空）')
  }
  return props.afterSummary || (props.loading ? '（生成中…）' : '（空）')
})

const useAfterSlot = computed(() => (
  props.showAfterSlot && props.loading && props.mode === 'resume'
))

function isApplied(key) {
  return appliedKeys.value.includes(key)
}

function handleApplySection(key) {
  if (isApplied(key)) return
  appliedKeys.value = [...appliedKeys.value, key]
  emit('apply-section', key)
}

function handleApplyAll() {
  emit('apply-all')
}

/** 点击「放弃」：明确丢弃结果 */
function handleDiscard() {
  emit('discard')
  if (!props.inline) open.value = false
}

/** 点遮罩/关闭：仅收起，不丢弃（生成页可再次打开对比） */
function handleClose() {
  if (!props.inline) open.value = false
  emit('close')
}
</script>

<template>
  <a-modal
    v-if="!inline"
    v-model:open="open"
    :title="title"
    :footer="null"
    :width="isNarrow ? 'calc(100vw - 24px)' : (mode === 'resume' ? 920 : 720)"
    :body-style="{ maxHeight: isNarrow ? 'calc(100vh - 120px)' : '70vh', overflowY: 'auto' }"
    destroy-on-close
    @cancel="handleClose"
  >
    <!-- 对比主体（Modal） -->
    <div>
      <div v-if="isNarrow" class="space-y-3">
        <a-segmented
          v-model:value="mobileTab"
          block
          :options="[
            { label: '优化后', value: 'after' },
            { label: '优化前', value: 'before' },
          ]"
        />
        <div class="min-h-[160px] rounded-card border border-line/50 bg-cream/40 p-3 text-sm leading-6 whitespace-pre-wrap text-ink">
          <slot v-if="mobileTab === 'after' && useAfterSlot" name="after" />
          <template v-else>
            {{ mobileTab === 'after' ? displayAfter : displayBefore }}
          </template>
        </div>
      </div>
      <div v-else class="grid grid-cols-2 gap-4">
        <div class="min-w-0">
          <p class="mb-2 text-xs font-semibold tracking-wide text-muted">优化前</p>
          <div class="max-h-[42vh] overflow-y-auto rounded-card border border-line/50 bg-cream/40 p-3 text-sm leading-6 whitespace-pre-wrap text-ink">
            {{ displayBefore }}
          </div>
        </div>
        <div class="min-w-0">
          <p class="mb-2 text-xs font-semibold tracking-wide text-brand-dark">优化后</p>
          <div class="max-h-[42vh] overflow-y-auto rounded-card border border-brand/30 bg-white p-3 text-sm leading-6 whitespace-pre-wrap text-ink shadow-soft">
            <slot v-if="useAfterSlot" name="after" />
            <template v-else>{{ displayAfter }}</template>
          </div>
        </div>
      </div>
      <div v-if="mode === 'resume' && changedSections.length && !loading" class="mt-4 space-y-2">
        <p class="text-sm font-semibold text-ink">变更模块（可逐项应用）</p>
        <div
          v-for="section in changedSections"
          :key="section.key"
          class="rounded-card border border-line/50 bg-white p-3"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <p class="text-sm font-medium text-ink">{{ section.label }}</p>
              <p class="mt-1 line-clamp-3 text-xs text-muted">{{ section.afterText }}</p>
            </div>
            <button
              type="button"
              class="btn-ghost min-h-11 shrink-0 px-4 text-sm"
              :disabled="isApplied(section.key)"
              @click="handleApplySection(section.key)"
            >
              {{ isApplied(section.key) ? '已应用' : '应用此项' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="notes.length && !loading" class="mt-4 rounded-card border border-line/40 bg-emerald-50/40 p-3">
        <p class="mb-2 text-sm font-semibold text-ink">优化亮点</p>
        <ul class="space-y-1 text-xs text-ink-secondary">
          <li v-for="(note, idx) in notes" :key="idx">· {{ note }}</li>
        </ul>
      </div>
      <div class="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" class="btn-ghost min-h-11 px-5" :disabled="loading" @click="handleDiscard">
          放弃
        </button>
        <GradientButton class="min-h-11 justify-center px-6" :disabled="!canApplyAll" @click="handleApplyAll">
          {{ applyAllLabel }}
        </GradientButton>
      </div>
    </div>
  </a-modal>

  <!-- 内嵌形态 -->
  <div v-else>
    <div v-if="isNarrow" class="space-y-3">
      <a-segmented
        v-model:value="mobileTab"
        block
        :options="[
          { label: '优化后', value: 'after' },
          { label: '优化前', value: 'before' },
        ]"
      />
      <div class="min-h-[160px] rounded-card border border-line/50 bg-cream/40 p-3 text-sm leading-6 whitespace-pre-wrap text-ink">
        <slot v-if="mobileTab === 'after' && useAfterSlot" name="after" />
        <template v-else>
          {{ mobileTab === 'after' ? displayAfter : displayBefore }}
        </template>
      </div>
    </div>
    <div v-else class="grid grid-cols-2 gap-4">
      <div class="min-w-0">
        <p class="mb-2 text-xs font-semibold tracking-wide text-muted">优化前</p>
        <div class="max-h-[36vh] overflow-y-auto rounded-card border border-line/50 bg-cream/40 p-3 text-sm leading-6 whitespace-pre-wrap text-ink">
          {{ displayBefore }}
        </div>
      </div>
      <div class="min-w-0">
        <p class="mb-2 text-xs font-semibold tracking-wide text-brand-dark">优化后</p>
        <div class="max-h-[36vh] overflow-y-auto rounded-card border border-brand/30 bg-white p-3 text-sm leading-6 whitespace-pre-wrap text-ink shadow-soft">
          <slot v-if="useAfterSlot" name="after" />
          <template v-else>{{ displayAfter }}</template>
        </div>
      </div>
    </div>
    <div v-if="mode === 'resume' && changedSections.length && !loading" class="mt-4 space-y-2">
      <p class="text-sm font-semibold text-ink">变更模块（可逐项应用）</p>
      <div
        v-for="section in changedSections"
        :key="section.key"
        class="rounded-card border border-line/50 bg-white p-3"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="text-sm font-medium text-ink">{{ section.label }}</p>
            <p class="mt-1 line-clamp-3 text-xs text-muted">{{ section.afterText }}</p>
          </div>
          <button
            type="button"
            class="btn-ghost min-h-11 shrink-0 px-4 text-sm"
            :disabled="isApplied(section.key)"
            @click="handleApplySection(section.key)"
          >
            {{ isApplied(section.key) ? '已应用' : '应用此项' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="notes.length && !loading" class="mt-4 rounded-card border border-line/40 bg-emerald-50/40 p-3">
      <p class="mb-2 text-sm font-semibold text-ink">优化亮点</p>
      <ul class="space-y-1 text-xs text-ink-secondary">
        <li v-for="(note, idx) in notes" :key="idx">· {{ note }}</li>
      </ul>
    </div>
    <div class="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" class="btn-ghost min-h-11 px-5" :disabled="loading" @click="handleDiscard">
        放弃
      </button>
      <GradientButton class="min-h-11 justify-center px-6" :disabled="!canApplyAll" @click="handleApplyAll">
        {{ applyAllLabel }}
      </GradientButton>
    </div>
  </div>
</template>
