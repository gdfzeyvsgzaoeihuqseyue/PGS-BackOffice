import { defineStore } from 'pinia'
import type { Admin } from '~/types'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admins: [] as Admin[],
    currentAdmin: null as Admin | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchAdmins() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await useAPI<{ admins: Admin[] }>('/admin/get-all-admins')
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
        const { data, error } = await useAPI<{ admin: Admin }>(`/admin/manage/get-admin/${id}`)
        if (error.value) throw error.value

        if (data.value?.admin) {
          this.currentAdmin = data.value.admin
        } else {
          throw new Error('Administrateur introuvable')
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

    async manageAdmin(payload: { adminId: string, action: string, [key: string]: any }) {
      try {
        const { error } = await useAPI('/admin/manage/admin/manage', {
          method: 'POST',
          body: payload
        })
        if (error.value) throw error.value

        // Refresh current admin if it matches
        if (this.currentAdmin && this.currentAdmin.id === payload.adminId) {
          await this.fetchAdmin(payload.adminId)
        }

        // Refresh list
        await this.fetchAdmins()
      } catch (e: any) {
        throw e
      }
    },

    async toggleStatus(adminId: string) {
      const admin = this.admins.find(a => a.id === adminId) || (this.currentAdmin?.id === adminId ? this.currentAdmin : null)
      if (!admin) return

      const action = admin.status === 'active' ? 'suspend' : 'activate'

      try {
        await this.manageAdmin({
          adminId,
          action
        })
      } catch (e: any) {
        throw e
      }
    },

    async deleteAdmin(adminId: string) {
      try {
        await this.manageAdmin({
          adminId,
          action: 'delete'
        })
      } catch (e: any) {
        throw e
      }
    }
  }
})
