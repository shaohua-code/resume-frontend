<script setup>
/**
 * 管理后台侧边栏（左侧固定导航）
 * 只负责展示可访问菜单，菜单过滤逻辑由父组件完成，这里再叠加关键词搜索。
 */
import { computed } from 'vue'

const activeKey = defineModel({ type: String, default: 'stats' })

const props = defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
  keyword: {
    type: String,
    default: '',
  },
})

// 顶栏搜索时按标题/描述过滤菜单
const filteredMenus = computed(() => {
  const word = props.keyword.trim()
  if (!word) return props.menus
  return props.menus.filter((item) => `${item.label}${item.desc}`.includes(word))
})

const groupedMenus = computed(() => {
  // 菜单按业务域分组，贴近参考图中的分组结构。
  return filteredMenus.value.reduce((groups, item) => {
    const groupName = item.group || '默认分组'
    const group = groups.find((current) => current.name === groupName)
    if (group) {
      group.items.push(item)
    } else {
      groups.push({ name: groupName, items: [item] })
    }
    return groups
  }, [])
})
</script>

<template>
  <aside class="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-line bg-white">
    <div class="flex h-[72px] items-center gap-3 border-b border-line px-5">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-sm font-bold text-white shadow-soft">
        AI
      </div>
      <div class="min-w-0">
        <h2 class="truncate text-base font-semibold text-ink">AI简历助手后台</h2>
        <p class="truncate text-xs text-muted">智能运营管理中心</p>
      </div>
    </div>

    <nav class="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      <div v-for="group in groupedMenus" :key="group.name" class="mb-5 last:mb-0">
        <p class="mb-2 px-3 text-xs font-semibold text-slate-400">
          {{ group.name }}
        </p>
        <div class="flex flex-col gap-1">
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-primary"
            :class="activeKey === item.key ? 'bg-blue-50 font-medium text-primary' : ''"
            @click="activeKey = item.key"
          >
            <span
              class="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity"
              :class="activeKey === item.key ? 'opacity-100' : 'opacity-0'"
            />
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              :class="activeKey === item.key ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-primary'"
            >
              <component :is="item.icon" class="h-[18px] w-[18px]" />
            </span>
            <span class="min-w-0">
              <span class="block truncate font-medium">{{ item.label }}</span>
              <span class="mt-0.5 block truncate text-xs text-slate-400">{{ item.desc }}</span>
            </span>
          </button>
        </div>
      </div>
    </nav>

    <div class="border-t border-line p-4">
      <div class="rounded-2xl bg-blue-50 p-4">
        <p class="text-sm font-semibold text-primary">管理中心</p>
        <p class="mt-1 text-xs leading-5 text-slate-500">左侧导航固定展示，右侧输出当前模块页面。</p>
      </div>
    </div>
  </aside>
</template>
