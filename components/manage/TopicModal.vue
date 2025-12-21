<template>
  <BaseModal :isOpen="isOpen" :title="isEditing ? 'Modifier le Sujet FAQ' : 'Nouveau Sujet FAQ'" @close="closeModal">
    <form @submit.prevent="save" class="space-y-4">
      <!-- Name & Slug -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
          <input v-model="form.name" type="text" required class="form-input" placeholder="Ex: Authentification" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Slug</label>
          <input v-model="form.slug" type="text" class="form-input" placeholder="authentification" />
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea v-model="form.description" rows="3" class="form-input" placeholder="Courte description..."></textarea>
      </div>

      <!-- Platform & Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Plateforme associée</label>
          <select v-model="form.platform" required class="form-input bg-white">
            <option :value="null" disabled>Sélectionner une plateforme</option>
            <option v-for="plat in platforms" :key="plat.id" :value="plat.id">
              {{ plat.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Statut</label>
          <select v-model="form.status" required class="form-input bg-white">
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
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
import { useFaqTopicStore } from '~/stores/faq-topic'
import { usePlatformStore } from '~/stores/platform'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  topic: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()

const topicStore = useFaqTopicStore()
const platformStore = usePlatformStore()
const { loading } = storeToRefs(topicStore)
const { platforms } = storeToRefs(platformStore)

const isEditing = computed(() => !!props.topic)

const form = reactive({
  name: '',
  slug: '',
  description: '',
  platform: null,
  status: 'active'
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
    if (props.topic) {
      form.name = props.topic.name
      form.slug = props.topic.slug || ''
      form.description = props.topic.description || ''
      form.platform = typeof props.topic.platform === 'object' ? props.topic.platform.id : props.topic.platform
      form.status = props.topic.status || 'active'
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.name = ''
  form.slug = ''
  form.description = ''
  form.platform = null
  form.status = 'active'
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const save = async () => {
  try {
    if (isEditing.value) {
      await topicStore.updateTopic(props.topic.id, form)
    } else {
      await topicStore.addTopic(form)
    }
    notify(isEditing.value ? 'Sujet mis à jour' : 'Sujet créé')
    closeModal()
    emit('saved')
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}
</script>
