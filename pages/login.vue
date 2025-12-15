<script setup>
import { IconLock, IconMail, IconKey, IconAlertCircle, IconArrowRight } from '@tabler/icons-vue'

definePageMeta({
  layout: false,
  title: 'Connexion'
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
    // If successful, redirect to dashboard.
    // Middleware should also handle this but explicit redirect is safe.
    await navigateTo('/admin')
  } catch (e) {
    error.value = e.data?.message || 'Identifiants incorrects. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse">
      </div>
      <div
        class="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-cyan-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-1000">
      </div>
      <div
        class="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-2000">
      </div>
    </div>

    <div
      class="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-emerald-500/10 rounded-3xl p-8 md:p-10 transform hover:scale-[1.01] transition-transform duration-500">
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30 mb-6 text-white">
          <IconLock size="32" stroke-width="2" />
        </div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Bienvenue</h1>
        <p class="text-slate-500 mt-3 font-medium">Panneau d'administration SuperAdmin</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-bold text-slate-700 ml-1">Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <IconMail size="20" />
            </div>
            <input v-model="form.email" type="email" required
              class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-slate-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 placeholder-slate-400"
              placeholder="admin@stafast.com" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-slate-700 ml-1">Mot de passe</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <IconKey size="20" />
            </div>
            <input v-model="form.password" type="password" required
              class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-slate-200 border rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 placeholder-slate-400"
              placeholder="••••••••••••" />
          </div>
        </div>

        <div v-if="error"
          class="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3 animate-fade-in-up">
          <IconAlertCircle size="20" class="flex-shrink-0 mt-0.5" />
          <span>{{ error }}</span>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <span v-else>Se connecter</span>
          <IconArrowRight v-if="!loading" size="20" />
        </button>
      </form>
    </div>
  </div>
</template>

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
