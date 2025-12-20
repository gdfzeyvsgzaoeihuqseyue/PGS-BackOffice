<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Plateformes</h2>
        <p class="text-slate-500 mt-1">Gérer les solutions logicielles</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ platforms.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouvelle Plateforme</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!platforms.length && !platformStore.loading">
      <div class="p-12 text-slate-500">Aucune plateforme trouvée.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Nom</th>
              <th class="px-6 py-4">Slug</th>
              <th class="px-6 py-4">Catégorie</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="platform in platforms" :key="platform.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <div class="flex items-center gap-3">
                  <img v-if="platform.logo" :src="platform.logo" class="w-8 h-8 rounded object-cover bg-slate-100" />
                  <div v-else class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                    <IconPhoto size="16" />
                  </div>
                  <NuxtLink :to="`/me/solutions/platform/${platform.slug}`"
                    class="hover:text-emerald-600 transition-colors">
                    {{ platform.name }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 font-mono">{{ platform.slug }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <span v-if="platform.category"
                  class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{{ platform.category }}</span>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold"
                  :class="platform.disabled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                  {{ platform.disabled ? 'Désactivé' : 'Actif' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(platform)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(platform.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Generic Modal for Create/Edit -->
    <BaseModal :is-open="isModalOpen" :title="editingId ? 'Modifier Plateforme' : 'Nouvelle Plateforme'"
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
import { IconPlus, IconPencil, IconTrash, IconPhoto } from '@tabler/icons-vue'
import { usePlatformStore } from '~/stores/platform'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Plateformes'
})

const platformStore = usePlatformStore()
const { platforms, loading, error } = storeToRefs(platformStore)

const refresh = () => {
  platformStore.fetchPlatforms()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer cette plateforme ? Cette action est irréversible.')) {
    await platformStore.deletePlatform(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingId = ref(null)

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

const logoName = ref('')
const logoDeskName = ref('')
const featuresList = ref([])

const extractNameFromUrl = (url) => {
  if (!url) return ''
  if (url.startsWith(LOGO_PREFIX) && url.endsWith(LOGO_SUFFIX)) {
    return url.replace(LOGO_PREFIX, '').replace(LOGO_SUFFIX, '')
  }
  return ''
}

const syncFormWithData = (data) => {
  form.name = data.name || ''
  form.slug = data.slug || ''
  form.description = data.description || ''
  form.content = data.content || ''
  form.logo = data.logo || ''
  form.logoDesk = data.logoDesk || ''
  form.category = data.category || ''
  form.disabled = data.disabled || false
  form.allowAuth = data.allowAuth || false
  form.authType = data.authType || 'all'
  form.ctaText = data.ctaText || ''
  form.ctaLink = data.ctaLink || ''

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

const resetForm = () => {
  form.name = ''
  form.slug = ''
  form.description = ''
  form.content = ''
  form.logo = ''
  form.logoDesk = ''
  form.category = ''
  form.disabled = false
  form.allowAuth = false
  form.authType = 'all'
  form.ctaText = ''
  form.ctaLink = ''
  logoName.value = ''
  logoDeskName.value = ''
  featuresList.value = []
}

const openModal = (platform) => {
  if (platform) {
    editingId.value = platform.id
    syncFormWithData(platform)
  } else {
    editingId.value = null
    resetForm()
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingId.value = null
}

const addFeature = () => featuresList.value.push('')
const removeFeature = (index) => featuresList.value.splice(index, 1)

const save = async () => {
  try {
    form.features = featuresList.value.filter(f => f && f.trim() !== '')

    // Construct URLs
    form.logo = logoName.value ? `${LOGO_PREFIX}${logoName.value}${LOGO_SUFFIX}` : ''
    form.logoDesk = logoDeskName.value ? `${LOGO_PREFIX}${logoDeskName.value}${LOGO_SUFFIX}` : ''

    if (!editingId.value) {
      await platformStore.addPlatform(form)
    } else {
      await platformStore.updatePlatform(editingId.value, form)
    }
    closeModal()
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}
</script>
