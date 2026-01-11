<template>
  <BaseModal :isOpen="isOpen" :title="isEditing ? 'Modifier l\'événement' : 'Nouvel événement'" @close="closeModal">
    <form @submit.prevent="save" class="space-y-4">
      <!-- Type & Format -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select v-model="form.type" required class="form-input bg-white">
            <option value="event">Événement</option>
            <option value="webinar">Webinaire</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Format</label>
          <select v-model="form.format" required class="form-input bg-white">
            <option value="online">En ligne</option>
            <option value="présential">Présentiel</option>
            <option value="hybride">Hybride</option>
          </select>
        </div>
      </div>

      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
        <input v-model="form.title" type="text" required class="form-input" placeholder="Titre de l'événement" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea v-model="form.description" rows="3" required class="form-input"
          placeholder="Description de l'événement..."></textarea>
      </div>

      <!-- Date & Time -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input v-model="form.date" type="date" required class="form-input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Heure</label>
          <input v-model="form.time" type="time" required class="form-input" />
        </div>
      </div>

      <!-- Location (conditionally required) -->
      <div v-if="form.format === 'présential' || form.format === 'hybride'">
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Lieu
          <span v-if="form.format === 'présential'" class="text-red-500">*</span>
        </label>
        <input v-model="form.location" type="text" :required="form.format === 'présential'" class="form-input"
          placeholder="Adresse du lieu" />
      </div>

      <!-- Link (conditionally required) -->
      <div v-if="form.format === 'online' || form.format === 'hybride'">
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Lien en ligne
          <span v-if="form.format === 'online'" class="text-red-500">*</span>
        </label>
        <input v-model="form.link" type="url" :required="form.format === 'online'" class="form-input"
          placeholder="https://..." />
      </div>

      <!-- CTA -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Texte CTA</label>
          <input v-model="form.ctaText" type="text" class="form-input" placeholder="S'inscrire" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Lien CTA <span
              class="text-red-500">*</span></label>
          <input v-model="form.ctaLink" type="url" required class="form-input" placeholder="https://..." />
        </div>
      </div>

      <!-- Agenda (for type 'event') -->
      <div v-if="form.type === 'event'">
        <label class="block text-sm font-medium text-slate-700 mb-2">
          Agenda <span class="text-red-500">*</span>
        </label>
        <div class="space-y-2">
          <div v-for="(item, index) in form.agenda" :key="index"
            class="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
            <div class="flex-1 space-y-2">
              <input v-model="item.title" type="text" class="form-input text-sm" placeholder="Titre du point"
                required />
              <input v-model="item.description" type="text" class="form-input text-sm"
                placeholder="Description (optionnel)" />
            </div>
            <button type="button" @click="removeAgendaItem(index)"
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <IconTrash size="18" />
            </button>
          </div>
        </div>
        <button type="button" @click="addAgendaItem"
          class="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
          <IconPlus size="16" />
          Ajouter un point
        </button>
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
import { IconPlus, IconTrash } from '@tabler/icons-vue'
import { useEventStore } from '~/stores/event'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  event: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()

const eventStore = useEventStore()
const { loading } = storeToRefs(eventStore)

const isEditing = computed(() => !!props.event?.id)

const form = reactive({
  type: 'event',
  title: '',
  description: '',
  format: 'online',
  date: '',
  time: '',
  location: '',
  link: '',
  ctaText: 'S\'inscrire',
  ctaLink: '',
  agenda: []
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.event) {
      form.type = props.event.type || 'event'
      form.title = props.event.title || ''
      form.description = props.event.description || ''
      form.format = props.event.format || 'online'
      form.date = props.event.date || ''
      form.time = props.event.time || ''
      form.location = props.event.location || ''
      form.link = props.event.link || ''
      form.ctaText = props.event.ctaText || 'S\'inscrire'
      form.ctaLink = props.event.ctaLink || ''
      // Convert string items to objects for form compatibility
      form.agenda = props.event.agenda
        ? props.event.agenda.map(item => typeof item === 'string' ? { title: item, description: '' } : item)
        : []
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.type = 'event'
  form.title = ''
  form.description = ''
  form.format = 'online'
  form.date = ''
  form.time = ''
  form.location = ''
  form.link = ''
  form.ctaText = 'S\'inscrire'
  form.ctaLink = ''
  form.agenda = []
}

const addAgendaItem = () => {
  form.agenda.push({ title: '', description: '' })
}

const removeAgendaItem = (index) => {
  form.agenda.splice(index, 1)
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const save = async () => {
  try {
    // Validation
    if (form.type === 'event' && form.agenda.length === 0) {
      notify('L\'agenda est requis pour les événements', 'error')
      return
    }

    if (form.format === 'présential' && !form.location) {
      notify('Le lieu est requis pour les événements en présentiel', 'error')
      return
    }

    if (form.format === 'online' && !form.link) {
      notify('Le lien est requis pour les événements en ligne', 'error')
      return
    }

    if (form.format === 'hybride' && !form.location && !form.link) {
      notify('Le lieu ou le lien est requis pour les événements hybrides', 'error')
      return
    }

    const payload = {
      type: form.type,
      title: form.title,
      description: form.description,
      format: form.format,
      date: form.date,
      time: form.time,
      location: form.location || null,
      link: form.link || null,
      ctaText: form.ctaText || 'S\'inscrire',
      ctaLink: form.ctaLink,
      agenda: form.agenda.filter(a => a.title.trim() !== '').map(a => a.title)
    }

    if (isEditing.value) {
      await eventStore.updateEvent(props.event.id, payload)
    } else {
      await eventStore.addEvent(payload)
    }
    notify(isEditing.value ? 'Événement mis à jour' : 'Événement créé')
    closeModal()
    emit('saved')
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}
</script>
