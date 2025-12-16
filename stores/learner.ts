import { defineStore } from 'pinia'
import type { Learner } from '~/types/user'

export const useLearnerStore = defineStore('learner', {
  state: () => ({
    learners: [] as Learner[],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    loading: false,
    search: ''
  }),
  actions: {
    async fetchLearners(search = '') {
      this.loading = true
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
      } catch (e) {
        console.error('Fetch learners error', e)
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
