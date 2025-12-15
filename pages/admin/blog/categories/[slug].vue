<template>
  <div v-if="category">
    <div class="mb-6">
      <button @click="$router.back()"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4">
        <IconArrowLeft size="18" />
        <span>Retour</span>
      </button>
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
          <span class="font-bold text-slate-800">{{ category.articles?.length || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-12 text-slate-500">Catégorie introuvable...</div>
</template>

<script setup>
import { IconArrowLeft, IconCategory } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Détail Catégorie'
})

const route = useRoute()
const blogStore = useBlogStore()
const { categories } = storeToRefs(blogStore)

const category = computed(() => {
  return categories.value.find(c => c.slug === route.params.slug)
})

if (!category.value && !categories.value.length) {
  await blogStore.fetchCategories()
}
</script>
