<template>
  <NuxtLink :to="to"
    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary-400 hover:bg-secondary-800 hover:text-white transition-all group relative"
    active-class="bg-primary-600/10 text-primary-400 shadow-sm border border-primary-500/10">
    <component :is="iconComponent" class="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />

    <span v-if="!collapsed" class="font-medium truncate transition-all duration-300">{{ label }}</span>

    <!-- Tooltip for collapsed mode -->
    <div v-if="collapsed"
      class="absolute left-full ml-4 px-2 py-1 bg-secondary-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
      {{ label }}
    </div>
  </NuxtLink>
</template>

<script setup>
import {
  IconDashboard,
  IconUsers, IconUserShield, IconUserStar, IconUserEdit,
  IconNews, IconUserShare, IconDeviceAnalytics,
  IconArticle, IconFileDescription, IconUserBolt, IconCategory,
  IconDeviceDesktop, IconBook, IconHeartHandshake, IconQuote, IconVideo, IconWorld,
  IconHelp, IconBookmarkQuestion
} from '@tabler/icons-vue'

const props = defineProps({
  to: String,
  icon: String,
  label: String,
  collapsed: Boolean
})

const icons = {
  IconDashboard,
  IconUsers, IconUserShield, IconUserStar, IconUserEdit,
  IconNews, IconUserShare, IconDeviceAnalytics,
  IconArticle, IconFileDescription, IconUserBolt, IconCategory,
  IconDeviceDesktop, IconBook, IconHeartHandshake, IconQuote, IconVideo, IconWorld,
  IconHelp, IconBookmarkQuestion
}

const iconComponent = computed(() => icons[props.icon] || IconDashboard)
</script>
