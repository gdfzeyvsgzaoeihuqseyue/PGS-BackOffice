<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Sujets FAQ</h2>
        <p class="text-slate-500 mt-1">Gérer les thématiques de la foire aux questions</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ topics.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouveau Sujet</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!topics.length && !topicStore.loading">
      <div class="p-12 text-slate-500">Aucun sujet trouvé.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Nom</th>
              <th class="px-6 py-4">Slug</th>
              <th class="px-6 py-4">Plateforme</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="topic in topics" :key="topic.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <NuxtLink :to="`/me/solutions/topic/${topic.id}`" class="hover:text-emerald-600 transition-colors">
                  {{ topic.name }}
                </NuxtLink>
                <div class="text-xs text-slate-500 truncate max-w-[200px]">{{ topic.description }}</div>
              </td>
              <td class="px-6 py-4 text-sm font-mono text-slate-600">
                {{ topic.slug || '-' }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="topic.platform"
                  class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-700/10">
                  {{ topic.platform.name || 'ID: ' + topic.platform }}
                </span>
                <span v-else class="text-slate-400 italic">Aucune</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-bold',
                  topic.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                ]">
                  {{ topic.status === 'active' ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(topic)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(topic.id)" class="p-1 text-slate-400 hover:text-red-500">
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
  <ManageTopicModal :is-open="isModalOpen" :topic="editingTopic" @close="closeModal" @saved="refresh" />
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-vue'
import { useFaqTopicStore } from '~/stores/faq-topic'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Sujets FAQ'
})

const topicStore = useFaqTopicStore()
const { topics, loading, error } = storeToRefs(topicStore)

const refresh = () => {
  topicStore.fetchTopics()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer ce sujet ?')) {
    await topicStore.deleteTopic(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingTopic = ref(null)

const openModal = (topic) => {
  editingTopic.value = topic
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingTopic.value = null
}
</script>
