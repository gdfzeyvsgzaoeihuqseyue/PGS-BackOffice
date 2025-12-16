import { defineStore } from 'pinia'
import type { Admin } from '~/types/auth'

export interface Session {
  id: string
  adminId: string
  token: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
  ipAddress: string
  userAgent: string
  isRevoked: boolean
  deviceInfo: any
  createdAt: string
  updatedAt: string
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    loading: false,
    sessionInfo: null as Admin | null,
    lastVerified: null as Date | null,
    sessions: [] as Session[],
    currentToken: '' as string
  }),
  actions: {
    // --- Current Session / Validations (Auth) ---
    async getSession() {
      // Calls the /auth/session endpoint -> returns { admin: ... }
      this.loading = true
      try {
        const { data, error } = await useAPI<{ admin: Admin }>('/admin/auth/session')

        if (error.value) throw error.value

        if (data.value?.admin) {
          this.sessionInfo = data.value.admin
          this.lastVerified = new Date()
        }
        return data.value
      } catch (e) {
        this.sessionInfo = null
        throw e
      } finally {
        this.loading = false
      }
    },

    async verifyToken() {
      // Calls /auth/verify-token
      try {
        const { data, error } = await useAPI<{ valid: boolean, admin: Admin }>('/admin/auth/verify-token', {
          method: 'POST'
        })

        if (error.value) throw error.value

        if (data.value?.valid && data.value?.admin) {
          this.sessionInfo = data.value.admin
          this.lastVerified = new Date()
          return true
        }
        return false
      } catch (e) {
        return false
      }
    },

    async refreshToken() {
      try {
        const { data, error } = await useAPI('/admin/auth/refresh-token', {
          method: 'POST'
        })

        if (error.value) throw error.value
        return true
      } catch (e) {
        throw e
      }
    },

    // --- Session Management (List / Revoke) ---
    async fetchSessions() {
      this.loading = true
      try {
        // Calls /admin/sessions -> returns { sessions: [], currentToken: '' }
        const { data, error } = await useAPI<{ sessions: Session[], currentToken: string }>('/admin/sessions')

        if (error.value) throw error.value

        if (data.value) {
          this.sessions = data.value.sessions || []
          this.currentToken = data.value.currentToken || ''
        }
      } catch (e) {
        console.error('Failed to fetch sessions', e)
        this.sessions = []
      } finally {
        this.loading = false
      }
    },

    async revokeSession(sessionId: string) {
      try {
        const { error } = await useAPI(`/admin/sessions/${sessionId}/revoke`, {
          method: 'POST'
        })
        if (error.value) throw error.value

        // Remove from list or mark as revoked
        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index].isRevoked = true
          // ou remove: this.sessions.splice(index, 1) -- mais le backend met isRevoked=true, donc on garde
        }
        return true
      } catch (e) {
        throw e
      }
    },

    async revokeAllSessions() {
      try {
        const { error } = await useAPI('/admin/sessions/revoke-all', {
          method: 'POST'
        })
        if (error.value) throw error.value

        // Refresh list
        await this.fetchSessions()
        return true
      } catch (e) {
        throw e
      }
    }
  }
})
