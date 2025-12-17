<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Logs Système</h2>
        <p class="text-slate-500 mt-1">Surveillance de l'activité de tous les administrateurs.</p>
      </div>
      <button @click="logsStore.fetchLogs()" class="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        title="Actualiser">
        <IconRefresh :class="{ 'animate-spin': logsStore.loading }" />
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Admin ID Filter -->
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">ID Admin</label>
          <input v-model="logsStore.filters.adminId" @change="logsStore.setPage(1)" type="text"
            placeholder="Filtrer par ID..."
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>

        <!-- Action Filter -->
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Action</label>
          <select v-model="logsStore.filters.action" @change="logsStore.setPage(1)"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
            <option value="">Toutes</option>
            <option value="login">Connexion</option>
            <option value="logout">Déconnexion</option>
            <option value="create">Création</option>
            <option value="update">Mise à jour</option>
            <option value="delete">Suppression</option>
            <option value="toggle_status">Changement statut</option>
            <option value="resend_invite">Renvoi invitation</option>
          </select>
        </div>
        <h2 class="text-2xl font-bold text-secondary-800">Journal Système</h2>
        <p class="text-secondary-500 mt-1">Activité globale de l'administration</p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <!-- Admin Filter -->
        <div class="relative">
          <IconUser class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input v-model="adminFilter" type="text" placeholder="ID Admin..."
            class="pl-9 pr-4 py-2 bg-white border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm w-40" />
        </div>

        <!-- Target Filter -->
        <div class="relative">
          <select v-model="filterType"
            class="pl-4 pr-10 py-2 bg-white border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm appearance-none cursor-pointer">
            <option value="">Tous les types</option>
            <option value="user">Utilisateur</option>
            <option value="learner">Apprenant</option>
            <option value="admin">Admin</option>
            <option value="system">Système</option>
          </select>
        </div>

        <button @click="refresh"
          class="p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
          <IconRefresh size="20" :class="{ 'animate-spin': adminLogsStore.loading }" />
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden" v-if="logs.length">
      <table class="w-full text-left">
        <thead class="bg-secondary-50 border-b border-secondary-200 text-xs uppercase text-secondary-500 font-bold">
          <tr>
            <th class="px-6 py-4">Admin</th>
            <th class="px-6 py-4">Action</th>
            <th class="px-6 py-4">Cible</th>
            <th class="px-6 py-4">Date</th>
            <th class="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-secondary-100">
          <tr v-for="log in logs" :key="log.id || log._id" class="hover:bg-secondary-50/50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3" v-if="log.admin">
                <div
                  class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                  {{ log.admin.firstName?.[0] }}
                </div>
                <div>
                  <div class="font-medium text-secondary-800 text-sm">{{ log.admin.firstName }} {{ log.admin.lastName }}
                  </div>
                  <div class="text-xs text-secondary-400">{{ log.admin.email }}</div>
                </div>
              </div>
              <span v-else class="text-secondary-400 italic text-sm">Système</span>
            </td>
            <td class="px-6 py-4">
              <span
                class="font-mono text-xs bg-secondary-100 px-2 py-1 rounded text-secondary-700 border border-secondary-200 font-medium">
                {{ log.action }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="{
                  'bg-primary-500': log.targetType === 'user',
                  'bg-accent-500': log.targetType === 'learner',
                  'bg-warn-500': log.targetType === 'admin',
                  'bg-secondary-400': !['user', 'learner', 'admin'].includes(log.targetType)
                }"></div>
                <span class="font-medium text-secondary-700 capitalize">{{ log.targetType }}</span>
              </div>
              <div class="text-xs text-secondary-400 font-mono pl-4">{{ log.targetId }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-secondary-600">
              {{ new Date(log.createdAt).toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-right">
              <NuxtLink :to="`/me/activity/syst/${log.id || log._id}`"
                class="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary-100 text-secondary-400 hover:text-primary-600 transition-colors">
                <IconArrowRight size="18" />
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-secondary-100 flex items-center justify-between">
        <div class="text-sm text-secondary-500">
          Page {{ adminLogsStore.currentPage }} sur {{ adminLogsStore.totalPages }}
        </div>
        <div class="flex gap-2">
          <button @click="adminLogsStore.setPage(adminLogsStore.currentPage - 1)"
            :disabled="adminLogsStore.currentPage <= 1"
            class="p-1 rounded hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed text-secondary-600">
            <IconChevronLeft size="20" />
          </button>
          <button @click="adminLogsStore.setPage(adminLogsStore.currentPage + 1)"
            :disabled="adminLogsStore.currentPage >= adminLogsStore.totalPages"
            class="p-1 rounded hover:bg-secondary-100 disabled:opacity-50 disabled:cursor-not-allowed text-secondary-600">
            <IconChevronRight size="20" />
          </button>
        </div>
      </div>

    </div>
    <div v-else class="text-center p-12 text-secondary-500 bg-white rounded-xl border border-secondary-200 shadow-sm">
      <IconTimeline class="w-12 h-12 mx-auto text-secondary-200 mb-2" />
      <p>{{ adminLogsStore.loading ? 'Chargement...' : 'Aucun journal trouvé.' }}</p>
    </div>
  </div>
</template>

<script setup>
import { IconRefresh, IconChevronLeft, IconChevronRight, IconUser, IconArrowRight, IconTimeline } from '@tabler/icons-vue'
import { useAdminLogsStore } from '~/stores/adminLogs'

definePageMeta({
  layout: 'admin',
  title: 'Journal Système'
})

const adminLogsStore = useAdminLogsStore()
const { logs, loading, error } = storeToRefs(adminLogsStore)

const filterType = ref('')
const adminFilter = ref('')
let searchTimeout

adminLogsStore.fetchLogs()

const refresh = () => adminLogsStore.fetchLogs({ targetType: filterType.value, adminId: adminFilter.value })

watch([filterType, adminFilter], ([newType, newAdmin]) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    adminLogsStore.currentPage = 1
    adminLogsStore.fetchLogs({ targetType: newType, adminId: newAdmin })
  }, 500)
})

onMounted(() => {
  // Poll for updates every 30s?
})
</script>
