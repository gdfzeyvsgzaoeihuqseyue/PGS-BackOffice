<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Articles de Blog</h2>
        <p class="text-slate-500 mt-1">Gérer les publications</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ articles.length }}</span>
        </div>
        <button @click="openModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouvel Article</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!articles.length && !blogStore.loading">
      <div class="p-12 text-slate-500">Aucun article trouvé.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
          <tr>
            <th class="px-6 py-4">Titre</th>
            <th class="px-6 py-4">Auteur</th>
            <th class="px-6 py-4">Catégorie</th>
            <th class="px-6 py-4">Vues</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="article in articles" :key="article.id" class="hover:bg-slate-50/50">
            <td class="px-6 py-4 font-medium text-slate-800">
              <NuxtLink :to="`/me/blog/articles/${article.slug}`" class="hover:text-emerald-600 transition-colors">
                {{ article.title }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ article.author?.name || '-' }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">
              <span v-if="article.category" class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{{
                article.category.name }}</span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 font-mono">{{ article.views || 0 }}</td>
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
      <form @submit.prevent="save" class="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Titre</label>
          <input v-model="form.title" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>

        <!-- Slug removed as requested -->

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Extrait (Résumé)</label>
          <textarea v-model="form.excerpt" rows="2"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"></textarea>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Contenu (HTML)</label>
          <RichTextEditor v-model="form.content" />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">URL Image</label>
          <input v-model="form.imageUrl" type="url"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="https://..." />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Auteur</label>
            <select v-model="form.author" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="" disabled>Sélectionner...</option>
              <option v-for="auth in authors" :key="auth.id" :value="auth.id">{{ auth.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Catégorie</label>
            <select v-model="form.category" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="" disabled>Sélectionner...</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2">Tags</label>
          <div class="space-y-2">
            <div v-for="(tag, index) in tagsList" :key="index" class="flex gap-2">
              <input v-model="tagsList[index]" type="text"
                class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                placeholder="Tag..." />
              <button type="button" @click="removeTag(index)" class="p-2 text-red-500 hover:bg-red-50 rounded">
                <IconTrash size="18" />
              </button>
            </div>
            <button type="button" @click="addTag"
              class="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline mt-2">
              <IconPlus size="16" /> Ajouter un tag
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button type="button" @click="closeModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
          <button type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm">Enregistrer</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { IconArticle, IconPlus, IconPencil, IconTrash } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Blog - Articles'
})

const blogStore = useBlogStore()
const { articles, authors, categories, loading, error } = storeToRefs(blogStore)

// Fetch all necessary data
const refresh = () => {
  blogStore.fetchArticles()
  blogStore.fetchAuthors()
  blogStore.fetchCategories()
}

refresh()

const isModalOpen = ref(false)
const editingId = ref(null)
// const inputTags = ref('') // Removed in favor of tagsList
const tagsList = ref([])

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  author: '',
  category: '',
  tags: [] // Handled via tagsList
})


const openModal = () => {
  editingId.value = null
  form.title = ''
  form.excerpt = ''
  form.content = ''
  form.imageUrl = ''
  form.author = ''
  form.category = ''
  form.tags = []
  tagsList.value = []
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const edit = (article) => {
  editingId.value = article.id
  form.title = article.title
  form.excerpt = article.excerpt || ''
  form.content = article.content
  form.imageUrl = article.imageUrl || ''

  // Handle relation mapping (assuming object in read, ID in write)
  form.author = article.author?.id || article.author || ''
  form.category = article.category?.id || article.category || ''

  form.tags = article.tags || []
  tagsList.value = [...form.tags]

  isModalOpen.value = true
}

// Simple slugify for frontend fallback (backend usually handles this)
const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

const addTag = () => tagsList.value.push('')
const removeTag = (index) => tagsList.value.splice(index, 1)

const save = async () => {
  try {
    // Parse tags
    form.tags = tagsList.value.filter(t => t && t.trim() !== '')

    const payload = { ...form }
    // Generate slug if new and not present (though backend should trigger)
    if (!editingId.value) {
      payload.slug = slugify(form.title)
    }

    if (editingId.value) {
      await blogStore.updateArticle(editingId.value, payload)
    } else {
      await blogStore.addArticle(payload)
    }
    closeModal()
  } catch (e) {
    alert('Erreur: ' + e.message)
  }
}

const remove = async (id) => {
  if (confirm('Supprimer cet article ?')) await blogStore.deleteArticle(id)
}
</script>
