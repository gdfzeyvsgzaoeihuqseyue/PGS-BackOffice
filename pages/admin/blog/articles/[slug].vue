<template>
  <div>
    <div class="mb-6">
      <button @click="$router.back()"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4">
        <IconArrowLeft size="18" />
        <span>Retour</span>
      </button>
      <h1 class="text-3xl font-bold text-slate-800">{{ article?.title || 'Article' }}</h1>
    </div>

    <!-- Edit Form (could be reused or full page) -->
    <!-- For detail view we might mostly show content, but given this is admin, let's show an editor-like view or metadata -->

    <div v-if="article" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="prose max-w-none" v-html="article.content"></div>
        </div>
      </div>

      <!-- Sidebar Meta -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-slate-800 mb-4 border-b pb-2">Méta-données</h3>
          <div class="space-y-4">
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Slug</span>
              <code class="text-sm bg-slate-100 p-1 rounded">{{ article.slug }}</code>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Auteur</span>
              <div class="flex items-center gap-2">
                <img :src="article.author?.avatar" class="w-6 h-6 rounded-full" v-if="article.author?.avatar" />
                <span class="text-sm text-slate-700">{{ article.author?.name }}</span>
              </div>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Catégorie</span>
              <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{{ article.category?.name
                }}</span>
            </div>
            <div>
              <span class="text-xs font-bold uppercase text-slate-400 block mb-1">Vues</span>
              <span class="text-sm font-medium">{{ article.views }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center p-12 text-slate-500">
      Article introuvable...
    </div>
  </div>
</template>

<script setup>
import { IconArrowLeft } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Détail Article'
})

const route = useRoute()
const blogStore = useBlogStore()
const { articles } = storeToRefs(blogStore)

// Try getting from state or fallback to fetch list
const article = computed(() => {
  return articles.value.find(a => a.slug === route.params.slug)
})

// Fetch single if not found? Or list. 
// Assuming we fetch list for now as per previous logic
if (!article.value && !articles.value.length) {
  await blogStore.fetchArticles()
}
</script>
