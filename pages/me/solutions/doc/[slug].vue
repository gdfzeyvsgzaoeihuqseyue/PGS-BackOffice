<template>
  <AppLoader v-if="loading && !doc" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-6 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/doc"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-bold text-slate-800">
            {{ isNew ? 'Nouveau Document' : doc?.name || 'Modification' }}
          </h2>
          <p class="text-slate-500 mt-1" v-if="!isNew">Édition du document</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="save" class="max-w-2xl mx-auto space-y-6 pb-12">
      <!-- Info Principales -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Informations</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nom du document</label>
            <input v-model="form.name" type="text" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Lien URL</label>
            <input v-model="form.link" type="url" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Plateforme associée</label>
            <select v-model="form.platform" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="" disabled>Sélectionner une plateforme...</option>
              <option v-for="plat in platforms" :key="plat.id" :value="plat.id">{{ plat.name }}</option>
            </select>
            <p v-if="platformsLoading" class="text-xs text-slate-400 mt-1">Chargement des plateformes...</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <NuxtLink to="/me/solutions/doc"
          class="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler
        </NuxtLink>
        <button type="submit"
          class="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm hover:shadow-md transition-all">
          Enregistrer
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { IconArrowLeft } from '@tabler/icons-vue'
import { useDocStore } from '~/stores/doc'
import { usePlatformStore } from '~/stores/platform'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const docStore = useDocStore()
const platformStore = usePlatformStore()

const { loading, error } = storeToRefs(docStore)
const { platforms, loading: platformsLoading } = storeToRefs(platformStore)

const id = route.params.slug // "slug" in filename but effectively an ID for docs usually, unless logic differs. Docs usually looked up by ID.
const isNew = id === 'new'
const doc = ref(null)

const form = reactive({
  name: '',
  link: '',
  platform: ''
})

onMounted(async () => {
  // Load platforms for the select
  platformStore.fetchPlatforms()

  if (!isNew) {
    try {
      const data = await docStore.fetchDoc(id)
      doc.value = data

      form.name = data.name
      form.link = data.link
      form.platform = data.platform?.id || data.platform || ''
    } catch (e) {
      // Error handled by store/component
    }
  }
})

useHead({
  title: computed(() => isNew ? 'Nouveau Document' : `Modifier ${doc.value?.name || 'Document'}`)
})

const save = async () => {
  try {
    if (isNew) {
      await docStore.addDoc(form)
    } else {
      await docStore.updateDoc(doc.value.id, form)
    }
    router.push('/me/solutions/doc')
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}
</script>
