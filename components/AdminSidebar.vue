<template>
  <div class="flex flex-col h-full bg-secondary-900 transition-all duration-300" :class="[collapsed ? 'w-20' : 'w-64']">
    <!-- Header -->
    <div class="h-16 flex items-center justify-center border-b border-secondary-800 flex-shrink-0">
      <transition name="fade" mode="out-in">
        <div v-if="!collapsed" class="px-4">
          <img :src="sharedFiles.paths.logo.dw" alt="Logo" class="h-8 w-auto" />
        </div>
        <div v-else>
          <img :src="sharedFiles.paths.logo.mw" alt="Logo" class="h-8 w-auto" />
        </div>
      </transition>
    </div>

    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto py-4 space-y-2 scrollbar-hide">

      <!-- Dashboard (Single Item) -->
      <div class="px-3 space-y-1 mb-4">
        <NavItem to="/me" icon="IconDashboard" label="Dashboard" :collapsed="collapsed" />
      </div>

      <!-- Groups -->
      <template v-for="(group, index) in navigationGroups" :key="index">
        <SidebarGroup :label="group.label" :collapsed="collapsed" :icon="group.icon" :startOpen="isGroupActive(group)"
          :to="group.to">
          <NavItem v-for="item in group.items" :key="item.to" :to="item.to" :icon="item.icon" :label="item.label"
            :collapsed="collapsed" />
        </SidebarGroup>
      </template>

    </div>

    <!-- Footer Toggle -->
    <div class="p-4 border-t border-secondary-800 flex-shrink-0">
      <button @click="$emit('toggle')"
        class="w-full flex items-center justify-center p-2 rounded-lg text-secondary-400 hover:bg-secondary-800 hover:text-white transition-colors">
        <IconChevronsLeft v-if="!collapsed" class="w-5 h-5" />
        <IconChevronsRight v-else class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useSharedFiles } from '~/stores/sharedFiles'
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-vue'

const props = defineProps({
  collapsed: Boolean
})
const emit = defineEmits(['toggle'])
const route = useRoute()
const sharedFiles = useSharedFiles()

const { navigationGroups } = useNavigation()

// Logic to check if a group should be open based on current route
const isGroupActive = (group) => {
  return route.path === group.to || group.items.some(item => route.path.startsWith(item.to))
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
