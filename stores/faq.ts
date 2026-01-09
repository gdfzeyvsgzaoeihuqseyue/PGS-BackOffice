import { defineStore } from 'pinia'
import type { SolutionFaq } from '~/types'

export const useFaqStore = defineStore('faq', () => {
  const faqs = ref<SolutionFaq[]>([])
  const currentFaq = ref<SolutionFaq | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchFaqs = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<any>(`/public/solution/faq?page=${page}&limit=${limit}`)
      if (data.value) {
        // Handle paginated response
        if (data.value.data && Array.isArray(data.value.data)) {
          faqs.value = data.value.data
          pagination.value = {
            page: data.value.currentPage || page,
            limit: limit,
            total: data.value.nb || 0,
            totalPages: data.value.totalPages || 0
          }
        } else if (Array.isArray(data.value)) {
          faqs.value = data.value
          pagination.value.total = data.value.length
        } else {
          faqs.value = []
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des FAQs'
    } finally {
      loading.value = false
    }
  }

  const fetchFaq = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: apiError } = await useAPI<any>(`/public/solution/faq/${id}`)
      if (apiError.value) throw apiError.value

      if (data.value) {
        const itemData = data.value.data || data.value
        currentFaq.value = itemData
        return itemData
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de la FAQ'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addFaq = async (faq: Partial<SolutionFaq>) => {
    loading.value = true
    try {
      await useAPI('/admin/solution/faq', { method: 'POST', body: faq })
      await fetchFaqs()
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    } finally {
      loading.value = false
    }
  }

  const updateFaq = async (id: string, updates: Partial<SolutionFaq>) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/faq/${id}`, { method: 'PUT', body: updates })
      await fetchFaqs()
      if (currentFaq.value && currentFaq.value.id === id) {
        Object.assign(currentFaq.value, updates)
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      loading.value = false
    }
  }

  const deleteFaq = async (id: string) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/faq/${id}`, { method: 'DELETE' })
      await fetchFaqs()
      if (currentFaq.value && currentFaq.value.id === id) {
        currentFaq.value = null
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    } finally {
      loading.value = false
    }
  }

  const resetVotes = async (id: string) => {
    try {
      await useAPI(`/admin/solution/reset-vote/${id}`, { method: 'PATCH' })
      await fetchFaq(id)
      await fetchFaqs()
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la réinitialisation des votes')
    }
  }

  return {
    faqs,
    currentFaq,
    pagination,
    loading,
    error,
    fetchFaqs,
    fetchFaq,
    addFaq,
    updateFaq,
    deleteFaq,
    resetVotes
  }
})
