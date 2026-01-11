import { defineStore } from 'pinia'
import type { SolutionFaqTopic } from '~/types'

export const useFaqTopicStore = defineStore('faq-topic', () => {
  const topics = ref<SolutionFaqTopic[]>([])
  const currentTopic = ref<SolutionFaqTopic | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchTopics = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<any>(`/public/solution/faq-topic?page=${page}&limit=${limit}`)
      if (data.value) {
        if (data.value.data && Array.isArray(data.value.data)) {
          topics.value = data.value.data
          pagination.value = {
            page: data.value.currentPage || page,
            limit: limit,
            total: data.value.nb || 0,
            totalPages: data.value.totalPages || 0
          }
        } else if (Array.isArray(data.value)) {
          topics.value = data.value
          pagination.value.total = data.value.length
        } else {
          topics.value = []
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des sujets FAQ'
    } finally {
      loading.value = false
    }
  }

  const fetchTopic = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: apiError } = await useAPI<any>(`/public/solution/faq-topic/${id}`)
      if (apiError.value) throw apiError.value

      if (data.value) {
        const itemData = data.value.data || data.value
        currentTopic.value = itemData
        return itemData
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du sujet'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addTopic = async (topic: Partial<SolutionFaqTopic>) => {
    loading.value = true
    try {
      await useAPI('/admin/solution/faq-topic', { method: 'POST', body: topic })
      await fetchTopics(pagination.value.page)
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    } finally {
      loading.value = false
    }
  }

  const updateTopic = async (id: string, updates: Partial<SolutionFaqTopic>) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/faq-topic/${id}`, { method: 'PUT', body: updates })
      await fetchTopics(pagination.value.page)
      if (currentTopic.value && currentTopic.value.id === id) {
        Object.assign(currentTopic.value, updates)
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      loading.value = false
    }
  }

  const deleteTopic = async (id: string) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/faq-topic/${id}`, { method: 'DELETE' })
      await fetchTopics(pagination.value.page)
      if (currentTopic.value && currentTopic.value.id === id) {
        currentTopic.value = null
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    } finally {
      loading.value = false
    }
  }

  return {
    topics,
    currentTopic,
    pagination,
    loading,
    error,
    fetchTopics,
    fetchTopic,
    addTopic,
    updateTopic,
    deleteTopic
  }
})

