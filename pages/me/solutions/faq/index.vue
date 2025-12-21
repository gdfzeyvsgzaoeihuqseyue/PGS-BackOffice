<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">FAQ</h2>
        <p class="text-slate-500 mt-1">Gérer les questions fréquentes</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ faqs.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouvelle FAQ</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!faqs.length && !faqStore.loading">
      <div class="p-12 text-slate-500">Aucune FAQ trouvée.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Question</th>
              <th class="px-6 py-4">Sujet</th>
              <th class="px-6 py-4">Utile / Inutile</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="faq in faqs" :key="faq.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <NuxtLink :to="`/me/solutions/faq/${faq.id}`" class="hover:text-emerald-600 transition-colors block">
                  {{ faq.question }}
                </NuxtLink>
                <div class="text-xs text-slate-500 truncate max-w-[300px] mt-1">{{ faq.answer }}</div>
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="faq.topic" class="font-medium text-slate-700">
                  {{ faq.topic.name || 'ID: ' + faq.topic }}
                </span>
                <span v-else class="text-slate-400 italic">-</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1 text-emerald-600">
                    <IconThumbUp size="16" />
                    <span class="font-bold">{{ faq.isUseful || 0 }}</span>
                  </div>
                  <div class="flex items-center gap-1 text-red-500">
                    <IconThumbDown size="16" />
                    <span class="font-bold">{{ faq.isUseless || 0 }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-bold',
                  faq.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                ]">
                  {{ faq.status === 'active' ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(faq)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="resetVotes(faq.id)" class="p-1 text-slate-400 hover:text-orange-500"
                  title="Réinitialiser votes">
                  <IconRefresh size="18" />
                </button>
                <button @click="remove(faq.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageFaqModal :is-open="isModalOpen" :faq="editingFaq" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconThumbUp, IconThumbDown, IconRefresh } from '@tabler/icons-vue'
import { useFaqStore } from '~/stores/faq'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - FAQ'
})

const faqStore = useFaqStore()
const { faqs, loading, error } = storeToRefs(faqStore)

const refresh = () => {
  faqStore.fetchFaqs()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer cette FAQ ?')) {
    await faqStore.deleteFaq(id)
  }
}

const resetVotes = async (id) => {
  if (confirm('Réinitialiser les votes pour cette FAQ ?')) {
    await faqStore.resetVotes(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingFaq = ref(null)

const openModal = (faq) => {
  editingFaq.value = faq
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingFaq.value = null
}
</script>
