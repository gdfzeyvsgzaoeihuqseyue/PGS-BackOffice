<template>
  <div v-if="category">
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

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-lg mx-auto">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <IconCategory size="32" />
        </div>
        <h1 class="text-2xl font-bold text-slate-800">{{ category.name }}</h1>
        <p class="text-slate-500 mt-1">Détails de la catégorie</p>
      </div>

      <div class="space-y-4">
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-medium">ID</span>
          <span class="text-xs font-mono text-slate-400">{{ category.id }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-medium">Slug</span>
          <code class="text-sm bg-slate-100 px-2 py-0.5 rounded">{{ category.slug }}</code>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-medium">Articles associés</span>
          <span class="font-bold text-slate-800">{{ computedArticleCount }}</span>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <BaseModal :is-open="isModalOpen" title="Modifier Catégorie" @close="closeModal">
      <form @submit.prevent="save" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
          <input v-model="form.name" type="text" required
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

  </div>
  <div v-else class="text-center p-12 text-slate-500">Catégorie introuvable...</div>
</template>

<script setup>
import { IconArrowLeft, IconCategory, IconTrash, IconPencil } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Détail Catégorie'
})

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { categories, articles } = storeToRefs(blogStore)

await Promise.all([
  blogStore.fetchCategories(),
  blogStore.fetchArticles()
])

const category = computed(() => {
  return categories.value.find(c => c.slug === route.params.slug)
})

const computedArticleCount = computed(() => {
  if (!category.value || !articles.value) return 0
  return articles.value.filter(a => {
    const catRef = a.category
    if (!catRef) return false
    if (typeof catRef === 'object') return catRef.id === category.value.id || catRef.slug === category.value.slug
    return catRef === category.value.id
  }).length
})

// Edit Logic
const isModalOpen = ref(false)
const form = reactive({ name: '' })

const openModal = () => {
  if (!category.value) return
  form.name = category.value.name
  isModalOpen.value = true
}

const closeModal = () => isModalOpen.value = false

const save = async () => {
  try {
    await blogStore.updateCategory(category.value.id, { ...form })
    closeModal()
    await blogStore.fetchCategories()
  } catch (e) {
    alert('Erreur: ' + e.message)
  }
}

const remove = async () => {
  if (!category.value) return
  if (confirm('Supprimer cette catégorie ?')) {
    await blogStore.deleteCategory(category.value.id)
    router.push('/admin/blog/categories')
  }
}
</script>
