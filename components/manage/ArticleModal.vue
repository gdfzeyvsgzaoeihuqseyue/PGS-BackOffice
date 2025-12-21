<template>
  <BaseModal :is-open="isOpen" :title="article ? 'Modifier Article' : 'Nouvel Article'" @close="close">
    <form @submit.prevent="save" class="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Titre</label>
        <input v-model="form.title" type="text" required class="form-input" />
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Extrait (Résumé)</label>
        <textarea v-model="form.excerpt" rows="2" class="form-input"></textarea>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Contenu (HTML)</label>
        <RichTextEditor v-model="form.content" />
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">URL Image</label>
        <input v-model="form.imageUrl" type="url" class="form-input" placeholder="https://..." />
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

      <!-- Tags -->
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-2">Tags</label>
        <div class="space-y-2">
          <div v-for="(tag, index) in tagsList" :key="index" class="flex gap-2">
            <input v-model="tagsList[index]" type="text"
              class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              placeholder="Tag..." />
            <button type="button" @click="removeTag(index)" class="p-2 text-red-500 hover:bg-red-50 rounded">
              <IconTrash size="18" />
            </button>
          </div>
          <button type="button" @click="addTag"
            class="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline mt-2">
            <IconPlus size="16" /> Ajouter un tag
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button type="button" @click="close"
          class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
        <button type="submit"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm">Enregistrer</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { IconTrash, IconPlus } from '@tabler/icons-vue'
import { useBlogStore } from '~/stores/blog'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  article: Object // If passed, edit mode. Else create mode.
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()

const blogStore = useBlogStore()
const { authors, categories } = storeToRefs(blogStore)

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  author: '',
  category: '',
  tags: []
})

const tagsList = ref([])

// Sync form with props
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.article) {
      form.title = props.article.title
      form.excerpt = props.article.excerpt || ''
      form.content = props.article.content
      form.imageUrl = props.article.imageUrl || ''
      form.author = props.article.author?.id || props.article.author || ''
      form.category = props.article.category?.id || props.article.category || ''
      form.tags = props.article.tags || []
      tagsList.value = [...form.tags]
    } else {
      form.title = ''
      form.excerpt = ''
      form.content = ''
      form.imageUrl = ''
      form.author = ''
      form.category = ''
      form.tags = []
      tagsList.value = []
    }

    // Ensure lists are loaded
    if (!authors.value.length) blogStore.fetchAuthors()
    if (!categories.value.length) blogStore.fetchCategories()
  }
})

const addTag = () => tagsList.value.push('')
const removeTag = (index) => tagsList.value.splice(index, 1)

const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

const save = async () => {
  try {
    form.tags = tagsList.value.filter(t => t && t.trim() !== '')
    const payload = { ...form }

    if (!props.article) {
      payload.slug = slugify(form.title)
    }

    if (props.article) {
      await blogStore.updateArticle(props.article.id, payload)
    } else {
      await blogStore.addArticle(payload)
    }
    notify(props.article ? 'Article mis à jour' : 'Article créé')
    close()
    emit('saved')
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}

const close = () => emit('close')
</script>
