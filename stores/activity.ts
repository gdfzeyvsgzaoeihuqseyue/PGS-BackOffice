import { defineStore } from 'pinia'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    logs: [],
    loading: false,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20
  }),
  actions: {
    async fetchLogs(filters: any = {}) {
      this.loading = true
      try {
        const query = {
             page: this.currentPage,
             limit: this.limit,
             ...filters
        }
        
        const { data } = await useAPI<any>('/superadmin/activity-logs', { query })
        
        if (data.value) {
            this.logs = data.value.logs || []
            if (data.value.pagination) {
                this.total = data.value.pagination.total || 0
                this.totalPages = data.value.pagination.totalPages || 1
            }
        }
      } catch (error) {
        console.error('Failed to fetch logs', error)
      } finally {
        this.loading = false
      }
    },
    
    setPage(page: number) {
        this.currentPage = page
        this.fetchLogs()
    }
  }
})
