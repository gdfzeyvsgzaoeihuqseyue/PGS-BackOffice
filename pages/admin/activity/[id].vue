<template>
  <div v-if="log">
    <div class="mb-6 flex items-center justify-between">
      <button @click="$router.back()"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
        <IconArrowLeft size="18" />
        <span>Retour</span>
      </button>
      <div class="text-sm text-slate-400">
        LOG ID: <span class="font-mono text-slate-600">{{ log.id || log._id }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="md:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Détails de l'Action</h3>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Type d'Action</span>
              <span
                class="inline-block font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                {{ log.action }}
              </span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Date & Heure</span>
              <span class="text-sm text-slate-700 font-medium">
                {{ new Date(log.createdAt).toLocaleString() }}
              </span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Cible (Type)</span>
              <span class="text-sm text-slate-700 font-medium capitalize">{{ log.targetType }}</span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">ID Cible</span>
              <code
                class="text-xs bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">{{ log.targetId || 'N/A' }}</code>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="text-lg font-bold text-slate-800">Données Techniques (JSON)</h3>
            <button @click="downloadJson"
              class="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              <IconDownload size="16" />
              Télécharger
            </button>
          </div>
          <div class="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre class="text-xs text-emerald-400 font-mono">{{ JSON.stringify(log.details, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Sidebar Info -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-sm font-bold uppercase text-slate-400 mb-4">Auteur de l'action</h3>
          <div v-if="log.admin" class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              {{ log.admin.firstName?.charAt(0) || 'A' }}
            </div>
            <div>
              <div class="font-bold text-slate-800 text-sm">{{ log.admin.firstName }} {{ log.admin.lastName }}
              </div>
              <div class="text-xs text-slate-500">{{ log.admin.email }}</div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-slate-400 italic text-sm bg-slate-50 rounded-lg">
            Système ou Auteur Inconnu
          </div>

          <div v-if="log.admin" class="border-t pt-4 mt-2">
            <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Rôle</span>
            <span class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold uppercase tracking-wide">
              {{ log.admin.role }}
            </span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-sm font-bold uppercase text-slate-400 mb-4">Métadonnées</h3>
          <ul class="space-y-3 text-sm">
            <li class="flex justify-between">
              <span class="text-slate-500">IP Source</span>
              <span class="font-mono text-slate-700">{{ log.ipAddress || 'N/A' }}</span>
            </li>
            <li class="flex justify-between">
              <span class="text-slate-500">Status</span>
              <span class="font-mono text-slate-700">{{ log.status || 'N/A' }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4" v-if="loading"></div>
    <div v-else>
      <p class="text-slate-500 mb-4">Introuvable ou chargement...</p>
      <button @click="$router.back()" class="text-emerald-600 hover:underline">Retour à la liste</button>
    </div>
  </div>
</template>

<script setup>
import { IconArrowLeft, IconDownload } from '@tabler/icons-vue'
import { useActivityStore } from '~/stores/activity'

definePageMeta({
  layout: 'admin',
  title: 'Détail Activité'
})

const route = useRoute()
const activityStore = useActivityStore()
const { logs, loading } = storeToRefs(activityStore)

// Try to find in existing logs first
const log = computed(() => {
  return logs.value.find(l => (l.id === route.params.id) || (l._id === route.params.id))
})

// If not found (e.g. direct access), we might need to fetch. 
// Since our store fetches a list, let's just fetch the list for now as a fallback if empty.
// Ideally there should be a fetchOne(id) endpoint.
if (!log.value && !logs.value.length) {
  activityStore.fetchLogs()
}

const downloadJson = () => {
  if (!log.value || !log.value.details) return
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(log.value.details, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", `log-${log.value.id}.json`)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
</script>
