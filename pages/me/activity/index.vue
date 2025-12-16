<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="activityStore.fetchLogs()" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Journal d'Activité</h2>
        <p class="text-slate-500 mt-1">Historique des actions administratives</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative">
          <select v-model="filterType"
            class="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm appearance-none cursor-pointer">
            <option value="">Tous les types</option>
            <option value="user">Utilisateur</option>
            <option value="learner">Apprenant</option>
            <option value="admin">Admin</option>
            <option value="service">Service</option>
            <option value="system">Système</option>
          </select>
        </div>

        <button @click="refresh"
          class="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
          <IconRefresh size="20" :class="{ 'animate-spin': activityStore.loading }" />
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-if="logs.length">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
          <tr>
            <th class="px-6 py-4">Auteur</th>
            <th class="px-6 py-4">Action</th>
            <th class="px-6 py-4">Cible</th>
            <th class="px-6 py-4">Date</th>
            <th class="px-6 py-4">Détails</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="log in logs" :key="log.id || log._id" class="hover:bg-slate-50/50">
            <td class="px-6 py-4">
              <div v-if="log.admin" class="flex items-center gap-2">
                <span class="font-medium text-slate-700 text-sm">{{ log.admin.firstName }} {{
                  log.admin.lastName }}</span>
                <span class="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{{
                  log.admin.role }}</span>
              </div>
              <span v-else class="text-slate-400 italic text-sm">Système / Inconnu</span>
            </td>
            <td class="px-6 py-4">
              <span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">{{
                log.action }}</span>
            </td>
            <td class="px-6 py-4 text-sm">
              <div class="flex flex-col">
                <span class="font-medium text-slate-700 capitalize">{{ log.targetType }}</span>
                <span class="text-xs text-slate-400 font-mono">{{ log.targetId }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">
              {{ new Date(log.createdAt).toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-500">
              <NuxtLink :to="`/me/activity/${log.id || log._id}`"
                class="text-emerald-600 hover:underline text-xs font-bold uppercase">
                Voir Détail
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <div class="text-sm text-slate-500">
          Page {{ activityStore.currentPage }} sur {{ activityStore.totalPages }}
        </div>
        <div class="flex gap-2">
          <button @click="activityStore.setPage(activityStore.currentPage - 1)"
            :disabled="activityStore.currentPage <= 1"
            class="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <IconChevronLeft size="20" />
          </button>
          <button @click="activityStore.setPage(activityStore.currentPage + 1)"
            :disabled="activityStore.currentPage >= activityStore.totalPages"
            class="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <IconChevronRight size="20" />
          </button>
        </div>
      </div>

    </div>
    <div v-else class="text-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200">
      {{ activityStore.loading ? 'Chargement...' : 'Aucune activité enregistrée.' }}
    </div>
  </div>
</template>

<script setup>
import { IconRefresh, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import { useActivityStore } from '~/stores/activity'

definePageMeta({
  layout: 'admin',
  title: 'Journal d\'Activité'
})

const activityStore = useActivityStore()
const { logs, loading, error } = storeToRefs(activityStore)
const filterType = ref('')

activityStore.fetchLogs()

const refresh = () => activityStore.fetchLogs({ targetType: filterType.value })

watch(filterType, (val) => {
  activityStore.currentPage = 1
  activityStore.fetchLogs({ targetType: val })
})

onMounted(() => {
  // Poll for updates every 30s? maybe
})
</script>
