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
    <ManageArticleModal :is-open="isModalOpen" :article="editingArticle" @close="closeModal" @saved="refresh" />
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
const { articles, loading, error } = storeToRefs(blogStore)

// Fetch all necessary data
const refresh = () => {
  blogStore.fetchArticles()
  blogStore.fetchAuthors()
  blogStore.fetchCategories()
}

refresh()

const isModalOpen = ref(false)
const editingArticle = ref(null)

const openModal = () => {
  editingArticle.value = null
  isModalOpen.value = true
}

const edit = (article) => {
  editingArticle.value = article
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingArticle.value = null
}

const remove = async (id) => {
  if (confirm('Supprimer cet article ?')) await blogStore.deleteArticle(id)
}
</script>
