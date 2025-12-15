<template>
  <div v-if="author">
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
          <span class="text-sm font-bold text-slate-700">{{ author.articles?.length || 0 }} contribution(s)</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-12 text-slate-500">Auteur introuvable...</div>
</template>

<script setup>
import { IconArrowLeft, IconTrash } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Détail Auteur'
})

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const { authors } = storeToRefs(blogStore)

const author = computed(() => {
  return authors.value.find(a => a.slug === route.params.slug)
})

if (!author.value && !authors.value.length) {
  await blogStore.fetchAuthors()
}

const remove = async () => {
  if (!author.value) return
  if (confirm('Supprimer cet auteur ?')) {
    await blogStore.deleteAuthor(author.value.id)
    router.push('/admin/blog/authors')
  }
}
</script>
