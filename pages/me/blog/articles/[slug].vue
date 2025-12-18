<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
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
          <div v-if="article.imageUrl"
            class="rounded-2xl overflow-hidden shadow-sm border border-slate-100 aspect-video relative">
            <img :src="article.imageUrl" class="object-cover w-full h-full" />
          </div>

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
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <BaseModal :is-open="isModalOpen" title="Modifier Article" @close="closeModal">
      <form @submit.prevent="save" class="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Titre</label>
          <input v-model="form.title" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
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
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
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

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Tags (séparés par virgule)</label>
          <input v-model="inputTags" type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button type="button" @click="closeModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
          <button type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm font-medium">Enregistrer</button>
        </div>
      </form>
    </BaseModal>

    <div v-if="!article" class="text-center p-12 text-slate-500">
      Article introuvable...
    </div>
  </div>
</template>

<script setup>
import { IconArrowLeft, IconTrash, IconEye, IconPencil } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Détail Article'
})

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { articles, authors, categories, loading, error } = storeToRefs(blogStore)

const refresh = () => {
  blogStore.fetchArticles()
  blogStore.fetchAuthors()
  blogStore.fetchCategories()
}

refresh()

const article = computed(() => {
  return articles.value.find(a => a.slug === route.params.slug)
})


// Edit Modal
const isModalOpen = ref(false)
const inputTags = ref('')
const form = reactive({
  title: '', excerpt: '', content: '', imageUrl: '', author: '', category: '', tags: []
})

const openModal = () => {
  if (!article.value) return
  form.title = article.value.title
  form.excerpt = article.value.excerpt || ''
  form.content = article.value.content
  form.imageUrl = article.value.imageUrl || ''

  // Map existing objects to IDs for select
  form.author = article.value.author?.id || article.value.author || ''
  form.category = article.value.category?.id || article.value.category || ''

  form.tags = article.value.tags || []
  inputTags.value = form.tags.join(', ')

  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const save = async () => {
  try {
    form.tags = inputTags.value.split(',').map(t => t.trim()).filter(t => t)
    await blogStore.updateArticle(article.value.id, { ...form })
    closeModal()
    await blogStore.fetchArticles()
  } catch (e) {
    alert('Erreur: ' + e.message)
  }
}

const remove = async () => {
  if (!article.value) return
  if (confirm('Supprimer cet article ?')) {
    await blogStore.deleteArticle(article.value.id)
    router.push('/me/blog/articles')
  }
}
</script>
