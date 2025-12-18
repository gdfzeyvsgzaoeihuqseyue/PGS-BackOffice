<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="userStore.fetchUsers()" />
  <div v-else-if="user">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button @click="$router.back()"
          class="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-500">
          <IconArrowLeft size="24" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ user.fullName || 'Utilisateur' }}</h1>
          <span class="text-sm text-secondary-500">ID: {{ user.id }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button @click="handleStatusToggle"
          :class="user.isActive ? 'text-warn-600 bg-warn-50 hover:bg-warn-100' : 'text-primary-600 bg-primary-50 hover:bg-primary-100'"
          class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconBan v-if="user.isActive" size="20" />
          <IconCheck v-else size="20" />
          <span>{{ user.isActive ? 'Suspendre' : 'Activer' }}</span>
        </button>
        <button @click="handleVerifyEmail"
          class="text-accent-600 bg-accent-50 hover:bg-accent-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconMailCheck size="20" />
          <span>Vérifier Email</span>
        </button>
        <button @click="handleDelete"
          class="text-danger-600 bg-danger-50 hover:bg-danger-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <IconTrash size="20" />
          <span>Supprimer</span>
        </button>
      </div>
    </div>

    <!-- Details Card -->
    <div class="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-bold text-secondary-800 mb-4 border-b pb-2">Informations Générales</h3>
          <div class="space-y-4">
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Prénom</span>
              <span class="font-medium text-secondary-700">{{ user.firstName || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Nom</span>
              <span class="font-medium text-secondary-700">{{ user.lastName || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Username</span>
              <span class="font-medium text-secondary-700">@{{ user.username || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Email</span>
              <span class="font-medium text-secondary-700">{{ user.email }}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-bold text-secondary-800 mb-4 border-b pb-2">Statut & Activité</h3>
          <div class="space-y-4">
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Compte Actif</span>
              <div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="user.isActive ? 'bg-primary-100 text-primary-800' : 'bg-danger-100 text-danger-800'">
                  {{ user.isActive ? 'Oui' : 'Non' }}
                </span>
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Email Vérifié</span>
              <div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="user.emailVerified ? 'bg-accent-100 text-accent-800' : 'bg-secondary-100 text-secondary-800'">
                  {{ user.emailVerified ? 'Vérifié' : 'Non vérifié' }}
                </span>
              </div>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Dernière Connexion</span>
              <span class="font-medium text-secondary-700">{{ user.lastLogin ? new Date(user.lastLogin).toLocaleString()
                :
                'Jamais' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase text-secondary-400">Date Inscription</span>
              <span class="font-medium text-secondary-700">{{ user.createdAt ? new
                Date(user.createdAt).toLocaleDateString()
                : '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center p-12 text-secondary-500">
    Utilisateur introuvable...
  </div>
</template>

<script setup>
import { IconArrowLeft, IconBan, IconCheck, IconTrash, IconMailCheck } from '@tabler/icons-vue'
import { useUserStore } from '~/stores/user'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Détail Utilisateur'
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { currentUser: user, loading, error } = storeToRefs(userStore)
const { add: notify } = useToast()

onMounted(() => {
  userStore.fetchUser(route.params.id)
})

const handleStatusToggle = async () => {
  if (!user.value) return
  try {
    const action = user.value.isActive ? 'suspend' : 'activate'
    await userStore.manageUser(user.value.id, action)
    notify(`Utilisateur ${user.value.isActive ? 'suspendu' : 'activé'} avec succès`)
    // Refresh user data
    await userStore.fetchUser(user.value.id)
  } catch (e) {
    notify('Erreur lors de la mise à jour', 'error')
  }
}

const handleVerifyEmail = async () => {
  if (!user.value) return
  try {
    await userStore.manageUser(user.value.id, 'verify_email')
    notify('Email vérifié avec succès')
    // Refresh user data
    await userStore.fetchUser(user.value.id)
  } catch (e) {
    notify('Erreur lors de la vérification', 'error')
  }
}

const handleDelete = async () => {
  if (!user.value) return
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return

  try {
    await userStore.manageUser(user.value.id, 'delete')
    notify('Utilisateur supprimé avec succès')
    router.push('/me/manage/users')
  } catch (e) {
    notify('Erreur lors de la suppression', 'error')
  }
}
</script>
