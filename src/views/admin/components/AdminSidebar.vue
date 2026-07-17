<script setup>
/**
 * 管理后台侧边栏 - 路由导航
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const emit = defineEmits(['navigate'])

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

const route = useRoute()
const router = useRouter()

const filteredMenus = computed(() => {
  const word = props.keyword.trim()
  if (!word) return props.menus
  return props.menus.filter((item) => `${item.label}${item.desc}`.includes(word))
})

const groupedMenus = computed(() => {
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

function isActive(item) {
  return route.path === item.path
}

function selectMenu(item) {
  if (route.path !== item.path) {
    router.push(item.path)
  }
  emit('navigate')
}
</script>

<template>
  <div class="flex h-screen flex-col bg-white">
    <div class="flex h-[72px] shrink-0 items-center gap-3 border-b border-line px-5">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-soft" style="background: var(--gradient-primary)">
        AI
      </div>
      <div class="min-w-0">
        <h2 class="truncate text-base font-semibold text-ink">AI 简历后台</h2>
        <p class="truncate text-xs text-muted">智能运营管理中心</p>
      </div>
    </div>

    <nav class="sidebar-nav min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-4">
      <div v-for="group in groupedMenus" :key="group.name" class="mb-5 last:mb-0">
        <p class="mb-2 px-3 text-xs font-semibold text-muted">{{ group.name }}</p>
        <div class="flex flex-col gap-1">
          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink-secondary transition-all duration-200 hover:bg-brand-lighter hover:text-brand-dark"
            :class="isActive(item) ? 'bg-brand-lighter font-medium text-brand-dark' : ''"
            @click="selectMenu(item)"
          >
            <span
              class="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-dark transition-opacity"
              :class="isActive(item) ? 'opacity-100' : 'opacity-0'"
            />
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              :class="isActive(item) ? 'text-white' : 'bg-cream text-muted group-hover:bg-white group-hover:text-brand-dark'"
              :style="isActive(item) ? { background: 'var(--gradient-primary)' } : {}"
            >
              <component :is="item.icon" class="h-[18px] w-[18px]" />
            </span>
            <span class="min-w-0">
              <span class="block truncate font-medium">{{ item.label }}</span>
              <span class="mt-0.5 block truncate text-xs text-muted">{{ item.desc }}</span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  @apply rounded-full bg-line;
}
</style>
