import { defineStore } from 'pinia'

interface User {
  id: number | string
  email: string
  fullName: string
  role: string
  // Add other fields as needed
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: true // Start loading to block until checked
  }),
  actions: {
    async fetchUser() {
      this.loading = true
      try {
        const { data, error } = await useAPI<User>('/superadmin/profile')
        if (error.value) {
          this.user = null
        } else {
          this.user = data.value
        }
      } catch (e) {
        this.user = null
      } finally {
        this.loading = false
      }
    },
    async login(body: any) {
      const { data, error } = await useAPI('/superadmin/auth/login', {
        method: 'POST',
        body
      })
      if (error.value) throw error.value
      // Fetch user profile after successful login to populate state
      await this.fetchUser()
    },
    async logout() {
      try {
        await useAPI('/superadmin/auth/logout', { method: 'POST' })
      } catch (e) {
        console.error('Logout error', e)
      } finally {
        this.user = null
        navigateTo('/login')
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user
  }
})
