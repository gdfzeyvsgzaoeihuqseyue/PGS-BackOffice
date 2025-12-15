import { defineStore } from 'pinia'
import type { SuperAdmin, LoginCredentials, AuthResponse } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as SuperAdmin | null,
    loading: false,
    initialized: false
  }),
  actions: {
    async fetchUser() {
      // Avoid fetching if already loading
      if (this.loading) return

      this.loading = true
      try {
        const { data, error } = await useAPI<{ superAdmin: SuperAdmin }>('/superadmin/profile')

        if (error.value) {
          this.user = null
        } else if (data.value?.superAdmin) {
          this.user = data.value.superAdmin
        }
      } catch (e) {
        this.user = null
      } finally {
        this.loading = false
        this.initialized = true
      }
    },
    async login(credentials: LoginCredentials) {
      this.loading = true
      try {
        const { data, error } = await useAPI<AuthResponse>('/superadmin/auth/login', {
          method: 'POST',
          body: credentials
        })

        if (error.value) throw error.value

        // Update user state immediately from login response if provided
        if (data.value?.superAdmin) {
          this.user = data.value.superAdmin
        } else {
          // Otherwise fetch it
          await this.fetchUser()
        }

        return true
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
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
    isAuthenticated: (state) => !!state.user,
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
  }
})
