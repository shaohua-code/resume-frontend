<script setup>
/**
 * 数据口径卡片把全局指标、周期活跃与本人钱包的边界直接放在数据旁边。
 */
import { Info } from 'lucide-vue-next'

// 这些说明对应 dashboard API 的固定统计口径，减少管理员跨卡片猜测范围。
const definitions = [
  { title: '累计规模', description: '累计用户是当前权限范围内的用户总量；新建简历是所选周期内创建的简历数。' },
  { title: '活跃用户', description: '所选周期内至少产生过一次 AI 调用的去重用户数，不等同于登录人数。' },
  { title: '周期比较', description: '本期与紧邻的等时长上一周期比较；上一周期为 0 时不计算百分比。' },
  { title: '个人额度', description: '余额、AI 消费和发放只属于当前管理员账户，不代表全站营收或全站用户余额。' },
]
</script>

<template>
  <section class="card-base" aria-labelledby="data-glossary-heading">
    <div class="mb-4 flex items-start gap-3">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lighter text-brand-dark">
        <Info class="h-5 w-5" />
      </span>
      <div>
        <h2 id="data-glossary-heading" class="text-base font-semibold text-ink">数据口径</h2>
        <p class="mt-1 text-xs text-muted">了解指标范围，避免把个人额度当成全站收入。</p>
      </div>
    </div>
    <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div v-for="item in definitions" :key="item.title" class="rounded-xl bg-cream p-3">
        <dt class="text-sm font-medium text-ink">{{ item.title }}</dt>
        <dd class="mt-1 text-xs leading-5 text-muted">{{ item.description }}</dd>
      </div>
    </dl>
  </section>
</template>
