<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Tutoriels</h2>
        <p class="text-slate-500 mt-1">Gérer les guides et vidéos</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ tutos.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouveau Tuto</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!tutos.length && !tutoStore.loading">
      <div class="p-12 text-slate-500">Aucun tutoriel trouvé.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Titre</th>
              <th class="px-6 py-4">Durée</th>
              <th class="px-6 py-4">Plateforme</th>
              <th class="px-6 py-4">Lien</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="tuto in tutos" :key="tuto.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <NuxtLink :to="`/me/solutions/tuto/${tuto.id}`" class="hover:text-emerald-600 transition-colors">
                  {{ tuto.title }}
                </NuxtLink>
                <div class="text-xs text-slate-500 truncate max-w-[200px]">{{ tuto.description }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <div class="flex items-center gap-1" v-if="tuto.time">
                  <IconClock size="14" class="text-slate-400" />
                  {{ tuto.time }}
                </div>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="tuto.platform"
                  class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-700/10">
                  {{ tuto.platform.name || 'ID: ' + tuto.platform }}
                </span>
                <span v-else class="text-slate-400 italic">Aucune</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <a :href="tuto.link" target="_blank" class="text-emerald-600 hover:underline flex items-center gap-1">
                  <IconExternalLink size="14" />
                  Voir
                </a>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(tuto)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(tuto.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageTutoModal :is-open="isModalOpen" :tuto="editingTuto" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconExternalLink, IconClock } from '@tabler/icons-vue'
import { useTutoStore } from '~/stores/tuto'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Tutoriels'
})

const tutoStore = useTutoStore()
const { tutos, loading, error } = storeToRefs(tutoStore)

const refresh = () => {
  tutoStore.fetchTutos()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer ce tutoriel ?')) {
    await tutoStore.deleteTuto(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingTuto = ref(null)

const openModal = (tuto) => {
  editingTuto.value = tuto
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingTuto.value = null
}
</script>
