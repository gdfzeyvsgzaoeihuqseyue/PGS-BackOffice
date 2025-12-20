<template>
  <AppLoader v-if="loading && !platform" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-6 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/platform"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-bold text-slate-800">
            {{ isNew ? 'Nouvelle Plateforme' : platform?.name || 'Modification' }}
          </h2>
          <p class="text-slate-500 mt-1" v-if="!isNew">Édition de la solution</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="save" class="max-w-4xl mx-auto space-y-6 pb-12">
      <!-- Info Principales -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Informations Générales</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
            <input v-model="form.name" type="text" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Slug</label>
            <input v-model="form.slug" type="text" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Catégorie</label>
            <input v-model="form.category" type="text"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div class="flex items-center gap-3 pt-6">
            <input type="checkbox" v-model="form.disabled" id="disabled"
              class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            <label for="disabled" class="text-sm font-bold text-slate-700">Désactiver la plateforme</label>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-bold text-slate-700 mb-1">Description courte</label>
          <textarea v-model="form.description" rows="2"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"></textarea>
        </div>
      </div>

      <!-- Visuels -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Visuels</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Logo Mobile (URL)</label>
            <input v-model="form.logo" type="url"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Logo Bureau (URL)</label>
            <input v-model="form.logoDesk" type="url"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
        </div>
      </div>

      <!-- Auth & CTA -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Configuration & Appels à l'action</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div class="flex items-center gap-3 pt-2">
            <input type="checkbox" v-model="form.allowAuth" id="allowAuth"
              class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            <label for="allowAuth" class="text-sm font-bold text-slate-700">Autoriser l'authentification</label>
          </div>
          <div v-if="form.allowAuth">
            <label class="block text-sm font-bold text-slate-700 mb-1">Type d'Auth</label>
            <select v-model="form.authType"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="all">Tous (User + Learner)</option>
              <option value="user">Utilisateur (User)</option>
              <option value="learner">Apprenant (Learner)</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Texte bouton CTA</label>
            <input v-model="form.ctaText" type="text"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Lien bouton CTA</label>
            <input v-model="form.ctaLink" type="text"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
          </div>
        </div>
      </div>

      <!-- Contenu -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Contenu Détaillé</h3>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Contenu (HTML)</label>
          <RichTextEditor v-model="form.content" />
        </div>
      </div>

      <!-- Features (JSON) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Fonctionnalités</h3>
        <p class="text-xs text-slate-500 mb-2">Ajoutez des fonctionnalités. Format simple liste.</p>

        <div class="space-y-3">
          <div v-for="(feat, index) in featuresList" :key="index" class="flex gap-2">
            <input v-model="featuresList[index]" type="text"
              class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Description fonctionnalité..." />
            <button type="button" @click="removeFeature(index)" class="p-2 text-red-500 hover:bg-red-50 rounded">
              <IconTrash size="18" />
            </button>
          </div>
          <button type="button" @click="addFeature"
            class="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline">
            <IconPlus size="16" /> Ajouter une fonctionnalité
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <NuxtLink to="/me/solutions/platform"
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
import { IconArrowLeft, IconTrash, IconPlus } from '@tabler/icons-vue'
import { usePlatformStore } from '~/stores/platform'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const platformStore = usePlatformStore()
const { loading, error } = storeToRefs(platformStore)

const slug = route.params.slug
const isNew = slug === 'new'
const platform = ref(null)

const form = reactive({
  name: '',
  slug: '',
  description: '',
  content: '',
  logo: '',
  logoDesk: '',
  category: '',
  disabled: false,
  allowAuth: false,
  authType: 'all',
  ctaText: '',
  ctaLink: '',
  features: []
})

const featuresList = ref([])

onMounted(async () => {
  if (!isNew) {
    try {
      const data = await platformStore.fetchPlatform(slug)
      platform.value = data

      form.name = data.name
      form.slug = data.slug
      form.description = data.description
      form.content = data.content
      form.logo = data.logo
      form.logoDesk = data.logoDesk
      form.category = data.category
      form.disabled = data.disabled
      form.allowAuth = data.allowAuth
      form.authType = data.authType
      form.ctaText = data.ctaText
      form.ctaLink = data.ctaLink

      if (Array.isArray(data.features)) {
        featuresList.value = [...data.features]
      } else if (typeof data.features === 'string') {
        try {
          featuresList.value = JSON.parse(data.features)
        } catch (e) {
          featuresList.value = []
        }
      }
    } catch (e) {
      // Error handled by store/component
    }
  }
})

useHead({
  title: computed(() => isNew ? 'Nouvelle Plateforme' : `Modifier ${platform.value?.name || 'Plateforme'}`)
})

const addFeature = () => {
  featuresList.value.push('')
}

const removeFeature = (index) => {
  featuresList.value.splice(index, 1)
}

const save = async () => {
  try {
    form.features = featuresList.value.filter(f => f && f.trim() !== '')

    if (isNew) {
      await platformStore.addPlatform(form)
    } else {
      await platformStore.updatePlatform(platform.value.id, form)
    }
    router.push('/me/solutions/platform')
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}
</script>
