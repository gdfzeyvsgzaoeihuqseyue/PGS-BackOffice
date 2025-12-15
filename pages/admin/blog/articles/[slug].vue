<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <button @click="$router.back()"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
        <IconArrowLeft size="18" />
        <span>Retour</span>
      </button>
      <div class="flex gap-2">
        <button @click="remove"
          class="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconTrash size="20" />
          <span>Supprimer</span>
        </button>
      </div>
    </div>

    <div v-if="article">
      <h1 class="text-3xl font-bold text-slate-800 mb-6">{{ article.title }}</h1>

      <!-- Meta Header -->
      <div class="flex flex-wrap items-center gap-4 mb-8 text-sm text-slate-500">
        <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
          <img :src="article.author?.avatar" class="w-6 h-6 rounded-full" v-if="article.author?.avatar" />
          <span class="font-medium text-slate-700">{{ article.author?.name || 'Auteur inconnu' }}</span>
        </div>

        <div v-if="article.category" class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-bold">
          {{ article.category.name }}
        </div>

        <div class="flex items-center gap-1">
          <IconEye size="16" />
          <span>{{ article.views || 0 }} vues</span>
        </div>

        <div>Publié le {{ new Date(article.createdAt).toLocaleDateString() }}</div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <!-- Image Cover -->
          <div v-if="article.imageUrl"
            class="rounded-2xl overflow-hidden shadow-sm border border-slate-100 aspect-video relative">
            <img :src="article.imageUrl" class="object-cover w-full h-full" />
          </div>

          <!-- Content -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none">
            <div v-html="article.content"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="font-bold text-slate-800 mb-4 border-b pb-2">Résumé</h3>
            <p class="text-slate-600 text-sm leading-relaxed italic">{{ article.excerpt || 'Aucun résumé.' }}</p>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="font-bold text-slate-800 mb-4 border-b pb-2">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in article.tags" :key="tag"
                class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">#{{ tag }}</span>
              <span v-if="!article.tags?.length" class="text-slate-400 text-sm">Aucun tag</span>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="font-bold text-slate-800 mb-4 border-b pb-2">Informations Techniques</h3>
            <div class="space-y-2 text-sm">
              <div><span class="text-slate-400">ID:</span> <code class="text-xs">{{ article.id }}</code></div>
              <div><span class="text-slate-400">Slug:</span> <code class="text-xs">{{ article.slug }}</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center p-12 text-slate-500">
      Chargement ou article introuvable...
    </div>
  </div>
</template>

<script setup>
import { IconArrowLeft, IconTrash, IconEye } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Détail Article'
})

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { articles } = storeToRefs(blogStore)

// Initialize
const article = computed(() => {
  return articles.value.find(a => a.slug === route.params.slug)
})

if (!article.value && !articles.value.length) {
  await blogStore.fetchArticles()
}

const remove = async () => {
  if (!article.value) return
  if (confirm('Supprimer cet article ?')) {
    await blogStore.deleteArticle(article.value.id)
    router.push('/admin/blog/articles')
  }
}
</script>
