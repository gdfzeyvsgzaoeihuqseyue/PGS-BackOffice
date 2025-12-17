import { defineStore } from 'pinia'
import type { User, PaginatedResponse } from '~/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    loading: false,
    error: null as string | null,
    search: ''
  }),
  actions: {
    async fetchUsers(search = '') {
      this.loading = true
      this.error = null
      this.search = search
      try {
        const { data, error } = await useAPI<any>('/admin/user/list', {
          query: {
            page: this.page,
            limit: this.limit,
            search: this.search
          }
        })

        if (error.value) throw error.value

        // Helper to normalize response structure
        const responseData = data.value
        if (responseData) {
          const rawUsers = responseData.users || responseData.items || []
          this.users = rawUsers.map((u: any) => ({
            ...u,
            fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim()
          }))

          // Handle pagination structure from listUser.json: { pagination: { total, totalPages, ... } }
          if (responseData.pagination) {
            this.total = responseData.pagination.total || 0
            this.totalPages = responseData.pagination.totalPages || 1
          } else {
            this.total = responseData.total || 0
            this.totalPages = responseData.totalPages || 1
          }
        }
      } catch (e: any) {
        // Handle error
        console.error('Fetch users error', e)
        this.error = e.message || 'Erreur lors du chargement des utilisateurs'
      } finally {
        this.loading = false
      }
    },
    async manageUser(id: string, action: 'suspend' | 'activate' | 'delete' | 'verify_email') {
      try {
        await useAPI('/admin/user/manage', {
          method: 'POST',
          body: { id, action }
        })
        // Refresh list
        await this.fetchUsers(this.search)
        return true
      } catch (e) {
        throw e
      }
    },
    setPage(p: number) {
      this.page = p
      this.fetchUsers(this.search)
    }
  }
})
