import { defineStore } from 'pinia'
import type { SolutionPlatform } from '~/types'

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    platforms: [] as SolutionPlatform[],
    currentPlatform: null as SolutionPlatform | null,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchPlatforms() {
      this.loading = true
      this.error = null
      try {
        const { data } = await useAPI<any>('/public/solution/platform')
        if (data.value && data.value.data) {
          this.platforms = data.value.data
        } else if (Array.isArray(data.value)) {
          this.platforms = data.value
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
      await this.fetchPlatforms()
    },
    async updatePlatform(id: string, platform: any) {
      await useAPI(`/admin/solution/platform/${id}`, { method: 'PUT', body: platform })
      if (this.currentPlatform && this.currentPlatform.id === id) {
        await this.fetchPlatform(id)
      }
      await this.fetchPlatforms()
    },
    async deletePlatform(id: string) {
      await useAPI(`/admin/solution/platform/${id}`, { method: 'DELETE' })
      await this.fetchPlatforms()
      this.currentPlatform = null
    }
  }
})
