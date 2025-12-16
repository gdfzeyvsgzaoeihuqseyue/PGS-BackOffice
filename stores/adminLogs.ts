import { defineStore } from 'pinia'

export const useAdminLogsStore = defineStore('adminLogs', {
  state: () => ({
    logs: [],
    loading: false,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    error: null as string | null,
    filters: {
      adminId: '',
      action: '',
      targetType: '',
      startDate: '',
      endDate: ''
    }
  }),
  actions: {
    async fetchLogs() {
      this.loading = true
      this.error = null
      try {
        // Nettoyer les filtres vides
        const activeFilters = Object.fromEntries(
          Object.entries(this.filters).filter(([_, v]) => v !== '')
        )

        const query = {
          page: this.currentPage,
          limit: this.limit,
          ...activeFilters
        }

        const { data, error } = await useAPI<any>('/admin/all-activity-logs', { query })

        if (error.value) throw error.value

        if (data.value) {
          this.logs = data.value.logs || []
          if (data.value.pagination) {
            this.total = data.value.pagination.total || 0
            this.totalPages = data.value.pagination.totalPages || 1
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch admin logs', error)
        this.error = error.message || 'Erreur lors du chargement des logs globaux'
      } finally {
        this.loading = false
      }
    },

    setPage(page: number) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchLogs()
    },

    resetFilters() {
      this.filters = {
        adminId: '',
        action: '',
        targetType: '',
        startDate: '',
        endDate: ''
      }
      this.currentPage = 1
      this.fetchLogs()
    }
  }
})
