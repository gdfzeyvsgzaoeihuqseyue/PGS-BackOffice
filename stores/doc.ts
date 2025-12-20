import { defineStore } from 'pinia'
import type { SolutionDoc } from '~/types'

export const useDocStore = defineStore('doc', {
  state: () => ({
    docs: [] as SolutionDoc[],
    currentDoc: null as SolutionDoc | null,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchDocs() {
      this.loading = true
      this.error = null
      try {
        const { data } = await useAPI<any>('/public/solution/doc')
        if (data.value && data.value.data) {
          this.docs = data.value.data
        } else if (Array.isArray(data.value)) {
          this.docs = data.value
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

        if (data.value && data.value.data) {
          this.currentDoc = data.value.data
          return data.value.data
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
      await this.fetchDocs()
    },
    async updateDoc(id: string, doc: any) {
      await useAPI(`/admin/solution/doc/${id}`, { method: 'PUT', body: doc })
      if (this.currentDoc && this.currentDoc.id === id) {
        await this.fetchDoc(id)
      }
      await this.fetchDocs()
    },
    async deleteDoc(id: string) {
      await useAPI(`/admin/solution/doc/${id}`, { method: 'DELETE' })
      await this.fetchDocs()
      this.currentDoc = null
    }
  }
})
