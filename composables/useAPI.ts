import { defu } from 'defu'
import type { UseFetchOptions } from 'nuxt/app'

export function useAPI<T>(url: string, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()

  const defaults: UseFetchOptions<T> = {
    // baseURL can be set here or in nuxt.config.ts runtimeConfig.public.apiBase
    // For now assuming relative path proxied or same domain
    // Use the API URL from runtime config
    baseURL: config.public.pgsBaseAPI || '/api/v1',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...useRequestHeaders(['cookie'])
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Handle unauthorized globally
        // Check if we are already on login to avoid loop
        const route = useRoute()
        if (route.path !== '/login') {
          navigateTo('/login')
        }
      }
    }
  }

  const params = defu(options, defaults)

  return useFetch(url, params)
}
