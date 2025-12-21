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
      <div class="overflow-x-auto">
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
    </div>
  </div>

  <!-- Modal -->
  <ManageAuthorModal :is-open="isModalOpen" :author="editingAuthor" @close="closeModal"
    @saved="blogStore.fetchAuthors()" />
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
const editingAuthor = ref(null)

const openModal = () => {
  editingAuthor.value = null
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const edit = (author) => {
  editingAuthor.value = author
  isModalOpen.value = true
}

const remove = async (id) => {
  if (confirm('Supprimer cet auteur ?')) await blogStore.deleteAuthor(id)
}
</script>
