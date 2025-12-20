<template>
  <BaseModal :is-open="isOpen" :title="partner ? 'Modifier Partenaire' : 'Nouveau Partenaire'" @close="close">
    <form @submit.prevent="save" class="space-y-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Nom / Organisation</label>
          <input v-model="form.name" type="text" required
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Site Web (URL)</label>
          <input v-model="form.website" type="url"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Logo (URL)</label>
          <input v-model="form.logo" type="url"
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
import { usePartnerStore } from '~/stores/partner'
import { usePlatformStore } from '~/stores/platform'

const props = defineProps({
  isOpen: Boolean,
  partner: Object
})

const emit = defineEmits(['close', 'saved'])
const partnerStore = usePartnerStore()
const platformStore = usePlatformStore()
const { platforms } = storeToRefs(platformStore)

const form = reactive({
  name: '',
  website: '',
  logo: '',
  platform: ''
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (!platforms.value.length) platformStore.fetchPlatforms()

    if (props.partner) {
      form.name = props.partner.name || ''
      form.website = props.partner.website || ''
      form.logo = props.partner.logo || ''
      form.platform = props.partner.platform?.id || props.partner.platform || ''
    } else {
      form.name = ''
      form.website = ''
      form.logo = ''
      form.platform = ''
    }
  }
})

const save = async () => {
  try {
    if (!props.partner) {
      await partnerStore.addPartner(form)
    } else {
      await partnerStore.updatePartner(props.partner.id, form)
    }
    emit('saved')
    close()
  } catch (e) {
    alert('Erreur: ' + (e.message || 'Une erreur est survenue'))
  }
}

const close = () => emit('close')
</script>
