<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Wiki</h2>
        <p class="text-slate-500 mt-1">Base de connaissances et documentation</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ wikis.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouveau Wiki</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!wikis.length && !wikiStore.loading">
      <div class="p-12 text-slate-500">Aucune ressource trouvée.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Nom / Slug</th>
              <th class="px-6 py-4">URL</th>
              <th class="px-6 py-4">Plateforme</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="wiki in wikis" :key="wiki.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <NuxtLink :to="`/me/solutions/wiki/${wiki.id}`" class="hover:text-emerald-600 transition-colors">
                  {{ wiki.name }}
                </NuxtLink>
                <div class="text-xs text-slate-500 font-mono">{{ wiki.slug }}</div>
              </td>
              <td class="px-6 py-4 text-sm">
                <a :href="wiki.url" target="_blank"
                  class="text-blue-600 hover:underline flex items-center gap-1 max-w-[200px] truncate">
                  <IconLink size="14" />
                  {{ wiki.url }}
                </a>
              </td>
              <td class="px-6 py-4 text-sm">
                <span v-if="wiki.platform"
                  class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-700/10">
                  {{ wiki.platform.name || 'ID: ' + wiki.platform }}
                </span>
                <span v-else class="text-slate-400 italic">Général</span>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(wiki)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(wiki.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageWikiModal :is-open="isModalOpen" :wiki="editingWiki" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconLink } from '@tabler/icons-vue'
import { useWikiStore } from '~/stores/wiki'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Wiki'
})

const wikiStore = useWikiStore()
const { wikis, loading, error } = storeToRefs(wikiStore)

const refresh = () => {
  wikiStore.fetchWikis()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer cette ressource ?')) {
    await wikiStore.deleteWiki(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingWiki = ref(null)

const openModal = (wiki) => {
  editingWiki.value = wiki
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingWiki.value = null
}
</script>
