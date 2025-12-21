<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Témoignages</h2>
        <p class="text-slate-500 mt-1">Gérer les avis clients</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ testimonies.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouveau Témoignage</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!testimonies.length && !testimonyStore.loading">
      <div class="p-12 text-slate-500">Aucun témoignage trouvé.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Auteur</th>
              <th class="px-6 py-4">Entreprise</th>
              <th class="px-6 py-4">Note</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="testi in testimonies" :key="testi.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <div class="flex items-center gap-3">
                  <img v-if="testi.avatar" :src="testi.avatar"
                    class="w-8 h-8 rounded-full object-cover border border-slate-100" />
                  <div v-else
                    class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                    {{ testi.author.charAt(0) }}
                  </div>
                  <NuxtLink :to="`/me/solutions/testi/${testi.id}`" class="hover:text-emerald-600 transition-colors">
                    {{ testi.author }}
                  </NuxtLink>
                  <span v-if="testi.isFeatured" class="ml-2 text-xs text-orange-500 font-bold" title="Mis en avant">
                    <IconStar size="14" />
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <div class="font-medium">{{ testi.company || '-' }}</div>
                <div class="text-xs text-slate-400">{{ testi.role }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex text-yellow-400">
                  <template v-for="n in 5" :key="n">
                    <IconStarFilled v-if="n <= (testi.note || 0)" size="14" class="text-yellow-400" />
                    <IconStarHalfFilled v-else-if="n - 0.5 <= (testi.note || 0)" size="14" class="text-yellow-400" />
                    <IconStarFilled v-else size="14" class="text-slate-200" />
                  </template>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  :class="testi.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="testi.isPublished ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ testi.isPublished ? 'Publié' : 'Brouillon' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(testi)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(testi.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageTestimonyModal :is-open="isModalOpen" :testimony="editingTesti" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-vue'
import { useTestimonyStore } from '~/stores/testimony'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Témoignages'
})

const testimonyStore = useTestimonyStore()
const { testimonies, loading, error } = storeToRefs(testimonyStore)

// Load init data
const refresh = () => {
  testimonyStore.fetchTestimonies()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer ce témoignage ? Cette action est irréversible.')) {
    await testimonyStore.deleteTestimony(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingTesti = ref(null)

const openModal = (testi) => {
  editingTesti.value = testi
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingTesti.value = null
}
</script>
