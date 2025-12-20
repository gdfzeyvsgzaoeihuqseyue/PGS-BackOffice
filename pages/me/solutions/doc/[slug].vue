<template>
  <AppLoader v-if="loading && !doc" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/doc"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <IconFileText size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ doc?.name || 'Document' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="doc?.platform" class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">
                {{ doc.platform.name || 'ID: ' + doc.platform }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button @click="openModal"
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
        <IconPencil size="18" />
        <span>Modifier</span>
      </button>
    </div>

    <!-- View Content -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center fade-in-up">
      <h3 class="font-bold text-lg text-slate-800 mb-2">Accès au document</h3>
      <p class="text-slate-500 mb-6 max-w-lg mx-auto">Ce document est hébergé en externe. Cliquez ci-dessous pour y
        accéder.</p>

      <a :href="doc?.link" target="_blank"
        class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
        <IconExternalLink size="20" />
        Ouvrir le document
      </a>

      <div class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Créé le</span>
          <span class="text-sm font-mono text-slate-600">{{ doc?.createdAt ? new
            Date(doc.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Mis à jour le</span>
          <span class="text-sm font-mono text-slate-600">{{ doc?.updatedAt ? new
            Date(doc.updatedAt).toLocaleDateString() : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <BaseModal :is-open="isModalOpen" :title="isNew ? 'Nouveau Document' : 'Modifier Document'" @close="closeModal">
      <form @submit.prevent="save" class="space-y-6">
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
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t mt-4">
          <button type="button" @click="closeModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
          <button type="submit"
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm hover:shadow-md transition-all">
            Enregistrer
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { IconArrowLeft, IconPencil, IconFileText, IconExternalLink } from '@tabler/icons-vue'
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
const { platforms } = storeToRefs(platformStore)

const id = route.params.slug
const isNew = id === 'new'
const doc = ref(null)
const isModalOpen = ref(false)

const form = reactive({
  name: '',
  link: '',
  platform: ''
})

onMounted(async () => {
  // Determine context: we need platforms list for the form
  platformStore.fetchPlatforms()

  if (!isNew) {
    try {
      const data = await docStore.fetchDoc(id)
      doc.value = data
      syncFormWithData(data)
    } catch (e) {
      // Error handled by store
    }
  } else {
    isModalOpen.value = true
  }
})

const syncFormWithData = (data) => {
  form.name = data.name
  form.link = data.link
  form.platform = data.platform?.id || data.platform || ''
}

const openModal = () => {
  if (doc.value) syncFormWithData(doc.value)
  isModalOpen.value = true
}

const closeModal = () => {
  if (isNew) router.back()
  else isModalOpen.value = false
}

useHead({
  title: computed(() => isNew ? 'Nouveau Document' : `Modifier ${doc.value?.name || 'Document'}`)
})

const save = async () => {
  try {
    if (isNew) {
      await docStore.addDoc(form)
      router.push('/me/solutions/doc')
    } else {
      await docStore.updateDoc(doc.value.id, form)
      // refresh
      doc.value = await docStore.fetchDoc(doc.value.id)
      isModalOpen.value = false
    }
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}
</script>
