<template>
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
                {{ service.apiKey }}
            </code>
        <button @click="copy(service.apiKey)"
          class="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Copier la clé">
          <IconCopy size="20" />
        </button>
      </div>
      <p class="text-xs text-slate-500 mt-2">
        <IconInfoCircle size="12" class="inline mr-1" />
        Cette clé doit être incluse dans les en-têtes de vos requêtes (Header: <code>x-api-key</code>).
      </p>
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
</template>

<script setup>
import { IconArrowLeft, IconExternalLink, IconPencil, IconTrash, IconKey, IconCopy, IconInfoCircle, IconWorld } from '@tabler/icons-vue'
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

const remove = async () => {
  if (confirm('Supprimer ce service ? Cette action est irréversible.')) {
    try {
      await serviceStore.deleteService(service.value.id)
      notify('Service supprimé', 'success')
      router.push('/me/solutions/services')
    } catch (e) {
      notify(e.message, 'error')
    }
  }
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
