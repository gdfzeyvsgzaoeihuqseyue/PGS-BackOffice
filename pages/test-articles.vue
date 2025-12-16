<template>
  <div>
    <div class="p-6">
      <button @click="$router.push('/')" class="mb-4 text-emerald-600 underline">Back Home</button>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Articles de Blog (Test Mode)</h2>
          <p class="text-slate-500 mt-1">Gérer les publications - TEST SANS AUTH</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
            Total: <span class="font-bold text-slate-800">{{ articles.length }}</span>
          </div>
          <button @click="openModal"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
            <IconPlus size="20" />
            <span>Nouvel Article</span>
          </button>
        </div>
      </div>

      <!-- Data List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
        v-if="!articles.length">
        <div class="p-12 text-slate-500">Aucun article trouvé.</div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Titre</th>
              <th class="px-6 py-4">Auteur</th>
              <th class="px-6 py-4">Catégorie</th>
              <th class="px-6 py-4">Vues</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="article in articles" :key="article.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <a href="#" class="hover:text-emerald-600 transition-colors">
                  {{ article.title }}
                </a>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ article.author?.name || '-' }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <span v-if="article.category" class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{{
                  article.category.name }}</span>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 font-mono">{{ article.views || 0 }}</td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="edit(article)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(article.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <BaseModal :is-open="isModalOpen" :title="editingId ? 'Modifier Article' : 'Nouvel Article'" @close="closeModal">
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
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="https://..." />
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
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Tech, News, ..." />
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" @click="closeModal"
              class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
            <button type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm">
              {{ editingId ? 'Mettre à jour (Voir Console)' : 'Créer (Voir Console)' }}
            </button>
          </div>
        </form>
      </BaseModal>

      <div v-if="savedData" class="mt-8 p-4 bg-gray-100 rounded border border-gray-300">
        <h3 class="font-bold mb-2">Saved Data Output (Check for Styles):</h3>
        <pre class="bg-black text-white p-4 rounded overflow-auto max-h-96 text-xs">{{ savedData }}</pre>
        <h4 class="font-bold mt-4 mb-2">Rendered HTML Preview:</h4>
        <div v-html="savedData.content" class="p-4 bg-white border rounded"></div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-vue'
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Test Blog Articles'
})

// MOCK DATA based on blogResponse.json
const mockArticle = {
  "id": "68df34a4605c6ce8ac0a558a",
  "slug": "octobre-rose-pgs-s-engage-pour-la-prevention-et-le-depistage",
  "title": "Octobre Rose : PGS s’engage pour la prévention et le dépistage",
  "excerpt": "Chaque année, Octobre Rose rappelle l’importance de la lutte contre le cancer du sein. PGS soutient la prévention et le dépistage pour sauver des vies.",
  "content": "<div style='background-color:#fff0f6; padding:20px; border-radius:12px;'> <h2 style='color:#d6336c;'>Octobre Rose : un rappel essentiel</h2><p>Chaque année, <strong>Octobre Rose</strong> rappelle l’importance de la lutte contre le cancer du sein. Chez <strong>PGS</strong>, nous tenons à soutenir cette cause qui touche directement ou indirectement des millions de personnes. La recherche avance, les traitements s’améliorent, mais une vérité demeure : <span style='color:#e64980; font-weight:bold;'>plus le cancer est détecté tôt, plus les chances de guérison sont élevées.</span></p><h2 style='color:#d6336c;'>La consultation régulière, un geste vital</h2><p>Le dépistage, une étape incontournable</p><p style='background-color:#ffe3ec; padding:12px; border-radius:8px; color:#c2255c; font-weight:bold;'>En ce mois d’Octobre Rose, PGS rappelle : prenez soin de vous.</p></div>",
  "imageUrl": "https://lh3.googleusercontent.com/p/AF1QipNc7SwKWfVJNv36FPGAVhbqYRCOLA4qSDGo8QE=h305-no",
  "tags": [
    "PGS",
    "Octobre Rose"
  ],
  "views": 81,
  "category": {
    "id": "68df3429605c6ce8ac0a5589",
    "name": "Autres",
    "slug": "autres"
  },
  "author": {
    "id": "68df33ac605c6ce8ac0a5588",
    "name": "Contributeur externe",
    "slug": "contributeur-externe"
  }
}

const articles = ref([mockArticle])
const authors = ref([{ id: '68df33ac605c6ce8ac0a5588', name: 'Contributeur externe' }])
const categories = ref([{ id: '68df3429605c6ce8ac0a5589', name: 'Autres' }])

const isModalOpen = ref(false)
const editingId = ref(null)
const inputTags = ref('')
const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  author: '',
  category: '',
  tags: []
})

const savedData = ref(null)

const openModal = () => {
  editingId.value = null
  form.title = ''
  form.excerpt = ''
  form.content = ''
  form.imageUrl = ''
  form.author = ''
  form.category = ''
  form.tags = []
  inputTags.value = ''
  isModalOpen.value = true
  savedData.value = null
}

const closeModal = () => isModalOpen.value = false

const edit = (article) => {
  editingId.value = article.id
  form.title = article.title
  form.excerpt = article.excerpt || ''
  form.content = article.content
  form.imageUrl = article.imageUrl || ''

  // Handle relation mapping
  form.author = article.author?.id || article.author || ''
  form.category = article.category?.id || article.category || ''

  form.tags = article.tags || []
  inputTags.value = form.tags.join(', ')

  isModalOpen.value = true
  savedData.value = null
}

const save = async () => {
  // Parse tags
  form.tags = inputTags.value.split(',').map(t => t.trim()).filter(t => t)

  const payload = { ...form }

  console.log('SAVING PAYLOAD:', payload)
  savedData.value = payload

  if (editingId.value) {
    // Update local mock
    const idx = articles.value.findIndex(a => a.id === editingId.value)
    if (idx !== -1) {
      articles.value[idx] = {
        ...articles.value[idx], ...payload,
        author: authors.value.find(a => a.id === payload.author),
        category: categories.value.find(c => c.id === payload.category)
      }
    }
  } else {
    // Add new mock
    articles.value.push({
      id: Date.now().toString(),
      ...payload,
      views: 0,
      author: authors.value.find(a => a.id === payload.author),
      category: categories.value.find(c => c.id === payload.category)
    })
  }
  // Don't close immediately so we can see the debug output
  // closeModal()
}

const remove = async (id) => {
  if (confirm('Supprimer cet article ?')) {
    articles.value = articles.value.filter(a => a.id !== id)
  }
}
</script>
