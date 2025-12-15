<template>
  <div v-if="user">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="$router.back()" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <IconArrowLeft size="24" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ user.fullName || 'Apprenant' }}</h1>
          <span class="text-sm text-slate-500">ID: {{ user.id }}</span>
        </div>
      </div>
    </div>

    <!-- Details Card -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Informations Générales</h3>
          <div class="space-y-4">
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-slate-400">Prénom</span>
              <span class="font-medium text-slate-700">{{ user.firstName || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-slate-400">Nom</span>
              <span class="font-medium text-slate-700">{{ user.lastName || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-slate-400">Username</span>
              <span class="font-medium text-slate-700">@{{ user.username || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-slate-400">Email</span>
              <span class="font-medium text-slate-700">{{ user.email }}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Statut & Activité</h3>
          <div class="space-y-4">
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-slate-400">Compte Actif</span>
              <div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                  {{ user.isActive ? 'Oui' : 'Non' }}
                </span>
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-slate-400">Date Inscription</span>
              <span class="font-medium text-slate-700">{{ user.createdAt ? new Date(user.createdAt).toLocaleDateString()
                : '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-12 text-slate-500">
    Chargement ou apprenant introuvable...
  </div>
</template>

<script setup>
import { IconArrowLeft } from '@tabler/icons-vue'
import { useLearnerStore } from '~/stores/learner'

definePageMeta({
  layout: 'admin',
  title: 'Détail Apprenant'
})

const route = useRoute()
const learnerStore = useLearnerStore()
const { learners } = storeToRefs(learnerStore)

// Try getting from state or fallback to fetch list
const user = computed(() => {
  return learners.value.find(u => u.id === route.params.id)
})

if (!user.value && !learners.value.length) {
  await learnerStore.fetchLearners()
}
</script>
