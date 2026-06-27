<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAdminConfigs, saveAdminConfig } from '@/api/admin'

const loading = ref(false)
const configs = ref([])
const configDrafts = reactive({})

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

async function saveConfig(item) {
  try {
    // 保存前解析 JSON，防止错误配置进入数据库后影响业务逻辑。
    const configValue = JSON.parse(configDrafts[item.config_key] || '{}')
    await saveAdminConfig(item.config_key, {
      config_value: configValue,
      description: item.description,
    })
    message.success('配置已保存')
    await loadConfigs()
  } catch (e) {
    message.error('配置值必须是合法 JSON')
  }
}

onMounted(loadConfigs)
</script>

<template>
  <a-spin :spinning="loading">
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <a-card v-for="item in configs" :key="item.config_key" :bordered="false" class="rounded-[28px] shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <template #title>
          <div>
            <p class="text-base font-semibold text-slate-950">{{ item.config_key }}</p>
            <p class="mt-1 text-xs text-slate-400">系统配置项</p>
          </div>
        </template>
        <a-textarea :value="configDrafts[item.config_key]" :rows="7" @update:value="configDrafts[item.config_key] = $event" />
        <a-input :value="item.description" placeholder="配置说明" class="mt-3" @update:value="item.description = $event" />
        <a-button type="primary" class="mt-3" @click="saveConfig(item)">保存配置</a-button>
      </a-card>
    </div>
  </a-spin>
</template>
