import { defineStore } from 'pinia'
import type { SolutionTuto } from '~/types'

export const useTutoStore = defineStore('tuto', () => {
  const tutos = ref<SolutionTuto[]>([])
  const currentTuto = ref<SolutionTuto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTutos = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<any>('/public/solution/tutorial')
      if (data.value) {
        if (Array.isArray(data.value)) {
          tutos.value = data.value
        } else if (data.value.data) {
          tutos.value = data.value.data
        } else {
          tutos.value = []
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des tutoriels'
    } finally {
      loading.value = false
    }
  }

  const fetchTuto = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      // Typically detail endpoints use ID
      const { data, error: apiError } = await useAPI<any>(`/public/solution/tutorial/${id}`)
      if (apiError.value) throw apiError.value

      if (data.value) {
        const itemData = data.value.data || data.value
        currentTuto.value = itemData
        return itemData
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du tutoriel'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addTuto = async (tuto: Partial<SolutionTuto>) => {
    loading.value = true
    try {
      await useAPI('/admin/solution/tutorial', { method: 'POST', body: tuto })
      await fetchTutos()
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    } finally {
      loading.value = false
    }
  }

  const updateTuto = async (id: string, updates: Partial<SolutionTuto>) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/tutorial/${id}`, { method: 'PUT', body: updates })
      await fetchTutos()
      if (currentTuto.value && currentTuto.value.id === id) {
        Object.assign(currentTuto.value, updates)
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      loading.value = false
    }
  }

  const deleteTuto = async (id: string) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/tutorial/${id}`, { method: 'DELETE' })
      await fetchTutos()
      if (currentTuto.value && currentTuto.value.id === id) {
        currentTuto.value = null
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    } finally {
      loading.value = false
    }
  }

  return {
    tutos,
    currentTuto,
    loading,
    error,
    fetchTutos,
    fetchTuto,
    addTuto,
    updateTuto,
    deleteTuto
  }
})
