<template>
  <BaseModal :is-open="isOpen" :title="isEditing ? 'Modifier la FAQ' : 'Nouvelle FAQ'" @close="closeModal">
    <form @submit.prevent="save" class="space-y-4">
      <!-- Question -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Question</label>
        <input v-model="form.question" type="text" required class="form-input" placeholder="Quelle est la question ?" />
      </div>

      <!-- Answer -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Réponse (HTML accepté)</label>
        <textarea v-model="form.answer" rows="5" required class="form-input" placeholder="Votre réponse..."></textarea>
      </div>

      <!-- Topic & Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Sujet (Topic)</label>
          <select v-model="form.topic" required class="form-input bg-white">
            <option :value="null" disabled>Sélectionner un sujet</option>
            <option v-for="t in topics" :key="t.id" :value="t.id">
              {{ t.name }} ({{ t.platform?.name || 'Général' }})
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
import { useFaqStore } from '~/stores/faq'
import { useFaqTopicStore } from '~/stores/faq-topic'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  faq: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()

const faqStore = useFaqStore()
const topicStore = useFaqTopicStore()
const { loading } = storeToRefs(faqStore)
const { topics } = storeToRefs(topicStore)

const isEditing = computed(() => !!props.faq)

const form = reactive({
  question: '',
  answer: '',
  topic: null,
  status: 'active'
})

// Check if we need to load topics
onMounted(() => {
  if (props.isOpen && topics.value.length === 0) {
    topicStore.fetchTopics()
  }
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (topics.value.length === 0) {
      topicStore.fetchTopics()
    }
    if (props.faq) {
      form.question = props.faq.question
      form.answer = props.faq.answer
      form.topic = typeof props.faq.topic === 'object' ? props.faq.topic.id : props.faq.topic
      form.status = props.faq.status || 'active'
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.question = ''
  form.answer = ''
  form.topic = null
  form.status = 'active'
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const save = async () => {
  try {
    if (isEditing.value) {
      await faqStore.updateFaq(props.faq.id, form)
    } else {
      await faqStore.addFaq(form)
    }
    notify(isEditing.value ? 'FAQ mise à jour' : 'FAQ créée')
    closeModal()
    emit('saved')
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}
</script>
