<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Documents</h2>
        <p class="text-slate-500 mt-1">Gérer la documentation des solutions</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ docs.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouveau Document</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!docs.length && !docStore.loading">
      <div class="p-12 text-slate-500">Aucun document trouvé.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Nom</th>
              <th class="px-6 py-4">Plateforme</th>
              <th class="px-6 py-4">Lien</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="doc in docs" :key="doc.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <div class="flex items-center gap-3">
                  <IconFileText size="20" class="text-slate-400" />
                  <NuxtLink :to="`/me/solutions/doc/${doc.id}`" class="hover:text-emerald-600 transition-colors">
                    {{ doc.name }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <span v-if="doc.platform"
                  class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-700/10">
                  {{ doc.platform.name || 'ID: ' + doc.platform }}
                </span>
                <span v-else class="text-slate-400 italic">Aucune</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <a :href="doc.link" target="_blank" class="text-emerald-600 hover:underline flex items-center gap-1">
                  <IconExternalLink size="14" />
                  Voir
                </a>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(doc)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(doc.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Edit -->
    <BaseModal :is-open="isModalOpen" :title="editingId ? 'Modifier Document' : 'Nouveau Document'" @close="closeModal">
      <form @submit.prevent="save" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nom du document</label>
            <input v-model="form.name" type="text" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Lien URL</label>
            <input v-model="form.link" type="url" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Plateforme associée</label>
            <select v-model="form.platform" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="" disabled>Sélectionner une plateforme...</option>
              <option v-for="plat in platforms" :key="plat.id" :value="plat.id">{{ plat.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t mt-4">
          <button type="button" @click="closeModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
          <button type="submit"
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm hover:shadow-md transition-all">
            Enregistrer
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconFileText, IconExternalLink } from '@tabler/icons-vue'
import { useDocStore } from '~/stores/doc'
import { usePlatformStore } from '~/stores/platform'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Documentation'
})

const docStore = useDocStore()
const platformStore = usePlatformStore()
const { docs, loading, error } = storeToRefs(docStore)
const { platforms } = storeToRefs(platformStore)

// Load init data
const refresh = () => {
  docStore.fetchDocs()
  platformStore.fetchPlatforms()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer ce document ? Cette action est irréversible.')) {
    await docStore.deleteDoc(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingId = ref(null)
const form = reactive({
  name: '',
  link: '',
  platform: ''
})

const syncFormWithData = (data) => {
  form.name = data.name || ''
  form.link = data.link || ''
  form.platform = data.platform?.id || data.platform || ''
}

const resetForm = () => {
  form.name = ''
  form.link = ''
  form.platform = ''
}

const openModal = (doc) => {
  if (doc) {
    editingId.value = doc.id
    syncFormWithData(doc)
  } else {
    editingId.value = null
    resetForm()
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingId.value = null
}

const save = async () => {
  try {
    if (!editingId.value) {
      await docStore.addDoc(form)
    } else {
      await docStore.updateDoc(editingId.value, form)
    }
    closeModal()
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}
</script>
