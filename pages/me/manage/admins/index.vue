<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Administrateurs</h2>
        <p class="text-slate-500 mt-1">Gérez l'équipe d'administration et leurs accès.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative hidden md:block">
          <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input v-model="searchQuery" type="text" placeholder="Rechercher..."
            class="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 transition-all" />
        </div>
        <NuxtLink to="/me/manage/admins/invite"
          class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 active:translate-y-0.5 transition-all flex items-center gap-2">
          <IconUserPlus class="w-5 h-5" />
          <span>Inviter</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile Search -->
    <div class="mb-6 md:hidden relative">
      <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
      <input v-model="searchQuery" type="text" placeholder="Rechercher un administrateur..."
        class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAdmins.length === 0"
      class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <IconUsers class="w-10 h-10 text-slate-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-800 mb-2">Aucun administrateur trouvé</h3>
      <p class="text-slate-500 mb-6">Commencez par inviter des membres à votre équipe.</p>
      <NuxtLink to="/me/manage/admins/invite"
        class="inline-flex items-center text-emerald-600 font-bold hover:underline">
        Inviter un administrateur
        <IconArrowRight class="w-4 h-4 ml-1" />
      </NuxtLink>
    </div>

    <!-- List -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr
              class="bg-slate-50/50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <th class="px-6 py-4">Administrateur</th>
              <th class="px-6 py-4">Rôle</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4">Dernière connexion</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="admin in filteredAdmins" :key="admin.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm bg-gradient-to-br from-slate-100 to-slate-200 uppercase">
                    {{ (admin.firstName?.[0] || '') + (admin.lastName?.[0] || '') }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-800">
                      <NuxtLink :to="`/me/manage/admins/${admin.id}`"
                        class="hover:text-emerald-600 hover:underline transition-colors">
                        {{ admin.firstName }} {{ admin.lastName }}
                      </NuxtLink>
                    </div>
                    <div class="text-xs text-slate-500">{{ admin.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide"
                  :class="getRoleBadgeClass(admin.role)">
                  {{ admin.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="{
                    'bg-emerald-500': admin.status === 'active',
                    'bg-amber-500': admin.status === 'pending',
                    'bg-red-500': admin.status === 'suspended',
                    'bg-slate-300': admin.status === 'deleted'
                  }"></div>
                  <span class="text-sm font-medium" :class="{
                    'text-emerald-700': admin.status === 'active',
                    'text-amber-700': admin.status === 'pending',
                    'text-red-700': admin.status === 'suspended',
                    'text-slate-500': admin.status === 'deleted'
                  }">
                    {{
                      admin.status === 'active' ? 'Actif' :
                        admin.status === 'pending' ? 'En attente' :
                          admin.status === 'suspended' ? 'Suspendu' : 'Supprimé'
                    }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Jamais' }}
              </td>
              <td class="px-6 py-4 text-right">
                <Menu as="div" class="relative inline-block text-left">
                  <MenuButton
                    class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <IconDotsVertical class="w-5 h-5" />
                  </MenuButton>
                  <transition enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <MenuItems
                      class="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-10">
                      <div class="px-1 py-1">
                        <MenuItem v-if="admin.status === 'pending'" v-slot="{ active }">
                        <button @click="resendInvite(admin)"
                          :class="[active ? 'bg-amber-50 text-amber-700' : 'text-slate-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                          <IconMailForward class="mr-2 h-4 w-4 text-amber-500" aria-hidden="true" />
                          Renvoyer invitation
                        </button>
                        </MenuItem>
                        <MenuItem v-else v-slot="{ active }">
                        <button @click="toggleStatus(admin)" :disabled="admin.role === 'main'"
                          :class="[active ? 'bg-slate-50' : '', admin.role === 'main' ? 'opacity-50 cursor-not-allowed' : '', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm text-slate-700']">
                          <IconPower class="mr-2 h-4 w-4"
                            :class="admin.status === 'active' ? 'text-red-500' : 'text-emerald-500'"
                            aria-hidden="true" />
                          {{ admin.status === 'active' ? 'Suspendre' : 'Activer' }}
                        </button>
                        </MenuItem>

                        <MenuItem v-slot="{ active }">
                        <button @click="handleDelete(admin)" :disabled="admin.role === 'main'"
                          :class="[active ? 'bg-red-50 text-red-700' : 'text-red-600', admin.role === 'main' ? 'opacity-50 cursor-not-allowed' : '', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                          <IconTrash class="mr-2 h-4 w-4" aria-hidden="true" />
                          Supprimer
                        </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSearch, IconUserPlus, IconUsers, IconArrowRight, IconDotsVertical, IconPower, IconTrash, IconMailForward, IconEye } from '@tabler/icons-vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import type { Admin } from '~/types/auth'

definePageMeta({
  layout: 'admin',
  title: 'Gestion Admins'
})

const { add: notify } = useToast()
const adminStore = useAdminStore()
const loading = computed(() => adminStore.loading)
const admins = computed(() => adminStore.admins)

const searchQuery = ref('')

onMounted(() => {
  adminStore.fetchAdmins()
})

const filteredAdmins = computed(() => {
  if (!searchQuery.value) return admins.value
  const query = searchQuery.value.toLowerCase()
  return admins.value.filter(admin =>
    admin.firstName?.toLowerCase().includes(query) ||
    admin.lastName?.toLowerCase().includes(query) ||
    admin.email.toLowerCase().includes(query)
  )
})

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'main': return 'bg-purple-100 text-purple-700'
    case 'admin': return 'bg-emerald-100 text-emerald-700'
    case 'moderator': return 'bg-blue-100 text-blue-700'
    case 'support': return 'bg-amber-100 text-amber-700'
    case 'analyst': return 'bg-slate-100 text-slate-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const toggleStatus = async (admin: any) => {
  try {
    await adminStore.toggleStatus(admin.id)
    notify(`Statut mis à jour`)
  } catch (e) {
    notify('Erreur lors du changement de statut', 'error')
  }
}

const resendInvite = async (admin: any) => {
  if (!confirm(`Renvoyer l'e-mail d'invitation à ${admin.firstName} ${admin.lastName} ?`)) return

  try {
    await adminStore.resendInvite(admin.id)
    notify('Invitation renvoyée avec succès')
  } catch (e) {
    notify('Erreur lors du renvoi', 'error')
  }
}

const handleDelete = async (admin: any) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.')) return

  try {
    await adminStore.deleteAdmin(admin.id)
    notify('Administrateur supprimé')
  } catch (e) {
    notify('Erreur lors de la suppression', 'error')
  }
}
</script>
