<template>
  <BaseModal :is-open="isOpen" :title="platform ? 'Modifier Plateforme' : 'Nouvelle Plateforme'" @close="close">
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
          <input v-model="form.slug" type="text"
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
        <CdnInput v-model="form.logo" label="Nom Logo Mobile" placeholder="nom-logo" />
        <CdnInput v-model="form.logoDesk" label="Nom Logo Bureau" placeholder="nom-logo-desk" />
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
        <label class="block text-sm font-bold text-slate-700 mb-1">Contenu Détaillé</label>
        <textarea v-model="form.content" rows="6" class="form-textarea"></textarea>
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
        <button type="button" @click="close"
          class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
        <button type="submit"
          class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm hover:shadow-md transition-all">
          Enregistrer
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { IconTrash, IconPlus } from '@tabler/icons-vue'
import { usePlatformStore } from '~/stores/platform'
import CdnInput from './CdnInput.vue'

const props = defineProps({
  isOpen: Boolean,
  platform: Object
})

const emit = defineEmits(['close', 'saved'])
const platformStore = usePlatformStore()

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

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.platform) {
      const data = props.platform
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

      // Features
      if (Array.isArray(data.features)) {
        featuresList.value = [...data.features]
      } else if (typeof data.features === 'string') {
        try {
          const parsed = JSON.parse(data.features)
          featuresList.value = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          featuresList.value = []
        }
      } else {
        featuresList.value = []
      }
    } else {
      // Reset
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
      featuresList.value = []
    }
  }
})

const addFeature = () => featuresList.value.push('')
const removeFeature = (index) => featuresList.value.splice(index, 1)

const save = async () => {
  try {
    form.features = featuresList.value.filter(f => f && f.trim() !== '')

    if (!props.platform) {
      await platformStore.addPlatform(form)
    } else {
      await platformStore.updatePlatform(props.platform.id, form)
    }
    emit('saved')
    close()
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}

const close = () => emit('close')
</script>
