<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary-50 relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse">
      </div>
      <div
        class="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-accent-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000">
      </div>
      <div
        class="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-2000">
      </div>
    </div>

    <div
      class="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-primary-500/10 rounded-3xl p-8 md:p-10 transform hover:scale-[1.01] transition-transform duration-500">
      <div class="text-center mb-10">
        <!-- Logo -->
        <div class="mb-10">
          <div class="flex justify-center mb-8">
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
        </div>
        <h1 class="text-3xl font-extrabold text-secondary-800 tracking-tight">Bienvenue</h1>
        <p class="text-secondary-500 mt-3 font-medium">Panneau d'administration</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-bold text-secondary-700 ml-1">Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400">
              <IconMail size="20" />
            </div>
            <input v-model="form.email" type="email" required
              class="w-full pl-11 pr-4 py-3.5 bg-secondary-50 border-secondary-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400"
              placeholder="admin@stafast.com" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-secondary-700 ml-1">Mot de passe</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400">
              <IconKey size="20" />
            </div>
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required
              class="w-full pl-11 pr-10 py-3.5 bg-secondary-50 border-secondary-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400"
              placeholder="••••••••••••" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600 transition-colors">
              <IconEye v-if="showPassword" size="20" />
              <IconEyeOff v-else size="20" />
            </button>
          </div>
        </div>

        <div v-if="error"
          class="p-4 bg-danger-50 text-danger-600 text-sm font-medium rounded-xl border border-danger-100 flex items-start gap-3 animate-fade-in-up">
          <IconAlertCircle size="20" class="flex-shrink-0 mt-0.5" />
          <span>{{ error }}</span>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <IconLoader v-if="loading" class="animate-spin h-5 w-5 text-white" />
          <span v-else>Se connecter</span>
          <IconArrowRight v-if="!loading" size="20" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { IconMail, IconKey, IconAlertCircle, IconArrowRight, IconLoader, IconEye, IconEyeOff } from '@tabler/icons-vue'
import { useSharedFiles } from '~/stores/sharedFiles';

const sharedFiles = useSharedFiles();

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login({ ...form })
    await navigateTo('/me')
  } catch (e) {
    error.value = e.data?.message || 'Identifiants incorrects. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Connexion'
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
