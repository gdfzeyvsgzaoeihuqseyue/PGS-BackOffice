<template>
  <div class="min-h-screen bg-slate-50 flex font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-300">
      <div class="h-16 flex items-center justify-center border-b border-slate-800">
        <span class="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">BackOffice</span>
      </div>
      
      <nav class="flex-1 p-4 space-y-2">
        <div class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Général</div>
        
        <NuxtLink to="/admin/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group" active-class="bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          <IconDashboard class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="font-medium">Dashboard</span>
        </NuxtLink>

        <div class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Gestion</div>

        <NuxtLink to="/admin/users" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group" active-class="bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          <IconUsers class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="font-medium">Utilisateurs</span>
        </NuxtLink>
         <NuxtLink to="/admin/learners" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group" active-class="bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          <IconSchool class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="font-medium">Apprenants</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-800">
         <NuxtLink to="/admin/profile" class="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors hover:bg-slate-800">
            <IconSettings class="w-5 h-5" />
            <span>Mon Profil</span>
         </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
        <h1 class="text-xl font-semibold text-slate-800">{{ route.meta.title || 'Panel' }}</h1>
        
        <div class="flex items-center gap-4">
           <!-- Profile Dropdown -->
           <Menu as="div" class="relative inline-block text-left">
              <MenuButton class="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {{ userInitials }}
                </div>
                <div class="hidden sm:flex flex-col items-start">
                    <span class="text-sm font-medium text-slate-700 leading-tight">{{ user?.fullName || 'Admin' }}</span>
                    <span class="text-[10px] text-slate-500 uppercase font-bold">{{ user?.role || 'SuperAdmin' }}</span>
                </div>
                <IconChevronDown class="w-4 h-4 text-slate-400" />
              </MenuButton>
              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                  <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                      <NuxtLink to="/admin/profile" :class="[active ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors']">
                        <IconUser class="mr-2 h-4 w-4 text-emerald-500" aria-hidden="true" />
                        Mon Profil
                      </NuxtLink>
                    </MenuItem>
                  </div>
                  <div class="px-1 py-1">
                     <MenuItem v-slot="{ active }">
                      <button @click="handleLogout" :class="[active ? 'bg-red-50 text-red-900' : 'text-slate-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors']">
                        <IconLogout class="mr-2 h-4 w-4 text-red-500" aria-hidden="true" />
                        Se déconnecter
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
           </Menu>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto p-6 md:p-8 scroll-smooth">
          <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { IconDashboard, IconUsers, IconSchool, IconSettings, IconChevronDown, IconUser, IconLogout } from '@tabler/icons-vue'

const route = useRoute()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const userInitials = computed(() => {
    if (!user.value?.fullName) return 'A'
    const parts = user.value.fullName.split(' ')
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].substring(0,2).toUpperCase()
})

const handleLogout = async () => {
    await authStore.logout()
}
</script>
