import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    loading: false
  }),
  actions: {
    async updateProfile(data: { firstName: string, lastName: string, username: string }) {
      this.loading = true
      try {
        const { error } = await useAPI('/admin/profile', {
          method: 'PUT',
          body: data
        })

        if (error.value) throw error.value

        const authStore = useAuthStore()
        await authStore.fetchUser()

        return { success: true }
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
