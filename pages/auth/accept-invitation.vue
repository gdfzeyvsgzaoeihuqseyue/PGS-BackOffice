<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary-50 relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse">
      </div>
      <div
        class="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-accent-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000">
      </div>
    </div>

    <div
      class="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-primary-500/10 rounded-3xl p-8 md:p-10">
      <div v-if="success" class="text-center py-8 animate-fade-in-up">
        <div
          class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
          <IconCheck size="40" stroke-width="3" />
        </div>
        <h2 class="text-2xl font-bold text-secondary-800 mb-2">Compte Activé !</h2>
        <p class="text-secondary-500 mb-8">Votre compte a été configuré avec succès. Vous allez être redirigé vers la
          page
          de connexion.</p>
        <NuxtLink to="/auth/login" class="inline-flex items-center text-primary-600 font-bold hover:underline">
          Aller à la connexion
          <IconArrowRight size="18" class="ml-1" />
        </NuxtLink>
      </div>

      <div v-else>
        <div class="text-center mb-8">
          <!-- Logo -->
          <div class="flex justify-center mb-4">
            <div class="hidden lg:block">
              <img :src="sharedFiles.paths.logo.dc" alt="Logo" class="h-10 w-auto sm:h-12 request-logo dark:hidden" />
              <img :src="sharedFiles.paths.logo.dw" alt="Logo"
                class="h-10 w-auto sm:h-12 request-logo hidden dark:block" />
            </div>
            <div class="lg:hidden">
              <img :src="sharedFiles.paths.logo.mc" alt="Logo" class="h-10 w-auto sm:h-12 request-logo dark:hidden" />
              <img :src="sharedFiles.paths.logo.mw" alt="Logo"
                class="h-10 w-auto sm:h-12 request-logo hidden dark:block" />
            </div>
          </div>

          <h1 class="text-2xl font-extrabold text-secondary-800 tracking-tight">Finaliser votre compte</h1>
          <p class="text-secondary-500 mt-2 text-sm">Définissez votre mot de passe pour accéder au panel
            d'administration.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Optional Names Update -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-secondary-700 ml-1">Prénom (Optionnel)</label>
              <input v-model="form.firstName" type="text"
                class="w-full px-4 py-3 bg-secondary-50 border-secondary-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 text-sm"
                placeholder="Confirmation" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-secondary-700 ml-1">Nom (Optionnel)</label>
              <input v-model="form.lastName" type="text"
                class="w-full px-4 py-3 bg-secondary-50 border-secondary-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 text-sm"
                placeholder="Confirmation" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-secondary-700 ml-1">Nouveau mot de passe</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400">
                <IconLock size="18" />
              </div>
              <input v-model="form.password" type="password" required minlength="10"
                class="w-full pl-10 pr-4 py-3 bg-secondary-50 border-secondary-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400"
                placeholder="Minimum 10 caractères" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-bold text-secondary-700 ml-1">Confirmer mot de passe</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400">
                <IconLock size="18" />
              </div>
              <input v-model="form.confirmPassword" type="password" required minlength="10"
                class="w-full pl-10 pr-4 py-3 bg-secondary-50 border-secondary-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400"
                placeholder="Répétez le mot de passe" />
            </div>
          </div>

          <div v-if="error"
            class="p-4 bg-danger-50 text-danger-600 text-sm font-medium rounded-xl border border-danger-100 flex items-start gap-3 animate-fade-in-up">
            <IconAlertCircle size="20" class="flex-shrink-0 mt-0.5" />
            <span>{{ error }}</span>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
            <span v-if="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Activer mon compte</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconLock, IconCheck, IconAlertCircle, IconArrowRight } from '@tabler/icons-vue'
import { useSharedFiles } from '~/stores/sharedFiles';

const sharedFiles = useSharedFiles();
const authStore = useAuthStore()

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { add: notify } = useToast()

const token = route.query.token

const loading = ref(false)
const success = ref(false)
const error = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: ''
})

onMounted(() => {
  if (!token) {
    error.value = 'Token d\'invitation manquant.'
  }
})

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  if (form.password.length < 10) {
    error.value = 'Le mot de passe doit contenir au moins 10 caractères.'
    return
  }

  authStore.loading = true
  loading.value = true
  error.value = ''

  try {
    await authStore.acceptInvitation({
      token,
      password: form.password,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined
    })

    success.value = true

    // Redirect after short delay
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)

  } catch (e) {
    error.value = e.data?.message || 'Erreur lors de l\'activation du compte.'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Accepter l\'invitation'
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
