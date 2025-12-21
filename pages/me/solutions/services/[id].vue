<template>
  <div>
    <AppLoader v-if="loading" />
    <AppError v-else-if="error" :message="error" @retry="refresh" />
    <div v-else-if="service">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <NuxtLink to="/me/solutions/services" class="text-slate-400 hover:text-slate-600 transition-colors">
              <IconArrowLeft size="20" />
            </NuxtLink>
            <h2 class="text-2xl font-bold text-slate-800">{{ service.name }}</h2>
            <span :class="[
              'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
              service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            ]">
              {{ service.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </div>
          <a :href="service.domain" target="_blank" class="text-blue-500 hover:underline flex items-center gap-1 ml-7">
            {{ service.domain }}
            <IconExternalLink size="14" />
          </a>
        </div>

        <div class="flex items-center gap-2">
          <button @click="toggle" class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            :class="service.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'">
            <component :is="service.isActive ? IconPower : IconPower" size="18" />
            {{ service.isActive ? 'Désactiver' : 'Activer' }}
          </button>
          <button @click="openModal"
            class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
            <IconPencil size="18" /> Modifier
          </button>
          <button @click="remove"
            class="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2">
            <IconTrash size="18" /> Supprimer
          </button>
        </div>
      </div>

      <!-- API Key Section -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <IconKey size="20" class="text-emerald-600" /> Clé API
        </h3>
        <div class="flex items-center gap-3">
          <code class="bg-slate-800 text-emerald-400 px-4 py-3 rounded-lg font-mono text-sm flex-1 break-all">
                {{ isRevealed ? service.apiKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••' }}
            </code>
          <button @click="toggleReveal"
            class="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            :title="isRevealed ? 'Masquer' : 'Afficher'">
            <IconEye v-if="!isRevealed" size="20" />
            <IconEyeOff v-else size="20" />
          </button>
          <button @click="copy(service.apiKey)"
            class="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            title="Copier la clé">
            <IconCopy size="20" />
          </button>
          <button @click="regenerate"
            class="p-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
            title="Régénérer la clé">
            <IconRefresh size="20" />
          </button>
        </div>
        <p class="text-xs text-slate-500 mt-2">
          <IconInfoCircle size="12" class="inline mr-1" />
          Cette clé doit être incluse dans les en-têtes de vos requêtes (Header: <code>x-api-key</code>).
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" v-if="service.stats">
        <!-- Users -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div class="p-3 rounded-full bg-blue-50 text-blue-600">
            <IconUsers size="24" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-500 uppercase">Utilisateurs</div>
            <div class="text-2xl font-bold text-slate-800">{{ service.stats.users.total }}</div>
            <div class="text-xs text-slate-400">Dont {{ service.stats.users.active }} actifs</div>
          </div>
        </div>

        <!-- Learners -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div class="p-3 rounded-full bg-purple-50 text-purple-600">
            <IconUserEdit size="24" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-500 uppercase">Apprenants</div>
            <div class="text-2xl font-bold text-slate-800">{{ service.stats.learners.total }}</div>
            <div class="text-xs text-slate-400">Dont {{ service.stats.learners.active }} actifs</div>
          </div>
        </div>

        <!-- Total -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div class="p-3 rounded-full bg-emerald-50 text-emerald-600">
            <IconDeviceAnalytics size="24" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-500 uppercase">Total Accès</div>
            <div class="text-2xl font-bold text-slate-800">{{ service.stats.totalAccess }}</div>
            <div class="text-xs text-slate-400">Utilisateurs + Apprenants</div>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Info -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-full">
          <h3 class="font-bold text-slate-800 mb-4">Informations</h3>
          <div class="space-y-4">
            <div>
              <div class="text-xs font-bold text-slate-500 uppercase mb-1">Description</div>
              <div class="text-slate-700">{{ service.description || 'Aucune description' }}</div>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-500 uppercase mb-1">Créé le</div>
              <div class="text-slate-700 font-mono text-sm">{{ new Date(service.createdAt).toLocaleDateString() }}</div>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-500 uppercase mb-1">Dernière mise à jour</div>
              <div class="text-slate-700 font-mono text-sm">{{ new Date(service.updatedAt).toLocaleDateString() }}</div>
            </div>
          </div>
        </div>

        <!-- Allowed Origins -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-full">
          <h3 class="font-bold text-slate-800 mb-4">Origines Autorisées (CORS)</h3>
          <div v-if="originsList.length">
            <ul class="space-y-2">
              <li v-for="(origin, idx) in originsList" :key="idx"
                class="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                <IconWorld size="16" class="text-slate-400" />
                <span class="font-mono text-sm text-slate-700">{{ origin }}</span>
              </li>
            </ul>
          </div>
          <div v-else class="text-slate-400 italic text-sm">
            Toutes les origines sont autorisées (Non recommandé en production).
          </div>
        </div>
      </div>

    </div>
    <div v-else class="text-center p-12 text-slate-500">Service introuvable...</div>

    <!-- Modal Edit -->
    <ManageServiceModal :is-open="isModalOpen" :service="service" @close="closeModal" @saved="refresh" />

    <!-- Modal Delete -->
    <ManageServiceDeleteModal :is-open="isDeleteModalOpen" :service="deletingService" @close="closeDeleteModal"
      @deleted="onDeleted" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconExternalLink, IconPencil, IconTrash, IconKey, IconCopy, IconInfoCircle, IconWorld, IconUsers, IconUserEdit, IconDeviceAnalytics, IconEye, IconEyeOff, IconRefresh, IconPower } from '@tabler/icons-vue'
import { useServiceStore } from '~/stores/service'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Service - Détails'
})

const route = useRoute()
const router = useRouter()
const serviceStore = useServiceStore()
const { service, loading, error } = storeToRefs(serviceStore)
const { add: notify } = useToast()

const refresh = () => {
  if (route.params.id) {
    serviceStore.fetchService(route.params.id)
  }
}

refresh()

const originsList = computed(() => {
  if (!service.value || !service.value.allowedOrigins) return []
  if (Array.isArray(service.value.allowedOrigins)) return service.value.allowedOrigins
  if (typeof service.value.allowedOrigins === 'string') {
    try {
      const parsed = JSON.parse(service.value.allowedOrigins)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return service.value.allowedOrigins.includes(',') ? service.value.allowedOrigins.split(',').map(s => s.trim()) : [service.value.allowedOrigins]
    }
  }
  return []
})

const copy = (text) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  notify('Clé CLI copiée', 'success')
}

const toggle = async () => {
  if (!service.value) return

  const newStatus = !service.value.isActive
  const action = newStatus ? 'activer' : 'désactiver'

  const reason = prompt(`Voulez-vous vraiment ${action} le service "${service.value.name}" ?\nRaison (optionnelle) :`)

  if (reason === null) return

  try {
    await serviceStore.toggleService(service.value.id, newStatus, reason)
    notify(`Service ${newStatus ? 'activé' : 'désactivé'} avec succès`, 'success')
  } catch (e) {
    notify(e.message, 'error')
  }
}

const isRevealed = ref(false)
const toggleReveal = () => isRevealed.value = !isRevealed.value

const regenerate = async () => {
  if (confirm('Attention : Régénérer la clé API rendra l\'ancienne invalide immédiatement. Voulez-vous continuer ?')) {
    try {
      await serviceStore.updateService(service.value.id, { regenerateApiKey: true })
      notify('Clé API régénérée avec succès', 'success')
    } catch (e) {
      notify(e.message, 'error')
    }
  }
}

const isDeleteModalOpen = ref(false)
const deletingService = ref(null)

const remove = () => {
  deletingService.value = service.value
  isDeleteModalOpen.value = true
}

const onDeleted = () => {
  router.push('/me/solutions/services')
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deletingService.value = null
}

// Modal Logic
const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
</script>
