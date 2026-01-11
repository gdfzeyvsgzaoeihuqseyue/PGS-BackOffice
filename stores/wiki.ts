import { defineStore } from 'pinia'
import type { SolutionWiki } from '~/types'

export const useWikiStore = defineStore('wiki', () => {
  const wikis = ref<SolutionWiki[]>([])
  const currentWiki = ref<SolutionWiki | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchWikis = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await useAPI<any>(`/public/solution/wiki?page=${page}&limit=${limit}`)
      if (data.value) {
        if (data.value.data && Array.isArray(data.value.data)) {
          wikis.value = data.value.data
          pagination.value = {
            page: data.value.currentPage || page,
            limit: limit,
            total: data.value.nb || 0,
            totalPages: data.value.totalPages || 0
          }
        } else if (Array.isArray(data.value)) {
          wikis.value = data.value
          pagination.value.total = data.value.length
        } else {
          wikis.value = []
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des wikis'
    } finally {
      loading.value = false
    }
  }

  const fetchWiki = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      // Backend route says /:identifier, could be slug or ID. Admin uses ID.
      // We'll use ID here for consistency if we have it, or slug.
      // Usually fetchWiki(id) implies ID.
      const { data, error: apiError } = await useAPI<any>(`/public/solution/wiki/${id}`)
      if (apiError.value) throw apiError.value

      if (data.value) {
        const itemData = data.value.data || data.value
        currentWiki.value = itemData
        return itemData
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du wiki'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addWiki = async (wiki: Partial<SolutionWiki>) => {
    loading.value = true
    try {
      await useAPI('/admin/solution/wiki', { method: 'POST', body: wiki })
      await fetchWikis(pagination.value.page)
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création')
    } finally {
      loading.value = false
    }
  }

  const updateWiki = async (id: string, updates: Partial<SolutionWiki>) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/wiki/${id}`, { method: 'PUT', body: updates })
      await fetchWikis(pagination.value.page)
      if (currentWiki.value && currentWiki.value.id === id) {
        Object.assign(currentWiki.value, updates)
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      loading.value = false
    }
  }

  const deleteWiki = async (id: string) => {
    loading.value = true
    try {
      await useAPI(`/admin/solution/wiki/${id}`, { method: 'DELETE' })
      await fetchWikis(pagination.value.page)
      if (currentWiki.value && currentWiki.value.id === id) {
        currentWiki.value = null
      }
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression')
    } finally {
      loading.value = false
    }
  }

  return {
    wikis,
    currentWiki,
    pagination,
    loading,
    error,
    fetchWikis,
    fetchWiki,
    addWiki,
    updateWiki,
    deleteWiki
  }
})

