import { defineStore } from 'pinia'
import type { Admin } from '~/types'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admins: [] as any[], // Using any for now to support status extension until type is updated globally
    currentAdmin: null as any | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAdmins() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await useAPI<{ admins: any[] }>('/admin/get-admins')
        if (error.value) throw error.value

        if (data.value?.admins) {
          this.admins = data.value.admins
        }
      } catch (e: any) {
        console.error('Failed to fetch admins', e)
        this.error = e.message || 'Impossible de charger la liste des administrateurs'
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchAdmin(id: string) {
      this.loading = true
      this.error = null
      try {
        // Try to find in existing list first if available (and if we trust it's fresh enough)
        // But for detail view, better fetch fresh or fetch all if endpoint doesn't support single get
        // As per current implementation, we fetch all (limit 1000) and find one. 

        const { data, error } = await useAPI<{ admins: any[] }>('/admin/get-admins', { query: { limit: 1000 } })
        if (error.value) throw error.value

        if (data.value?.admins) {
          const found = data.value.admins.find(a => a.id === id)
          if (found) {
            this.currentAdmin = found
          } else {
            throw new Error('Administrateur introuvable')
          }
        }
      } catch (e: any) {
        console.error('Failed to fetch admin', e)
        this.error = e.message || 'Administrateur introuvable'
        this.currentAdmin = null
        throw e
      } finally {
        this.loading = false
      }
    },

    async inviteAdmin(payload: any) {
      this.loading = true
      try {
        const { error } = await useAPI('/admin/invite/invite-admin', {
          method: 'POST',
          body: { ...payload, status: 'pending' }
        })

        if (error.value) throw error.value

        // Optionally refresh list
        // await this.fetchAdmins() 
      } catch (e: any) {
        this.error = e.data?.message || 'Erreur lors de l\'envoi de l\'invitation'
        throw e
      } finally {
        this.loading = false
      }
    },

    async resendInvite(adminId: string) {
      try {
        const { error } = await useAPI('/admin/invite/resend', {
          method: 'POST',
          body: { adminId }
        })
        if (error.value) throw error.value
      } catch (e: any) {
        throw e
      }
    },

    async toggleStatus(adminId: string) {
      try {
        const { error } = await useAPI(`/admin/get-admins/${adminId}/toggle-status`, { method: 'POST' })
        if (error.value) throw error.value

        // Optimistic update in list
        const adminInList = this.admins.find(a => a.id === adminId)
        if (adminInList) {
          adminInList.status = adminInList.status === 'active' ? 'suspended' : 'active'
        }

        // Optimistic update in current admin
        if (this.currentAdmin && this.currentAdmin.id === adminId) {
          this.currentAdmin.status = this.currentAdmin.status === 'active' ? 'suspended' : 'active'
        }

      } catch (e: any) {
        throw e
      }
    },

    async deleteAdmin(adminId: string) {
      try {
        const { error } = await useAPI(`/admin/get-admins/${adminId}`, { method: 'DELETE' })
        if (error.value) throw error.value

        this.admins = this.admins.filter(a => a.id !== adminId)
        if (this.currentAdmin && this.currentAdmin.id === adminId) {
          this.currentAdmin = null
        }
      } catch (e: any) {
        throw e
      }
    }
  }
})
