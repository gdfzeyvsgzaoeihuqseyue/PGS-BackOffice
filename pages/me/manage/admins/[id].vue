<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4 mb-2">
      <NuxtLink to="/me/manage/admins"
        class="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
        <IconArrowLeft size="24" />
      </NuxtLink>
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Détails Administrateur</h2>
        <p class="text-slate-500">Informations et historique d'activité</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !admin" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
    </div>

    <!-- Content -->
    <div v-else-if="admin" class="space-y-6">
      <!-- Profile Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start">
          <!-- Avatar -->
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex-shrink-0 flex items-center justify-center text-3xl font-bold text-emerald-600 shadow-inner">
            {{ (admin.firstName?.[0] || 'A') + (admin.lastName?.[0] || '') }}
          </div>

          <!-- Info -->
          <div class="flex-1 space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 class="text-xl font-bold text-slate-900">{{ admin.firstName }} {{ admin.lastName }}</h3>
                <p class="text-slate-500">{{ admin.email }}</p>
              </div>
              <div class="flex gap-2">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
                  {{ admin.role }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold"
                  :class="admin.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                  {{ admin.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span class="block text-xs font-bold text-slate-400 uppercase">Nom d'utilisateur</span>
                <span class="text-slate-700 font-medium">{{ admin.username || '-' }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-slate-400 uppercase">Dernière connexion</span>
                <span class="text-slate-700 font-medium">{{ admin.lastLogin ? new Date(admin.lastLogin).toLocaleString()
                  : 'Jamais' }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-slate-400 uppercase">Compte créé le</span>
                <span class="text-slate-700 font-medium">{{ new Date(admin.createdAt).toLocaleDateString() }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-slate-400 uppercase">Email vérifié</span>
                <span class="text-slate-700 font-medium"
                  :class="{ 'text-emerald-600': admin.emailVerified, 'text-amber-600': !admin.emailVerified }">
                  {{ admin.emailVerified ? 'Oui' : 'Non' }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-6 flex gap-3" v-if="admin.role !== 'main'">
              <button v-if="!admin.isActive && !admin.emailVerified" @click="resendInvite"
                class="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-medium transition-colors flex items-center gap-2">
                <IconMailForward size="18" />
                Renvoyer invitation
              </button>

              <button @click="toggleStatus"
                class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                :class="admin.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'">
                <IconPower size="18" />
                {{ admin.isActive ? 'Désactiver le compte' : 'Activer le compte' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Logs -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">Historique d'activité</h3>
          <span class="text-xs text-slate-500">{{ logsTotal }} entrées</span>
        </div>

        <div class="divide-y divide-slate-100" v-if="logs.length > 0">
          <div v-for="log in logs" :key="log.id" class="p-4 hover:bg-slate-50/50 transition-colors flex gap-4">
            <div class="pt-1">
              <div class="p-2 rounded bg-slate-100 text-slate-500">
                <IconActivity size="16" />
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 text-sm font-mono">{{ log.action }}</span>
                <span class="text-xs text-slate-400">{{ new Date(log.createdAt).toLocaleString() }}</span>
              </div>
              <div class="text-sm text-slate-600 mt-1">
                Cible: <span class="font-medium bg-slate-100 px-1 rounded">{{ log.targetType }}</span>
                <span class="text-slate-400 text-xs ml-2">{{ log.ipAddress }}</span>
              </div>
              <div class="text-xs text-slate-500 mt-1 truncate max-w-lg">
                {{ JSON.stringify(log.details) }}
              </div>
            </div>
          </div>
          <!-- Load More -->
          <div v-if="logs.length < logsTotal" class="p-4 text-center border-t border-slate-100">
            <button @click="loadMoreLogs" :disabled="logsLoading"
              class="text-sm text-emerald-600 font-bold hover:underline">
              {{ logsLoading ? 'Chargement...' : 'Voir plus' }}
            </button>
          </div>
        </div>
        <div v-else class="p-8 text-center text-slate-500">
          Aucune activité enregistrée.
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <p class="text-slate-500">Administrateur introuvable.</p>
      <NuxtLink to="/me/manage/admins" class="text-emerald-600 hover:underline mt-2">Retour à la liste</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { IconArrowLeft, IconMailForward, IconPower, IconActivity } from '@tabler/icons-vue'

definePageMeta({
  layout: 'admin',
  title: 'Détail Admin'
})

const route = useRoute()
const { add: notify } = useToast()
const adminId = route.params.id

const admin = ref(null)
const loading = ref(false)

const logs = ref([])
const logsTotal = ref(0)
const logsPage = ref(1)
const logsLoading = ref(false)

const fetchAdmin = async () => {
  loading.value = true
  try {
    const { data, error } = await useAPI('/admin/get-admins', { query: { limit: 1000 } })
    if (error.value) throw error.value

    if (data.value?.admins) {
      admin.value = data.value.admins.find(a => a.id === adminId)
      // Add status if missing
      if (admin.value) {
        if (!admin.value.isActive) {
          if (admin.value.emailProofToken) admin.value.status = 'pending_invite'
          else admin.value.status = 'inactive'
        } else {
          admin.value.status = 'active'
        }
      }
    }

  } catch (e) {
    notify('Administrateur introuvable', 'error')
  } finally {
    loading.value = false
  }
}

const fetchLogs = async (loadMore = false) => {
  logsLoading.value = true
  try {
    const page = loadMore ? logsPage.value + 1 : 1
    const { data, error } = await useAPI('/admin/all-activity-logs', {
      query: {
        adminId: adminId,
        page: page,
        limit: 10
      }
    })

    if (error.value) throw error.value

    if (data.value?.logs) {
      if (loadMore) {
        logs.value.push(...data.value.logs)
        logsPage.value = page
      } else {
        logs.value = data.value.logs
        logsPage.value = 1
      }
      logsTotal.value = data.value.pagination?.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    logsLoading.value = false
  }
}

const loadMoreLogs = () => {
  fetchLogs(true)
}

onMounted(() => {
  fetchAdmin()
  fetchLogs()
})

const toggleStatus = async () => {
  if (!admin.value) return
  try {
    await useAPI(`/admin/get-admins/${admin.value.id}/toggle-status`, { method: 'POST' })
    admin.value.isActive = !admin.value.isActive
    notify('Statut mis à jour')
  } catch (e) {
    notify('Erreur', 'error')
  }
}

const resendInvite = async () => {
  if (!admin.value) return
  try {
    await useAPI('/admin/invite/resend', {
      method: 'POST',
      body: { adminId: admin.value.id }
    })
    notify('Invitation renvoyée')
  } catch (e) {
    notify('Erreur', 'error')
  }
}
</script>
