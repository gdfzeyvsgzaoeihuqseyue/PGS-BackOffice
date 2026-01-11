import { defineStore } from 'pinia'
import type { SolutionDoc } from '~/types'

export const useDocStore = defineStore('doc', {
  state: () => ({
    docs: [] as SolutionDoc[],
    currentDoc: null as SolutionDoc | null,
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
    async fetchDocs(page = 1, limit = 10) {
      this.loading = true
      this.error = null
      try {
        const { data } = await useAPI<any>(`/public/solution/doc?page=${page}&limit=${limit}`)
        if (data.value) {
          if (data.value.data && Array.isArray(data.value.data)) {
            this.docs = data.value.data
            this.pagination = {
              page: data.value.currentPage || page,
              limit: limit,
              total: data.value.nb || 0,
              totalPages: data.value.totalPages || 0
            }
          } else if (Array.isArray(data.value)) {
            this.docs = data.value
            this.pagination.total = data.value.length
          }
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement des documents'
      } finally {
        this.loading = false
      }
    },
    async fetchDoc(id: string) {
      this.loading = true
      this.error = null
      this.currentDoc = null
      try {
        const { data, error } = await useAPI<any>(`/public/solution/doc/${id}`)
        if (error.value) throw error.value

        if (data.value) {
          const result = data.value.data || data.value
          this.currentDoc = result
          return result
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement du document'
        throw e
      } finally {
        this.loading = false
      }
    },
    async addDoc(doc: any) {
      await useAPI('/admin/solution/doc', { method: 'POST', body: doc })
      await this.fetchDocs(this.pagination.page)
    },
    async updateDoc(id: string, doc: any) {
      await useAPI(`/admin/solution/doc/${id}`, { method: 'PUT', body: doc })
      if (this.currentDoc && this.currentDoc.id === id) {
        await this.fetchDoc(id)
      }
      await this.fetchDocs(this.pagination.page)
    },
    async deleteDoc(id: string) {
      await useAPI(`/admin/solution/doc/${id}`, { method: 'DELETE' })
      await this.fetchDocs(this.pagination.page)
      this.currentDoc = null
    }
  }
})

