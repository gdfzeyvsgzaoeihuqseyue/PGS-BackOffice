import { defineStore } from 'pinia'
import type { SolutionPartner } from '~/types'

export const usePartnerStore = defineStore('partner', () => {
  const partners = ref<SolutionPartner[]>([])
  const currentPartner = ref<SolutionPartner | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPartners = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<any>('/public/solution/partner')
      if (data.value) {
        if (Array.isArray(data.value)) {
          partners.value = data.value
        } else if (data.value.data) {
          partners.value = data.value.data
        } else {
          partners.value = []
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des partenaires'
    } finally {
      loading.value = false
    }
  }

  const fetchPartner = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: apiError } = await useAPI<any>(`/public/solution/partner/${id}`)
      if (apiError.value) throw apiError.value

      if (data.value) {
        // Handle potential nested data structure
        const partnerData = data.value.data || data.value
        currentPartner.value = partnerData
        return partnerData
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du partenaire'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addPartner = async (partner: Partial<SolutionPartner>) => {
    loading.value = true
    try {
      await useAPI('/admin/solution/partner', { method: 'POST', body: partner })
      await fetchPartners()
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    } finally {
      loading.value = false
    }
  }

  const updatePartner = async (id: string, updates: Partial<SolutionPartner>) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/partner/${id}`, { method: 'PUT', body: updates })
      await fetchPartners()
      if (currentPartner.value && currentPartner.value.id === id) {
        Object.assign(currentPartner.value, updates)
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      loading.value = false
    }
  }

  const deletePartner = async (id: string) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/partner/${id}`, { method: 'DELETE' })
      await fetchPartners()
      if (currentPartner.value && currentPartner.value.id === id) {
        currentPartner.value = null
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    } finally {
      loading.value = false
    }
  }

  return {
    partners,
    currentPartner,
    loading,
    error,
    fetchPartners,
    fetchPartner,
    addPartner,
    updatePartner,
    deletePartner
  }
})
