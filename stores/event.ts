import { defineStore } from 'pinia'

export interface EventItem {
  id: string
  type: 'event' | 'webinar'
  title: string
  description: string
  format: 'hybride' | 'présential' | 'online'
  date: string
  time: string
  location?: string
  link?: string
  ctaText: string
  ctaLink: string
  agenda: Array<{ title: string; description?: string }>
  createdAt?: string
  updatedAt?: string
}

export const useEventStore = defineStore('event', () => {
  const events = ref<EventItem[]>([])
  const currentEvent = ref<EventItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchEvents = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<any>(`/public/get-events?page=${page}&limit=${limit}`)
      if (data.value) {
        if (data.value.data && Array.isArray(data.value.data)) {
          events.value = data.value.data
          pagination.value = {
            page: data.value.currentPage || page,
            limit: limit,
            total: data.value.nb || 0,
            totalPages: data.value.totalPages || 0
          }
        } else if (Array.isArray(data.value)) {
          events.value = data.value
          pagination.value.total = data.value.length
        } else {
          events.value = []
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des événements'
    } finally {
      loading.value = false
    }
  }

  const fetchEvent = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: apiError } = await useAPI<any>(`/public/get-event/${id}`)
      if (apiError.value) throw apiError.value

      if (data.value) {
        const itemData = data.value.data || data.value
        currentEvent.value = itemData
        return itemData
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de l\'événement'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addEvent = async (event: Partial<EventItem>) => {
    loading.value = true
    try {
      await useAPI('/admin/event', { method: 'POST', body: event })
      await fetchEvents(pagination.value.page)
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    } finally {
      loading.value = false
    }
  }

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    loading.value = true
    try {
      await useAPI(`/admin/event/${id}`, { method: 'PUT', body: updates })
      await fetchEvents(pagination.value.page)
      if (currentEvent.value && currentEvent.value.id === id) {
        Object.assign(currentEvent.value, updates)
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (id: string) => {
    loading.value = true
    try {
      await useAPI(`/admin/event/${id}`, { method: 'DELETE' })
      await fetchEvents(pagination.value.page)
      if (currentEvent.value && currentEvent.value.id === id) {
        currentEvent.value = null
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    currentEvent,
    pagination,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    addEvent,
    updateEvent,
    deleteEvent
  }
})
