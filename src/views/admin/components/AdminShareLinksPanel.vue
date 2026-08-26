<script setup>
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { buildShareLink, VISIT_PLATFORMS } from '@/constants/visitPlatforms'

/** 用当前站点 origin 生成各平台追踪链接，复制后发到对应渠道 */
const shareItems = computed(() =>
  VISIT_PLATFORMS.map((item) => ({
    ...item,
    url: buildShareLink(window.location.origin, item.key),
  })),
)

async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url)
    message.success('链接已复制')
  } catch {
    message.error('复制失败，请手动复制')
  }
}
</script>

<template>
  <div class="space-y-4">
    <a-card :bordered="false" class="card-base">
      <h2 class="text-lg font-semibold text-ink">分享链接</h2>
      <p class="mt-1 text-sm text-muted">
        微信、小红书等 App 内打开经常没有来源域名。请把对应平台的链接发出去，访客打开后会记到该平台。
      </p>
    </a-card>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <a-card
        v-for="item in shareItems"
        :key="item.key"
        :bordered="false"
        class="card-base"
      >
        <div class="flex flex-col gap-3">
          <div>
            <h3 class="text-base font-semibold text-ink">{{ item.label }}</h3>
            <p class="mt-1 break-all text-xs text-muted">{{ item.url }}</p>
          </div>
          <button
            class="btn-primary min-h-[44px]"
            type="button"
            @click="copyLink(item.url)"
          >
            复制链接
          </button>
        </div>
      </a-card>
    </div>
  </div>
</template>
