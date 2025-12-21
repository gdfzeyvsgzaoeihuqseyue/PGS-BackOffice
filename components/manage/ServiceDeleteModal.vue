<template>
  <BaseModal :isOpen="isOpen" title="Supprimer le Service" @close="close">
    <div class="space-y-6">
      <div class="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
        <IconAlertTriangle class="shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold">Zone de danger</h4>
          <p class="text-sm mt-1">
            Cette action est irréversible. Le service <strong>{{ service?.name }}</strong> sera définitivement supprimé.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleDelete" class="space-y-4">
        <!-- Reason -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Raison de la suppression <span
              class="text-red-500">*</span></label>
          <textarea v-model="form.reason" rows="3" required minlength="10"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:text-sm"
            placeholder="Veuillez indiquer la raison (min. 10 caractères)..."></textarea>
          <p class="text-xs text-slate-500 mt-1 text-right">{{ form.reason.length }}/10 caractères</p>
        </div>

        <!-- Confirmation Name -->
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Confirmation du nom <span
              class="text-red-500">*</span></label>
          <input v-model="form.confirmation" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
            :placeholder="'Tapez ' + service?.name + ' pour confirmer'" />
        </div>

        <!-- Force Delete Checkbox (shown on error or warning) -->
        <div v-if="showForceDelete" class="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-fade-in">
          <div class="flex items-start gap-2 mb-2">
            <IconInfoCircle class="text-amber-600 shrink-0 mt-0.5" size="18" />
            <p class="text-sm text-amber-800 font-medium">{{ activeAccessMessage }}</p>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <input type="checkbox" v-model="form.deleteAccessRecords" id="forceDelete"
              class="w-4 h-4 rounded border-amber-500 text-red-600 focus:ring-red-500" />
            <label for="forceDelete" class="text-sm font-bold text-slate-700">Je confirme vouloir supprimer aussi les
              enregistrements d'accès liés.</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <button type="button" @click="close"
            class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Annuler</button>
          <button type="submit" :disabled="!isValid"
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Supprimer définitivement
          </button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-vue'
import { useServiceStore } from '~/stores/service'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  service: Object
})

const emit = defineEmits(['close', 'deleted'])
const { add: notify } = useToast()
const serviceStore = useServiceStore()

const form = reactive({
  reason: '',
  confirmation: '',
  deleteAccessRecords: false
})

const showForceDelete = ref(false)
const activeAccessMessage = ref('')

// Reset form when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.reason = ''
    form.confirmation = ''
    form.deleteAccessRecords = false
    showForceDelete.value = false
    activeAccessMessage.value = ''
  }
})

const isValid = computed(() => {
  if (!props.service) return false
  return form.reason.length >= 10 && form.confirmation === props.service.name
})

const handleDelete = async () => {
  if (!isValid.value) return

  try {
    await serviceStore.deleteService(props.service.id, {
      confirmation: form.confirmation,
      reason: form.reason,
      deleteAccessRecords: form.deleteAccessRecords
    })

    notify('Service supprimé avec succès', 'success')
    close()
    emit('deleted')

  } catch (error) {
    if (error.message && error.message.includes('accès actifs')) {
      showForceDelete.value = true
      activeAccessMessage.value = "Ce service a des utilisateurs ou apprenants actifs. Cochez la case ci-dessous pour forcer la suppression de leurs accès."
      notify('Attention : Accès actifs détectés', 'warning')
    } else {
      notify(error.message || 'Erreur lors de la suppression', 'error')
    }
  }
}

const close = () => emit('close')
</script>
