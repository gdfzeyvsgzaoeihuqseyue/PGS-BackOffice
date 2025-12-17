<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/manage/admins"
          class="p-2 -ml-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors">
          <IconArrowLeft size="24" />
        </NuxtLink>
        <div>
          <h2 class="text-2xl font-bold text-secondary-800">Détails Administrateur</h2>
          <p class="text-secondary-500">Informations et historique d'activité</p>
        </div>
      </div>
      <div>
        <button v-if="admin && admin.role !== 'main'" @click="openEditModal"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center gap-2">
          <IconEdit size="18" />
          Modifier
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !admin" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>

    <!-- Content -->
    <div v-else-if="admin" class="space-y-6">
      <!-- Profile Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden">
        <div class="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start">
          <!-- Avatar -->
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex-shrink-0 flex items-center justify-center text-3xl font-bold text-primary-600 shadow-inner">
            {{ (admin.firstName?.[0] || 'A') + (admin.lastName?.[0] || '') }}
          </div>

          <!-- Info -->
          <div class="flex-1 space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 class="text-xl font-bold text-secondary-900">{{ admin.firstName }} {{ admin.lastName }}</h3>
                <p class="text-secondary-500">{{ admin.email }}</p>
              </div>
              <div class="flex gap-2">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide bg-secondary-100 text-secondary-600">
                  {{ admin.role }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold" :class="{
                  'bg-primary-100 text-primary-700': admin.status === 'active',
                  'bg-warn-100 text-warn-700': admin.status === 'pending',
                  'bg-danger-100 text-danger-700': admin.status === 'suspended',
                  'bg-secondary-100 text-secondary-500': admin.status === 'deleted'
                }">
                  {{
                    admin.status === 'active' ? 'Actif' :
                      admin.status === 'pending' ? 'En attente' :
                        admin.status === 'suspended' ? 'Suspendu' : 'Supprimé'
                  }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-100">
              <div>
                <span class="block text-xs font-bold text-secondary-400 uppercase">Nom d'utilisateur</span>
                <span class="text-secondary-700 font-medium">{{ admin.username || '-' }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-secondary-400 uppercase">Dernière connexion</span>
                <span class="text-secondary-700 font-medium">{{ admin.lastLogin ? new
                  Date(admin.lastLogin).toLocaleString()
                  : 'Jamais' }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-secondary-400 uppercase">Compte créé le</span>
                <span class="text-secondary-700 font-medium">{{ new Date(admin.createdAt).toLocaleDateString() }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-secondary-400 uppercase">Email vérifié</span>
                <span class="text-secondary-700 font-medium"
                  :class="{ 'text-primary-600': admin.emailVerified, 'text-warn-600': !admin.emailVerified }">
                  {{ admin.emailVerified ? 'Oui' : 'Non' }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-6 flex gap-3" v-if="admin.role !== 'main'">
              <button v-if="admin.status === 'pending' || (admin.status !== 'active' && !admin.emailVerified)"
                @click="resendInvite"
                class="px-4 py-2 bg-warn-50 text-warn-700 rounded-lg hover:bg-warn-100 font-medium transition-colors flex items-center gap-2">
                <IconMailForward size="18" />
                Renvoyer invitation
              </button>

              <button v-if="admin.status !== 'deleted'" @click="toggleStatus"
                class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                :class="admin.status === 'active' ? 'bg-danger-50 text-danger-700 hover:bg-danger-100' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'">
                <IconPower size="18" />
                {{ admin.status === 'active' ? 'Suspendre le compte' : 'Activer le compte' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Logs -->
      <div class="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
          <h3 class="font-bold text-secondary-800">Historique d'activité</h3>
          <span class="text-xs text-secondary-500">{{ logsTotal }} entrées</span>
        </div>

        <div class="divide-y divide-secondary-100" v-if="logs.length > 0">
          <div v-for="log in logs" :key="log.id" class="p-4 hover:bg-secondary-50/50 transition-colors flex gap-4">
            <div class="pt-1">
              <div class="p-2 rounded bg-secondary-100 text-secondary-500">
                <IconActivity size="16" />
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-secondary-700 text-sm font-mono">{{ log.action }}</span>
                <span class="text-xs text-secondary-400">{{ new Date(log.createdAt).toLocaleString() }}</span>
              </div>
              <div class="text-sm text-secondary-600 mt-1">
                Cible: <span class="font-medium bg-secondary-100 px-1 rounded">{{ log.targetType }}</span>
                <span class="text-secondary-400 text-xs ml-2">{{ log.ipAddress }}</span>
              </div>
              <div class="text-xs text-secondary-500 mt-1 truncate max-w-lg">
                {{ JSON.stringify(log.details) }}
              </div>
            </div>
          </div>
          <!-- Load More -->
          <div v-if="logs.length < logsTotal" class="p-4 text-center border-t border-secondary-100">
            <button @click="loadMoreLogs" :disabled="logsLoading"
              class="text-sm text-primary-600 font-bold hover:underline">
              {{ logsLoading ? 'Chargement...' : 'Voir plus' }}
            </button>
          </div>
        </div>
        <div v-else class="p-8 text-center text-secondary-500">
          Aucune activité enregistrée.
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <p class="text-secondary-500">Administrateur introuvable.</p>
      <NuxtLink to="/me/manage/admins" class="text-primary-600 hover:underline mt-2">Retour à la liste</NuxtLink>
    </div>

    <!-- Edit Modal -->
    <BaseModal :isOpen="isEditModalOpen" title="Modifier l'administrateur" @close="closeEditModal">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">Prénom</label>
            <input v-model="editForm.firstName" type="text"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">Nom</label>
            <input v-model="editForm.lastName" type="text"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">Nom d'utilisateur</label>
          <input v-model="editForm.username" type="text"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">Rôle</label>
          <select v-model="editForm.role"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
            <option value="admin">Administrateur</option>
            <option value="moderator">Modérateur</option>
            <option value="support">Support</option>
            <option value="analyst">Analyste</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button @click="closeEditModal"
            class="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50">
            Annuler
          </button>
          <button @click="saveEdit" :disabled="isSaving"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            <IconLoader2 v-if="isSaving" class="animate-spin w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { IconArrowLeft, IconMailForward, IconPower, IconActivity, IconEdit, IconLoader2 } from '@tabler/icons-vue'

definePageMeta({
  layout: 'admin',
  title: 'Détail Admin'
})

const route = useRoute()
const { add: notify } = useToast()
const adminId = route.params.id

const adminStore = useAdminStore()
const adminLogsStore = useAdminLogsStore()

const admin = computed(() => adminStore.currentAdmin)
const loading = computed(() => adminStore.loading)

const logs = computed(() => adminLogsStore.logs)
const logsTotal = computed(() => adminLogsStore.total)
const logsLoading = computed(() => adminLogsStore.loading)

// Edit Modal State
const isEditModalOpen = ref(false)
const isSaving = ref(false)
const editForm = reactive({
  firstName: '',
  lastName: '',
  username: '',
  role: 'admin'
})

const openEditModal = () => {
  if (!admin.value) return
  editForm.firstName = admin.value.firstName || ''
  editForm.lastName = admin.value.lastName || ''
  editForm.username = admin.value.username || ''
  editForm.role = admin.value.role || 'admin'
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const saveEdit = async () => {
  isSaving.value = true
  try {
    await adminStore.manageAdmin({
      adminId: admin.value.id,
      action: 'update',
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      username: editForm.username,
      role: editForm.role
    })
    notify('Compte mis à jour avec succès')
    closeEditModal()
  } catch (e) {
    notify(e.message || 'Erreur lors de la mise à jour', 'error')
  } finally {
    isSaving.value = false
  }
}

const fetchLogs = async (loadMore = false) => {
  if (loadMore) {
    adminLogsStore.setPage(adminLogsStore.currentPage + 1)
  } else {
    adminLogsStore.filters.adminId = adminId
    adminLogsStore.filters.action = ''
    adminLogsStore.filters.targetType = ''
    adminLogsStore.filters.startDate = ''
    adminLogsStore.filters.endDate = ''

    adminLogsStore.limit = 10
    adminLogsStore.currentPage = 1
    await adminLogsStore.fetchLogs()
  }
}

const loadMoreLogs = () => {
  fetchLogs(true)
}

onMounted(() => {
  if (!admin.value || admin.value.id !== adminId) {
    adminStore.fetchAdmin(adminId)
  }
  fetchLogs()
})

const toggleStatus = async () => {
  if (!admin.value) return
  try {
    await adminStore.toggleStatus(admin.value.id)
    notify('Statut mis à jour')
  } catch (e) {
    notify('Erreur lors de la mise à jour du statut', 'error')
  }
}

const resendInvite = async () => {
  if (!admin.value) return
  try {
    await adminStore.resendInvite(admin.value.id)
    notify('Invitation renvoyée')
  } catch (e) {
    notify('Erreur', 'error')
  }
}
</script>
