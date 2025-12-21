import { defineStore } from 'pinia'
import type { Service } from '~/types'

export const useServiceStore = defineStore('service', () => {

  // State
  const services = ref<Service[]>([])
  const service = ref<Service | null>(null)
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchServices = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<{ services: Service[], pagination: any }>('/admin/service/list')
      if (data.value && data.value.services) {
        services.value = data.value.services
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des services'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchService = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<{ service: Service, users: any, learners: any }>(`/admin/service/${id}`)
      if (data.value && data.value.service) {
        service.value = data.value.service
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du service'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const addService = async (payload: any) => {
    try {
      // Mapping to backend route: POST /api/v1/admin/service/create
      const { data, error } = await useAPI<Service>('/admin/service/create', { method: 'POST', body: payload })
      if (error.value) throw error.value
      if (data.value) {
        services.value.push(data.value)
        return data.value
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    }
  }

  const updateService = async (id: string, payload: any) => {
    try {
      // Mapping to backend route: PUT /api/v1/admin/service/:serviceId
      const { data, error } = await useAPI<Service>(`/admin/service/${id}`, { method: 'PUT', body: payload })
      if (error.value) throw error.value

      if (data.value) {
        // Update in list
        const index = services.value.findIndex(s => s.id === id)
        if (index !== -1) {
          services.value[index] = { ...services.value[index], ...data.value }
        }
        // Update detail if loaded
        if (service.value && service.value.id === id) {
          service.value = { ...service.value, ...data.value }
        }
        return data.value
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    }
  }

  const deleteService = async (id: string) => {
    try {
      // Mapping to backend route: DELETE /api/v1/admin/service/:serviceId
      const { error } = await useAPI(`/admin/service/${id}`, { method: 'DELETE' })
      if (error.value) throw error.value
      services.value = services.value.filter(s => s.id !== id)
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    }
  }

  const toggleService = async (id: string) => {
    try {
      // Mapping to backend route: PATCH /api/v1/admin/service/:serviceId/toggle
      const { data, error } = await useAPI<Service>(`/admin/service/${id}/toggle`, { method: 'PATCH' })
      if (error.value) throw error.value

      if (data.value) {
        // Update in list
        const index = services.value.findIndex(s => s.id === id)
        if (index !== -1) {
          services.value[index].isActive = data.value.isActive
        }
        // Update detail if loaded
        if (service.value && service.value.id === id) {
          service.value.isActive = data.value.isActive
        }
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors du changement de statut')
    }
  }

  const fetchStats = async () => {
    try {
      // Mapping to backend route: GET /api/v1/admin/service/stats
      const { data } = await useAPI('/admin/service/stats')
      if (data.value) {
        stats.value = data.value
      }
    } catch (err: any) {
      console.error('Failed to fetch stats', err)
    }
  }

  return {
    services,
    service,
    stats,
    loading,
    error,
    fetchServices,
    fetchService,
    addService,
    updateService,
    deleteService,
    toggleService,
    fetchStats
  }
})
