<template>
  <BaseModal :isOpen="isOpen" :title="service ? 'Modifier Service' : 'Nouveau Service'" @close="close">
    <form @submit.prevent="save" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nom du service</label>
          <input v-model="form.name" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Domaine (URL)</label>
          <input v-model="form.domain" type="url" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            placeholder="https://example.com" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Description</label>
        <textarea v-model="form.description" rows="3"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"></textarea>
      </div>

      <!-- Allowed Origins -->
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-2">Origines autorisées (CORS)</label>
        <div class="space-y-2">
          <div v-for="(origin, index) in originsList" :key="index" class="flex gap-2">
            <input v-model="originsList[index]" type="text"
              class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              placeholder="https://client-app.com" />
            <button type="button" @click="removeOrigin(index)" class="p-2 text-red-500 hover:bg-red-50 rounded">
              <IconTrash size="18" />
            </button>
          </div>
          <button type="button" @click="addOrigin"
            class="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline mt-2">
            <IconPlus size="16" /> Ajouter une origine
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <input type="checkbox" v-model="form.isActive" id="isActive"
          class="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        <label for="isActive" class="text-sm font-bold text-slate-700">Service Actif</label>
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
import { IconTrash, IconPlus } from '@tabler/icons-vue'
import { useServiceStore } from '~/stores/service'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  service: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()
const serviceStore = useServiceStore()

const form = reactive({
  name: '',
  domain: '',
  description: '',
  isActive: true,
  allowedOrigins: []
})

const originsList = ref([])

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.service) {
      const s = props.service
      form.name = s.name || ''
      form.domain = s.domain || ''
      form.description = s.description || ''
      form.isActive = s.isActive !== false // Default true

      // Parse origins
      if (Array.isArray(s.allowedOrigins)) {
        originsList.value = [...s.allowedOrigins]
      } else if (typeof s.allowedOrigins === 'string') {
        try {
          const parsed = JSON.parse(s.allowedOrigins)
          originsList.value = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          // Maybe it's a comma separated string?
          if (s.allowedOrigins.includes(',')) {
            originsList.value = s.allowedOrigins.split(',').map(o => o.trim())
          } else {
            originsList.value = [s.allowedOrigins]
          }
        }
      } else {
        originsList.value = []
      }

    } else {
      form.name = ''
      form.domain = ''
      form.description = ''
      form.isActive = true
      originsList.value = []
    }
  }
})

const addOrigin = () => originsList.value.push('')
const removeOrigin = (index) => originsList.value.splice(index, 1)

const save = async () => {
  try {
    form.allowedOrigins = originsList.value.filter(o => o && o.trim() !== '')

    if (!props.service) {
      await serviceStore.addService(form)
    } else {
      await serviceStore.updateService(props.service.id, form)
    }
    notify(props.service ? 'Service mis à jour' : 'Service créé')
    close()
    emit('saved')
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}

const close = () => emit('close')
</script>
