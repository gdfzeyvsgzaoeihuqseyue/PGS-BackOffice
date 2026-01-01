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
      const { data } = await useAPI<{ services: Service[], pagination: any }>('/admin/solution/list-service')
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
      const { data } = await useAPI<{ service: Service, users: any, learners: any }>(`/admin/solution/get-service/${id}`)
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
      const { data, error } = await useAPI<{ service: Service }>('/admin/solution/create-service', { method: 'POST', body: payload })
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
      const { data, error } = await useAPI<{ service: Service }>(`/admin/solution/update-service/${id}`, { method: 'PUT', body: payload })
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
      const { error } = await useAPI(`/admin/solution/delete-service/${id}`, {
        method: 'DELETE',
        body: payload
      })

      if (error.value) {
        throw error.value
      }

      services.value = services.value.filter(s => s.id !== id)
    } catch (err: any) {
      if (err.data) {
        throw new Error(err.data.message || err.message)
      }
      throw new Error(err.message || 'Erreur lors de la suppression')
    }
  }

  const toggleService = async (id: string, isActive: boolean, reason: string | null = null) => {
    try {
      const { data, error } = await useAPI<{ service: Service }>(`/admin/solution/toggle-service-status/${id}`, {
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
      const { data } = await useAPI<ServiceStats>('/admin/solution/get-service-stats')
      if (data.value) {
        stats.value = data.value
      }
    } catch (err: any) {
      console.error('Failed to fetch stats', err)
    }
  }

  const toggleAccess = async (targetId: string, serviceId: string, targetType: 'user' | 'learner', isActive: boolean) => {
    try {
      const { data, error } = await useAPI<{ access: any }>(`/admin/solution/toggle-service-access/${serviceId}`, {
        method: 'PATCH',
        body: { targetId, serviceId, targetType, isActive }
      })

      if (error.value) throw error.value

      const accessData = data.value?.access
      if (!accessData) return true

      if (targetType === 'user' && serviceUsers.value?.items) {
        const item = serviceUsers.value.items.find((i: any) => i.accessId === accessData.id || i.user?.id === targetId)
        if (item) item.isActive = isActive
      } else if (targetType === 'learner' && serviceLearners.value?.items) {
        const item = serviceLearners.value.items.find((i: any) => i.accessId === accessData.id || i.learner?.id === targetId)
        if (item) item.isActive = isActive
      }

      return true
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la modification de l\'accès')
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
    fetchStats,
    toggleAccess
  }
})
