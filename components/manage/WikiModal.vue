<template>
  <BaseModal :is-open="isOpen" :title="isEditing ? 'Modifier la ressource Wiki' : 'Nouvelle ressource Wiki'"
    @close="closeModal">
    <form @submit.prevent="save" class="space-y-4">
      <!-- Name & Slug -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
          <input v-model="form.name" type="text" required class="form-input" placeholder="Nom de la ressource" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Slug</label>
          <input v-model="form.slug" type="text" required class="form-input" placeholder="slug-unique" />
        </div>
      </div>

      <!-- URL -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">URL</label>
        <input v-model="form.url" type="url" required class="form-input" placeholder="https://..." />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea v-model="form.description" rows="3" required class="form-input"
          placeholder="Description du contenu..."></textarea>
      </div>

      <!-- Additional Info -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Infos supplémentaires</label>
        <textarea v-model="form.additionalInfo" rows="2" class="form-input"
          placeholder="Notes ou détails..."></textarea>
      </div>

      <!-- Platform -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Plateforme associée</label>
        <select v-model="form.platform" class="form-input">
          <option :value="null">Aucune (Général)</option>
          <option v-for="plat in platforms" :key="plat.id" :value="plat.id">
            {{ plat.name }}
          </option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" @click="closeModal"
          class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors">
          Annuler
        </button>
        <button type="submit" :disabled="loading"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-transform active:scale-95 flex items-center gap-2">
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>{{ isEditing ? 'Mettre à jour' : 'Créer' }}</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { useWikiStore } from '~/stores/wiki'
import { usePlatformStore } from '~/stores/platform'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  wiki: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()

const wikiStore = useWikiStore()
const platformStore = usePlatformStore()
const { loading } = storeToRefs(wikiStore)
const { platforms } = storeToRefs(platformStore)

const isEditing = computed(() => !!props.wiki)

const form = reactive({
  slug: '',
  name: '',
  description: '',
  url: '',
  additionalInfo: '',
  platform: null
})

// Check if we need to load platforms
onMounted(() => {
  if (props.isOpen && platforms.value.length === 0) {
    platformStore.fetchPlatforms()
  }
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (platforms.value.length === 0) {
      platformStore.fetchPlatforms()
    }
    if (props.wiki) {
      form.slug = props.wiki.slug
      form.name = props.wiki.name
      form.description = props.wiki.description
      form.url = props.wiki.url
      form.additionalInfo = props.wiki.additionalInfo || ''
      form.platform = typeof props.wiki.platform === 'object' ? props.wiki.platform.id : props.wiki.platform
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.slug = ''
  form.name = ''
  form.description = ''
  form.url = ''
  form.additionalInfo = ''
  form.platform = null
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const save = async () => {
  try {
    if (isEditing.value) {
      await wikiStore.updateWiki(props.wiki.id, form)
    } else {
      await wikiStore.addWiki(form)
    }
    notify(isEditing.value ? 'Wiki mis à jour' : 'Wiki créé')
    emit('saved')
    closeModal()
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}
</script>
