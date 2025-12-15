<template>
  <div v-if="author">
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
          <span class="text-sm font-bold text-slate-700">{{ computedArticleCount }} contribution(s)</span>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <BaseModal :is-open="isModalOpen" title="Modifier Auteur" @close="closeModal">
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
          <input v-model="form.name" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Avatar URL</label>
          <input v-model="form.avatar" type="url"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Rôle</label>
          <input v-model="form.role" type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
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
  <div v-else class="text-center p-12 text-slate-500">Auteur introuvable...</div>
</template>

<script setup>
import { IconArrowLeft, IconTrash, IconPencil } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Détail Auteur'
})

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { authors, articles } = storeToRefs(blogStore)

// Fetch both so we can count articles
await Promise.all([
  blogStore.fetchAuthors(),
  blogStore.fetchArticles()
])

const author = computed(() => {
  return authors.value.find(a => a.slug === route.params.slug)
})

// Calculate article count by filtering all articles
const computedArticleCount = computed(() => {
  if (!author.value || !articles.value) return 0
  return articles.value.filter(a => {
    // Handle potential different response structures (id or full object)
    const authRef = a.author
    if (!authRef) return false
    if (typeof authRef === 'object') return authRef.id === author.value.id || authRef.slug === author.value.slug
    return authRef === author.value.id
  }).length
})


// Edit Modal Logic
const isModalOpen = ref(false)
const form = reactive({ name: '', avatar: '', role: '', bio: '' })

const openModal = () => {
  if (!author.value) return
  form.name = author.value.name
  form.avatar = author.value.avatar || ''
  form.role = author.value.role || 'Rédacteur'
  form.bio = author.value.bio || ''
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const save = async () => {
  try {
    await blogStore.updateAuthor(author.value.id, { ...form })
    closeModal()
    await blogStore.fetchAuthors() // Refresh data
  } catch (e) {
    alert('Erreur: ' + e.message)
  }
}

const remove = async () => {
  if (!author.value) return
  if (confirm('Supprimer cet auteur ?')) {
    await blogStore.deleteAuthor(author.value.id)
    router.push('/admin/blog/authors')
  }
}
</script>
