<template>
   <AppLoader v-if="loading" />
   <AppError v-else-if="error" :message="error" @retry="learnerStore.fetchLearners()" />
   <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
         <div>
            <h2 class="text-2xl font-bold text-secondary-800">Gestion Apprenants</h2>
            <p class="text-secondary-500 mt-1">Liste des apprenants</p>
         </div>
         <div class="flex items-center gap-4">
            <div
               class="px-4 py-2 bg-secondary-50 rounded-lg border border-secondary-200 text-sm font-medium text-secondary-600">
               Total: <span class="font-bold text-secondary-800">{{ learnerStore.total || learners.length }}</span>
            </div>
            <div class="relative group">
               <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-400">
                  <IconSearch size="18" />
               </div>
               <input v-model="search" type="text" placeholder="Rechercher..."
                  class="pl-10 pr-4 py-2.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none w-64 transition-all shadow-sm group-hover:shadow-md" />
            </div>
         </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden fade-in-up delay-100">
         <div class="overflow-x-auto relative">
            <table class="w-full text-left border-collapse">
               <thead>
                  <tr
                     class="bg-secondary-50 border-b border-secondary-200 text-xs uppercase text-secondary-500 font-bold tracking-wider">
                     <th class="px-6 py-4">Apprenant</th>
                     <th class="px-6 py-4">Email</th>
                     <th class="px-6 py-4">Statut</th>
                     <th class="px-6 py-4">Date Inscription</th>
                     <th class="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-secondary-100">
                  <tr v-for="user in learners" :key="user.id" class="hover:bg-secondary-50/50 transition-colors group">
                     <td class="px-6 py-4">
                        <NuxtLink :to="`/me/manage/learners/${user.id}`"
                           class="flex items-center gap-3 group/link hover:opacity-80 transition-opacity">
                           <div
                              class="w-10 h-10 rounded-full bg-gradient-to-br from-accent-100 to-primary-100 text-accent-600 flex items-center justify-center font-bold text-sm">
                              {{ user.fullName ? user.fullName.charAt(0).toUpperCase() : 'L' }}
                           </div>
                           <div>
                              <div
                                 class="font-medium text-secondary-900 group-hover/link:text-primary-600 transition-colors">
                                 {{ user.fullName || 'Sans nom' }}</div>
                              <div class="text-xs text-secondary-400">@{{ user.username }}</div>
                           </div>
                        </NuxtLink>
                     </td>
                     <td class="px-6 py-4 text-secondary-600 text-sm font-medium">{{ user.email }}</td>
                     <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                           :class="{
                              'bg-primary-50 text-primary-700 border-primary-100': user.isActive,
                              'bg-warn-50 text-warn-700 border-warn-100': !user.isActive
                           }">
                           <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                              :class="user.isActive ? 'bg-primary-500' : 'bg-warn-500'"></span>
                           {{ user.isActive ? 'Actif' : 'Suspendu' }}
                        </span>
                     </td>
                     <td class="px-6 py-4 text-secondary-500 text-xs font-mono">{{ user.createdAt ? new
                        Date(user.createdAt).toLocaleDateString() : '-' }}</td>
                     <td class="px-6 py-4 text-right">
                        <Menu as="div" class="relative inline-block text-left">
                           <MenuButton
                              class="p-1.5 hover:bg-secondary-100 rounded-lg text-secondary-400 hover:text-secondary-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              <IconDotsVertical size="20" />
                           </MenuButton>
                           <transition enter-active-class="transition duration-100 ease-out"
                              enter-from-class="transform scale-95 opacity-0"
                              enter-to-class="transform scale-100 opacity-100"
                              leave-active-class="transition duration-75 ease-in"
                              leave-from-class="transform scale-100 opacity-100"
                              leave-to-class="transform scale-95 opacity-0">
                              <MenuItems
                                 class="absolute right-0 mt-2 w-48 z-20 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 py-1">
                                 <div class="px-1 py-1">
                                    <MenuItem v-slot="{ active }">
                                    <button @click="handleStatusToggle(user)"
                                       :class="[active ? 'bg-primary-50 text-primary-900' : 'text-secondary-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors']">
                                       <IconBan v-if="user.isActive" class="mr-2 h-4 w-4 text-warn-500" />
                                       <IconCheck v-else class="mr-2 h-4 w-4 text-primary-500" />
                                       {{ user.isActive ? 'Suspendre' : 'Activer' }}
                                    </button>
                                    </MenuItem>
                                 </div>
                                 <div class="px-1 py-1">
                                    <MenuItem v-slot="{ active }">
                                    <button @click="handleDelete(user)"
                                       :class="[active ? 'bg-danger-50 text-danger-900' : 'text-secondary-700', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors']">
                                       <IconTrash class="mr-2 h-4 w-4 text-danger-500" />
                                       Supprimer
                                    </button>
                                    </MenuItem>
                                 </div>
                              </MenuItems>
                           </transition>
                        </Menu>
                     </td>
                  </tr>
                  <tr v-if="learners.length === 0 && !loading">
                     <td colspan="5" class="px-6 py-12 text-center text-secondary-500">
                        <p class="text-sm">Aucun apprenant trouvé.</p>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>

         <!-- Pagination -->
         <div class="px-6 py-4 border-t border-secondary-200 flex items-center justify-between bg-secondary-50/50"
            v-if="totalPages > 1">
            <button @click="learnerStore.setPage(page - 1)" :disabled="page <= 1"
               class="flex items-center px-4 py-2 border border-secondary-200 bg-white rounded-lg hover:bg-secondary-50 hover:border-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-secondary-600 shadow-sm">
               Précédent
            </button>
            <span class="text-sm font-medium text-secondary-600">Page {{ page }} <span
                  class="text-secondary-400">/</span> {{
                     totalPages }}</span>
            <button @click="learnerStore.setPage(page + 1)" :disabled="page >= totalPages"
               class="flex items-center px-4 py-2 border border-secondary-200 bg-white rounded-lg hover:bg-secondary-50 hover:border-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-secondary-600 shadow-sm">
               Suivant
            </button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { IconDotsVertical, IconBan, IconCheck, IconTrash, IconSearch } from '@tabler/icons-vue'
import { useLearnerStore } from '~/stores/learner'
import { useToast } from '~/composables/useToast'
import type { Learner } from '~/types/person'

definePageMeta({
   layout: 'admin'
})

useHead({
   title: 'Apprenants'
})

const learnerStore = useLearnerStore()
const { learners, totalPages, page, loading, error } = storeToRefs(learnerStore)
const { add: notify } = useToast()

const search = ref('')
let searchTimeout: NodeJS.Timeout

learnerStore.fetchLearners()

watch(search, (val) => {
   clearTimeout(searchTimeout)
   searchTimeout = setTimeout(() => {
      learnerStore.fetchLearners(val)
   }, 300)
})

const handleStatusToggle = async (user: Learner) => {
   try {
      const action = user.isActive ? 'suspend' : 'activate'
      await learnerStore.manageLearner(user.id, action)
      notify(`Apprenant ${user.isActive ? 'suspendu' : 'activé'} avec succès`)
   } catch (e) {
      notify('Erreur lors de la mise à jour', 'error')
   }
}

const handleDelete = async (user: Learner) => {
   if (!confirm('Êtes-vous sûr de vouloir supprimer cet apprenant ?')) return

   try {
      await learnerStore.manageLearner(user.id, 'delete')
      notify('Apprenant supprimé avec succès')
   } catch (e) {
      notify('Erreur lors de la suppression', 'error')
   }
}
</script>

<style scoped>
.fade-in-up {
   animation: fadeInUp 0.4s ease-out forwards;
   opacity: 0;
}

.delay-100 {
   animation-delay: 0.1s;
}

@keyframes fadeInUp {
   from {
      opacity: 0;
      transform: translateY(10px);
   }

   to {
      opacity: 1;
      transform: translateY(0);
   }
}
</style>
