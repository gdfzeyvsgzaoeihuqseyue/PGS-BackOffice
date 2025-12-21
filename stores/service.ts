import { defineStore } from 'pinia'
import type { Service, ServiceStats } from '~/types'

export const useServiceStore = defineStore('service', () => {

  // State
  const services = ref<Service[]>([])
  const service = ref<Service | null>(null)
  const serviceUsers = ref<any>(null)
  const serviceLearners = ref<any>(null)
  const stats = ref<ServiceStats | null>(null)
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
      if (data.value) {
        if (data.value.service) service.value = data.value.service
        if (data.value.users) serviceUsers.value = data.value.users
        if (data.value.learners) serviceLearners.value = data.value.learners
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
      const { data, error } = await useAPI<{ service: Service }>('/admin/service/create', { method: 'POST', body: payload })
      if (error.value) throw error.value
      if (data.value && data.value.service) {
        services.value.push(data.value.service)
        return data.value.service
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    }
  }

  const updateService = async (id: string, payload: any) => {
    try {
      // Mapping to backend route: PUT /api/v1/admin/service/:serviceId
      const { data, error } = await useAPI<{ service: Service }>(`/admin/service/${id}`, { method: 'PUT', body: payload })
      if (error.value) throw error.value

      if (data.value && data.value.service) {
        // Update in list
        const index = services.value.findIndex(s => s.id === id)
        if (index !== -1) {
          services.value[index] = { ...services.value[index], ...data.value.service }
        }
        // Update detail if loaded
        if (service.value && service.value.id === id) {
          service.value = { ...service.value, ...data.value.service }
        }
        return data.value.service
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    }
  }

  const deleteService = async (id: string, payload: any) => {
    try {
      // Mapping to backend route: DELETE /api/v1/admin/service/:serviceId
      // We pass the payload as 'body' in the options
      const { error } = await useAPI(`/admin/service/${id}`, {
        method: 'DELETE',
        body: payload
      })

      if (error.value) {
        // Pass the whole error value so component can inspect status/data
        throw error.value
      }

      services.value = services.value.filter(s => s.id !== id)
    } catch (err: any) {
      // If it's a FetchError from useAPI
      if (err.data) {
        // Re-throw the data part which contains the specific backend error message/code
        throw new Error(err.data.message || err.message)
      }
      throw new Error(err.message || 'Erreur lors de la suppression')
    }
  }

  const toggleService = async (id: string, isActive: boolean, reason: string | null = null) => {
    try {
      // Mapping to backend route: PATCH /api/v1/admin/service/:serviceId/toggle
      // Backend returns { message, service: Service, impact: ... }
      const { data, error } = await useAPI<{ service: Service }>(`/admin/service/${id}/toggle`, {
        method: 'PATCH',
        body: { isActive, reason }
      })

      if (error.value) throw error.value

      if (data.value && data.value.service) {
        // Update in list
        const index = services.value.findIndex(s => s.id === id)
        if (index !== -1) {
          services.value[index].isActive = data.value.service.isActive
        }
        // Update detail if loaded
        if (service.value && service.value.id === id) {
          service.value.isActive = data.value.service.isActive
        }
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors du changement de statut')
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await useAPI<ServiceStats>('/admin/service/stats')
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
    serviceUsers,
    serviceLearners,
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
