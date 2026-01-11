<template>
  <div>
    <AppLoader v-if="loading" />
    <AppError v-else-if="error" :message="error" @retry="refresh" />
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Catégories</h2>
          <p class="text-slate-500 mt-1">Gérer les catégories</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
            Total: <span class="font-bold text-slate-800">{{ categoriesPagination.total }}</span>
          </div>
          <button @click="openModal"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
            <IconPlus size="20" />
            <span>Nouvelle Catégorie</span>
          </button>
        </div>
      </div>

      <!-- Data List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
        v-if="!categories.length && !blogStore.loading">
        <div class="p-12 text-slate-500">Aucune catégorie trouvée.</div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-4">Nom</th>
                <th class="px-6 py-4">Slug</th>
                <th class="px-6 py-4">Articles</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="cat in categories" :key="cat.id" class="hover:bg-slate-50/50">
                <td class="px-6 py-4 font-medium text-slate-800">
                  <NuxtLink :to="`/me/blog/categories/${cat.slug}`" class="hover:text-emerald-600 transition-colors">
                    {{ cat.name }}
                  </NuxtLink>
                </td>
                <td class="px-6 py-4 text-slate-500 bg-slate-50/50 font-mono text-sm">{{ cat.slug }}</td>
                <td class="px-6 py-4 text-sm text-slate-600 font-bold">
                  {{ getArticleCount(cat.id) }}
                </td>
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

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50"
          v-if="categoriesPagination.totalPages > 1">
          <div class="text-sm text-slate-500">
            Page <span class="font-bold text-slate-800">{{ categoriesPagination.page }}</span> sur <span
              class="font-bold text-slate-800">{{ categoriesPagination.totalPages }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="changePage(categoriesPagination.page - 1)" :disabled="categoriesPagination.page <= 1"
              class="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Précédent
            </button>
            <button @click="changePage(categoriesPagination.page + 1)"
              :disabled="categoriesPagination.page >= categoriesPagination.totalPages"
              class="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ManageCategoryModal :is-open="isModalOpen" :category="editingCategory" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconArticle, IconPlus, IconPencil, IconTrash } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Blog - Catégories'
})

const blogStore = useBlogStore()
const { categories, articles, loading, error, categoriesPagination } = storeToRefs(blogStore)

const refresh = () => {
  blogStore.fetchCategories(categoriesPagination.value.page)
}

const changePage = (page) => {
  if (page > 0 && page <= categoriesPagination.value.totalPages) {
    blogStore.fetchCategories(page)
  }
}

refresh()
blogStore.fetchArticles()

const getArticleCount = (catId) => {
  if (!articles.value) return 0
  return articles.value.filter(a => {
    const catRef = a.category
    if (!catRef) return false
    if (typeof catRef === 'object') return catRef.id === catId || catRef._id === catId
    return catRef === catId
  }).length
}

const isModalOpen = ref(false)
const editingCategory = ref(null)

const openModal = () => {
  editingCategory.value = null
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const edit = (cat) => {
  editingCategory.value = cat
  isModalOpen.value = true
}

const remove = async (id) => {
  if (confirm('Supprimer cet élément ?')) await blogStore.deleteCategory(id)
}
</script>
