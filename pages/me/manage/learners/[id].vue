<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="learnerStore.fetchLearners()" />
  <div v-else-if="user">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button @click="$router.back()" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <IconArrowLeft size="24" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ user.fullName || 'Apprenant' }}</h1>
          <span class="text-sm text-slate-500">ID: {{ user.id }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button @click="handleStatusToggle"
          :class="user.isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'"
          class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconBan v-if="user.isActive" size="20" />
          <IconCheck v-else size="20" />
          <span>{{ user.isActive ? 'Suspendre' : 'Activer' }}</span>
        </button>
        <button @click="handleDelete"
          class="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconTrash size="20" />
          <span>Supprimer</span>
        </button>
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
    Apprenant introuvable...
  </div>
</template>

<script setup>
import { IconArrowLeft, IconBan, IconCheck, IconTrash } from '@tabler/icons-vue'
import { useLearnerStore } from '~/stores/learner'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  title: 'Détail Apprenant'
})

const route = useRoute()
const router = useRouter()
const learnerStore = useLearnerStore()
const { learners, loading, error } = storeToRefs(learnerStore)
const { add: notify } = useToast()

const user = computed(() => {
  return learners.value.find(u => u.id === route.params.id)
})

if (!user.value && !learners.value.length) {
  learnerStore.fetchLearners()
}

const handleStatusToggle = async () => {
  if (!user.value) return
  try {
    const action = user.value.isActive ? 'suspend' : 'activate'
    await learnerStore.manageLearner(user.value.id, action)
    notify(`Apprenant ${user.value.isActive ? 'suspendu' : 'activé'} avec succès`)
  } catch (e) {
    notify('Erreur lors de la mise à jour', 'error')
  }
}

const handleDelete = async () => {
  if (!user.value) return
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet apprenant ?')) return

  try {
    await learnerStore.manageLearner(user.value.id, 'delete')
    notify('Apprenant supprimé avec succès')
    router.push('/me/manage/learners')
  } catch (e) {
    notify('Erreur lors de la suppression', 'error')
  }
}
</script>
