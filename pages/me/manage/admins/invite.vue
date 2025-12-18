<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-secondary-800">Inviter un administrateur</h2>
        <p class="text-secondary-500 mt-1">Envoyez une invitation par email pour rejoindre l'équipe.</p>
      </div>
      <NuxtLink to="/me/manage/admins" class="text-secondary-500 hover:text-primary-600 font-medium transition-colors">
        Retour à la liste
      </NuxtLink>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden p-8">
      <form @submit.prevent="handleInvite" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-secondary-700 ml-1">Prénom</label>
            <input v-model="form.firstName" type="text" required
              class="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800"
              placeholder="Jean" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-secondary-700 ml-1">Nom</label>
            <input v-model="form.lastName" type="text" required
              class="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800"
              placeholder="Dupont" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-secondary-700 ml-1">Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400">
              <IconMail size="20" />
            </div>
            <input v-model="form.email" type="email" required
              class="w-full pl-11 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800"
              placeholder="jean.dupont@exemple.com" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-secondary-700 ml-1">Rôle</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400">
              <IconShieldLock size="20" />
            </div>
            <select v-model="form.role" required
              class="w-full pl-11 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 appearance-none">
              <option value="moderator">Modérateur</option>
              <option value="admin">Administrateur</option>
              <option value="support">Support</option>
              <option value="analyst">Analyste</option>
            </select>
            <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-secondary-500">
              <IconChevronDown size="16" />
            </div>
          </div>
          <p class="text-xs text-secondary-500 ml-1 mt-1">
            <span v-if="form.role === 'moderator'">Peut gérer le contenu mais pas les utilisateurs.</span>
            <span v-else-if="form.role === 'admin'">Accès complet sauf configuration système critique.</span>
            <span v-else-if="form.role === 'support'">Accès en lecture et support utilisateur uniquement.</span>
            <span v-else-if="form.role === 'analyst'">Accès aux statistiques et rapports uniquement.</span>
          </p>
        </div>

        <div class="pt-4 border-t border-secondary-100 flex justify-end">
          <button type="submit" :disabled="loading"
            class="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/20 transform active:translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            <IconSend v-if="!loading" size="20" />
            <span v-if="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ loading ? 'Envoi...' : 'Envoyer l\'invitation' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { IconMail, IconShieldLock, IconChevronDown, IconSend } from '@tabler/icons-vue'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Inviter un admin'
})

const { add: notify } = useToast()
const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: 'moderator',
  permissions: {}
})

const handleInvite = async () => {
  loading.value = true
  try {
    const data = await adminStore.inviteAdmin(form)

    notify(`Invitation envoyée avec succès à ${data?.admin?.maskedEmail || form.email}`)
    router.push('/me/manage/admins')

  } catch (e) {
    notify(e.data?.message || 'Erreur lors de l\'envoi de l\'invitation', 'error')
  } finally {
    loading.value = false
  }
}
</script>
