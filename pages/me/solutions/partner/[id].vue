<template>
  <AppLoader v-if="loading && !partner" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/partner"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <IconBuilding size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ partner?.name || 'Partenaire' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="partner?.platform" class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">
                {{ partner.platform.name || 'ID: ' + partner.platform }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button @click="openModal"
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
        <IconPencil size="18" />
        <span>Modifier</span>
      </button>
    </div>

    <!-- View Content -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center fade-in-up">
      <img v-if="partner?.logo" :src="partner.logo" class="w-32 h-32 object-contain mx-auto mb-6" />

      <h3 class="font-bold text-lg text-slate-800 mb-2">{{ partner?.name }}</h3>

      <a v-if="partner?.website" :href="partner.website" target="_blank"
        class="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors mt-4">
        <IconExternalLink size="20" />
        Visiter le site
      </a>
      <span v-else class="text-slate-400 block mt-4">Aucun site web renseigné.</span>

      <div class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Créé le</span>
          <span class="text-sm font-mono text-slate-600">{{ partner?.createdAt ? new
            Date(partner.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Mis à jour le</span>
          <span class="text-sm font-mono text-slate-600">{{ partner?.updatedAt ? new
            Date(partner.updatedAt).toLocaleDateString() : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManagePartnerModal :is-open="isModalOpen" :partner="partner" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconPencil, IconBuilding, IconExternalLink } from '@tabler/icons-vue'
import { usePartnerStore } from '~/stores/partner'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const partnerStore = usePartnerStore()

const { loading, error } = storeToRefs(partnerStore)

const id = route.params.id // As discussed, treating param as ID or 'new'
const isNew = id === 'new'
const partner = ref(null)
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    try {
      const data = await partnerStore.fetchPartner(id)
      partner.value = data
    } catch (e) {
      // Error handled by store
    }
  } else {
    isModalOpen.value = true
  }
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  if (isNew && !partner.value) router.back()
  else isModalOpen.value = false
}

useHead({
  title: computed(() => isNew ? 'Nouveau Partenaire' : `Modifier ${partner.value?.name || 'Partenaire'}`)
})

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/solutions/partner')
  } else {
    partner.value = await partnerStore.fetchPartner(id)
    closeModal()
  }
}
</script>
