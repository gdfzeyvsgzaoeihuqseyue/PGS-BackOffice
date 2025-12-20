<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="retryFetch" />
  <div v-else-if="author">
    <div class="mb-6 flex items-center justify-between">
      <button @click="$router.back()"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
        <IconArrowLeft size="18" />
        <span>Retour</span>
      </button>
      <div class="flex gap-2">
        <button @click="openModal"
          class="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconPencil size="20" />
          <span>Modifier</span>
        </button>
        <button @click="remove"
          class="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconTrash size="20" />
          <span>Supprimer</span>
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-2xl mx-auto text-center">
      <img :src="author.avatar" class="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-slate-50 shadow-sm" />
      <h1 class="text-3xl font-bold text-slate-800 mb-2">{{ author.name }}</h1>
      <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold mb-6 inline-block">{{
        author.role }}</span>

      <div class="text-left bg-slate-50 rounded-xl p-6 mb-6">
        <h3 class="text-sm font-bold uppercase text-slate-400 mb-2">Biographie</h3>
        <p class="text-slate-600 leading-relaxed">{{ author.bio || 'Aucune biographie disponible pour cet auteur.' }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 text-left">
        <div class="bg-slate-50 p-4 rounded-xl">
          <span class="text-xs text-slate-400 font-bold uppercase block mb-1">Slug</span>
          <code class="text-sm text-slate-700">{{ author.slug }}</code>
        </div>
        <div class="bg-slate-50 p-4 rounded-xl">
          <span class="text-xs text-slate-400 font-bold uppercase block mb-1">Articles</span>
          <span class="text-sm font-bold text-slate-700">{{ authorArticles.length }} contribution(s)</span>
        </div>
      </div>
    </div>

    <!-- Related Articles -->
    <div class="mt-8 max-w-4xl mx-auto">
      <h3 class="text-lg font-bold text-slate-800 mb-4 px-1">Articles publiés ({{ authorArticles.length }})</h3>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        v-if="paginatedArticles.length">
        <div v-for="article in paginatedArticles" :key="article.id"
          class="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex items-center justify-between group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
              <img v-if="article.imageUrl" :src="article.imageUrl" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                <IconArticle size="20" />
              </div>
            </div>
            <div>
              <NuxtLink :to="`/me/blog/articles/${article.slug}`"
                class="font-medium text-slate-800 hover:text-emerald-600 block transition-colors">
                {{ article.title }}
              </NuxtLink>
              <div class="text-xs text-slate-500 mt-0.5 flex gap-2">
                <span>{{ new Date(article.createdAt).toLocaleDateString() }}</span>
                <span v-if="article.category">• {{ article.category.name }}</span>
                <span>• {{ article.views || 0 }} vues</span>
              </div>
            </div>
          </div>
          <NuxtLink :to="`/me/blog/articles/${article.slug}`"
            class="p-2 text-slate-300 group-hover:text-emerald-500 transition-colors">
            <IconArrowRight size="20" />
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div class="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center"
          v-if="totalPages > 1">
          <span class="text-xs text-slate-500">Page {{ currentPage }} sur {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="currentPage--" :disabled="currentPage === 1"
              class="p-1 rounded hover:bg-slate-200 disabled:opacity-50">
              <IconChevronLeft size="18" />
            </button>
            <button @click="currentPage++" :disabled="currentPage === totalPages"
              class="p-1 rounded hover:bg-slate-200 disabled:opacity-50">
              <IconChevronRight size="18" />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
        Aucun article publié.
      </div>
    </div>

    <!-- Edit Modal -->
    <ManageAuthorModal :is-open="isModalOpen" :author="author" @close="closeModal" @saved="retryFetch" />
  </div>
  <div v-else class="text-center p-12 text-slate-500">Auteur introuvable...</div>
</template>

<script setup>
import { IconArrowLeft, IconTrash, IconPencil, IconArticle, IconArrowRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Détail Auteur'
})

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { currentAuthor: author, articles, loading, error } = storeToRefs(blogStore)

const retryFetch = () => {
  blogStore.fetchAuthor(route.params.slug)
  blogStore.fetchArticles()
}

// Fetch both so we can count articles
blogStore.fetchAuthor(route.params.slug)
blogStore.fetchArticles()

// Articles Logic
const currentPage = ref(1)
const itemsPerPage = 5

const authorArticles = computed(() => {
  if (!author.value || !articles.value) return []
  return articles.value.filter(a => {
    const authRef = a.author
    if (!authRef) return false
    if (typeof authRef === 'object') return authRef.id === author.value.id || authRef.slug === author.value.slug
    return authRef === author.value.id
  })
})

const totalPages = computed(() => Math.ceil(authorArticles.value.length / itemsPerPage))

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return authorArticles.value.slice(start, end)
})

// Reset page on slug change
watch(() => route.params.slug, () => currentPage.value = 1)


// Edit Modal Logic
const isModalOpen = ref(false)

const openModal = () => {
  if (!author.value) return
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const remove = async () => {
  if (!author.value) return
  if (confirm('Supprimer cet auteur ?')) {
    await blogStore.deleteAuthor(author.value.id)
    router.push('/me/blog/authors')
  }
}
</script>
