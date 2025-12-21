<template>
  <BaseModal :is-open="isOpen" :title="isEditing ? 'Modifier le tutoriel' : 'Nouveau tutoriel'" @close="closeModal">
    <form @submit.prevent="save" class="space-y-4">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
        <input v-model="form.title" type="text" required class="form-input" placeholder="Ex: Comment utiliser..." />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea v-model="form.description" rows="3" class="form-input" placeholder="Courte description..."></textarea>
      </div>

      <!-- Time & Link -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Durée</label>
          <input v-model="form.time" type="text" class="form-input" placeholder="Ex: 5min" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Lien (Vidéo/Guide)</label>
          <input v-model="form.link" type="text" required class="form-input" placeholder="https://..." />
        </div>
      </div>

      <!-- Platform -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Plateforme associée</label>
        <select v-model="form.platform" required class="form-input">
          <option :value="null" disabled>Sélectionner une plateforme</option>
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
import { useTutoStore } from '~/stores/tuto'
import { usePlatformStore } from '~/stores/platform'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  tuto: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()

const tutoStore = useTutoStore()
const platformStore = usePlatformStore()
const { loading } = storeToRefs(tutoStore)
const { platforms } = storeToRefs(platformStore)

const isEditing = computed(() => !!props.tuto)

const form = reactive({
  title: '',
  description: '',
  time: '',
  link: '',
  platform: null
})

// Check if we need to load platforms
onMounted(() => {
  if (props.isOpen && platforms.value.length === 0) {
    platformStore.fetchPlatforms()
  }
})

// Also watch isOpen just in case it's opened later
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (platforms.value.length === 0) {
      platformStore.fetchPlatforms()
    }
    if (props.tuto) {
      form.title = props.tuto.title
      form.description = props.tuto.description || ''
      form.time = props.tuto.time || ''
      form.link = props.tuto.link
      form.platform = typeof props.tuto.platform === 'object' ? props.tuto.platform.id : props.tuto.platform
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.time = ''
  form.link = ''
  form.platform = null
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const save = async () => {
  try {
    if (isEditing.value) {
      await tutoStore.updateTuto(props.tuto.id, form)
    } else {
      await tutoStore.addTuto(form)
    }
    notify(isEditing.value ? 'Tutoriel mis à jour' : 'Tutoriel créé')
    closeModal()
    emit('saved')
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}
</script>
