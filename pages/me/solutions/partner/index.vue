<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="refresh" />
  <div v-else>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Partenaires</h2>
        <p class="text-slate-500 mt-1">Gérer les partenaires des solutions</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          Total: <span class="font-bold text-slate-800">{{ partners.length }}</span>
        </div>
        <button @click="openModal(null)"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <IconPlus size="20" />
          <span>Nouveau Partenaire</span>
        </button>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
      v-if="!partners.length && !partnerStore.loading">
      <div class="p-12 text-slate-500">Aucun partenaire trouvé.</div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th class="px-6 py-4">Nom / Organisation</th>
              <th class="px-6 py-4">Plateforme</th>
              <th class="px-6 py-4">Site Web</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="partner in partners" :key="partner.id" class="hover:bg-slate-50/50">
              <td class="px-6 py-4 font-medium text-slate-800">
                <div class="flex items-center gap-3">
                  <img v-if="partner.logo" :src="partner.logo"
                    class="w-8 h-8 rounded object-cover border border-slate-100" />
                  <div v-else class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                    <IconBuilding size="16" />
                  </div>
                  <NuxtLink :to="`/me/solutions/partner/${partner.id}`"
                    class="hover:text-emerald-600 transition-colors">
                    {{ partner.name }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                <span v-if="partner.platform"
                  class="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-700/10">
                  {{ partner.platform.name || 'ID: ' + partner.platform }}
                </span>
                <span v-else class="text-slate-400 italic">Aucune</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <a v-if="partner.website" :href="partner.website" target="_blank"
                  class="text-emerald-600 hover:underline flex items-center gap-1">
                  <IconExternalLink size="14" />
                  Visiter
                </a>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button @click="openModal(partner)" class="p-1 text-slate-400 hover:text-blue-500">
                  <IconPencil size="18" />
                </button>
                <button @click="remove(partner.id)" class="p-1 text-slate-400 hover:text-red-500">
                  <IconTrash size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManagePartnerModal :is-open="isModalOpen" :partner="editingPartner" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconBuilding, IconExternalLink } from '@tabler/icons-vue'
import { usePartnerStore } from '~/stores/partner'
import { usePlatformStore } from '~/stores/platform'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Partenaires'
})

const partnerStore = usePartnerStore()
const platformStore = usePlatformStore()
const { partners, loading, error } = storeToRefs(partnerStore)
const { platforms } = storeToRefs(platformStore)

// Load init data
const refresh = () => {
  partnerStore.fetchPartners()
  platformStore.fetchPlatforms()
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer ce partenaire ? Cette action est irréversible.')) {
    await partnerStore.deletePartner(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingPartner = ref(null)

const openModal = (partner) => {
  editingPartner.value = partner
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingPartner.value = null
}
</script>
