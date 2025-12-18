<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="blogStore.fetchAuthors()" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Auteurs</h2>
        <p class="text-slate-500 mt-1">Gérer les auteurs</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ authors.length }}</span>
        </div>
        <button @click="openModal"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouvel Auteur</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!authors.length && !blogStore.loading">
      <div class="p-12 text-slate-500">Aucun auteur trouvé.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
          <tr>
            <th class="px-6 py-4">Nom & Avatar</th>
            <th class="px-6 py-4">Rôle</th>
            <th class="px-6 py-4">Articles</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="author in authors" :key="author.id" class="hover:bg-slate-50/50">
            <td class="px-6 py-4 font-medium text-slate-800">
              <NuxtLink :to="`/me/blog/authors/${author.slug}`"
                class="flex items-center gap-3 hover:text-emerald-600 transition-colors group">
                <img :src="author.avatar" class="w-8 h-8 rounded-full border border-slate-100" />
                <span>{{ author.name }}</span>
              </NuxtLink>
            </td>
            <td class="px-6 py-4 text-slate-500">
              <span class="px-2 py-1 bg-slate-100 rounded text-xs font-bold uppercase tracking-wide">{{ author.role
              }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 font-bold">
              {{ getArticleCount(author.id) }}
            </td>
            <td class="px-6 py-4 text-right flex justify-end gap-2">
              <button @click="edit(author)" class="p-1 text-slate-400 hover:text-blue-500">
                <IconPencil size="18" />
              </button>
              <button @click="remove(author.id)" class="p-1 text-slate-400 hover:text-red-500">
                <IconTrash size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <BaseModal :is-open="isModalOpen" :title="editingId ? 'Modifier Auteur' : 'Nouvel Auteur'" @close="closeModal">
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
          <input v-model="form.name" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>

        <!-- Slug removed -->

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Avatar URL</label>
          <input v-model="form.avatar" type="url"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="https://..." />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Rôle</label>
          <input v-model="form.role" type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="Rédacteur" />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Biographie</label>
          <textarea v-model="form.bio" rows="3"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"></textarea>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button type="button" @click="closeModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
          <button type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm font-medium">Enregistrer</button>
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
  title: 'Blog - Auteurs'
})

const blogStore = useBlogStore()
const { authors, articles, loading, error } = storeToRefs(blogStore)

blogStore.fetchAuthors()
blogStore.fetchArticles()

const getArticleCount = (authorId) => {
  if (!articles.value) return 0
  return articles.value.filter(a => {
    const authRef = a.author
    if (!authRef) return false
    if (typeof authRef === 'object') return authRef.id === authorId || authRef._id === authorId
    return authRef === authorId
  }).length
}

const isModalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', avatar: '', role: 'Rédacteur', bio: '' })

const openModal = () => {
  editingId.value = null
  form.name = ''
  form.avatar = ''
  form.role = 'Rédacteur'
  form.bio = ''
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const edit = (author) => {
  editingId.value = author.id
  form.name = author.name
  form.avatar = author.avatar || ''
  form.role = author.role || 'Rédacteur'
  form.bio = author.bio || ''
  isModalOpen.value = true
}

// Slugify helper
const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

const save = async () => {
  try {
    const payload = { ...form }
    if (!editingId.value) payload.slug = slugify(form.name)

    if (editingId.value) {
      await blogStore.updateAuthor(editingId.value, payload)
    } else {
      await blogStore.addAuthor(payload)
    }
    closeModal()
  } catch (e) {
    alert('Erreur: ' + e.message)
  }
}

const remove = async (id) => {
  if (confirm('Supprimer cet auteur ?')) await blogStore.deleteAuthor(id)
}
</script>
