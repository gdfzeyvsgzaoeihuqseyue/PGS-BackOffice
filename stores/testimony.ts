import { defineStore } from 'pinia'
import type { SolutionTestimony } from '~/types'

export const useTestimonyStore = defineStore('testimony', () => {
  const testimonies = ref<SolutionTestimony[]>([])
  const currentTestimony = ref<SolutionTestimony | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchTestimonies = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<any>(`/public/solution/testimony?page=${page}&limit=${limit}`)
      if (data.value) {
        if (data.value.data && Array.isArray(data.value.data)) {
          testimonies.value = data.value.data
          pagination.value = {
            page: data.value.currentPage || page,
            limit: limit,
            total: data.value.nb || 0,
            totalPages: data.value.totalPages || 0
          }
        } else if (Array.isArray(data.value)) {
          testimonies.value = data.value
          pagination.value.total = data.value.length
        } else {
          testimonies.value = []
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des témoignages'
    } finally {
      loading.value = false
    }
  }

  const fetchTestimony = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: apiError } = await useAPI<any>(`/public/solution/testimony/${id}`)
      if (apiError.value) throw apiError.value

      if (data.value) {
        const testiData = data.value.data || data.value
        currentTestimony.value = testiData
        return testiData
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du témoignage'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addTestimony = async (testimony: Partial<SolutionTestimony>) => {
    loading.value = true
    try {
      await useAPI('/admin/solution/testimony', { method: 'POST', body: testimony })
      await fetchTestimonies(pagination.value.page)
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    } finally {
      loading.value = false
    }
  }

  const updateTestimony = async (id: string, updates: Partial<SolutionTestimony>) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/testimony/${id}`, { method: 'PUT', body: updates })
      await fetchTestimonies(pagination.value.page)
      if (currentTestimony.value && currentTestimony.value.id === id) {
        Object.assign(currentTestimony.value, updates)
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      loading.value = false
    }
  }

  const deleteTestimony = async (id: string) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/testimony/${id}`, { method: 'DELETE' })
      await fetchTestimonies(pagination.value.page)
      if (currentTestimony.value && currentTestimony.value.id === id) {
        currentTestimony.value = null
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    } finally {
      loading.value = false
    }
  }

  return {
    testimonies,
    currentTestimony,
    pagination,
    loading,
    error,
    fetchTestimonies,
    fetchTestimony,
    addTestimony,
    updateTestimony,
    deleteTestimony
  }
})

