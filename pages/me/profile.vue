<template>
   <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold text-secondary-800 mb-6">Mon Profil</h2>

      <div class="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden p-6 md:p-8">
         <div class="flex items-center gap-6 mb-8">
            <div
               class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-3xl font-bold text-primary-600 shadow-inner">
               {{ authStore.user?.firstName?.charAt(0).toUpperCase() || 'A' }}
            </div>
            <div>
               <h3 class="text-xl font-bold text-secondary-900">{{ authStore.user?.firstName }} {{
                  authStore.user?.lastName
               }}</h3>
               <div class="flex items-center gap-2 mt-1">
                  <span
                     class="px-2 py-0.5 rounded text-xs font-bold bg-primary-100 text-primary-700 uppercase tracking-wide">
                     {{ authStore.user?.role }}</span>
               </div>
            </div>
         </div>

         <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label class="block text-sm font-bold text-secondary-700 mb-2">Prénom</label>
                  <input v-model="form.firstName" type="text"
                     class="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800" />
               </div>
               <div>
                  <label class="block text-sm font-bold text-secondary-700 mb-2">Nom</label>
                  <input v-model="form.lastName" type="text"
                     class="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800" />
               </div>
               <div>
                  <label class="block text-sm font-bold text-secondary-700 mb-2">Nom d'utilisateur</label>
                  <input v-model="form.username" type="text"
                     class="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800" />
               </div>
            </div>

            <div>
               <label class="block text-sm font-bold text-secondary-700 mb-2">Email</label>
               <input v-model="form.email" type="email" disabled
                  class="w-full px-4 py-3 bg-secondary-100 border border-secondary-200 rounded-xl text-secondary-500 cursor-not-allowed font-medium" />
               <p class="text-xs text-secondary-400 mt-2">L'adresse email ne peut pas être modifiée.</p>
            </div>

            <div class="pt-6 border-t border-secondary-100 flex justify-end">
               <button type="submit" :disabled="loading"
                  class="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
               </button>
            </div>
         </form>
      </div>
   </div>
</template>

<script setup>
definePageMeta({
   layout: 'admin'
})

useHead({
   title: 'Mon Profil - Administration'
})

const authStore = useAuthStore()
const profileStore = useProfileStore()
const { add: notify } = useToast()

const form = reactive({
   firstName: '',
   lastName: '',
   username: '',
   email: ''
})

// Mapping
watchEffect(() => {
   if (authStore.user) {
      form.firstName = authStore.user.firstName || ''
      form.lastName = authStore.user.lastName || ''
      form.username = authStore.user.username || ''
      form.email = authStore.user.email || ''
   }
})

const loading = computed(() => profileStore.loading)

const updateProfile = async () => {
   try {
      await profileStore.updateProfile({
         firstName: form.firstName,
         lastName: form.lastName,
         username: form.username
      })
      notify('Profil mis à jour avec succès')
   } catch (e) {
      notify('Erreur lors de la mise à jour', 'error')
   }
}
</script>
