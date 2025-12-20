<template>
  <AppLoader v-if="loading && !platform" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <!-- Header / View Mode -->
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/platform"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-4">
          <img v-if="platform?.logo" :src="platform.logo"
            class="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200" />
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ platform?.name || 'Plateforme' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="platform?.category"
                class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">{{ platform.category }}</span>
              <span class="text-xs text-slate-400 font-mono">{{ platform?.slug }}</span>
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

    <!-- Content View -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up delay-100">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Description & Contenu</h3>
          <div class="prose max-w-none mb-6">
            <p class="text-slate-600 italic">{{ platform?.description }}</p>
          </div>
          <div v-if="platform?.content" class="prose max-w-none pt-4 border-t" v-html="platform.content"></div>
          <div v-else class="text-slate-400 text-center py-8 italic">Aucun contenu détaillé.</div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Fonctionnalités</h3>
          <div v-if="parsedFeatures.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="(feat, idx) in parsedFeatures" :key="idx"
              class="flex items-start gap-2 p-3 rounded bg-slate-50 text-sm text-slate-700">
              <IconCheck size="16" class="text-emerald-500 mt-0.5 shrink-0" />
              <span>{{ feat }}</span>
            </div>
          </div>
          <div v-else class="text-slate-400 text-center py-4 italic">Aucune fonctionnalité listée.</div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Détails</h3>
          <div class="space-y-4">
            <div>
              <span class="block text-xs font-bold text-slate-400 uppercase">Statut</span>
              <span class="inline-flex mt-1 items-center px-2 py-1 rounded text-xs font-bold"
                :class="platform?.disabled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                {{ platform?.disabled ? 'Désactivé' : 'Actif' }}
              </span>
            </div>
            <div>
              <span class="block text-xs font-bold text-slate-400 uppercase">Authentification</span>
              <div v-if="platform?.allowAuth" class="mt-1">
                <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <IconLock size="16" class="text-emerald-500" />
                  <span>Autorisé ({{ platform.authType }})</span>
                </div>
              </div>
              <div v-else class="mt-1 text-sm text-slate-500">Non autorisé</div>
            </div>
            <div v-if="platform?.ctaText">
              <span class="block text-xs font-bold text-slate-400 uppercase">Call to Action</span>
              <a :href="platform.ctaLink" target="_blank"
                class="mt-2 block w-full text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded text-sm font-bold text-slate-700 transition-colors truncate">
                {{ platform.ctaText }}
              </a>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Visuels</h3>
          <div class="space-y-4">
            <div v-if="platform?.logo">
              <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Logo Mobile</span>
              <img :src="platform.logo"
                class="h-12 w-auto object-contain p-2 bg-slate-50 rounded border border-slate-100" />
            </div>
            <div v-if="platform?.logoDesk">
              <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Logo Bureau</span>
              <img :src="platform.logoDesk"
                class="h-12 w-auto object-contain p-2 bg-slate-50 rounded border border-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Generic Modal for Edit -->
    <BaseModal :is-open="isModalOpen" :title="isNew ? 'Nouvelle Plateforme' : 'Modifier Plateforme'"
      @close="closeModal">
      <form @submit.prevent="save" class="space-y-6">
        <!-- Info Principales -->
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

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Description courte</label>
          <textarea v-model="form.description" rows="2"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"></textarea>
        </div>

        <!-- Visuels : Custom Input for CDN -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div class="col-span-2 text-xs font-bold text-slate-500 uppercase">Visuels</div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nom Logo Mobile</label>
            <div class="flex items-center">
              <span
                class="bg-slate-200 px-3 py-2 border border-r-0 rounded-l-lg text-xs text-slate-500 whitespace-nowrap hidden sm:block truncate max-w-[120px]">.../Logos/</span>
              <input v-model="logoName" type="text" placeholder="nom-logo"
                class="flex-1 min-w-0 px-4 py-2 border rounded-lg sm:rounded-l-none sm:rounded-r-none focus:ring-2 focus:ring-emerald-500 outline-none" />
              <span
                class="bg-slate-200 px-3 py-2 border border-l-0 rounded-r-lg text-xs text-slate-500 font-mono">.png</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nom Logo Bureau</label>
            <div class="flex items-center">
              <span
                class="bg-slate-200 px-3 py-2 border border-r-0 rounded-l-lg text-xs text-slate-500 whitespace-nowrap hidden sm:block truncate max-w-[120px]">.../Logos/</span>
              <input v-model="logoDeskName" type="text" placeholder="nom-logo-desk"
                class="flex-1 min-w-0 px-4 py-2 border rounded-lg sm:rounded-l-none sm:rounded-r-none focus:ring-2 focus:ring-emerald-500 outline-none" />
              <span
                class="bg-slate-200 px-3 py-2 border border-l-0 rounded-r-lg text-xs text-slate-500 font-mono">.png</span>
            </div>
          </div>
        </div>

        <!-- Auth & CTA -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <input type="checkbox" v-model="form.allowAuth" id="allowAuth"
                class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <label for="allowAuth" class="text-sm font-bold text-slate-700">Autoriser l'authentification</label>
            </div>
            <select v-if="form.allowAuth" v-model="form.authType"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="all">Tous (User + Learner)</option>
              <option value="user">Utilisateur (User)</option>
              <option value="learner">Apprenant (Learner)</option>
            </select>
          </div>
          <div class="space-y-2">
            <div>
              <input v-model="form.ctaText" type="text" placeholder="Texte bouton d'action"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <input v-model="form.ctaLink" type="text" placeholder="https://lien-action.com"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        <!-- Contenu : Simple Textarea -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Contenu Détaillé (HTML accepté)</label>
          <textarea v-model="form.content" rows="6"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-sm"></textarea>
        </div>

        <!-- Features -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2">Fonctionnalités</label>
          <div class="space-y-2">
            <div v-for="(feat, index) in featuresList" :key="index" class="flex gap-2">
              <input v-model="featuresList[index]" type="text"
                class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                placeholder="Description..." />
              <button type="button" @click="removeFeature(index)" class="p-2 text-red-500 hover:bg-red-50 rounded">
                <IconTrash size="18" />
              </button>
            </div>
            <button type="button" @click="addFeature"
              class="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline mt-2">
              <IconPlus size="16" /> Ajouter une fonctionnalité
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t mt-6">
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
import { IconArrowLeft, IconTrash, IconPlus, IconPencil, IconCheck, IconLock } from '@tabler/icons-vue'
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
const isModalOpen = ref(false)

const LOGO_PREFIX = 'https://cdn.jsdelivr.net/gh/progestionsoft/Files/_General/Images/Logos/'
const LOGO_SUFFIX = '.png'

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

// Visuels helpers
const logoName = ref('')
const logoDeskName = ref('')
const featuresList = ref([])

onMounted(async () => {
  if (!isNew) {
    try {
      const data = await platformStore.fetchPlatform(slug)
      platform.value = data
      syncFormWithData(data)
    } catch (e) {
      // Error handled by store
    }
  } else {
    isModalOpen.value = true // Auto open if new
  }
})

useHead({
  title: computed(() => isNew ? 'Nouvelle Plateforme' : `Modifier ${platform.value?.name || 'Plateforme'}`)
})

// Parsed features for View Mode
const parsedFeatures = computed(() => {
  if (!platform.value?.features) return []
  if (Array.isArray(platform.value.features)) return platform.value.features
  try {
    const p = JSON.parse(platform.value.features)
    return Array.isArray(p) ? p : []
  } catch (e) { return [] }
})

const extractNameFromUrl = (url) => {
  if (!url) return ''
  if (url.startsWith(LOGO_PREFIX) && url.endsWith(LOGO_SUFFIX)) {
    return url.replace(LOGO_PREFIX, '').replace(LOGO_SUFFIX, '')
  }
  return '' // or url if we want to allow custom URLs (but instructions imply struct adherence)
}

const syncFormWithData = (data) => {
  form.name = data.name
  form.slug = data.slug
  form.description = data.description
  form.content = data.content
  form.logo = data.logo
  form.logoDesk = data.logoDesk
  form.category = data.category
  form.disabled = data.disabled
  form.allowAuth = data.allowAuth
  form.authType = data.authType || 'all'
  form.ctaText = data.ctaText
  form.ctaLink = data.ctaLink

  // Visuels
  logoName.value = extractNameFromUrl(data.logo)
  logoDeskName.value = extractNameFromUrl(data.logoDesk)

  // Features
  if (Array.isArray(data.features)) {
    featuresList.value = [...data.features]
  } else if (typeof data.features === 'string') {
    try {
      featuresList.value = JSON.parse(data.features)
    } catch (e) {
      featuresList.value = []
    }
  } else {
    featuresList.value = []
  }
}

const openModal = () => {
  if (platform.value) syncFormWithData(platform.value)
  isModalOpen.value = true
}
const closeModal = () => {
  if (isNew) router.back() // If cancelled creation, go back
  else isModalOpen.value = false
}

const addFeature = () => featuresList.value.push('')
const removeFeature = (index) => featuresList.value.splice(index, 1)

const save = async () => {
  try {
    form.features = featuresList.value.filter(f => f && f.trim() !== '')

    // Construct URLs
    form.logo = logoName.value ? `${LOGO_PREFIX}${logoName.value}${LOGO_SUFFIX}` : ''
    form.logoDesk = logoDeskName.value ? `${LOGO_PREFIX}${logoDeskName.value}${LOGO_SUFFIX}` : ''

    if (isNew) {
      await platformStore.addPlatform(form)
      router.push('/me/solutions/platform')
    } else {
      await platformStore.updatePlatform(platform.value.id, form)
      // Refresh local data
      const updated = await platformStore.fetchPlatform(form.slug || platform.value.slug)
      platform.value = updated
      closeModal()
    }
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}
</script>
