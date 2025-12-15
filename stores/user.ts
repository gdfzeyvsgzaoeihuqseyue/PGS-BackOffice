import { defineStore } from 'pinia'
import type { User, PaginatedResponse } from '~/types/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    loading: false,
    search: ''
  }),
  actions: {
    async fetchUsers(search = '') {
      this.loading = true
      this.search = search
      try {
        const { data, error } = await useAPI<any>('/superadmin/user/list', {
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
      } catch (e) {
        // Handle error
        console.error('Fetch users error', e)
      } finally {
        this.loading = false
      }
    },
    async manageUser(id: string, action: 'suspend' | 'activate' | 'delete' | 'verify_email') {
      try {
        await useAPI('/superadmin/user/manage', {
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
