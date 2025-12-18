import { defineStore } from 'pinia'
import type { ActivityLog, ActivityFilter } from '~/types/activity'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    logs: [] as ActivityLog[],
    currentLog: null as ActivityLog | null,
    loading: false,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    filters: {
      adminId: '',
      action: '',
      targetType: ''
    } as ActivityFilter,
    error: null as string | null
  }),
  actions: {
    async fetchLogs(filters: ActivityFilter = {}) {
      this.loading = true
      this.error = null
      try {
        const query = {
          page: this.currentPage,
          limit: this.limit,
          ...filters
        }

        const { data, error } = await useAPI<any>('/admin/get-my-all-logs', { query })

        if (error.value) throw error.value

        if (data.value) {
          this.logs = data.value.logs || []
          if (data.value.pagination) {
            this.total = data.value.pagination.total || 0
            this.totalPages = data.value.pagination.totalPages || 1
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch logs', error)
        this.error = error.message || 'Erreur lors du chargement de l\'historique'
      } finally {
        this.loading = false
      }
    },

    async fetchLog(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await useAPI<any>(`/admin/get-my-one-log/${id}`)

        if (error.value) throw error.value

        if (data.value) {
          this.currentLog = data.value.log
          return data.value.log
        }
      } catch (error: any) {
        console.error('Failed to fetch log details', error)
        this.error = error.message || 'Impossible de récupérer le détail du log'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSystemLogs(filters: ActivityFilter = {}) {
      this.loading = true
      this.error = null
      try {
        const query = {
          page: this.currentPage,
          limit: this.limit,
          ...this.filters,
          ...filters
        }

        const { data, error } = await useAPI<any>('/admin/get-syst-all-logs', { query })

        if (error.value) throw error.value

        if (data.value) {
          this.logs = data.value.logs || []
          if (data.value.pagination) {
            this.total = data.value.pagination.total || 0
            this.totalPages = data.value.pagination.totalPages || 1
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch system logs', error)
        this.error = error.message || 'Erreur lors du chargement journal système'
        this.logs = []
      } finally {
        this.loading = false
      }
    },

    async fetchSystemLog(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await useAPI<any>(`/admin/get-syst-one-logs/${id}`)

        if (error.value) throw error.value

        if (data.value) {
          this.currentLog = data.value.log
          return data.value.log
        }
      } catch (error: any) {
        console.error('Failed to fetch system log details', error)
        this.error = error.message || 'Impossible de récupérer le détail du log système'
        throw error
      } finally {
        this.loading = false
      }
    },

    setPage(page: number) {
      this.currentPage = page
      // Determine if we are fetching personal or system logs based on context/route is tricky here without context.
      // Ideally setPage should accept a callback or we have separate stores/states.
      // For now, let's assume the component calls the right fetch method after setting page, 
      // OR we just update the currentPage state and let the component watch it.
      // The current implementation calls fetchLogs() which might be wrong for system logs page.
      // Let's remove the automatic fetch call here and let the component handle it via watch or specific call.
    }
  }
})
