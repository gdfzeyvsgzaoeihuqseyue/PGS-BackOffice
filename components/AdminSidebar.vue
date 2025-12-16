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
      <!-- General (Toujours visible ou groupé) -->
      <div class="px-3 space-y-1 mb-4">
        <NavItem to="/admin" icon="IconDashboard" label="Dashboard" :collapsed="collapsed" />
      </div>

      <!-- Gestion Group -->
      <SidebarGroup label="Gestion Utilisateurs" :collapsed="collapsed" :icon="IconUsers">
        <NavItem to="/admin/manage/users" icon="IconUsers" label="Utilisateurs" :collapsed="collapsed" />
        <NavItem to="/admin/manage/learners" icon="IconSchool" label="Apprenants" :collapsed="collapsed" />
        <NavItem to="/admin/activity" icon="IconHistory" label="Journal" :collapsed="collapsed" />
      </SidebarGroup>

      <!-- Blog Group -->
      <SidebarGroup label="Blog" :collapsed="collapsed" :icon="IconArticle">
        <NavItem to="/admin/blog/articles" icon="IconArticle" label="Articles" :collapsed="collapsed" />
        <NavItem to="/admin/blog/authors" icon="IconPencil" label="Auteurs" :collapsed="collapsed" />
        <NavItem to="/admin/blog/categories" icon="IconCategory" label="Catégories" :collapsed="collapsed" />
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
  IconDashboard, IconUsers, IconSchool, IconArticle, IconPencil, IconCategory, IconHistory,
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
