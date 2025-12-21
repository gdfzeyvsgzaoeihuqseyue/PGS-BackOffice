<template>
  <BaseModal :is-open="isOpen" :title="doc ? 'Modifier Document' : 'Nouveau Document'" @close="close">
    <form @submit.prevent="save" class="space-y-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nom du document</label>
          <input v-model="form.name" type="text" required class="form-input" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Lien URL</label>
          <input v-model="form.link" type="url" required class="form-input" />
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
import { useDocStore } from '~/stores/doc'
import { usePlatformStore } from '~/stores/platform'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  doc: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()
const docStore = useDocStore()
const platformStore = usePlatformStore()
const { platforms } = storeToRefs(platformStore)

const form = reactive({
  name: '',
  link: '',
  platform: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (!platforms.value.length) platformStore.fetchPlatforms()

    if (props.doc) {
      form.name = props.doc.name || ''
      form.link = props.doc.link || ''
      form.platform = props.doc.platform?.id || props.doc.platform || ''
    } else {
      form.name = ''
      form.link = ''
      form.platform = ''
    }
  }
})

const save = async () => {
  try {
    if (!props.doc) {
      await docStore.addDoc(form)
    } else {
      await docStore.updateDoc(props.doc.id, form)
    }
    notify(props.doc ? 'Document mis à jour' : 'Document créé')
    emit('saved')
    close()
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}

const close = () => emit('close')
</script>
