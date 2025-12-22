<template>
  <div>
    <AppLoader v-if="loading" />
    <AppError v-else-if="error" :message="error" @retry="refresh" />
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Plateformes</h2>
          <p class="text-slate-500 mt-1">Gérer les solutions logicielles</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
            Total: <span class="font-bold text-slate-800">{{ platforms.length }}</span>
          </div>
          <button @click="openModal(null)"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
            <IconPlus size="20" />
            <span>Nouvelle Plateforme</span>
          </button>
        </div>
      </div>

      <!-- Data List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
        v-if="!platforms.length && !platformStore.loading">
        <div class="p-12 text-slate-500">Aucune plateforme trouvée.</div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-4">Nom</th>
                <th class="px-6 py-4">Slug</th>
                <th class="px-6 py-4">Catégorie</th>
                <th class="px-6 py-4">Statut</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="platform in platforms" :key="platform.id" class="hover:bg-slate-50/50">
                <td class="px-6 py-4 font-medium text-slate-800">
                  <div class="flex items-center gap-3">
                    <img v-if="platform.logo" :src="platform.logo" class="w-8 h-8 rounded object-cover bg-slate-100" />
                    <div v-else class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                      <IconPhoto size="16" />
                    </div>
                    <NuxtLink :to="`/me/solutions/platform/${platform.slug}`"
                      class="hover:text-emerald-600 transition-colors">
                      {{ platform.name }}
                    </NuxtLink>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600 font-mono">{{ platform.slug }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  <span v-if="platform.category"
                    class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{{ platform.category
                    }}</span>
                  <span v-else>-</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold"
                    :class="platform.disabled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                    {{ platform.disabled ? 'Désactivé' : 'Actif' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right flex justify-end gap-2">
                  <button @click="openModal(platform)" class="p-1 text-slate-400 hover:text-blue-500">
                    <IconPencil size="18" />
                  </button>
                  <button @click="remove(platform.id)" class="p-1 text-slate-400 hover:text-red-500">
                    <IconTrash size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ManagePlatformModal :is-open="isModalOpen" :platform="editingPlatform" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconPhoto } from '@tabler/icons-vue'
import { usePlatformStore } from '~/stores/platform'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Plateformes'
})

const platformStore = usePlatformStore()
const { platforms, loading, error } = storeToRefs(platformStore)

const refresh = () => {
  platformStore.fetchPlatforms()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer cette plateforme ? Cette action est irréversible.')) {
    await platformStore.deletePlatform(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingPlatform = ref(null)

const openModal = (platform) => {
  editingPlatform.value = platform
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingPlatform.value = null
}
</script>
