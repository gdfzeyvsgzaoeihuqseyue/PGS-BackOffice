import { defineStore } from 'pinia'
import type { SolutionPlatform } from '~/types'

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    platforms: [] as SolutionPlatform[],
    currentPlatform: null as SolutionPlatform | null,
    loading: false,
    error: null as string | null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  }),
  actions: {
    async fetchPlatforms(page = 1, limit = 10) {
      this.loading = true
      this.error = null
      try {
        const { data } = await useAPI<any>(`/public/solution/platform?page=${page}&limit=${limit}`)
        if (data.value) {
          if (data.value.data && Array.isArray(data.value.data)) {
            this.platforms = data.value.data
            this.pagination = {
              page: data.value.currentPage || page,
              limit: limit,
              total: data.value.nb || 0,
              totalPages: data.value.totalPages || 0
            }
          } else if (Array.isArray(data.value)) {
            this.platforms = data.value
            this.pagination.total = data.value.length
          }
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement des plateformes'
      } finally {
        this.loading = false
      }
    },
    async fetchPlatform(identifier: string) {
      this.loading = true
      this.error = null
      this.currentPlatform = null
      try {
        const { data, error } = await useAPI<any>(`/public/solution/platform/${identifier}`)
        if (error.value) throw error.value

        if (data.value) {
          const result = data.value.data || data.value
          this.currentPlatform = result
          return result
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement de la plateforme'
        throw e
      } finally {
        this.loading = false
      }
    },
    async addPlatform(platform: any) {
      await useAPI('/admin/solution/platform', { method: 'POST', body: platform })
      await this.fetchPlatforms(this.pagination.page)
    },
    async updatePlatform(id: string, platform: any) {
      await useAPI(`/admin/solution/platform/${id}`, { method: 'PUT', body: platform })
      if (this.currentPlatform && this.currentPlatform.id === id) {
        await this.fetchPlatform(id)
      }
      await this.fetchPlatforms(this.pagination.page)
    },
    async deletePlatform(id: string) {
      await useAPI(`/admin/solution/platform/${id}`, { method: 'DELETE' })
      await this.fetchPlatforms(this.pagination.page)
      this.currentPlatform = null
    }
  }
})

