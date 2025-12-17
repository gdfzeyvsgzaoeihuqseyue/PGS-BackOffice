import { defineStore } from 'pinia'
import type { Admin, LoginCredentials, AuthResponse } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as Admin | null,
    loading: false,
    initialized: false
  }),
  actions: {
    async fetchUser() {
      if (this.loading) return

      this.loading = true
      try {
        const { data, error } = await useAPI<{ admin: Admin }>('/admin/profile')

        if (error.value) {
          this.user = null
        } else if (data.value?.admin) {
          this.user = data.value.admin
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
        const { data, error } = await useAPI<AuthResponse>('/admin/auth/login', {
          method: 'POST',
          body: credentials
        })

        if (error.value) throw error.value

        if (data.value?.admin) {
          this.user = data.value.admin
        } else {
          await this.fetchUser()
        }

        return true
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },
    async acceptInvitation(payload: { token: string, password: string, firstName?: string, lastName?: string }) {
      this.loading = true
      try {
        const { error } = await useAPI('/admin/invite/accept-invitation', {
          method: 'POST',
          body: payload
        })

        if (error.value) throw error.value

        return true
      } catch (e: any) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await useAPI('/admin/auth/logout', { method: 'POST' })
      } catch (e) {
        console.error('Logout error', e)
      } finally {
        this.user = null
        navigateTo('/auth/login')
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
  }
})
