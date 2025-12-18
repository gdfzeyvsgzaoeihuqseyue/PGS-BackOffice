<template>
  <div class="max-w-4xl mx-auto space-y-6">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-secondary-800">Sessions Actives</h2>
        <p class="text-secondary-500 mt-1">Gérez vos appareils connectés et l'historique de vos connexions.</p>
      </div>
      <button @click="revokeAll" :disabled="otherSessions.length === 0 || loading"
        class="inline-flex items-center px-4 py-2 bg-danger-50 text-danger-600 rounded-xl hover:bg-danger-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm">
        <IconLogout :size="18" class="mr-2" />
        Déconnecter les autres sessions
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && sessions.length === 0" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Current Session -->
      <div v-if="currentSession"
        class="bg-white rounded-2xl shadow-sm border border-primary-100 overflow-hidden ring-1 ring-primary-500/20">
        <div class="px-6 py-4 border-b border-primary-50 bg-primary-50/30 flex items-center gap-3">
          <div class="p-2 bg-primary-100 text-primary-600 rounded-lg">
            <IconDeviceDesktopCheck :size="24" />
          </div>
          <div>
            <h3 class="font-bold text-secondary-800">Session Actuelle</h3>
            <p class="text-xs text-primary-600 font-medium uppercase tracking-wider">En ligne maintenant</p>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm font-medium text-secondary-500 mb-1">Appareil / Navigateur</p>
              <p class="text-secondary-900 font-medium truncate" :title="currentSession.userAgent">{{
                getDeviceName(currentSession.userAgent) }}</p>
              <p class="text-xs text-secondary-400 mt-1 truncate">{{ currentSession.userAgent }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500 mb-1">Adresse IP</p>
              <p class="text-secondary-900 font-medium">{{ currentSession.ipAddress }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500 mb-1">Connexion initiale</p>
              <p class="text-secondary-900">{{ formatDate(currentSession.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-500 mb-1">Dernière activité</p>
              <p class="text-secondary-900">{{ formatDate(currentSession.updatedAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Sessions List -->
      <div v-if="otherSessions.length > 0"
        class="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-secondary-100 bg-secondary-50/50">
          <h3 class="font-bold text-secondary-700">Autres appareils connectés</h3>
        </div>
        <ul class="divide-y divide-secondary-100">
          <li v-for="session in otherSessions" :key="session.id" class="p-6 hover:bg-secondary-50/50 transition-colors">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="p-2 bg-secondary-100 text-secondary-500 rounded-lg translate-y-1">
                  <IconDeviceDesktop :size="20" />
                </div>
                <div>
                  <h4 class="font-bold text-secondary-800">{{ getDeviceName(session.userAgent) }}</h4>
                  <p class="text-sm text-secondary-500 mb-2 truncate max-w-md">{{ session.userAgent }}</p>

                  <div class="flex items-center gap-4 text-xs text-secondary-500">
                    <span class="flex items-center">
                      <IconMapPin :size="14" class="mr-1" />
                      {{ session.ipAddress }}
                    </span>
                    <span class="flex items-center">
                      <IconClock :size="14" class="mr-1" />
                      {{ formatDate(session.updatedAt) }}
                    </span>
                  </div>
                </div>
              </div>

              <button @click="revoke(session.id)"
                class="flex-shrink-0 p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors group"
                title="Révoquer cette session">
                <IconTrash :size="20" />
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-else-if="sessions.length > 0"
        class="text-center py-12 bg-secondary-50 rounded-2xl border border-dashed border-secondary-300">
        <IconDeviceDesktop :size="48" class="mx-auto text-secondary-300 mb-3" />
        <p class="text-secondary-500">Aucune autre session active détectée.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  IconDeviceDesktop,
  IconDeviceDesktopCheck,
  IconTrash,
  IconMapPin,
  IconClock,
  IconLogout
} from '@tabler/icons-vue'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Gestion des Sessions - Administration'
})

const sessionStore = useSessionStore()
const { sessions, currentToken, loading } = storeToRefs(sessionStore)
const { add: notify } = useToast()

onMounted(() => {
  sessionStore.fetchSessions()
})

const currentSession = computed(() => {
  return sessions.value.find(s => s.token === currentToken.value && !s.isRevoked)
})

const otherSessions = computed(() => {
  return sessions.value.filter(s => s.token !== currentToken.value && !s.isRevoked)
})


const getDeviceName = (ua) => {
  if (!ua) return 'Appareil inconnu'
  if (ua.includes('Windows')) return 'Windows PC'
  if (ua.includes('Mac')) return 'Mac'
  if (ua.includes('Linux')) return 'Linux Desktop'
  if (ua.includes('iPhone')) return 'iPhone'
  if (ua.includes('Android')) return 'Android Device'
  return 'Appareil Web'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Jamais'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const revoke = async (id) => {
  if (!confirm('Voulez-vous vraiment déconnecter cet appareil ?')) return

  try {
    await sessionStore.revokeSession(id)
    notify('Session révoquée avec succès')
  } catch (e) {
    notify('Erreur lors de la révocation', 'error')
  }
}

const revokeAll = async () => {
  if (!confirm('Attention : Cela va déconnecter tous les autres appareils connectés à votre compte. Continuer ?')) return

  try {
    await sessionStore.revokeAllSessions()
    notify('Toutes les autres sessions ont été déconnectées')
  } catch (e) {
    notify('Erreur lors de la révocation générale', 'error')
  }
}
</script>
