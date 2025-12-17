import { defineStore } from 'pinia'
import type { Learner } from '~/types'

export const useLearnerStore = defineStore('learner', {
  state: () => ({
    learners: [] as Learner[],
    currentLearner: null as Learner | null,
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    loading: false,
    error: null as string | null,
    search: ''
  }),
  actions: {
    async fetchLearner(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await useAPI<{ learner: Learner }>(`/admin/manage/learner/${id}`)
        if (error.value) throw error.value

        if (data.value?.learner) {
          this.currentLearner = {
            ...data.value.learner,
            fullName: `${data.value.learner.firstName || ''} ${data.value.learner.lastName || ''}`.trim()
          }
        }
      } catch (e: any) {
        console.error('Failed to fetch learner', e)
        this.error = e.message || 'Apprenant introuvable'
        throw e
      } finally {
        this.loading = false
      }
    },
    async fetchLearners(search = '') {
      this.loading = true
      this.error = null
      this.search = search
      try {
        const { data, error } = await useAPI<any>('/admin/leaner/list', {
          query: {
            page: this.page,
            limit: this.limit,
            search: this.search
          }
        })

        if (error.value) throw error.value

        const responseData = data.value
        if (responseData) {
          const rawLearners = responseData.learners || responseData.items || []
          this.learners = rawLearners.map((u: any) => ({
            ...u,
            fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim()
          }))

          if (responseData.pagination) {
            this.total = responseData.pagination.total || 0
            this.totalPages = responseData.pagination.totalPages || 1
          } else {
            this.total = responseData.total || 0
            this.totalPages = responseData.totalPages || 1
          }
        }
      } catch (e: any) {
        console.error('Fetch learners error', e)
        this.error = e.message || 'Erreur lors du chargement des apprenants'
      } finally {
        this.loading = false
      }
    },
    async manageLearner(id: string, action: 'suspend' | 'activate' | 'delete') {
      try {
        await useAPI('/admin/leaner/manage', {
          method: 'POST',
          body: { id, action }
        })
        await this.fetchLearners(this.search)
        return true
      } catch (e) {
        throw e
      }
    },
    setPage(p: number) {
      this.page = p
      this.fetchLearners(this.search)
    }
  }
})
