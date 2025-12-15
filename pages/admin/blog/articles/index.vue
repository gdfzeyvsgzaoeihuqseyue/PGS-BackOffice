<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Articles de Blog</h2>
        <p class="text-slate-500 mt-1">Gérer les publications</p>
      </div>
      <button @click="openModal"
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
        <IconPlus size="20" />
        <span>Nouvel Article</span>
      </button>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="blogStore.loading && !articles.length" class="p-8 text-center text-slate-500">Chargement...</div>
      <div v-else-if="!articles.length" class="p-8 text-center text-slate-500">Aucun article trouvé.</div>

      <table v-else class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
          <tr>
            <th class="px-6 py-4">Titre</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="article in articles" :key="article.id" class="hover:bg-slate-50/50">
            <td class="px-6 py-4 font-medium text-slate-800">
              <NuxtLink :to="`/admin/blog/articles/${article.slug}`" class="hover:text-emerald-600 transition-colors">
                {{ article.title }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4"><span
                class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Publié</span></td>
            <td class="px-6 py-4 text-right flex justify-end gap-2">
              <button @click="edit(article)" class="p-1 text-slate-400 hover:text-blue-500">
                <IconPencil size="18" />
              </button>
              <button @click="remove(article.id)" class="p-1 text-slate-400 hover:text-red-500">
                <IconTrash size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <BaseModal :is-open="isModalOpen" :title="editingId ? 'Modifier Article' : 'Nouvel Article'" @close="closeModal">
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Titre</label>
          <input v-model="form.title" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Slug</label>
          <input v-model="form.slug" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Contenu (HTML)</label>
          <textarea v-model="form.content" rows="4" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
        </div>
        <!-- Add Author/Category Selectors here based on other store data if needed -->

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
  title: 'Blog - Articles'
})

const blogStore = useBlogStore()
const { articles } = storeToRefs(blogStore)

// Initial fetch
await blogStore.fetchArticles()

const isModalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ title: '', slug: '', content: '' })

const openModal = () => {
  editingId.value = null
  form.title = ''
  form.slug = ''
  form.content = ''
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const edit = (article) => {
  editingId.value = article.id
  form.title = article.title
  form.slug = article.slug
  form.content = article.content
  isModalOpen.value = true
}

const save = async () => {
  try {
    if (editingId.value) {
      await blogStore.updateArticle(editingId.value, { ...form })
    } else {
      await blogStore.addArticle({ ...form })
    }
    closeModal()
  } catch (e) {
    alert('Erreur: ' + e.message)
  }
}

const remove = async (id) => {
  if (confirm('Supprimer ?')) await blogStore.deleteArticle(id)
}
</script>
