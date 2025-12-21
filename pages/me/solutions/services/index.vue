<template>
  <div>
    <AppLoader v-if="loading" />
    <AppError v-else-if="error" :message="error" @retry="refresh" />
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Services</h2>
          <p class="text-slate-500 mt-1">Gérer les services et leurs clés API</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
            Total: <span class="font-bold text-slate-800">{{ services.length }}</span>
          </div>
          <button @click="openModal(null)"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
            <IconPlus size="20" />
            <span>Nouveau Service</span>
          </button>
        </div>
      </div>

      <!-- Data List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
        v-if="!services.length && !serviceStore.loading">
        <div class="p-12 text-slate-500">Aucun service trouvé.</div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-4">Nom / Domaine</th>
                <th class="px-6 py-4">Clé API</th>
                <th class="px-6 py-4">Origines</th>
                <th class="px-6 py-4">Statut</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="service in services" :key="service.id" class="hover:bg-slate-50/50">
                <td class="px-6 py-4 font-medium text-slate-800">
                  <NuxtLink :to="`/me/solutions/services/${service.id}`"
                    class="hover:text-emerald-600 transition-colors block">
                    {{ service.name }}
                  </NuxtLink>
                  <a :href="service.domain" target="_blank"
                    class="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                    <IconExternalLink size="12" /> {{ service.domain }}
                  </a>
                </td>
                <td class="px-6 py-4 text-sm font-mono bg-slate-50/50">
                  <div class="flex items-center gap-2 group">
                    <span class="text-slate-400 font-mono text-xs">
                      {{ isRevealed(service.id) ? service.apiKey : '••••••••••••••••••••••••' }}
                    </span>
                    <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="toggleReveal(service.id)" class="p-1 text-slate-400 hover:text-slate-700"
                        :title="isRevealed(service.id) ? 'Masquer' : 'Afficher'">
                        <IconEye v-if="!isRevealed(service.id)" size="14" />
                        <IconEyeOff v-else size="14" />
                      </button>
                      <button @click="copy(service.apiKey)" class="p-1 text-slate-400 hover:text-emerald-600"
                        title="Copier">
                        <IconCopy size="14" />
                      </button>
                      <button @click="regenerate(service.id)" class="p-1 text-slate-400 hover:text-amber-600"
                        title="Régénérer">
                        <IconRefresh size="14" />
                      </button>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div v-if="getOriginsCount(service) > 0" class="flex flex-wrap gap-1">
                    <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
                      {{ getOriginsCount(service) }} origine(s)
                    </span>
                  </div>
                  <span v-else class="text-slate-400 italic text-xs">Aucune restriction</span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <button @click="toggle(service)" class="px-2 py-1 rounded-full text-xs font-bold transition-all"
                    :class="service.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'">
                    {{ service.isActive ? 'Actif' : 'Inactif' }}
                  </button>
                </td>
                <td class="px-6 py-4 text-right flex justify-end gap-2">
                  <button @click="openModal(service)" class="p-1 text-slate-400 hover:text-blue-500">
                    <IconPencil size="18" />
                  </button>
                  <button @click="remove(service)" class="p-1 text-slate-400 hover:text-red-500">
                    <IconTrash size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageServiceModal :is-open="isModalOpen" :service="editingService" @close="closeModal" @saved="refresh" />

    <!-- Modal Delete -->
    <ManageServiceDeleteModal :is-open="isDeleteModalOpen" :service="deletingService" @close="closeDeleteModal"
      @deleted="onDeleted" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconExternalLink, IconCopy, IconEye, IconEyeOff, IconRefresh } from '@tabler/icons-vue'
import { useServiceStore } from '~/stores/service'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Services'
})

const serviceStore = useServiceStore()
const { services, loading, error } = storeToRefs(serviceStore)
const { add: notify } = useToast()

const refresh = () => {
  serviceStore.fetchServices()
}

refresh()

const editingService = ref(null)
const deletingService = ref(null)
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const remove = (service) => {
  deletingService.value = service
  isDeleteModalOpen.value = true
}

const onDeleted = () => {
  refresh()
}

const toggle = async (service) => {
  try {
    await serviceStore.toggleService(service.id)
    notify(`Service ${service.isActive ? 'désactivé' : 'activé'}`, 'success')
  } catch (e) {
    notify(e.message, 'error')
  }
}

const copy = (text) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  notify('Clé API copiée', 'success')
}

const revealedKeys = ref(new Set())

const isRevealed = (id) => revealedKeys.value.has(id)

const toggleReveal = (id) => {
  if (revealedKeys.value.has(id)) {
    revealedKeys.value.delete(id)
  } else {
    revealedKeys.value.add(id)
  }
}

const regenerate = async (id) => {
  if (confirm('Attention : Régénérer la clé API rendra l\'ancienne invalide immédiatement. Voulez-vous continuer ?')) {
    try {
      await serviceStore.updateService(id, { regenerateApiKey: true })
      notify('Clé API régénérée avec succès', 'success')
    } catch (e) {
      notify(e.message, 'error')
    }
  }
}

const getOriginsCount = (service) => {
  if (!service.allowedOrigins) return 0
  if (Array.isArray(service.allowedOrigins)) return service.allowedOrigins.length
  if (typeof service.allowedOrigins === 'string') {
    try {
      const parsed = JSON.parse(service.allowedOrigins)
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return service.allowedOrigins.includes(',') ? service.allowedOrigins.split(',').length : 1
    }
  }
  return 0
}

const openModal = (service) => {
  editingService.value = service
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingService.value = null
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deletingService.value = null
}
</script>
