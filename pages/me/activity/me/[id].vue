<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="fetchLog" />
  <div v-else-if="log">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button @click="$router.back()"
          class="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-500">
          <IconArrowLeft size="24" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">Détail Activité</h1>
          <span class="text-sm text-secondary-500 font-mono">{{ log.id || log._id }}</span>
        </div>
      </div>
      <button @click="downloadJson"
        class="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors font-medium">
        <IconDownload size="20" />
        <span>JSON</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h3 class="text-lg font-bold text-secondary-800 mb-4 flex items-center gap-2">
            <IconActivity size="20" class="text-primary-500" />
            Action
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span class="text-xs font-bold uppercase text-secondary-400 block mb-1">Type d'action</span>
              <span
                class="inline-block px-3 py-1 rounded-lg bg-secondary-100 text-secondary-800 font-mono font-medium border border-secondary-200">
                {{ log.action }}
              </span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-secondary-400 block mb-1">Date</span>
              <span class="text-secondary-700 font-medium">{{ new Date(log.createdAt).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Target Info -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h3 class="text-lg font-bold text-secondary-800 mb-4 flex items-center gap-2">
            <IconTarget size="20" class="text-accent-500" />
            Cible (Target)
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span class="text-xs font-bold uppercase text-secondary-400 block mb-1">Type de Cible</span>
              <span class="font-medium text-secondary-700 capitalize">{{ log.targetType }}</span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-secondary-400 block mb-1">ID Cible</span>
              <span class="font-mono text-sm text-secondary-600 bg-secondary-50 px-2 py-1 rounded inline-block">{{
                log.targetId }}
              </span>
            </div>
          </div>
        </div>

        <!-- Metadata / Changes -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h3 class="text-lg font-bold text-secondary-800 mb-4 flex items-center gap-2">
            <IconDatabase size="20" class="text-warn-500" />
            Détails (Metadata)
          </h3>
          <div class="bg-secondary-900 rounded-lg p-4 overflow-x-auto">
            <pre class="text-sm font-mono text-secondary-50">{{ JSON.stringify(log.metadata || {}, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Sidebar Info -->
      <div class="space-y-6">
        <!-- Author -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h3 class="text-lg font-bold text-secondary-800 mb-4 flex items-center gap-2">
            <IconUser size="20" class="text-secondary-500" />
            Auteur
          </h3>
          <div v-if="log.admin" class="space-y-4">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {{ log.admin.firstName?.[0] }}
              </div>
              <div>
                <div class="font-bold text-secondary-800">{{ log.admin.firstName }} {{ log.admin.lastName }}</div>
                <div class="text-xs text-secondary-500">{{ log.admin.email }}</div>
              </div>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-secondary-400 block mb-1">Rôle</span>
              <span
                class="inline-block px-2 py-1 rounded text-xs font-bold uppercase bg-secondary-100 text-secondary-700">
                {{ log.admin.role }}
              </span>
            </div>
          </div>
          <div v-else class="text-secondary-500 italic">
            Système ou Auteur inconnu
          </div>
        </div>

        <!-- System Info -->
        <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h3 class="text-lg font-bold text-secondary-800 mb-4 flex items-center gap-2">
            <IconDeviceDesktop size="20" class="text-secondary-500" />
            Système
          </h3>
          <div class="space-y-3">
            <div>
              <span class="text-xs font-bold uppercase text-secondary-400 block mb-1">IP</span>
              <span class="font-mono text-sm text-secondary-600">{{ log.ip || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-secondary-400 block mb-1">User Agent</span>
              <div class="text-xs text-secondary-500 break-words leading-tight">{{ log.userAgent || 'N/A' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-12 text-secondary-500">
    Log introuvable.
  </div>
</template>

<script setup>
import { IconArrowLeft, IconDownload, IconActivity, IconTarget, IconDatabase, IconUser, IconDeviceDesktop } from '@tabler/icons-vue'
import { useActivityStore } from '~/stores/activity'

definePageMeta({
  layout: 'admin',
  title: 'Détail Log'
})

const route = useRoute()
const activityStore = useActivityStore()
// Instead of creating a new ref, we can use a computed or just local state if we want to fetch specific log
// activityStore usually handles lists. Let's see if we can find it in the list or fetch it.
const loading = ref(false)
const error = ref(null)
const log = ref(null)

const fetchLog = async () => {
  loading.value = true
  error.value = null
  try {
    // Try to find in store first
    const existing = activityStore.logs.find(l => (l.id || l._id) === route.params.id)
    if (existing) {
      log.value = existing
    } else {
      // Simulate fetch or implement specific fetch in store
      // await activityStore.fetchLog(route.params.id)
      // For now, if not in list, we might need a store action or direct call.
      // Assuming list is populated for now or we redirect.
      // If authentic backend, we would do: log.value = await $fetch(`/api/admin/logs/${route.params.id}`)
      error.value = "Log non trouvé (ou non chargé dans la liste)"
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLog()
})

const downloadJson = () => {
  if (!log.value) return
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(log.value, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", `log_${log.value.id}.json`)
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
</script>
