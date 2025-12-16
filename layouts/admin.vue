<template>
  <div class="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
    <!-- Desktop Sidebar -->
    <AdminSidebar :collapsed="collapsed" @toggle="toggleSidebar" class="hidden md:flex flex-shrink-0 relative z-30" />

    <!-- Mobile Sidebar (Overlay) -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 flex md:hidden">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" @click="mobileMenuOpen = false">
      </div>

      <!-- Sidebar Panel -->
      <div
        class="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 transition-transform transform duration-300 ease-in-out">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button @click="mobileMenuOpen = false"
            class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <IconX class="h-6 w-6 text-white" />
          </button>
        </div>
        <AdminSidebar :collapsed="false" @toggle="mobileMenuOpen = false" class="flex-1 w-full" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Header -->
      <header
        class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 flex-shrink-0">

        <div class="flex items-center gap-3">
          <button @click="mobileMenuOpen = true"
            class="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <IconMenu2 class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-semibold text-slate-800">{{ route.meta.title || 'Panel' }}</h1>
        </div>

        <div class="flex items-center gap-4">
          <!-- Profile Dropdown -->
          <Menu as="div" class="relative inline-block text-left">
            <MenuButton
              class="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all">
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {{ userInitials }}
              </div>
              <div class="hidden sm:flex flex-col items-start translate-y-[1px]">
                <span class="text-sm font-medium text-slate-700 leading-tight">{{ user?.firstName || 'Admin' }}</span>
                <span class="text-[10px] text-slate-500 uppercase font-bold">{{ user?.role || 'admin' }}</span>
              </div>
              <!-- <IconChevronDown class="w-4 h-4 text-slate-400" /> -->
            </MenuButton>
            <transition enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0">
              <MenuItems
                class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
                <div class="px-1 py-1">
                  <MenuItem v-slot="{ active }">
                  <NuxtLink to="/me/profile"
                    :class="[active ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors']">
                    <IconUser class="mr-2 h-4 w-4 text-emerald-500" aria-hidden="true" />
                    Mon Profil
                  </NuxtLink>
                  </MenuItem>
                </div>
                <div class="px-1 py-1">
                  <MenuItem v-slot="{ active }">
                  <NuxtLink to="/me/sessions"
                    :class="[active ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors']">
                    <IconDeviceDesktop class="mr-2 h-4 w-4 text-emerald-500" aria-hidden="true" />
                    Sessions
                  </NuxtLink>
                  </MenuItem>
                </div>
                <div class="px-1 py-1">
                  <MenuItem v-slot="{ active }">
                  <button @click="handleLogout"
                    :class="[active ? 'bg-red-50 text-red-900' : 'text-slate-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors']">
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
      <main class="flex-1 overflow-auto p-6 md:p-8 scroll-smooth relative">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { IconUser, IconLogout, IconMenu2, IconX, IconDeviceDesktop } from '@tabler/icons-vue'
import { useAuthStore } from '~/stores/auth'

const mobileMenuOpen = ref(false)

const route = useRoute()

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const collapsed = ref(false)
const toggleSidebar = () => collapsed.value = !collapsed.value

const userInitials = computed(() => {
  if (!user.value?.firstName && !user.value?.lastName) return 'A'
  if (user.value.firstName && user.value.lastName) {
    return (user.value.firstName[0] + user.value.lastName[0]).toUpperCase()
  }
  return (user.value.firstName || user.value.lastName).substring(0, 2).toUpperCase()
})

const handleLogout = async () => {
  await authStore.logout()
}
</script>
