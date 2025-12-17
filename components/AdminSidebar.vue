<template>
  <div class="flex flex-col h-full bg-slate-900 transition-all duration-300" :class="[collapsed ? 'w-20' : 'w-64']">
    <div class="h-16 flex items-center justify-center border-b border-slate-800 flex-shrink-0">
      <transition name="fade" mode="out-in">
        <span v-if="!collapsed"
          class="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-wide absolute whitespace-nowrap">BackOffice</span>
        <span v-else class="text-xl font-bold text-emerald-400">BO</span>
      </transition>
    </div>

    <div class="flex-1 overflow-y-auto py-4 space-y-2 scrollbar-hide">
      <!-- General -->
      <div class="px-3 space-y-1 mb-4">
        <NavItem to="/me" icon="IconDashboard" label="Dashboard" :collapsed="collapsed" />
      </div>

      <!-- Gestion Group -->
      <SidebarGroup label="Gestion Utilisateurs" :collapsed="collapsed" :icon="IconUsers">
        <NavItem to="/me/manage/admins" icon="IconUserShield" label="Administrateurs" :collapsed="collapsed" />
        <NavItem to="/me/manage/users" icon="IconUsers" label="Utilisateurs" :collapsed="collapsed" />
        <NavItem to="/me/manage/learners" icon="IconSchool" label="Apprenants" :collapsed="collapsed" />
      </SidebarGroup>

      <!-- Journal Group -->
      <SidebarGroup label="Journal" :collapsed="collapsed" :icon="IconHistory">
        <NavItem to="/me/activity/me" icon="IconHistory" label="Personnel" :collapsed="collapsed" />
        <NavItem to="/me/activity/syst" icon="IconClipboardList" label="Système" :collapsed="collapsed" />
      </SidebarGroup>

      <!-- Blog Group -->
      <SidebarGroup label="Blog" :collapsed="collapsed" :icon="IconArticle">
        <NavItem to="/me/blog/articles" icon="IconArticle" label="Articles" :collapsed="collapsed" />
        <NavItem to="/me/blog/authors" icon="IconPencil" label="Auteurs" :collapsed="collapsed" />
        <NavItem to="/me/blog/categories" icon="IconCategory" label="Catégories" :collapsed="collapsed" />
      </SidebarGroup>
    </div>

    <div class="p-4 border-t border-slate-800 flex-shrink-0">
      <button @click="$emit('toggle')"
        class="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
        <IconChevronsLeft v-if="!collapsed" class="w-5 h-5" />
        <IconChevronsRight v-else class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  IconUsers, IconArticle, IconHistory,
  IconChevronsLeft, IconChevronsRight
} from '@tabler/icons-vue'

const props = defineProps({
  collapsed: Boolean
})
const emit = defineEmits(['toggle'])
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
