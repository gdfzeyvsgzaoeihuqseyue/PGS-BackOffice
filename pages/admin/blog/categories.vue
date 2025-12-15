<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Catégories</h2>
        <p class="text-slate-500 mt-1">Gérer les catégories</p>
      </div>
      <button @click="openModal"
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
        <IconPlus size="20" />
        <span>Nouvelle Catégorie</span>
      </button>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="blogStore.loading && !categories.length" class="p-8 text-center text-slate-500">Chargement...</div>
      <div v-else-if="!categories.length" class="p-8 text-center text-slate-500">Aucune catégorie trouvée.</div>

      <table v-else class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
          <tr>
            <th class="px-6 py-4">Nom</th>
            <th class="px-6 py-4">Slug</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="cat in categories" :key="cat.id" class="hover:bg-slate-50/50">
            <td class="px-6 py-4 font-medium text-slate-800">{{ cat.name }}</td>
            <td class="px-6 py-4 text-slate-500">{{ cat.slug }}</td>
            <td class="px-6 py-4 text-right flex justify-end gap-2">
              <button @click="edit(cat)" class="p-1 text-slate-400 hover:text-blue-500">
                <IconPencil size="18" />
              </button>
              <button @click="remove(cat.id)" class="p-1 text-slate-400 hover:text-red-500">
                <IconTrash size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <BaseModal :is-open="isModalOpen" :title="editingId ? 'Modifier Catégorie' : 'Nouvelle Catégorie'"
      @close="closeModal">
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
          <input v-model="form.name" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Slug</label>
          <input v-model="form.slug" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="closeModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
          <button type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Enregistrer</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { IconArticle, IconPlus, IconPencil, IconTrash } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Blog - Catégories'
})

const blogStore = useBlogStore()
const { categories } = storeToRefs(blogStore)

await blogStore.fetchCategories()

const isModalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', slug: '' })

const openModal = () => {
  editingId.value = null
  form.name = ''
  form.slug = ''
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const edit = (cat) => {
  editingId.value = cat.id
  form.name = cat.name
  form.slug = cat.slug
  isModalOpen.value = true
}

const save = async () => {
  try {
    if (editingId.value) {
      await blogStore.updateCategory(editingId.value, { ...form })
    } else {
      await blogStore.addCategory({ ...form })
    }
    closeModal()
  } catch (e) {
    alert('Erreur: ' + e.message)
  }
}

const remove = async (id) => {
  if (confirm('Supprimer ?')) await blogStore.deleteCategory(id)
}
</script>
