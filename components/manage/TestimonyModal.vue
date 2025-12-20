<template>
  <BaseModal :is-open="isOpen" :title="testimony ? 'Modifier Témoignage' : 'Nouveau Témoignage'" @close="close">
    <form @submit.prevent="save" class="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Auteur (Nom)</label>
          <input v-model="form.author" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Entreprise</label>
          <input v-model="form.company" type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Rôle / Poste</label>
          <input v-model="form.role" type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Avatar (URL)</label>
          <input v-model="form.avatar" type="url"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Contenu du témoignage</label>
        <textarea v-model="form.content" required rows="4"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Note / 5</label>
          <input v-model="form.note" type="number" min="1" max="5"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
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

      <div class="flex items-center gap-6 pt-2">
        <div class="flex items-center gap-3">
          <input type="checkbox" v-model="form.isPublished" id="isPublished"
            class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          <label for="isPublished" class="text-sm font-bold text-slate-700">Publié</label>
        </div>
        <div class="flex items-center gap-3">
          <input type="checkbox" v-model="form.isFeatured" id="isFeatured"
            class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          <label for="isFeatured" class="text-sm font-bold text-slate-700">Mis en avant</label>
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
import { useTestimonyStore } from '~/stores/testimony'
import { usePlatformStore } from '~/stores/platform'

const props = defineProps({
  isOpen: Boolean,
  testimony: Object
})

const emit = defineEmits(['close', 'saved'])
const testimonyStore = useTestimonyStore()
const platformStore = usePlatformStore()
const { platforms } = storeToRefs(platformStore)

const form = reactive({
  author: '',
  company: '',
  role: '',
  content: '',
  note: 5,
  avatar: '',
  isPublished: false,
  isFeatured: false,
  platform: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (!platforms.value.length) platformStore.fetchPlatforms()

    if (props.testimony) {
      const t = props.testimony
      form.author = t.author || ''
      form.company = t.company || ''
      form.role = t.role || ''
      form.content = t.content || ''
      form.note = t.note || 5
      form.avatar = t.avatar || ''
      form.isPublished = t.isPublished || false
      form.isFeatured = t.isFeatured || false
      form.platform = t.platform?.id || t.platform || ''
    } else {
      form.author = ''
      form.company = ''
      form.role = ''
      form.content = ''
      form.note = 5
      form.avatar = ''
      form.isPublished = false
      form.isFeatured = false
      form.platform = ''
    }
  }
})

const save = async () => {
  try {
    if (!props.testimony) {
      await testimonyStore.addTestimony(form)
    } else {
      await testimonyStore.updateTestimony(props.testimony.id, form)
    }
    emit('saved')
    close()
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}

const close = () => emit('close')
</script>
