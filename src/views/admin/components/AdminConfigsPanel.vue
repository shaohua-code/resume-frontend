<script setup>
/**
 * 系统配置：功能开关卡片 + 通用 JSON 配置项
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminConfigs, saveAdminConfig } from '@/api/admin'
import { getErrorMessage } from '@/utils/errorMessage'

const loading = ref(false)
const configs = ref([])
const configDrafts = reactive({})
const flagSaving = ref('')

const FEATURE_FLAGS = [
  {
    key: 'user_ai_model_customization',
    title: '用户自定义模型',
    desc: '开启后，登录用户可在「用户中心」按 AI 任务选择平台已启用模型（不可配置密钥）。',
  },
  {
    key: 'user_ai_prompt_customization',
    title: '用户自定义提示词',
    desc: '开启后，登录用户可编辑各 AI 任务业务指令；输出格式始终由系统锁定且不对用户展示。',
  },
]

const flagMap = computed(() => {
  const map = {}
  for (const item of configs.value) {
    map[item.config_key] = item
  }
  return map
})

const otherConfigs = computed(() => configs.value.filter(
  (item) => !FEATURE_FLAGS.some((flag) => flag.key === item.config_key),
))

function isFlagEnabled(key) {
  const value = flagMap.value[key]?.config_value || {}
  return value.enabled === true
}

async function loadConfigs() {
  loading.value = true
  try {
    const res = await getAdminConfigs()
    configs.value = res.items || []
    configs.value.forEach((item) => {
      configDrafts[item.config_key] = JSON.stringify(item.config_value || {}, null, 2)
    })
  } finally {
    loading.value = false
  }
}

async function toggleFlag(flag, enabled) {
  flagSaving.value = flag.key
  try {
    const existing = flagMap.value[flag.key]
    await saveAdminConfig(flag.key, {
      config_value: { enabled },
      description: existing?.description || flag.desc,
    })
    message.success(enabled ? `已开启${flag.title}` : `已关闭${flag.title}`)
    await loadConfigs()
  } catch (e) {
    message.error(getErrorMessage(e))
  } finally {
    flagSaving.value = ''
  }
}

async function saveConfig(item) {
  try {
    const configValue = JSON.parse(configDrafts[item.config_key] || '{}')
    await saveAdminConfig(item.config_key, {
      config_value: configValue,
      description: item.description,
    })
    message.success('配置已保存')
    await loadConfigs()
  } catch (e) {
    message.error(e?.message?.includes('JSON') ? '配置值必须是合法 JSON' : getErrorMessage(e))
  }
}

onMounted(loadConfigs)
</script>

<template>
  <a-spin :spinning="loading">
    <div class="space-y-4">
      <a-card :bordered="false" class="rounded-card shadow-card">
        <p class="text-base font-semibold text-ink">用户 AI 能力开关</p>
        <p class="mt-1 text-xs text-muted">仅超级管理员可切换；关闭后用户中心对应入口不可写入。</p>
        <div class="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
          <div
            v-for="flag in FEATURE_FLAGS"
            :key="flag.key"
            class="flex items-start justify-between gap-4 p-4 border rounded-card border-line/60"
          >
            <div class="min-w-0">
              <p class="font-medium text-ink">{{ flag.title }}</p>
              <p class="mt-1 text-xs leading-5 text-muted">{{ flag.desc }}</p>
            </div>
            <a-switch
              :checked="isFlagEnabled(flag.key)"
              :loading="flagSaving === flag.key"
              @update:checked="toggleFlag(flag, $event)"
            />
          </div>
        </div>
      </a-card>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <a-card v-for="item in otherConfigs" :key="item.config_key" :bordered="false" class="card-base">
          <template #title>
            <div>
              <p class="text-base font-semibold text-ink">{{ item.config_key }}</p>
              <p class="mt-1 text-xs text-muted">系统配置项</p>
            </div>
          </template>
          <a-textarea
            :value="configDrafts[item.config_key]"
            :rows="7"
            class="input-field"
            @update:value="configDrafts[item.config_key] = $event"
          />
          <a-input
            :value="item.description"
            placeholder="配置说明"
            class="input-field mt-3"
            @update:value="item.description = $event"
          />
          <button class="btn-primary mt-3" @click="saveConfig(item)">保存配置</button>
        </a-card>
      </div>
    </div>
  </a-spin>
</template>
