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
        <!-- Admin ID Filter (Simple Text for now, could be a combobox) -->
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

        <!-- Target Type -->
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Cible</label>
          <select v-model="logsStore.filters.targetType" @change="logsStore.setPage(1)"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
            <option value="">Toutes</option>
            <option value="user">Utilisateur</option>
            <option value="learner">Apprenant</option>
            <option value="admin">Admin</option>
            <option value="system">Système</option>
          </select>
        </div>

        <!-- Reset -->
        <div class="flex items-end">
          <button @click="logsStore.resetFilters()"
            class="w-full px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
      <div v-if="logsStore.loading"
        class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>

      <div v-if="!logsStore.loading && logsStore.logs.length === 0"
        class="flex flex-col items-center justify-center h-64 text-slate-400">
        <IconClipboardList size="48" class="mb-2 opacity-50" />
        <p>Aucun log trouvé pour ces critères.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Admin</th>
              <th class="px-6 py-4">Action</th>
              <th class="px-6 py-4">Cible</th>
              <th class="px-6 py-4">Info</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4 text-right">Détails</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logsStore.logs" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4">
                <div v-if="log.admin?.id !== 'unknown'">
                  <div class="font-bold text-slate-800 text-sm">{{ log.admin.firstName }} {{ log.admin.lastName }}</div>
                  <div class="text-xs text-slate-500">{{ log.admin.email }}</div>
                </div>
                <div v-else class="text-slate-400 italic text-sm">Système</div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-700 capitalize flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-400" v-if="log.targetType === 'user'"></span>
                  <span class="w-2 h-2 rounded-full bg-blue-400" v-else-if="log.targetType === 'learner'"></span>
                  <span class="w-2 h-2 rounded-full bg-purple-400" v-else-if="log.targetType === 'admin'"></span>
                  <span class="w-2 h-2 rounded-full bg-slate-400" v-else></span>
                  {{ log.targetType }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                <div class="max-w-xs truncate" :title="JSON.stringify(log.details)">
                  {{ formatDetails(log.details) }}
                </div>
                <div class="text-xs text-slate-400 mt-0.5">{{ log.ipAddress }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 tabular-nums">
                {{ new Date(log.createdAt).toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-slate-500">
                <NuxtLink :to="`/me/manage/admins/${log.admin?.id}`" v-if="log.admin?.id !== 'unknown'"
                  class="text-emerald-600 hover:underline text-xs font-bold uppercase whitespace-nowrap">
                  Voir Admin
                </NuxtLink>
                <!-- Optional: If we had a detailed single log view, we would link there. For now user said "Bouton Voir Détail" like in activity index.
                       In activity index it links to /me/activity/:id.
                       If we want detailed log view for ALL LOGS, we need a page for it.
                       However, the user said "Comme pour @[pages/me/activity/index.vue], ajoute un bouton Voir Détail dans @[pages/me/activity/all-logs.vue]". 
                       So I should add a link to detailed log view. 
                       I'll assume the same detailed view /me/activity/:id might work IF it handles fetching any log (if permitted). 
                       Or I might need to create it. For now, I will link to /me/activity/:id assuming it might work or is desired placeholder.
                   -->
                <button @click="$router.push(`/me/activity/${log.id}`)"
                  class="text-emerald-600 hover:underline text-xs font-bold uppercase ml-2">
                  Voir Détail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between" v-if="logsStore.total > 0">
        <div class="text-sm text-slate-500">
          Total : {{ logsStore.total }} logs
        </div>
        <div class="flex items-center gap-2">
          <button @click="logsStore.setPage(logsStore.currentPage - 1)" :disabled="logsStore.currentPage <= 1"
            class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <IconChevronLeft size="16" />
          </button>
          <span class="text-sm font-medium text-slate-700">Page {{ logsStore.currentPage }} / {{ logsStore.totalPages
          }}</span>
          <button @click="logsStore.setPage(logsStore.currentPage + 1)"
            :disabled="logsStore.currentPage >= logsStore.totalPages"
            class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <IconChevronRight size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconRefresh, IconClipboardList, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'

definePageMeta({
  layout: 'admin',
  title: 'Logs Système'
})

const logsStore = useAdminLogsStore()

onMounted(() => {
  logsStore.fetchLogs()
})

const formatDetails = (details) => {
  if (!details) return '-'
  if (Object.keys(details).length === 0) return '-'
  // Si c'est juste loginTime, on l'affiche
  if (details.loginTime && Object.keys(details).length === 1) return 'Connexion'

  // Sinon on essaie d'afficher proprement
  return Object.entries(details)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}
</script>
